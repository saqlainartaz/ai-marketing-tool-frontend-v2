# AI Marketing Tool v2 — Implementation Plan (master)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans, per milestone. Each milestone gets its own detailed bite-sized plan (docs/plans/) written at its start from this master — you don't detail M4's code before M1's learnings.

**Goal:** Build the v2 client product — **one card-based UI with
persona-driven defaults, visibility, and backend personalization** (persona
changes data, never components) — as a fresh Next.js app on Vercel, wired to
the existing Python engine, in four clickable milestones.

**Architecture:** Thin Next.js frontend renders server-defined cards; a BFF
layer (Next API routes with five internal module seams) owns product state in
Supabase Postgres (RLS-scoped); the existing engine stays unchanged behind a
typed adapter and supplies knowledge, provenance, guardrails, and voice.

**Auth & data-access model (explicit — the review's key catch):**
- **Team users are Supabase Auth users** (email/password) with roles in
  `profiles`; internal pages may query via server-side Supabase clients under
  team RLS (Abdul's proven pattern).
- **Assistants are Supabase Auth users too, but client-scoped delegates** —
  bound to exactly one `client_id`, never team access, never internal pages.
  The role exists in the data model from day one; assistant UI ships v2.1.
- **Clients are NOT Supabase Auth users.** They arrive via HMAC magic link →
  httpOnly session cookie. Therefore: **the client app never queries protected
  Supabase tables directly — client access is BFF-only through `/api/me/*`.**
  The BFF resolves the cookie to `client_id`, scopes every query by it, and
  RLS/DB constraints are defense-in-depth for server queries, not the only
  boundary. No browser-side Supabase client in any client-facing surface.

**Tech stack:** Next.js (App Router, TS) · Supabase (auth + Postgres + RLS) ·
Tailwind v4 + shadcn/ui · GSAP · Anthropic SDK (claude-fable-5 for
generation) · Vitest + Testing Library + Playwright.

**Sources of truth:** `AI Marketing Tool v2/specs/DESIGN_SPEC.md` (draft v2,
direction approved) · `specs/API_SKETCH.md` · wireframes (walkthrough /
journeys / design-v2-preview = the visual contract).

## Global constraints (from spec — every task inherits these)

- **Universal approval gate:** `content_item` can NEVER reach status `posted`
  without a client `approve` decision recorded in `audit_event`. Enforced in
  the policy module AND as a DB check; tested as an invariant. No
  publish-on-silence code paths, at any work_mode.
- **Generation creates `draft` only.** No generation path may write
  `approved`, `queued`, or `posted` — those are separate, audited transitions.
- **No client-visible `marketing_plan` unless internally approved** (the
  concierge gate is a status check, not a convention).
- **Card `type` ≠ card `state`.** `type` is the fixed taxonomy; each card
  carries a lifecycle `state` (e.g. question: unanswered → answered →
  generating → ready → dismissed). New lifecycle steps never mint new types.
- **Unnamed "we":** all product copy speaks as "we"; no named assistant.
- **Four palettes, switchable; default = Cobalt** (Saqlain, 2026-08-03).
  Themes are CSS custom properties under `[data-theme]`, exactly the token
  names used in the wireframes (`--paper --ink --ink-2 --ink-3 --clay
  --clay-deep --clay-mist --moss --moss-mist --honey --honey-mist --card
  --line --onact`).
- **Chrome budget ≤12 words/screen**; consequence + timing + undo on every
  commit button; Monzo-voice copy; no shame mechanics.
- **Card taxonomy is fixed:** `draft_approval | question | win | confirm |
  guardrail | missing_context`. New types = deliberate server-side addition.
- **Keyless tests:** the suite passes with zero API keys (FakeEngine +
  FakeAnthropic fakes are the default; real providers only via env).
- **Engine untouched:** consumed via `X-API-Key` REST only; client facts stay
  engine-side (atoms) — the BFF never duplicates the fact store.
- **Licence ledger:** every dependency recorded with its licence in
  `docs/DECISIONS.md` (ledger table) at install time.

## Stack licence ledger (verify + record at install)

| Dep | Licence | Note |
|---|---|---|
| next, react, @supabase/*, zod, @anthropic-ai/sdk, tailwindcss, vitest, @testing-library/* | MIT | |
| shadcn/ui | MIT (vendored source, not a dep) | components copied into repo |
| lucide-react | ISC | |
| playwright | Apache-2.0 | |
| **gsap** | GSAP Standard License — free incl. commercial (Webflow, 2025) | NOT OSI; verify current terms at gsap.com/licensing during install and record |
| Bricolage Grotesque, Inter | SIL OFL 1.1 | self-host via next/font |
| resend (M3, if chosen) | MIT SDK; commercial service | separate decision entry at M3 |

## Repo layout (fresh repo `marketing-tool-v2`; Saqlain creates Vercel project + Supabase project)

```
src/
  app/(client)/login/            # magic-link landing + team password login
  app/(client)/onboarding/       # S1–S6 (one route segment per screen)
  app/(client)/today/            # Home: card stack + dial + wins
  app/(client)/library/          # statuses, archive, filters
  app/(client)/plan/             # living plan page
  app/(client)/workspace/        # chat door, voice profile view (M3+)
  app/(client)/settings/
  app/(internal)/internal/       # cockpit: profile, plan curation, batch, rejections (M4)
  app/api/me/...                 # client BFF routes (per API_SKETCH.md)
  app/api/internal/...           # team BFF routes
  lib/bff/artifacts/             # seam 1: persistence, versioning, audit writes — ONLY this module touches the DB for product state
  lib/bff/workflow/              # seam 2: card state transitions + next-action logic — no DB, no HTTP
  lib/bff/engine/                # seam 3: engine adapter ONLY (typed contract + FakeEngine) — no product logic
  lib/bff/policy/                # seam 4: approval gates, guardrail_state machine, regulated-client rules — pre- AND post-generation
  lib/bff/cards/                 # seam 5: transforms workflow/artifacts state into renderable card schemas — no writes
  lib/prompts/                   # reusable prompt/guardrail modules (Intercom-pipeline pattern)
  lib/theme/tokens.css           # 4 palettes; default cobalt
  lib/auth/                      # cherry-picked: roles, homeForRole, client-token HMAC
  components/{cards,preview,onboarding,motion,ui}
supabase/migrations/             # SQL, versioned; RLS on every table
supabase/tests/rls.sql           # RLS isolation harness (pattern from Abdul's repo)
tests/                           # vitest unit/component; e2e/ playwright
docs/plans/                      # per-milestone detailed plans
docs/DECISIONS.md                # decision log + licence ledger
```

## Cherry-pick manifest (copy-and-adapt; never import from the old repos)

From **`AI marketing Tool/`** (Abdul's — the auth/schema foundations):
- `src/lib/supabase/{server,browser,admin}.ts` — three-client pattern, `import "server-only"` on admin
- `src/proxy.ts` — Next 16 session-refresh proxy (UX-only, not the authz boundary)
- `src/lib/auth/` — `roleFromToken` (cheap JWT check) + `resolveRole` (DB re-verify) + `homeForRole` single-source redirect
- `supabase/tests/rls.sql` — RLS test harness pattern; migration idempotency style
- What we deliberately do NOT take: localStorage store, mockData/persona layer, the client-facing (app) screens, native node test runner (we use Vitest)

From **`marketing tool/frontend/`** (engine-repo frontend — the engine wiring):
- `src/lib/client-token.ts` — HMAC magic-link tokens (`base64url(clientId.expires).hmacSHA256`, TTL) + `api/client-login/route.ts` verify→httpOnly cookie
- `src/lib/linkedin-skill.ts` — the craft/grounding prompt layer → becomes `lib/prompts/linkedin.ts` (module 1 of the reusable prompt system)
- `src/app/api/generate/linkedin/route.ts` — generation route shape incl. 409-on-zero-atoms
- `/internal` panel logic as functional reference (UI rebuilt in v2 language per design-v2-preview Screen 4); passcode gate replaced by Supabase team role

## Data model (Supabase migrations, all RLS-scoped by client_id; roles: client | assistant | team)

`client_profile` (business facts, industry, channels, links, risk_level) ·
`client_context` (work_mode, persona, goal, guidance_level, constraints;
versioned; preferences flagged confirmed|inferred + freshness) ·
`marketing_plan` (channels+why, pillars, rhythm, weekly actions; versioned;
status draft|approved — client only ever sees approved) ·
`action_card` (type from fixed taxonomy, state, payload jsonb, order) ·
`content_item` (draft text, channel, status draft→approved→queued→posted,
guardrail_state safe|softened|needs_review|blocked|missing_evidence,
provenance refs jsonb, edit_history jsonb) ·
`onboarding_response` (raw answers + timestamps) ·
`audit_event` (append-only: actor + actor_role, action, target table/id,
before/after status where relevant, at — **no UPDATE/DELETE grants for the
app role**, enforced in migration) ·
`profiles` (user↔role↔client bindings)

**Standard fields** on all client-scoped tables: `id, client_id, status,
created_at, updated_at, created_by, updated_by, schema_version`; versioned
tables (`client_context`, `marketing_plan`) add `version, superseded_by`.
`audit_event` deliberately omits `updated_*` (append-only).

**ProvenanceRef — defined now, stored as JSONB on `content_item`:**

```ts
type ProvenanceRef = {
  source_id: string                       // engine atom id, response id, …
  source_type: "engine_atom" | "onboarding_response" | "document" | "voice_profile"
  label: string                           // "your onboarding call, Mar 12"
  quote?: string                          // the exact grounding words
  location?: string                       // source_line / timestamp from engine provenance
  confidence?: number
}
```

## Engine wiring (`lib/bff/engine/`)

Typed adapter over: `POST /v1/clients/{id}/context` · `GET .../atoms?type=claims_blacklist|voice_constraint` · `GET .../voice-profile` · `POST .../documents` (onboarding answers → corpus, source_type=onboarding_form). Contract pinned by recorded-fixture tests (real responses captured once, replayed keyless). `FakeEngine` implements the same interface for all tests. Env: `ENGINE_URL`, `ENGINE_API_KEY`, `CLIENT_LOGIN_SECRET`, `ANTHROPIC_API_KEY`, Supabase keys.

Generation pipeline (M2): **policy pre-check** (blocked topics/risk rules can
stop generation before any Claude call) → card answers + context bundle +
approved voice profile + `lib/prompts` → Claude → **policy post-check**
(guardrail_state) → `content_item` with status `draft` (only ever draft).

**Failure behavior (contractual):** engine unavailable or zero atoms →
`missing_context` card or 409 with user-safe copy ("we need one thing before
drafting this") — never a blank failure, never a silent fallback to
ungrounded generation.

---

# Milestones — each ends clickable on Vercel + an iteration checkpoint with Saqlain

## M1 — Shell, theming, auth, first-run (mock-backed, demo-able)

**Ends with:** the walkthrough's Dave journey working as a real app on a
Vercel URL — magic link → S1→S6 → Home with mock cards — in all four themes.
**Internally split in two tracks so workers never mix concerns; GSAP polish
must never block auth/deploy:**

**M1A — visual shell (no real auth, no DB):**
1. Scaffold: create-next-app (TS) · Tailwind v4 · `lib/theme/tokens.css` with
   the four palettes (data-theme attr, cobalt default) + Appearance switcher ·
   next/font (Bricolage + Inter) · vitest + playwright wiring · licence
   ledger started. Theme snapshot test: each palette resolves all 14 tokens.
2. shadcn init + base primitives styled to tokens: `ActionButton` (with
   consequence-line slot), `PostPreview` (platform-style FB/LinkedIn frames),
   `CardShell`, `DialPill`, chips. Component tests per primitive.
3. First-run flow S1–S6 as routes, driven by fixtures (Dave + Amara from the
   walkthrough): confirm card w/ endowed checks, 4 questions ("not sure — you
   decide" on each), never-do with locked chips, plan reveal.
4. The assembly moment: GSAP timeline via `useGSAP` (gsap-react pattern),
   reduced-motion fallback. The demo money-shot — real time budgeted, but a
   simple crossfade fallback ships first so this task can never block M1B.
5. Home (mock): card stack from fixture `action_card`s, one-at-a-time pager
   on mobile, dial pill (visual only in M1), wins strip.
6. Playwright e2e: mock journey S1→Home against all 4 themes.

**M1B — auth & data foundation:**
1. Supabase: project schema v0 (`profiles`, roles) · team email/password
   login · cherry-picked auth stack (proxy, roleFromToken/resolveRole,
   homeForRole) · RLS harness running in CI.
2. Client magic-link auth: port `client-token.ts` HMAC + `/api/client-login`
   → httpOnly session; TDD the token verify (expiry, tamper, wrong client).
   Wire the fixture journey behind real client sessions.
3. Vercel env/deploy · full e2e (login link → S1→S6 → Home) · demo
   checkpoint with Saqlain · fold critique into M2's detailed plan.

## M2 — Real BFF: cards, generation, review/approve (the product loop)

**The golden path defines M2 — everything in this milestone exists to make
this one sentence true, and nothing else:**

> A seeded client opens Today → answers one question card → a draft is
> generated from THEIR engine context/atoms → provenance spans appear →
> guardrail_state is shown → they edit in the preview → approve → audit_event
> records the approval → Library shows the approved item.

**"Done" is deliberately narrow: one channel (LinkedIn), one draft type, one
seeded client, one approval loop.** No multi-channel, no batch, no strategy
generation. Keyless test suite green.

1. Migrations for all 8 tables + RLS + `audit_event` triggers; RLS isolation
   tests (client A cannot read client B — the harness from M1.3).
2. `lib/bff/artifacts/`: TDD CRUD + versioning for context/plan/cards/content.
3. `lib/bff/policy/`: TDD the guardrail_state machine and THE invariant test:
   no path to `posted` without client approve in audit_event (unit + DB
   constraint).
4. `lib/bff/engine/`: adapter + FakeEngine + recorded-fixture contract tests.
5. Generation route: context bundle + voice profile + `lib/prompts/linkedin`
   → FakeAnthropic in tests / Claude in prod → policy post-check →
   content_item. Port the 409-no-atoms behavior.
6. `lib/bff/cards/` + `workflow/`: server-defined card schemas (fixed
   taxonomy), card state machine (TDD: question→answered→generating→review),
   `/api/me/cards` + `/api/me/content/{id}/decision` per API_SKETCH.
7. Wire UI: Home reads real cards; C1 questions → C2 generating (visible
   steps) → C3 review with provenance spans (from atom provenance),
   edit-in-preview → guardrail re-check, approve/fix/toss with reason chips.
8. Onboarding answers → `onboarding_response` + engine document upload.
9. Deploy · checkpoint: run the loop with a real seeded client (e.g. the
   Friday-demo client's packet) · iterate.

## M3 — Handoff kit, Library, Plan, Settings (the loop closes)

**Required:**
1. Handoff: `/api/me/content/{id}/export` (text+assets package) · copy ·
   tokenized no-login share-review link · mark-as-posted (client or team) ·
   team notes — every action → audit_event. **Mark-as-posted is a manual
   status record for the archive only — it publishes nothing; there is no
   publishing code path anywhere in v2.**
2. Library page (statuses, pillar/channel filters, Amara's archive view incl.
   "published without your approval: 0" counter — computed from audit).
3. Plan living page; goal/channel change → plan re-adjust flag + "plan
   updated because…" note.
4. Activity feed ("while you were away") from audit_event.
5. Settings: profile facts, goal (change → plan re-adjust), editable never-do
   list, work_mode dial, Appearance (theme switcher from M1).

**Conditional (vendor decision, must not block):**
6. Email notification (Resend decision + licence entry at this point): if not
   ready, notification events are recorded and surfaced in the Activity feed;
   email layers on after the in-app loop is stable. Silence handling either
   way: reminder record → team follow-up queue (never publish).

**Stretch (committed v2 scope — ships here if time allows, else immediately
after M4):**
7. Workspace v1 (the Act-3 door): chat input whose replies land as cards
   (reuses the generation pipeline), plus the legible voice-profile view
   (read from the engine's approved profile). Full chat depth grows later.

8. Deploy · checkpoint · iterate.

## M4 — Internal cockpit (team side in v2 language)

**Scope cap: supports the demo and daily operations — NOT a full ops
dashboard or CRM. Batch generation stays basic (N drafts from the approved
plan, nothing fancier).**

1. `/internal` shell gated by team role; client roster.
2. Profile editor (seeds S1) + context/work_mode/risk overrides.
3. Plan curation: review/edit/approve gate (client sees only approved).
4. Batch generation → APPROVE cards; rejections queue with reason chips
   feeding client_context; log-a-win (feeds win cards, honest numbers only).
5. Login-link issuance UI.
6. Deploy · checkpoint → package for Tyler/Rudy demo.

**Deliberately NOT in any milestone** (spec §7): publishing integrations ·
publish-on-silence · SMS · owner report · multi-seat UI · voice input ·
attribution claims · self-signup/billing · named assistant.

## Testing strategy (summary)

- **TDD (vitest, keyless):** artifacts CRUD/versioning · card state machine ·
  guardrail_state machine · THE approval-gate invariant · generation-writes-
  draft-only invariant · HMAC token verify · provenance mapping · engine
  adapter against recorded fixtures.
- **Component tests:** every primitive in M1A.2; theme token resolution ×4.
- **E2E (playwright):** the 60-second demo path per milestone; ×4 themes in M1.
- **RLS & security (CI, from M1B on):** migrations apply cleanly from an
  empty database · every client-scoped table has RLS (asserted by query
  against pg_policies) · direct SQL attempt to set `posted` without an
  approve audit_event fails at the DB layer · an authenticated route can
  never return another client's content (cross-client test) · FakeEngine and
  recorded real fixtures produce identical response shapes (parity test).
- **NOT over-tested:** GSAP motion, visual polish (manual review + the
  wireframes as visual contract).

## Verification (end-to-end, per milestone)

- `npm test` green with zero API keys set — the keyless gate.
- Playwright demo-path spec green on the Vercel preview URL.
- Manual: run the milestone's demo script (M1: Dave's first login in Cobalt,
  switch to Forest, replay; M2: seeded client generates + approves a grounded
  post and the sources drawer shows real atom provenance; M3: export + mark
  posted + archive zero-counter; M4: rejection reason visibly changes next
  batch).
- Invariant audit before every checkpoint, three layers: **static check**
  (CI rule: only the policy module may write `status='posted'`) · **unit
  test** (policy rejects transition without an approve audit_event) · **DB
  invariant test** (direct SQL attempt to set `posted` without approval
  fails at the database).

## Process

Milestone start → write its detailed bite-sized plan (docs/plans/, per
writing-plans format, from this master + accumulated critique) → execute
(subagent-driven or inline, Saqlain's choice) → deploy → **iteration
checkpoint with Saqlain** → fold feedback into next milestone's plan. After
approval of this master plan, it gets committed into the new repo as
`docs/plans/2026-08-03-v2-master-plan.md`, and the `AI Marketing Tool v2`
design folder stays the design source of truth.

## Open items (non-blocking, resolved during execution)

- Saqlain creates: Vercel project + Supabase project + repo remote (M1.0).
- Email vendor decision lands at M3.1 with its own licence/decision entry.
- Engine contract improvements (voice profile in /context, lineage over HTTP)
  are engine-repo issues to file — nice-to-have, not blocking (adapter
  fetches voice profile separately).
