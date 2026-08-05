# Design spec — The Campaign Spine

**Date:** 2026-08-05
**Status:** design approved in brainstorming session; not yet planned or built
**Scope:** the client-facing product in this repo (`marketing-tool-v2`)
**Supersedes:** nothing. Extends the Desk build (2026-08-04) and
`docs/plans/2026-08-03-v2-master-plan.md`

---

## 1. Why this exists

The Desk build is a well-made shell with a hollow middle. The diagnosis, from
walking the code:

The product goes **engine context → drafts to approve**, with "the plan" being
pillars plus a weekly cadence (`FixtureClient.plan`). Nothing in it knows that a
$1–5M roofing business winning work through referrals and local search needs
fundamentally different marketing than a coach selling a $5k program. So the
client receives competent posts with no argument for why *these* posts move
*their* number.

Three symptoms were named by the product owner, and they have one root cause:

| Symptom | Root cause |
|---|---|
| "The UX doesn't feel right" | Six tabs are a filing cabinet, not a path. No screen answers "why am I looking at this?" |
| "The loop doesn't close" | Approve leads nowhere. The Today screen promises an outcome the product cannot deliver. |
| "Wrong asset scope" | The content model is shaped around single text posts, but the product must also make graphics, carousels and long-form. |

The root cause is a **missing strategy layer**. This spec adds it, as a library
of marketing plays selected against what is true about the client — and widens
the content model to carry more than posts.

Two seeds already in the code prove the instinct was right and should be
extended rather than replaced:

- `FixtureDraft.kind` (`"post" | "review_reply" | "email"`) carries the comment
  *"new tools add kinds, not screens."* The typed-asset model below is that
  comment, finished.
- `Rationale` (`{ moment, channel, shape }`) carries *"we explain the marketing,
  not the interface."* That reasoning exists per draft; what's missing is the
  same reasoning at goal and plan level.

### The design principle this spec turns on

**Strategy visibility is not strategy configuration.**

The client must *see* why this work serves their goal — that is what makes it a
marketing tool rather than a content vending machine. The client must never be
asked to *decide* strategy. The operator decides at onboarding, where the
sales-call transcript and onboarding form already live. Friction is the enemy;
explanation is not friction, because it stays collapsed.

---

## 2. What does not change

- **The engine.** No schema, pipeline, or endpoint changes. This is a new
  consumer of `/context`, atoms, and voice profiles. Consistent with
  `../marketing tool/docs/PRODUCT_DIRECTION.md` §7.3.
- **Binding decisions in `docs/DECISIONS.md`**, in particular *"Universal
  approval gate — no publish-on-silence code paths, ever"* (2026-08-03). Nothing
  in this spec introduces a silence-based path. `PRODUCT_DIRECTION` §10.2's
  publish-on-silence recommendation is **already overruled in this repo** and
  stays overruled.
- **`docs/UX_RULES.md` in full.** Where this spec and a UX rule disagree, the
  rule wins and the disagreement gets raised in that file, not worked around in
  a component. §4 below flags the one rule this spec puts pressure on.
- **`docs/DESIGN_SYSTEM.md`** and the four-theme token system. No new palettes,
  no new type voices.
- **The auth model.** HMAC client sessions, BFF-only access, `(client)` layout as
  the gate.

### What survives from the current build

Keep and reuse, unchanged or lightly extended: the theme system and primitives ·
`CardStack` / `IdeaCard` · `SourcedBody` / `WhyThis` / `GuardrailLine` ·
`WorkSpine` · `AssemblyMoment` · `StatusProvider` and its undo window ·
`ContentPreview` / `post-preview` / `platform-mark` · `PlanDocument` (becomes the
plan document described in §5.2) · the client-login route and session hook ·
all 70 unit tests and 6 e2e specs, which must stay green.

---

## 3. Domain model

Four concepts. All frontend-side; none require engine changes.

### 3.1 Brief — what is true about this client

Replaces `FixtureClient.plan` + `profileLines` + `lockedNever*` as the
authoritative description of the client.

Every field carries its source and a trust status, mirroring the engine's
`provisional → confirmed` atom lifecycle. The engine infers what it can from the
sales-call transcript; the operator confirms or overrides at onboarding. This is
reuse of a proven mechanism, not a new one — and it means the Brief is
provenance-tracked like everything else in the system.

```ts
// src/lib/brief/types.ts
// `Platform` is the existing type from "@/components/preview/post-preview" —
// import it, do not redefine it.

export type SourceRef =
  | { kind: "atom"; atomId: string; label: string }  // engine atom + human label
  | { kind: "operator"; who: string; at: string }    // captured at onboarding
  | { kind: "client"; at: string };                  // changed via Adjust

export type BriefField<T> = {
  value: T;
  source: SourceRef;
  status: "provisional" | "confirmed";
};

export type BusinessModel =
  | "local_service"        // roofer, plumber, restaurant
  | "professional_practice" // doctor, lawyer, advisor
  | "coaching_programs"    // coach, consultant, author
  | "b2b_services"
  | "ecommerce"
  | "hospitality";

export type AcquisitionMotion =
  | "referral"
  | "local_search"
  | "paid_ads"
  | "outbound"
  | "content_audience"
  | "partnerships"
  | "walk_in"
  | "events";

/** How the goal is measured. Honest by construction — see §6. */
export type GoalMetric =
  | { kind: "platform"; name: "views" | "engagements" | "profile_visits" }
  | { kind: "logged"; name: string; loggedBy: "operator" };

export type Goal = {
  statement: string;   // client's own words: "Book 6 discovery calls by 30 Sept"
  metric: GoalMetric;
  target: number;
  deadline: string;    // ISO date
};

export type BrandTokens = {
  logoUrl?: string;
  colours: { ink: string; accent: string };
  fontChoice: "display" | "body";  // constrained to the design system
  cta: { label: string; detail: string };  // "Call us — 0161 …"
};

/**
 * The client's friction budget. Ordered — compare via EFFORT_RANK, never by
 * string comparison, or rule 4 of the matcher silently does nothing.
 *
 * The existing `WorkMode` dial (`components/ui/dial-pill`) is the UI for this.
 * Check its actual union before wiring: if the values differ, map explicitly in
 * one place rather than widening either type.
 */
export type EffortLevel = "minimal" | "some" | "hands_on";

export const EFFORT_RANK: Record<EffortLevel, number> = {
  minimal: 0,
  some: 1,
  hands_on: 2,
};

export type Brief = {
  clientId: string;
  version: number;
  businessModel: BriefField<BusinessModel>;
  acquisitionMotions: BriefField<AcquisitionMotion[]>;
  goal: BriefField<Goal>;
  pillars: BriefField<string[]>;
  channels: BriefField<{ platform: Platform; state: "active" | "next"; why: string }[]>;
  neverSay: BriefField<string[]>;   // engine claims_blacklist + voice_constraint
  brand: BriefField<BrandTokens>;
  effort: BriefField<EffortLevel>;
};
```

### 3.2 Play — a reusable marketing tactic

Authored as data by the InsideSuccess team. **Files in the repo** (one TypeScript
module per play, typed and unit-testable). No CMS and no deploy-free authoring in
this spec — that is a later spec, and building it now would be premature.

Keeping Play separate from Brief is the load-bearing modelling choice: Brief is
what's true about one client, Play is a tactic reusable across many. Collapsing
them would be simpler today and would cost the library later.

```ts
// src/lib/plays/types.ts

export type AtomType =
  | "tldr" | "insight" | "pain_point" | "objection" | "proof_point"
  | "quote" | "terminology" | "claims_blacklist" | "voice_constraint";

export type RecipeStep = {
  order: number;
  assetKind: AssetKind;
  channel?: Platform;
  sourceAtomTypes: AtomType[];  // what grounds this asset
  promptRef: string;            // generation template id
  craftNote: string;            // operator-facing; never shown to the client
};

/**
 * An empty `fits*` array means "fits all" — it is the encoding for a
 * universal play like Objection series. Do not use a "any" string member;
 * that would weaken the union everywhere else it is used.
 */
export type Play = {
  id: string;
  name: string;                 // internal only
  clientSentence: string;       // one sentence, plain words, shown to the client
  whyTemplate: string;          // "…because {motionPhrase}" — rendered from Brief
  fitsBusinessModels: BusinessModel[];   // [] = all
  fitsMotions: AcquisitionMotion[];      // [] = all
  requiredAtomTypes: AtomType[];      // matcher excludes the play if absent
  requiredBriefFields: (keyof Brief)[];
  durationWeeks: number;
  cadencePerWeek: number;
  recipe: RecipeStep[];
  clientEffort: EffortLevel;          // must be ≤ brief.effort to be offered
  successMeasure: { metric: GoalMetric; expectation: string };
};

/**
 * What the matcher needs to know about the client's corpus — deliberately not
 * the atoms themselves, so the matcher stays pure and `lib/plays` never
 * imports `lib/engine`. Built once by `lib/brief` from the /context response.
 */
export type AtomSummary = {
  countsByType: Record<AtomType, number>;
  /** Most recent atom date per type, ISO — drives the freshness ranking. */
  newestByType: Partial<Record<AtomType, string>>;
};

export type RankedPlay = {
  play: Play;
  score: number;
  /** Why it ranked here, and why excluded ones were dropped. Operator-facing. */
  reasons: string[];
};
```

### 3.3 Campaign — one play, running for one client

```ts
export type Campaign = {
  id: string;
  clientId: string;
  playId: string;
  startedAt: string;
  state: "queued" | "running" | "complete" | "stopped";
  assetIds: string[];
  progress: { produced: number; decided: number; total: number };
};
```

### 3.4 Asset — the typed content object

Extends `FixtureDraft.kind` from three kinds to six, exactly as that field's
comment intended. `ProvenanceSpan`, `Rationale` and the guardrail shape are the
existing types, reused verbatim.

```ts
// src/lib/assets/types.ts

export type AssetKind =
  | "post" | "review_reply" | "email"   // exist today
  | "carousel" | "graphic" | "article"; // new

export type AssetStatus =
  | "generating"
  | "held"        // guardrail tripped — NEVER shown to the client
  | "ready"
  | "approved"
  | "skipped"
  | "copied"
  | "posted"
  | "failed";

export type Slide = {
  order: number;
  role: "hook" | "point" | "proof" | "cta";
  heading?: string;
  text: string;
};

export type AssetBody =
  | { kind: "post"; text: string; withImage?: boolean }
  | { kind: "review_reply"; text: string; review: { reviewer: string; stars: number; text: string } }
  | { kind: "email"; subject: string; preheader?: string; sections: { heading?: string; text: string }[] }
  | { kind: "carousel"; slides: Slide[] }
  | { kind: "graphic"; template: "quote" | "stat" | "tip"; fields: Record<string, string> }
  | { kind: "article"; title: string; sections: { heading: string; text: string }[] };

export type Asset = {
  id: string;
  clientId: string;
  campaignId: string;
  kind: AssetKind;
  channel?: Platform;
  status: AssetStatus;
  body: AssetBody;
  provenance: ProvenanceSpan[];        // existing type
  rationale: Rationale;                // existing type
  guardrail?: { note: string; from: string; to: string };
  preparedFor?: string;                // ISO date — a plan, not a commitment
  outcome?: {
    metric: string;
    value: number;
    at: string;
    source: "platform" | "operator";
  };
};
```

### 3.5 Client-facing vocabulary

`UX_RULES` §9 forbids leaking internal vocabulary. The model names above are
internal. What the client reads:

| Internal | Client-facing |
|---|---|
| Brief | "Your plan" (page title); the business section reads "What we know about your business" |
| Play | never named. Rendered as `clientSentence` — "We're reaching people who already know you." |
| Campaign | never shown |
| Asset | the noun of its kind: post, reply, email, carousel, article, graphic |
| Matcher, recipe, promptRef, craftNote | never shown |
| `status: "held"` | never shown — the asset simply isn't there |
| Guardrail | the existing "protected" honey line |

Banned in client copy, per `UX_RULES` §9 and §1: play, campaign, brief, recipe,
atom, provenance, pillar *as a bare label without explanation*, and any
milestone name.

---

## 4. Module boundaries

Each module has one job, a stated dependency, and can be tested alone.

| Module | Job | Depends on | Testing |
|---|---|---|---|
| `src/lib/engine/` | Thin REST client for the Client Content Engine. **The only module that knows atoms exist.** | fetch, session | Contract tests against a recorded fixture response |
| `src/lib/brief/` | Brief types, construction from engine context, versioning | `lib/engine` | Unit — pure transforms |
| `src/lib/plays/` | The play library and the matcher. **The matcher is a pure function** `(Brief, AtomSummary) => RankedPlay[]` with zero I/O | brief types only | Unit — fixture briefs in, ranked list out |
| `src/lib/assets/` | Asset types plus per-kind validators (character limits, slide counts, section counts) | none | Unit — one table-driven test per kind |
| `src/lib/generation/` | `(Brief, Play, RecipeStep, context) => Asset`. One adapter per asset kind. Behind a provider interface with a deterministic fake | engine, brief, plays, assets | Unit with the fake; the real provider is env-gated |
| `src/lib/outcomes/` | Recording what happened to an asset, and rolling it into goal progress | assets | Unit |
| `src/components/assets/` | One preview per kind behind a single `AssetPreview` switch; one `DecisionBar` for all kinds | assets | Component tests per kind + contrast gates ×4 themes |

Two rules that keep the boundaries honest:

1. **Nothing outside `lib/engine/` may reference an atom ID** except as an opaque
   string inside a `SourceRef`.
2. **`DecisionBar` must not branch on `AssetKind`.** Approve/skip is identical
   for every kind; if a kind needs a different action, that is a new component,
   not a conditional.

### Data flow

```
operator onboarding (admin dashboard, outside this repo)
  → engine ingests transcript + form → atoms, voice profile, constraints
  → Brief drafted from /context, operator confirms or overrides
      ↓
  matchPlays(Brief, atomSummary) → ranked plays
  → operator approves the sequence          [one running campaign at a time]
      ↓
  Campaign instantiated → generation walks the recipe → Assets
      ↓
  client sees: goal · one focus sentence · the decisions waiting
      ↓
  approve → copy out → mark as posted → outcome recorded → goal number moves
```

---

## 5. The client's surface

Six tabs become **three destinations and one drawer**. Each destination answers a
question the client actually asks; that is the test for whether it deserves to
exist.

| Route | Client label | Question it answers |
|---|---|---|
| `/now` | Now | "What do I do?" |
| `/plan` | Your plan | "What's the plan, and is it right about me?" |
| `/record` | What went out | "Did it work?" |
| drawer off `/now` | "Ask for anything" | escape hatch for the hands-on client |

`/today` is renamed to `/now`. `/library` becomes `/record`. `/profile` and
`/settings` are absorbed into `/plan`. `/workspace` stops being a tab and becomes
a drawer — satisfying the NN/g escape-hatch caveat in `PRODUCT_DIRECTION` §5.4
without giving a power-user surface top-level billing.

**On mobile, `/now` is the entire app.** Single column, decision bar within thumb
reach, 44px targets. That is the whole product for the phone-first client.

### 5.1 `/now`

Top to bottom, mobile order:

1. **Date eyebrow + effort dial.** Existing `DialPill`, unchanged.
2. **Goal line.** The client's own goal statement, with progress and the source
   of the number. `UX_RULES` §9 allows **one number per idea**, so this is the
   only numeral in the screen's *chrome* — figures inside a draft's own content
   don't count, but a second progress counter does:
   *"Book 6 discovery calls by 30 Sept — 2 so far"*,
   with `t-meta` beneath reading *"logged by your strategist"* or *"from
   LinkedIn"*. The `n of m` work-spine counter moves to the desktop rail; on
   mobile the spine renders as a progress bar with no second numeral.
3. **Focus sentence.** One sentence from `Play.clientSentence` plus the rendered
   `whyTemplate`. Collapsed detail uses the existing `WhyThis` disclosure. A
   client who reads it monthly learns marketing; a client who never opens it
   loses nothing.
4. **Decision stack.** `CardStack`, made polymorphic over `AssetKind` via
   `AssetPreview`. One commitment per screen is preserved.
5. **Next up** (desktop) / spine (mobile), as today.

Desktop rail keeps its current contents: this-week spine, last week's result,
pillars as chips with a door to the plan, and the "anything happening?"
affordance that opens the drawer.

**Empty states** must distinguish, per `UX_RULES` §5:
- nothing prepared yet → *"Nothing to look at yet. Your first posts land Monday."*
- everything decided → *"All clear. Next set lands Monday."*
- campaign finished, next not started → *"This stretch is done. Your strategist is lining up what's next."*

### 5.2 `/plan`

The plan as a document, reusing `PlanDocument`. Sections in order:

1. **What we know about your business** — business model, acquisition motions,
   `profileLines`. Each line reveals its source on tap ("your episode, 12 Mar"),
   using the same affordance as `SourcedBody`. This is the trust surface.
2. **Your goal** — the statement, the metric, the deadline, and **Adjust**.
3. **What we're doing** — the play sequence as a numbered document; the current
   one marked. Each entry is its `clientSentence`, never the play name.
4. **Never say** — the locked chips that exist today, sourced from the engine's
   `claims_blacklist` and `voice_constraint` atoms.
5. **Your details** — contact, connected accounts, theme. A plain section at the
   bottom, not a separate destination. For this client, settings and "what's true
   about me" are the same thing.

**Adjust** is exactly three controls, and no more:

- change the goal
- drop a pillar
- mute a channel

Each follows `UX_RULES` §7: one question per screen, closed questions, and
*"Not sure — you decide"* as a real answer on every one. A client change writes
`SourceRef { kind: "client" }` and bumps `Brief.version`; it never silently
overwrites an operator-confirmed field — the previous value stays visible as
"your strategist suggested X".

### 5.3 `/record`

Reverse-chronological list of everything that went out, with its outcome. Each
row opens the asset with its provenance intact — this is the Careful
Professional's receipts surface, and it answers "what went out, when" from
`PRODUCT_DIRECTION` §12.

No filters in v1. Two distinct empty states per `UX_RULES` §5: *"Nothing has gone
out yet."* versus *"Nothing went out in July."*

### 5.4 The drawer

Free-text, opened from `/now`. Never blank: seeded with `promptSuggestions`,
which already exist per client. Keeps the existing "Ask for anything" label —
`UX_RULES` §9 records that this copy replaced a metaphor deliberately.

---

## 6. Closing the loop, honestly

Nothing in this spec publishes. The loop still has to close, and it closes with
the client's real behaviour rather than a promise the product can't keep:

1. `Approve post` → status `approved`, with the existing 8-second undo window.
2. On approval, immediately offer `Copy post` and `Mark as posted`. Both are
   verb + object per `UX_RULES` §1.
3. `Mark as posted` → status `posted`, recorded with a timestamp. This is what
   feeds `/record` and moves the goal number.
4. `preparedFor` stays presented as *"prepared for Tuesday"* — a plan, never a
   scheduling commitment.

### The goal metric is honest by construction

`PRODUCT_DIRECTION` §6 pushback 3 forbids claiming attribution the system cannot
compute. `GoalMetric` therefore has exactly two shapes, and **the source is always
rendered next to the number**:

- `platform` — views, engagements, profile visits. Real, but modest.
- `logged` — an operator-logged win, labelled *"logged by your strategist"*.

There is no third shape. A metric that would require call tracking or
click-attribution cannot be expressed in this type, which makes the honesty
constraint structural rather than a matter of discipline.

### When publishing arrives — a flagged rule conflict

`UX_RULES` §2 currently reads *"Nothing in this product is irreversible — no
screen can publish — so no action earns a confirmation dialog."* Publishing
breaks that premise. Do not silently contradict it; amend it.

**Recommendation:** when a publishing vendor lands, implement it as a **15-minute
held send with a real `Cancel send` action**, not a confirmation dialog. That
preserves act-then-undo — the rule's actual intent — instead of introducing the
product's first modal. This also keeps the universal approval gate intact,
because the hold starts only after an explicit approve.

Publishing is otherwise **out of scope here** and blocked on the vendor decision
in `PRODUCT_DIRECTION` §10.1.

---

## 7. The play library

Six seed plays. Enough to cover the real customer base without inventing a
library nobody has used. Each ships as a typed module under
`src/lib/plays/library/`.

| Play | Fits | Asset recipe | Client effort |
|---|---|---|---|
| Referral reactivation | local_service, professional_practice · referral | email → post → post | approve_only |
| Local authority cadence | local_service, hospitality · local_search, walk_in | post ×2 → graphic (→ review_reply, pending decision 4) | approve_only |
| Proof stack | professional_practice, b2b_services · referral, outbound | article → carousel → post ×2 | approve_only |
| Objection series | all (`fits*: []`), gated on `objection` atoms existing | post ×3, each answering one objection atom | approve_only |
| Launch runway | coaching_programs · content_audience, events | email ×2 → carousel → post ×3 | one_answer |
| **Episode amplification** | all (`fits*: []`), gated on transcript-derived `quote` atoms | graphic ×2 → article → post ×3 | approve_only |

Note how "fits any client with a filmed episode" is expressed: not as a business
model, but as `requiredAtomTypes: ["quote", "insight"]`. A client without a filmed
episode has no transcript-derived quote atoms, so matcher rule 3 excludes the play
automatically. Eligibility falls out of the corpus rather than needing a flag.

**Episode amplification is the strategically important one.** It turns footage
InsideSuccess already owns into quote graphics, a long-form piece and a post
series, all grounded in transcript atoms. No competitor surveyed in
`PRODUCT_DIRECTION` §5 can run it, because none of them film their clients. It
should be the play used in every demo.

### Matcher rules

`matchPlays(brief, atomSummary)` — pure, no I/O:

1. **Hard exclude** if `brief.businessModel` ∉ `play.fitsBusinessModels`.
2. **Hard exclude** if `brief.acquisitionMotions` ∩ `play.fitsMotions` is empty.
3. **Hard exclude** if any `play.requiredAtomTypes` is absent from the corpus —
   a play whose inputs don't exist must never start a campaign that stalls
   halfway.
4. **Hard exclude** if `play.clientEffort` exceeds `brief.effort`.
5. **Rank** the survivors by motion-overlap count, then by how fresh the required
   atoms are.
6. **Cap one running campaign per client.** This is a friction control, not a
   technical limit, and it is what keeps `/now` to one focus sentence.

---

## 8. Asset pipelines

`post`, `review_reply` and `email` already exist; they gain per-channel
validators and nothing else.

**`carousel` — structured slides, never a text blob.** Generation returns
`Slide[]` with a role per slide (hook / point / proof / cta). A blob makes
preview, per-slide editing and re-render impossible. Preview is a swipeable stack
on mobile, a horizontal row on desktop; validator enforces 3–8 slides and the
per-slide character ceiling.

**`graphic` — rendered from templates plus brand tokens, not from an image
model.** A `quote` or `proof_point` atom is already the input. Three templates in
v1: quote, stat, tip. Deterministic, cheap, on-brand, and with no
generation-time surprises in front of a client. Image models are a later
decision, if ever.

**`article` and `email` — sectioned, not monolithic.** `{ heading, text }[]` so
provenance can attach per section and the client can skim. No per-network limits;
validators enforce sane section counts.

All six kinds render provenance through the existing `SourcedBody` and their
reasoning through `WhyThis`. That is what makes a carousel feel like the same
product as a post.

Brand tokens (logo, two colours, font choice, CTA) are captured operator-side at
onboarding and stored on the Brief. Without them, `graphic` and `carousel` steps
are excluded by matcher rule 3 rather than rendering unbranded.

---

## 9. Failure behaviour

Designed, not incidental. Each of these gets a test.

| Failure | Behaviour |
|---|---|
| Engine unreachable | Serve cached last-good context with a banner. Generation pauses. **Existing drafts stay approvable** — the client's approve action must never depend on the engine being up. |
| Generation fails for one asset | Asset sits at `failed` with a retry. It never blocks the rest of the queue, and the client sees the queue minus that item, not an error. |
| Guardrail trips (never-say hit) | Asset goes to `held`, flagged to the operator, **never rendered to the client**. Fails closed. This is the Careful Professional's quit condition. |
| Play's required inputs missing | Matcher excludes the play. No half-started campaign. |
| Brand tokens missing | `graphic` / `carousel` steps excluded; text-only plays still run. |
| Outcome data unavailable | Goal line shows the goal and the target with no progress numeral, plus *"nothing measured yet"* — never a zero implying failure. |
| Client and operator disagree on a Brief field | Client value wins and is labelled; the operator's suggestion stays visible. No silent overwrite. |

Per `UX_RULES` §4, every client-facing error leads with the promise that
survives: nothing was sent, nothing was lost.

---

## 10. Testing

Mirrors the engine's discipline: **keyless by default**, so CI needs no API keys.

- **Pure units:** the matcher (fixture briefs → ranked plays), every asset
  validator, Brief construction from a recorded `/context` response, outcome
  rollup arithmetic.
- **Component:** one test per asset kind through `AssetPreview`; `DecisionBar`
  identical across kinds; the existing 36 WCAG contrast gates extended to the new
  previews across all four themes.
- **Generation:** a deterministic fake provider returns fixed drafts. The real
  provider activates on env vars only, exactly as the engine does it.
- **e2e:** the 6 existing specs stay green. One new spec covers the whole loop —
  brief → matched play → generated assets → approve → mark as posted → outcome
  appears in `/record` and the goal number moves.
- **Regression gate:** an e2e assertion that a `held` asset never appears in any
  client-facing list. This is the one that protects the trust story.

---

## 11. Build order

Five stages, each independently shippable and each leaving the app working.

**S1 — Model and matcher, no visible change.** Add `lib/brief`, `lib/plays`,
`lib/assets`. Migrate fixtures from `FixtureDraft` to `Asset` (three existing
kinds only). Write the six plays and the matcher. All pure, all unit-tested.

The UI still renders exactly as today, which is only true if the migration ships
with a `fixtureDraftToAsset()` adapter and the existing components keep consuming
their current props until S2 changes them. Do the type migration and the component
rewrite in separate commits — a single commit doing both is how the 70 green tests
turn into an afternoon of debugging.

**S2 — `/now`.** Rename `/today`. Add the goal line and the focus sentence. Make
`CardStack` polymorphic via `AssetPreview`. Still posts, replies and emails only.

**S3 — New asset kinds.** `carousel`, `graphic`, `article` — types, validators,
previews, template renderer, brand tokens on the Brief.

**S4 — `/plan` and `/record`.** Absorb profile and settings into `/plan`, add
Adjust with its three controls, build `/record` with outcome recording. Demote
`/workspace` to a drawer.

**S5 — Engine wiring.** Replace fixtures with real `/context` behind
`lib/engine`. Keep the fake providers for CI. This is deliberately last: the
product owner confirmed fixtures are not the source of dissatisfaction, so
wiring should follow the shape being right.

Demo-ready at the end of S4, on fixtures, with no vendor dependency.

---

## 12. Out of scope, by decision

- **Publishing and scheduling.** Blocked on `PRODUCT_DIRECTION` §10.1. See §6 for
  the rule amendment it will require.
- **Operator authoring UI for plays.** Plays are repo files in this spec. A
  CMS-style authoring surface is a later spec.
- **Video assets.** Clips, reels, thumbnails, audiograms. Explicitly excluded by
  the product owner despite the footage existing.
- **Real attribution.** No call tracking, no click attribution. Structurally
  excluded by `GoalMetric`.
- **Image-model generation.** Graphics render from templates.
- **Adaptive persona inference.** `PRODUCT_DIRECTION` §8.3 — adaptable first,
  adaptive later.

---

## 13. Open decisions for Saqlain

Each with a recommendation, so silence is a workable default.

1. **Does the client get `Adjust` at launch, or does the operator hold all Brief
   edits initially?** *Recommendation:* ship `/plan` read-only with a "Ask for a
   change" affordance into the drawer; add the three Adjust controls once you've
   seen what clients actually want changed. Cheaper, and it protects the Brief's
   integrity while you learn.
2. **Goal metric default per business model.** *Recommendation:* `logged` for
   local_service and professional_practice (their real goals are calls and
   enquiries, which no platform reports), `platform` for coaching_programs where
   audience growth is genuinely the goal.
3. **Who writes the six seed plays?** *Recommendation:* you, in prose, one page
   each — then an agent converts prose to the typed module. The marketing
   judgement is the part that can't be delegated; the TypeScript is the part that
   can.
4. **Does `review_reply` stay in scope?** It exists in the fixtures and fits
   Local authority cadence, but it needs a review source (Google Business) that
   isn't wired. *Recommendation:* keep the kind, drop it from the seed recipe
   until the source exists.
5. **One running campaign, or one per channel?** *Recommendation:* one, full
   stop. It is the single strongest friction control in this design.

---

## 14. Traceability

| This spec | Source |
|---|---|
| Three surfaces, persona as settings not forks | `../marketing tool/docs/PRODUCT_DIRECTION.md` §7.1, §6 pushback 1 |
| No fake attribution | ibid. §6 pushback 3, §12 |
| Onboarding answers feed the engine | ibid. §6 pushback 4 |
| Escape hatch from guided surfaces | ibid. §5.4 (NN/g) |
| Engine unchanged | ibid. §7.3 |
| Block-on-silence always | `docs/DECISIONS.md` 2026-08-03 |
| Verb + noun labels, act-then-undo, one number per idea, no internal vocabulary | `docs/UX_RULES.md` §1, §2, §9 |
| `kind` extension rather than replacement | `src/lib/fixtures/clients.ts:37` comment |
| Marketing explained, not the interface | ibid. `Rationale` doc comment |
| Provisional → confirmed Brief fields | `../marketing tool/docs/ENGINE_BRIEF.md` atom lifecycle |

**Epistemic note.** The diagnosis in §1 comes from reading this repo's code and
docs plus a brainstorming session with the product owner on 2026-08-05. It has
not been validated against a real client using the product, because no client has
used it yet. The persona claims it leans on are sourced in `PRODUCT_DIRECTION`
and inherit that document's caveats.
