# Play catalogue — draft for review

**Date:** 2026-08-06
**Companion to:** `handoff-campaign-spine-draft.md` (§7 of that document)
**Status:** draft for Saqlain's review. Nothing here is decided.

---

## What this is, and how it was made

32 marketing plays, shaped for the InsideSuccess client base and grounded in what
the Client Content Engine can actually supply.

**Method.** A Precedent survey of 388 GitHub repositories of marketing Agent
Skills (16 query angles, 2026-08-06) produced an inventory of roughly 700 distinct
skill names across licensed and unlicensed libraries. That inventory is a map of
what the market thinks marketing automation consists of. This catalogue is the
subset that applies to businesses like yours, rewritten as plays that consume
engine atoms and produce typed assets.

**On sources and copying.** Skill *names, taxonomies and methods* are facts and
ideas — not protectable, and freely usable as research from any repo regardless of
licence. Skill *prose* is protected. So this catalogue takes ideas from
everything surveyed and text from nothing. Every prompt behind these plays is to
be written in-house against the engine's own vocabulary.

That is not a legal compromise, it is the better build: an imported skill knows
nothing about `objection` atoms, voice profiles, or a `claims_blacklist`. These
plays are written to use all three.

Where a licensed library is genuinely worth copying from — chiefly
`coreyhaines31/marketingskills` (MIT, 43k stars, 23 contributors) — do so under
the attribution rules in the companion spec §7.4. Two apparently-unlicensed
repos, `LeoYeAI/openclaw-marketing-skills` and `davidpc007/openclaw-marketing-skills`,
are near-identical 39-skill re-uploads of that MIT library with the licence
removed; take the content from the MIT original instead.

## What was deliberately left out

The surveyed ecosystem is overwhelmingly built for SaaS and startup marketing.
These recurring skills were excluded because they describe a business your clients
do not run: `paywall-upgrade-cro` · `signup-flow-cro` · `activation-funnel` ·
`onboarding-cro` · `programmatic-seo` · `free-tool-strategy` · `pmax-audit` ·
`app-store-optimization` · `product-feed-optimizer` · `churn-prevention` (in its
subscription-metrics sense) · the entire GA4/GTM/BigQuery audit family.

A roofer has no paywall. A physiotherapist has no activation funnel. Importing
these would produce plays that cannot fire, or worse, fire and produce nonsense.

Also excluded: everything requiring paid-ads spend, since no play should assume a
budget the client hasn't agreed. Paid plays belong in a later batch, gated on an
explicit `hasAdBudget` field on the Brief.

---

## The catalogue

Columns: **Fits** = business models · acquisition motions (empty means all).
**Needs** = engine atom types that must exist or the matcher excludes the play
(companion spec §7, matcher rule 3). **Produces** = the asset recipe, in order.
**Effort** = the client's burden: `approve` (approve or skip only) · `answer` (one
question) · `hands-on`.

### A — Trust and proof (fits nearly everyone)

| Play | Fits | Needs | Produces | Effort |
|---|---|---|---|---|
| objection-series | all | objection | post ×3, one per objection | approve |
| proof-stack | professional_practice, b2b_services, local_service | proof_point | article → carousel → post ×2 | approve |
| episode-amplification | all | quote, insight | graphic ×2 → article → post ×3 | approve |
| testimonial-harvest | all | proof_point | email → graphic ×2 | approve |
| question-answers | all | pain_point | post ×4, one per pain point | approve |
| myth-correction | professional_practice, local_service | insight, claims_blacklist | post ×2 → carousel | approve |

`objection-series` and `episode-amplification` are the two plays no competitor can
run: the first needs typed objection extraction from sales calls, the second needs
footage. Both are InsideSuccess-only by construction.

### B — Local demand

| Play | Fits | Needs | Produces | Effort |
|---|---|---|---|---|
| local-authority-cadence | local_service, hospitality, professional_practice · local_search, walk_in | insight | post ×2 → graphic | approve |
| review-request-loop | local_service, hospitality · walk_in, referral | proof_point | email → review_reply ×2 | approve |
| seasonal-demand | local_service, hospitality · local_search | insight, pain_point | post ×3 | approve |
| service-spotlight | local_service, professional_practice | terminology, proof_point | post → graphic, per service | approve |
| before-after-proof | local_service | proof_point, quote | graphic ×2 → post | answer |
| neighbourhood-presence | local_service, hospitality · walk_in | insight | post ×2 | approve |

### C — Referral and reactivation

| Play | Fits | Needs | Produces | Effort |
|---|---|---|---|---|
| referral-reactivation | local_service, professional_practice · referral | proof_point, quote | email → post ×2 | approve |
| referral-ask | all · referral | proof_point | email ×2 | approve |
| winback | local_service, hospitality, ecommerce | pain_point | email ×2 → post | approve |
| partner-introduction | b2b_services, professional_practice · partnerships | proof_point, tldr | email → post | answer |
| thank-you-loop | local_service, hospitality · walk_in, referral | quote | email → graphic | approve |

### D — Authority and audience

| Play | Fits | Needs | Produces | Effort |
|---|---|---|---|---|
| thought-leadership-arc | coaching_programs, professional_practice, b2b_services · content_audience | insight | article → post ×3 | approve |
| authority-carousel-series | coaching_programs, b2b_services · content_audience | insight, proof_point | carousel ×3 | approve |
| lesson-from-experience | coaching_programs, professional_practice | quote, insight | post ×3 | approve |
| contrarian-take | coaching_programs, b2b_services · content_audience | insight, voice_constraint | post ×2 | answer |
| newsletter-cadence | coaching_programs, b2b_services · content_audience | insight, tldr | email, recurring | approve |
| discovery-call-runway | coaching_programs · content_audience | pain_point, proof_point | post ×3 → email | approve |

`contrarian-take` requires `voice_constraint` atoms specifically because a
contrarian post is the highest-risk asset in the catalogue. Without explicit voice
constraints on file, the play does not run.

### E — Launch and offer

| Play | Fits | Needs | Produces | Effort |
|---|---|---|---|---|
| launch-runway | coaching_programs, ecommerce · content_audience, events | tldr, proof_point | email ×2 → carousel → post ×3 | answer |
| offer-clarity | all | terminology, tldr | post ×2 → graphic | approve |
| event-promotion | all · events | tldr | post ×3 → email | answer |
| pricing-transparency | local_service, professional_practice | terminology, objection | post → article | hands-on |

`pricing-transparency` is marked `hands-on` deliberately: publishing prices is a
business decision, not a content decision, and the client must engage with it.

### F — Education and explanation

| Play | Fits | Needs | Produces | Effort |
|---|---|---|---|---|
| jargon-translation | professional_practice, b2b_services | terminology | post ×3 | approve |
| process-explainer | local_service, professional_practice | terminology, insight | carousel → article | approve |
| compliance-safe-explainer | professional_practice | terminology, claims_blacklist, voice_constraint | article | approve |

`compliance-safe-explainer` exists for the Careful Professional persona. It
requires both negative-knowledge atom types on file, and its generated output
should route through the guardrail check twice — once on generation, once before
it reaches the client.

### G — Ecommerce (import only if these clients exist)

| Play | Fits | Needs | Produces | Effort |
|---|---|---|---|---|
| product-story | ecommerce | quote, proof_point | post ×2 → graphic | approve |
| seasonal-promotion | ecommerce, hospitality | insight | email → post ×2 | approve |
| bundle-explainer | ecommerce | terminology, tldr | carousel → post | approve |

---

## Coverage check

Against the five personas in `PRODUCT_DIRECTION` §3:

| Persona | Plays that fit | Verdict |
|---|---|---|
| Busy Operator (local service, referral + local search) | B and C clusters, plus objection-series, episode-amplification, offer-clarity — 14 plays | Well covered, all `approve` effort |
| Careful Professional (practice, reputation-first) | compliance-safe-explainer, jargon-translation, process-explainer, proof-stack, myth-correction, service-spotlight — 10 plays | Covered, and the two guardrail-gated plays are here |
| Aspiring Authority (coaching, personal brand) | D cluster plus launch-runway — 8 plays | Covered |
| Overwhelmed Newcomer (any, needs leading) | episode-amplification, question-answers, offer-clarity — the low-effort grounded ones | Thin by design. Their need is cadence and being led, which is the surface's job (companion spec §5.1), not the catalogue's |
| Delegator (assistant operates) | all of them — the assistant's effort ceiling is higher | Covered |

Two honest gaps: **hospitality** has only 6 plays and **b2b_services** 8, so
whichever is rarer in the real base should be dropped from v1 rather than
half-served. And no play in this catalogue drives paid acquisition, which is a
deliberate exclusion, not an oversight.

---

## The prompt behind a play

One prompt per play, written in-house, all following one structure. This is what
keeps it from becoming "messy all files" — every play is the same six sections, so
they are comparable, reviewable, and cheap to add to.

```markdown
# <play id>

## Role
One paragraph. Who the writer is and what standard they work to.

## When this applies
The client situation this play answers. Mirrors the fits/needs tags so the
prompt and the matcher can't drift apart.

## Inputs
Which engine atoms arrive, and what to do with each type. Explicit:
"`proof_point` atoms are the only permitted source of numbers. If none carry
`evidence_kind: measured`, write no figures at all."

## Output contract
The asset kinds, in order, with structure. Carousels return typed slides with
roles, never prose (companion spec §8).

## Guardrails
The client's `claims_blacklist` and `voice_constraint` atoms, restated as hard
prohibitions. Plus: no invented statistics, no claim without a `proof_point`,
no first-person voice unless the voice profile establishes it.

## Rationale output
The play must emit the three `Rationale` lines the UI shows — moment, channel,
shape — in the client's own terms. This is not optional: it is the product's
through-line, and a play that can't explain itself shouldn't run.
```

Two rules for the whole set:

1. **Every prompt receives atoms, never raw documents.** The engine's line-numbered
   data-block discipline is what stops a client's own document prompt-injecting
   the generator; going around it with raw text loses that.
2. **A play that cannot cite cannot claim.** If an asset makes a factual claim
   with no `proof_point` behind it, that is a generation bug, not a style issue.

---

## What I'd want from you on this

1. **Cut it down.** 32 is my proposal, not a target. Which of these would you
   actually put in front of a client, and which are me pattern-matching from a
   GitHub survey? Your cuts are more valuable than my additions.
2. **The two gap calls:** is hospitality or b2b_services rarer in your base? Drop
   the rarer one from v1.
3. **Ecommerce in or out** (cluster G) — do you have those clients?
4. **The tags are the product.** The `Fits` column is my guess from persona
   research. You know which businesses win work which way. Correcting that column
   is the highest-value hour anyone spends on this feature.
