# HANDOFF — this project is PAUSED

**Paused:** 2026-08-06, by Saqlain.
**Do not resume without Saqlain saying so by name.**

## Why it's paused

Abdul independently built his own v2 frontend (this repo is Saqlain's competing
version — the two were an A/B). Abdul's version won the call for now, and he has
written backend documentation to go with it. The active track from 2026-08-06 is:

1. Wire Abdul's frontend to the backend, using his backend docs.
2. Modify that frontend from there.
3. Saqlain will fork Abdul's frontend into a **"final frontend"** folder in a
   GitHub repo he'll supply the link to. That repo — not this one — is where work
   happens next.

**This repo is not part of that track.** Nothing in here should be copied,
referenced as a spec, or treated as the design of record for the final frontend
unless Saqlain explicitly asks. If you're reading this because a memory or a doc
pointed you here during work on the final frontend: that's a stale pointer. Stop
and ask.

Resuming is expected "over the weekend" at the earliest, and only if Saqlain says
this branch of work is live again.

---

## What this repo is, in one paragraph

A Next.js 16 / React 19 / Tailwind v4 client-facing product for InsideSuccess.TV,
running entirely on fixtures — **never wired to the Client Content Engine.** It
turns a client's prepared marketing into a stream of one-at-a-time decisions:
each draft arrives with the words it was built from, why it was made, and what
protection was applied, and nothing leaves without an explicit yes.

Repo: `https://github.com/saqlainartaz/ai-marketing-tool-frontend-v2`
Last commit at pause: `8800f7d`.

**State at pause:** 141 unit tests, 20 e2e, all green. Build clean.

```
npm test                 # vitest, 141
npx playwright test      # 20 e2e + 8 skipped gallery
npm run e2e              # next build && playwright test
GALLERY=1 npx playwright test e2e/gallery.spec.ts   # 128 screenshots, 16 screens x 4 themes x 2 viewports
```

---

## What was built (chronological, condensed)

**The studio build — 7 phases, completed 2026-08-05.** Dark-first rebuild:
`studio` is the default theme (renamed from `night`), elevation by lightness
rather than shadow, APCA added as a second opinion on top of the 36 WCAG contrast
assertions. The accent rule became *"colour always means something, decoration
gets none."* Surfaces added: `WhyThis` (marketing reasoning per card),
`VoiceSurface` (evidence, tone matrix, terminology tiers, versions),
`LegibleMemory` (read-only profile with a dispute flag), `/review/:id` (no-login
client link), `/documents` (teach-it flow), `/demo` + summonable `Guidance`.

**Two rules discovered by looking at screenshots rather than reasoning**, both now
in `docs/UX_RULES.md` §10 and §11:

- Reading measure is the default; full width must be earned by a page that puts
  something in it. `AppShell` holds the `WIDE` list.
- *"Never a blank page"* yields to **"never put words in the client's mouth."**
  The Workspace box ships empty on purpose — its suggestions are plausible, not
  true, and pre-filling one would have the product assert a job that may never
  have happened.

**Stage 1 of the month plan — completed 2026-08-06.** See below.

**Not done, and known:** the outdoor-daylight handset check on the dark default.
It needs a real phone in sunlight and can't be simulated. Still the one open
question on the studio palette.

---

## The expensive knowledge: the audit of `docs/proposals/`

On 2026-08-06 three proposal documents plus two mockups arrived in
`docs/proposals/`, written by an outside agent that read the repo but never ran
it. **Roughly 40% is worth taking; the rest would have cost the month.** The full
audit is below because it is the most expensive thing produced this session and
it does not survive in the code.

### The finding that mattered most

The approved mockup's palette **fails this repo's own contrast gate on its
most-used text colour.** `--ink-3` is "the whisper" and the only metadata role in
the proposed five-role scale. Measured with the same maths as
`tests/theme/contrast.test.ts`:

| Pair | Proposed | Gate requires | Current studio |
|---|---|---|---|
| `--ink-3` on page, light | **2.45:1** | 4.2 | — |
| `--ink-3` on raised, light | **2.26:1** | 4.5 | — |
| `--ink-3` on page, dark | **3.24:1** | 4.2 | 7.57:1 |
| `--ink-3` on raised, dark | **2.92:1** | 4.5 | 6.39:1 |

Every whisper on screen — dates, channel, source labels, rule origins — would
have failed WCAG AA at 11px, for an audience `UX_RULES` defines as "often older,
usually on a phone." Worse, the work order's own verification step could not have
caught it: Order 1 tells you to verify with the 36 contrast gates, but it also
deletes the tokens those gates measure (`--moss`, `--honey`, `--onact`, `--clay`
…), so the test doesn't fail — it stops being able to run.

### Other confirmed errors

- **Test counts are wrong throughout** — the docs say "70 unit tests, 6 e2e
  specs"; it was 124 and 21 at the time. The clearest evidence they never ran it.
- **"Six tabs"** — there are eight routes under `(tabs)`.
- **`/voice` and `/documents` are never mentioned once**, in any of the three
  documents (grep-verified). The proposed IA collapses to `/now`, `/plan`,
  `/record` + a drawer, silently dropping `VoiceSurface` and the teach-it flow —
  the two newest and most differentiated surfaces in the build. `/review/:id` is
  missing from the IA table too.
- **The matcher rules kill every universal play.** §3.2 says an empty `fits*`
  array means "fits all", but matcher rule 1 excludes when `businessModel ∉
  fitsBusinessModels` and rule 2 when the motion intersection is empty — both
  always true for `[]`. `episode-amplification`, which the same document calls
  "the play in every demo", would never match.
- **`EffortLevel` and `WorkMode` are inverted, not merely different.** `suggest`
  is the client's *highest* effort, `handle` the lowest. Mapping them positionally
  makes matcher rule 4 do the opposite of what's intended, silently.
- **`Asset` requires `provenance` and `rationale`;** the fixtures have both
  optional, with 14 rationale blocks across 22 draft ids. `fixtureDraftToAsset()`
  cannot be a total function.
- **`DecisionBar` and `AssetPreview` don't exist**, though §4 states a boundary
  rule about `DecisionBar` as if it constrains existing code.
- **`AtomType` is already defined** in `src/lib/fixtures/engine.ts`; the spec
  redeclares it.
- **Wrong file** — Order 1 says the palette is in `src/app/globals.css`. It's in
  `src/lib/theme/tokens.css`.
- **The doc contradicts its own work order:** §2.2 says "replaces the *default*
  theme's identity, not the architecture"; Order 1 says "for all four themes" —
  and supplies only one light and one dark palette.
- **"Days, not weeks"** for the type pass: it's 193 call sites (`t-sub` 58,
  `t-meta` 84, `t-label` 51), and the proposed five-role scale has no home for
  `t-sub` or `t-title`.
- **Colour semantics get deleted silently.** "One accent, twice per screen" means
  colour can no longer distinguish action from protection from win. In the mockup
  the guardrail line renders in grey `--ink-3` — the Careful Professional's entire
  reason to trust the product, gone, unremarked.
- Smaller `UX_RULES` breaks in the mockup: toasts over the ~30-character cap
  (§3), a bare "Add" button (§1), a 4.4s undo against the binding 8s (§2), and
  three numerals in the chrome (§9) — which contradicts its own companion spec's
  claim that the goal line is "the only numeral."

### What is genuinely good in the proposals, and was accepted

1. **The timecode receipt.** `label: "your episode, March · 22:14"` really is
   sitting in `src/lib/fixtures/clients.ts:221`. Splitting it onto its own line is
   presentation-only and it's the best idea in the set.
2. **The reject button as the learning loop** — four taps, no typing, converts the
   product's worst moment into visible learning.
3. **Asymmetric guardrails** — client adds and removes their own; can challenge
   but never remove operator- or compliance-derived rules.
4. **`GoalMetric` with exactly two shapes** — implemented in Stage 1, see below.
5. **§1.1 / §1.2 diagnosis** — accurate and measured from the code.
6. **§6's rule-conflict handling** — flag the conflict, amend the rule, propose a
   held-send instead of the product's first modal. The right way to do it.
7. **The licence discipline** — reading licence files rather than badges, catching
   that two "unlicensed" repos are stripped MIT re-uploads.

---

## The approved month plan

Full plan was at `C:\Users\saqla\.claude\plans\prancy-rolling-spring.md` (session
scratch — assume gone). Reproduced here in outline.

**Decided with Saqlain 2026-08-06:** day 30 is **a demo he drives** (Tyler, Rudy,
the A/B), **no engine wiring** inside the month, and the strategy layer is **six
hand-written plays, operator-assigned — no matcher, no 40-play catalogue.**

The organising idea: *don't build the selection layer, build the explanation
layer.* Explanation is what makes it a marketing tool; selection is what makes it
a platform, and a platform is next year's problem at fewer than ten clients.

**Five beats the demo must land:** it arrives with the work done · it shows its
receipts · it explains the marketing not the interface · **it learns from a no** ·
**the loop closes.** The last two win the A/B — neither is copyable without the
engine underneath.

| Stage | What | Status |
|---|---|---|
| S1 | The goal, and the number that moves | **Done** |
| S2 | The no that teaches — reject sheet + typed asymmetric never-say list | Next |
| S3 | The argument at three levels — `Reasoning` type + six plays | Not started |
| S4 | Design correction — role token layer, spruce, whisper collapse, timecode receipt, deference on `/now` | Not started |
| S5 | Demo hardening — script, Amara's depth, gallery reshoot, rehearsal | Not started |

**Cut deliberately:** the matcher and catalogue · the chat framework (Order 6 —
`/workspace` already takes a sentence and returns a card, not prose) · the command
palette · the `graphic` asset kind (a brand-asset pipeline wearing a bullet's
clothing) · `carousel`/`article` (deferred) · deleting `t-sub` · replacing all
four palettes · engine wiring · publishing.

### Stage 1, as built

`src/lib/brief/types.ts` — `Goal`, `GoalMetric`, `BriefField<T>`, `SourceRef`.
`src/lib/outcomes/index.ts` — `goalProgress()`, pure.
`src/components/goal/GoalLine.tsx`, rendered on `/today`.

The load-bearing decision, **which Saqlain has not yet accepted or rejected**:
`GoalMetric` has exactly two shapes — a platform reported it, or a person logged
it and we name them. There is no third. `goalProgress` admits an outcome only if
its source matches the metric, so **marking a post as posted cannot move a
"booked jobs" number** — not by policy, but because no path through the types
allows it.

The demo beat therefore becomes *"the goal didn't move, because we didn't book
you that job — your work did. When your strategist logs the booking, that's when
it moves."* Argued as the stronger beat: every competitor's dashboard implies the
link, and refusing to is not copyable by anyone who already built the lie in.

`e2e/honest-goal.spec.ts` exists to fail the day someone wires the two together
for a nicer demo — a lie that isn't being told is invisible, so only a test
catches it starting.

Dave's goal is the `logged` shape, Amara's the `platform` shape, so both are
visible side by side.

---

## Known issues carried into the pause

- **A control can be pressed before React hydrates and do nothing.** Found as an
  e2e flake (~1 cold run in 3) and fixed *in the test* by retrying the click. The
  product-side defect is real and unfixed: a user on a slow phone can tap before
  hydration and get nothing, which `UX_RULES` §8 calls a bug. Exposure is small
  (the confirm screen is several lines of reading first). Was slated for S4.
- **`docs/DECISIONS.md` is stale** — still records "default Cobalt" and the old
  `night` theme name, both superseded by the studio build. Needs amendment rows.
- **The dark default has never been checked on a real phone outdoors.**

---

## If you are picking this up again

1. Confirm with Saqlain that this repo is live again. Do not assume.
2. Read `docs/UX_RULES.md` and `docs/DESIGN_SYSTEM.md` first — they are binding
   and several were written because a specific bug happened.
3. `docs/proposals/README.md` still says its contents are proposals awaiting
   approval. That remains true, with the audit above as the standing response.
4. S2 is next: the reject sheet, and `lockedNeverChips: string[]` becoming typed
   with an origin. The asymmetry pattern already exists — `LegibleMemory` has
   `locked` and a dispute flow for atoms; it's the same shape applied to a second
   list.
