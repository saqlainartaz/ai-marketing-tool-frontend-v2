# What we can reuse from Postiz

**Read [postiz-1-features.md](postiz-1-features.md) first.** This report answers one question:
what, concretely, can InsideSuccess take from that repo — and at what cost.

---

## The constraint that decides everything: AGPL-3.0

Postiz is licensed **AGPL-3.0** (`LICENSE`, confirmed — GNU Affero General Public License v3).
There is no dual-licence, no MIT-licensed core, no permissive carve-out for the provider layer.

AGPL is GPL plus a **network clause**. Section 13 says that if users interact with a modified
version *over a network*, you must offer them the complete corresponding source of the whole
combined work. For a hosted SaaS — which is exactly what we're building — that means:

> **Copying Postiz source into our product would oblige us to publish our entire product's
> source under AGPL-3.0. Not just the copied files. The whole combined work — engine,
> frontend, prompts, guardrails, everything.**

There is no clever boundary that avoids this if we link the code into our application. Calling
it from a separate process over an API is the standard argument for avoiding derivation, but
that argument is contested for AGPL specifically and is not something to bet a company on
without a lawyer.

**What this does *not* restrict:** reading the code, learning from it, understanding platform
APIs, copying *architectural ideas*, and reimplementing behaviour from your own understanding.
Facts and methods aren't copyrightable — only the expression is. Every "reuse" recommendation
below is therefore either *run it as a separate product*, or *learn and reimplement*.

This also collides directly with our own rule in `docs/AI_CODING_RULES.md`: no new dependency
without a licence check recorded. AGPL fails that check for linked code.

---

## Option A — run Postiz as a separate self-hosted service (recommended to evaluate)

Deploy it unmodified alongside our engine and talk to it over its public API. Unmodified,
separately-deployed AGPL software that we merely *use* imposes no obligation on our code.

**What we'd get, immediately:**
- 34 platform integrations, maintained by someone else
- OAuth flows, token refresh, and the accumulated error handling
- Chunked/resumable media upload for YouTube, TikTok, X
- Scheduling and the publishing state machine

**How it would fit our architecture.** We already have the pieces this lacks:

```
ISTV engine (Python/FastAPI + pgvector)   →  brand knowledge, provenance, guardrails
        ↓
ISTV BFF + v2 frontend                    →  the card system, approval gate, undo
        ↓  (on client approval only)
Postiz public API                         →  distribution to 34 platforms
```

Postiz's `POST /public/v1/posts` and `integration-settings/:id` are a decent seam. Their public
API even returns per-platform rules and limits in a shape designed for LLM consumption, which
is useful to us for validation before we ever call it.

**Costs and risks, honestly:**
- It's a second Postgres, a Redis, **and a full Temporal cluster** (Temporal needs its own
  Postgres and Elasticsearch — look at their `docker-compose.yaml`). That is a lot of
  operational surface for a team our size, and it violates our M1 "no Redis/Celery" instinct
  by a wide margin.
- Their API auth forges `role: 'SUPERADMIN'` for every API caller, and several routes are
  unauthenticated behind a shared secret. It must never be exposed to the public internet.
- Zero tests. Upgrades are unverifiable except by our own testing.
- Their data model has no concept of our client, our approval, or our provenance. We'd be
  maintaining a mapping layer and two sources of truth for "what went out".

**Verdict:** genuinely worth a spike when we reach real publishing (M3+). Not now — it would
add more operational weight than the whole rest of our stack combined, to solve a problem we
haven't got yet.

---

## Option B — learn and reimplement (the main value)

This is where most of the value actually is, and it carries no licence risk. Ranked by what it
would save us.

### B1. The pending-publish state machine — the single best idea in the repo

Their `PendingCheckResponse` contract solves the hardest problem in publishing: *the request
timed out and I don't know whether it posted.*

```
'pending'   → still processing, poll again
'ready'     → processing done, run the finalising mutations
'completed' → done, here's the post id and URL
```

With one invariant, stated in their source and worth quoting when we write ours:

> once `finalizePost`'s mutations have actually gone through on the platform, `checkPostStatus`
> must return `'completed'` — never `'ready'` again — otherwise a retry after an unknown-outcome
> failure would re-run the mutations and duplicate the post.

Paired with their three retry policies — and specifically **`maximumAttempts: 1` on any
irreversible publish mutation** — this is the correct design for a system whose entire promise
is "nothing goes out without your yes". A duplicate post would be a direct breach of that
promise. **Adopt the pattern; write our own code.**

### B2. Platform API knowledge — worth days of research each

Their `handleErrors` methods are string-matched maps of real production incidents: YouTube 22
branches, TikTok ~24. Things nobody would guess:

- TikTok limits pending posts to 5 per 24 hours, and the error is `spam_risk_too_many_pending_share`
- TikTok photos have no direct-file-upload path at all — they must be pulled from a public URL
- YouTube can succeed at the video and fail at the thumbnail, and that needs a *partial success* message
- Dribbble requires images at exactly 400×300 or 800×600
- Pinterest requires all images in a multi-image pin to share identical dimensions
- LinkedIn comments cannot contain media
- X Verified accounts have a 4,000-character limit, not 280 — and you must read the account's own settings to know

We should read these as **documentation** and write our own validation from them. That is
legitimate and it saves weeks.

### B3. The write-once / fork-per-channel content model

Global content plus a per-channel override, with an explicit "back to global" reset. It's the
right answer to a problem we will hit the moment we support more than one channel per client,
and it maps cleanly onto our card system.

### B4. Per-platform validation as declarative DTOs shared by client and server

One class-validator DTO per provider, imported by *both* the NestJS backend and the React
form resolver. One definition, enforced in both places, impossible to drift. We'd do this with
Pydantic on the engine side and a generated schema on the frontend — same idea, our stack.

### B5. The provider interface shape

Their minimum viable provider is ~9 members and their simplest real one is 106 lines. The
`@Tool` / `@Rules` decorators — exposing provider capabilities to an LLM and injecting
natural-language platform constraints into generation context — are a genuinely good idea we
should steal conceptually. Our engine already has guardrails; per-platform rules are the same
mechanism pointed at a different constraint.

### B6. Small, concrete things worth copying as ideas

- Per-item **alt text** and **custom video thumbnails** (canvas frame-grab at a chosen
  timestamp) — accessibility and quality, cheap to build
- **Time slots** as a per-channel posting queue, with a `find-slot` endpoint
- Recurring posts **computed at read time** rather than materialised
- Storing the *creation method* on each post (web/API/agent/autopost) — we'd want this for
  provenance anyway
- Streaming AI progress as named steps over NDJSON — we already do this visually with
  `AssemblyMoment`; theirs streams real node names from a LangGraph

---

## Option C — things we should deliberately NOT take

- **Their approval model.** There isn't one. `QUEUE | PUBLISHED | ERROR | DRAFT` with a public
  comment thread is *weaker* than what we already have. Our universal approval gate and undo
  are ahead here — this is our differentiator, not a gap.
- **Their agency model.** A `Customer` is just a channel grouping. No client login, no
  per-client approval, no white-label. We're already further along in design.
- **Their AI architecture.** Postiz generates from its own past posts by category. We generate
  from ingested brand knowledge with provenance. Ours is the harder and more defensible thing;
  adopting theirs would be a downgrade.
- **The plaintext token storage**, the deterministic MD5-derived encryption, and the
  policy-guard holes. We must not inherit these.
- **Temporal**, unless and until we genuinely need durable multi-day workflows. For "publish at
  9am Tuesday", a scheduled job against Postgres is enough, and we don't have Redis or Celery
  yet by deliberate choice.
- **Polotno**, CopilotKit, and the 213-dependency surface generally.

---

## Recommendation

1. **Do not copy Postiz code into our product.** AGPL makes it a licence event, and our own
   rules already forbid it without a recorded check that this would fail.
2. **Mine it as documentation now** — specifically the pending-publish contract (B1), the
   platform error knowledge (B2), and the validation-DTO pattern (B4). Record what we learn in
   `docs/DECISIONS.md` so the origin of the design is traceable.
3. **Keep a separately-deployed Postiz on the table as a distribution backend** for when we
   reach real publishing, and spike it then — not before. Our approval gate stays the front
   door; Postiz would only ever be the last mile, called *after* a recorded client approve.
4. **Do not treat this as a competitor.** It solves distribution; we solve knowledge,
   provenance and governance. Postiz has no brand memory and no approval workflow — the two
   things our product is actually about.
