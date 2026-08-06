# Design direction and chat architecture

**Date:** 2026-08-06
**Companion to:** `handoff-campaign-spine-draft.md` · `handoff-play-catalogue-draft.md`
**Design direction:** approved 2026-08-06 (quiet premium) from the mockup below
**Reference mockup:** https://claude.ai/code/artifact/06607361-35da-4b48-8b61-9748240b973e
· local copy `mockup-now-quiet.html`
**Rejected first attempt** (kept for contrast): https://claude.ai/code/artifact/55e4385f-e032-4ffb-8da2-c169d67e283a

---

## 1. The diagnosis

### 1.1 The type scale can't express hierarchy

From `globals.css`: `t-display` 32–44px, `t-title` 20, then 17, 15, `t-ui` 14,
`t-sub` 13, `t-meta` 11, `t-label` 10.

Seven roles live between 10px and 20px, 1–2px apart. On a phone at arm's length,
`t-ui`, `t-sub` and `t-meta` are the same size. The system *encodes* hierarchy and
can't *express* it, so everything below the headline flattens into one grey mass.
For an older, phone-first audience this is worse than for anyone else.

### 1.2 Nothing on screen dominates

`CardShell` is `rounded-xl p-4` with `surface`. The `primary` card — the one thing
the client should act on — differs by `border-t-2 border-t-clay`. A 2px top border.
Then Now stacks the decision card, next-up rows, the win stat, pillar chips and a
dashed prompt, all at comparable weight. Premium interfaces work by **deference**:
one element commands, the rest recede. There's no deference because there's no
dominant element, and a screen of equal-weight cards reads as a form.

### 1.3 The palette and type were the AI default

AI-generated design currently clusters on a few looks. The first is *warm cream
near #F4F1EA, a high-contrast display face, a terracotta accent.* Desk is
warm-paper canvas, Bricolage display, `clay` accent.

Nothing about it was childish. It was **the generic answer that appears regardless
of subject**, which is exactly why polishing never made it feel like yours.

**What survives:** the token architecture, four-theme switching, the contrast
gates, the sidebar, and `post-preview` — which is genuinely good (per-platform
action rows, Google Business getting Call/Website/Directions). The rest of the UI
was competing with it.

---

## 2. Direction: quiet premium

Approved from the mockup. The rules below are what made it work — they are
measured from the built artifact, not theory.

### 2.1 The five rules

1. **Open with a sentence, not a dashboard.** *"Two posts ready, Dave."* at ~54px,
   then air. No greeting-plus-counter, no stat tiles, no progress bar above the
   fold. The screen's first job is to say what's happening in human words.
2. **No borders anywhere.** Separation is 64px of space between sections and
   nothing else. A 1px rule on every row is admin-panel language, and it was the
   single biggest tell in both the current build and the rejected first mockup.
3. **Seven elements, not fourteen.** Deleted from the mockup and to be deleted
   from the app: the rundown segment bar, next-up as bordered rows, the pillar
   chip, the mode pill, the result card, the dashed prompt affordance.
4. **Two sizes and a whisper.** 54px display · 19px content · 11px mono metadata.
   Nothing in the middle band. Secondary hierarchy comes from **weight**, never
   from a 1px size step.
5. **One accent, twice per screen.** On the approve action and the timecode. Not
   on links, labels, icons, chips and borders as well.

### 2.2 Tokens (as built)

```css
:root {
  --paper:    #FBFBFA;  /* off-white, never #FFF */
  --raised:   #F2F2F0;  /* the one contained object */
  --ink:      #17171A;  /* off-black, never #000 */
  --ink-2:    #6C6C74;
  --ink-3:    #A2A2A9;  /* the whisper */
  --accent:   #14584A;  /* deep spruce */
  --accent-t: #E4EFEA;
}
/* dark */
--paper: #0E0E10; --raised: #191A1D; --ink: #F2F2F0;
--ink-2: #9A9AA2; --ink-3: #63636B; --accent: #58C0A2; --accent-t: #16241F;
```

**Why spruce and not blue.** Every SaaS product is blue; blue reads as *software*.
Spruce reads as confidence, and it happens to be the colour of the only action on
the screen. It clears WCAG AA on both grounds. Keep the four themes — this replaces
the *default* theme's identity, not the architecture.

**Type scale — five roles, ~1.6 ratio:**

| Role | Size | Weight / treatment |
|---|---|---|
| display | clamp(2.6rem, 2rem + 3.4vw, 3.4rem) | 800, `-0.038em`, `text-wrap: balance` |
| content | 1.1875rem / 19px | 400, `-0.011em`, line-height 1.6 |
| body | 1.0625rem / 17px | 400 |
| ui | 1rem / 16px | 600 for controls |
| whisper | 0.6875rem / 11px | mono, uppercase, `+0.13em`, `--ink-3` |

`t-sub`, `t-meta` and `t-label` are **deleted, not renamed.** The deletion is the fix.

### 2.3 The signature: the timecode receipt

```
22:14 · your episode, March
“…just last month we had three inspections where the homeowner had no idea…”
```

Their own words, set as content in italic, with the moment they said them in mono
accent above.

**This is already in your data.** `src/lib/fixtures/clients.ts` has
`label: "your episode, March · 22:14"` — the timecode is sitting inside a label
string. Split it out and give it its own line. Presentation, not plumbing.

It's the trust story made visible, and it's uncopyable: a competitor with no
footage has no timecode.

### 2.4 Display face

The mockup uses the system stack because Artifacts can't load webfonts. In the app,
swap Bricolage for **Archivo Expanded** (SIL OFL, Google Fonts, self-hosted via
`next/font` like the current faces). Wide grotesque at 800 weight reads as
considered; Bricolage reads as 2026 startup default. Body stays **Inter** —
changing it trades legibility for character in the one place an older audience
can't afford it. Mono stays **JetBrains Mono**.

One font swap. Not three.

### 2.5 Cost

Tokens, type scale, and deletions: days, not weeks. The 36 contrast gates tell you
immediately if a theme broke. Not recommended: rebuilding the four themes, or
touching `post-preview`.

---

## 3. Guardrails the client can edit

Requested 2026-08-06. The engine seeds the never-say list at onboarding from
`claims_blacklist` and `voice_constraint` atoms; the client needs to add their own.

### 3.1 Asymmetric by design

| Constraint origin | Client can add | Client can remove |
|---|---|---|
| Engine-extracted, operator-confirmed | — | No. Can **challenge**, which routes to the operator |
| Compliance / licence-derived | — | No, ever |
| Client-added | Yes | Yes |

Same precedence rule as the Brief: a client change never silently overwrites an
operator-confirmed field. In the mockup, licence-derived rules show
`Licensed trade` and carry no remove control; client rules show `You added this`
and a 44px remove target.

### 3.2 The reject button is the learning loop

**The most valuable interaction in the product.** A rejection is the one moment a
client knows exactly what's wrong — so don't waste it on a shrug.

`Not this one` opens a sheet: *What's wrong with it?*

| Option | Effect |
|---|---|
| Doesn't sound like me | Writes a voice note against the profile |
| Can't claim that | Drops the asset, flags the unsupported claim |
| **Never say this again** | **Writes a permanent constraint** |
| Not right now | Requeues |

One tap, no typing — which is what makes it usable by a roofer in a truck. It
converts your most negative moment into visible learning, and people don't abandon
a tool they've trained. Every rule added is also engine input.

Rules added this way carry `source: { kind: "client" }` and appear immediately in
the never-say list.

---

## 4. The chat surface

### 4.1 Generative UI keeps it from becoming a second product

A chat surface for advanced users plus card surfaces for beginners is two products
in one codebase, and `PRODUCT_DIRECTION` §5.4 says parallel modes rot.

**The chat returns components, not prose.** It emits the same `Asset` cards the Now
screen renders — provenance, guardrail line, approve and skip. A client says
*"we're getting storm damage calls this week"* and gets a draft card back, not three
paragraphs about content strategy. One set of components, two entry points: pushed
at you on a schedule, or pulled by asking.

### 4.2 Architecture

Typed properly — the message stream is a discriminated union, not `string`:

```ts
// src/lib/chat/types.ts
export type ChatPart =
  | { type: "text"; text: string }
  | { type: "asset"; asset: Asset }            // renders the real card
  | { type: "play_proposal"; playId: string; why: string }
  | { type: "brief_change"; field: keyof Brief; from: string; to: string }
  | { type: "receipt"; atomId: string; timecode?: string; quote: string }
  | { type: "tool_running"; label: string }    // reuse AssemblyMoment
  | { type: "refusal"; reason: "guardrail" | "no_evidence"; detail: string };

export type ChatMessage = {
  id: string;
  role: "client" | "assistant";
  parts: ChatPart[];   // ordered; a reply can mix prose and cards
  at: string;
};
```

Two rules:

1. **No assertion without a `receipt` part.** No `proof_point` atom, no claim. A
   `refusal` with `reason: "no_evidence"` is a correct answer — *"I don't have
   anything in your material that supports that"* is more trustworthy than a
   confident guess, and it's the thing ChatGPT will never say.
2. **Guardrails run on chat output too.** A `claims_blacklist` hit produces a
   `refusal`, not a draft. The client never sees the violating text.

**Libraries** — all verified permissive on 2026-08-06 by reading the licence file:

| Library | Licence | Holder | Role |
|---|---|---|---|
| assistant-ui/assistant-ui | MIT | AgentbaseAI Inc., 2025 | Typed React chat primitives — closest fit |
| TanStack/ai | MIT | Tanner Linsley, 2025 | Type-safe streaming + tool calling |
| CopilotKit/CopilotKit | MIT | Atai Barkai | Generative UI, heavier and more opinionated |
| vercel-labs/json-render | Apache-2.0 | — | Generative UI via JSON contracts |
| tambo-ai/tambo | MIT | Fractal Dynamics Inc., 2025 | Generative UI SDK |

*Recommendation:* `assistant-ui` for primitives plus your own thin typed provider
layer. **Never let a framework own the message shape** — `ChatPart` is your
contract, and a framework that owns it will fight the `Asset` model. Ledger rows go
in `docs/DECISIONS.md`.

### 4.3 What the chat knows

All context you already have: business context and voice profile · never-say
constraints · **the calendar and plan** — what's scheduled, running, due · **the
content and its outcomes** — what went out and how it did · the play catalogue, so
it can propose a play rather than improvise a post.

Which produces answers no general assistant can give: *"you've got three posts
waiting and the roof-storm one is your best performer this month — want two more
like it?"*

### 4.4 Where it sits

Not a tab. A **floating pill fixed at the bottom of `/now`** — the mockup shows it —
one line, seeded, never blank. Expands into the conversation when used. Cards stay
the default; talking is available, never required.

### 4.5 Voice — deferred, seam kept

Deferred by decision. Keep the input's contract at `(text) => ChatMessage` and
nothing more, so a microphone can be added later without touching anything
downstream. Transcription stays parked; the seam does not.

---

## 5. Growth: features without new screens

Dispatch, art effects, and whatever comes next. A tab per feature is how products
become unusable.

**A command palette is the growth mechanism.** One keystroke, one search field,
every play and action reachable. New features become entries, not navigation. It's
also how Wispr Flow feels dense without looking cluttered — depth lives behind a
keystroke, not on the surface. Clients who never press a key combination lose
nothing; the cards still arrive.

---

## 6. Why not ChatGPT

The frontend is the answer to this, not the engine.

1. **It arrives with work already done.** ChatGPT is a blank box that requires you
   to know what to ask. For ~70% of your base, knowing what to ask is the thing
   they can't do.
2. **Receipts.** Every claim traces to a timecode and a speaker. ChatGPT will
   invent a plausible statistic about their business.
3. **Negative knowledge.** `claims_blacklist` and `voice_constraint` mean the
   product knows what they must never say. Nobody thinks to tell a general
   assistant this.
4. **The loop closes.** A goal, a plan, a record of what went out and what it did.

Where ChatGPT wins, honestly: raw reasoning, breadth, price. So don't compete on
being a better chatbot. Compete on arriving unprompted, which a chatbot by
definition never does.

For the marketing site: *ChatGPT waits to be asked. This shows up with the work
done, and shows you where every word came from.*

---

## 7. Work orders

Copy-pasteable, one per stage. Run everything from `marketing-tool-v2/`. Each order
ends with its own verification, and each leaves the app working.

### Setup

```bash
cd marketing-tool-v2
npm install
npm test          # 70 unit tests — must be green before you start
npm run e2e       # 6 specs, 4 themes
```

### Order 1 — Design tokens and the deletion pass

```
In marketing-tool-v2, apply the approved design direction from
handoff-design-direction-draft.md §2.

1. Replace the palette tokens in src/app/globals.css with §2.2's values, for all
   four themes. Keep the theme architecture; change only the default theme's
   identity.
2. Replace the type scale with §2.2's five roles. DELETE .t-sub, .t-meta and
   .t-label — do not rename them. Fix every call site.
3. Swap the display face from Bricolage Grotesque to Archivo Expanded via
   next/font. Inter and JetBrains Mono stay. Update the licence ledger row.
4. Apply the no-borders rule: remove every border-b / border rule used as a
   separator. Sections separate by ~64px of space.
5. In src/components/ui/card-shell.tsx, remove the `primary` variant. Only the
   decision object gets the raised treatment now; nothing else on the screen is a
   card.

Verify: npm test (36 contrast gates must pass on all four themes), then
npm run e2e. Commit as one change per numbered step.
```

### Order 2 — The Now screen

```
Rebuild src/app/(client)/(tabs)/today/page.tsx as /now, matching
mockup-now-quiet.html (local file) exactly in structure and spacing.

- Open with a display-size sentence: "Two posts ready, {firstName}."
- One raised object: the decision. Everything below is text on paper.
- The timecode receipt gets its own line: split the timecode out of
  ProvenanceSpan.label ("your episode, March · 22:14") into its own field.
- Actions: one filled pill "Approve post", one bare "Not this one".
- Delete: the rundown segment bar, next-up bordered rows, the pillar chip, the
  mode pill, the result card, the dashed prompt affordance.
- The goal figure renders with tabular-nums and its source label beneath.

Verify: npm run e2e. The existing 44px-target gate on Today must still pass.
```

### Order 3 — Client-editable guardrails and the teaching sheet

```
Implement handoff-design-direction-draft.md §3.

1. The never-say list gains an add form and per-rule removal, asymmetric:
   client-added rules are removable; engine- and licence-derived rules are not and
   render their origin instead.
2. "Not this one" opens the teaching sheet with four options (§3.2). Wire
   "Never say this again" to write a constraint with source { kind: "client" }.
3. Every write goes through StatusProvider.announce() with the 8-second undo.

Verify: new unit tests for the asymmetry (a licence-derived rule must have no
remove control), plus an e2e that rejects a draft, picks "Never say this again",
and asserts the rule appears in the list.
```

### Order 4 — Typed asset model and the matcher

```
Implement handoff-campaign-spine-draft.md §3 and §7, stages S0–S1.

1. Add lib/brief, lib/plays, lib/assets per the type definitions in that document.
2. Import and tag the play catalogue from handoff-play-catalogue-draft.md. Fill the
   `imported` block for anything taken from a licensed source; generate
   THIRD-PARTY-NOTICES.md; add ledger rows.
3. Migrate fixtures from FixtureDraft to Asset (post, review_reply, email only).
   Ship a fixtureDraftToAsset() adapter and keep components on their current props.
4. Build matchPlays() as a pure function. Rules 1–4 are hard filters.

Do the type migration and any component rewrite in SEPARATE commits.
Verify: npm test. The matcher and validators are pure — table-driven tests.
```

### Order 5 — New asset kinds

```
Add carousel, graphic and article per handoff-campaign-spine-draft.md §8.

- Carousels return typed Slide[] with a role per slide, never a text blob.
- Graphics render from templates plus brand tokens, not from an image model.
- One preview per kind behind a single AssetPreview switch.
- DecisionBar must NOT branch on AssetKind.

Verify: one component test per kind, contrast gates extended to the new previews
across all four themes.
```

### Order 6 — The chat surface

```
Implement handoff-design-direction-draft.md §4.

npm i @assistant-ui/react   # MIT — add the ledger row

- ChatPart exactly as specified in §4.2. The union is the contract; do not let the
  library own the message shape.
- An "asset" part renders the same AssetPreview the Now screen uses.
- Enforce: no assertion without a receipt part; a guardrail hit yields a refusal,
  never a draft.
- The input is a floating pill fixed at the bottom of /now, seeded with
  suggestions, never blank. Contract stays (text) => ChatMessage so voice can be
  added later without downstream changes.

Verify: unit tests per ChatPart variant; an e2e where a guardrail-violating request
returns a refusal and no asset is rendered.
```

---

## 8. Open decisions

1. **Archivo Expanded, or keep Bricolage?** *Recommendation:* swap — Bricolage is
   the tell. One config line either way, so try both and look at them.
2. **Does the client get `Adjust` on the Brief at launch?** *Recommendation:* ship
   `/plan` read-only with "Ask for a change" into the chat; add controls once
   you've seen what clients actually want changed.
3. **Does the chat get to change the Brief?** `brief_change` assumes yes with
   confirmation. *Recommendation:* read-only in v1 — a client casually redefining
   their goal mid-conversation is a support problem, not a feature.
4. **`assistant-ui` or hand-rolled?** *Recommendation:* `assistant-ui` for
   primitives, your own `ChatPart`.
5. **Play catalogue size.** Still needs your cuts — see the catalogue doc's closing
   section. The `Fits` column is the highest-value hour anyone spends on this.

---

## 9. Sources

Design skills surveyed (301 repos, 12 query angles, 2026-08-06). Licences read,
not inferred. Of 286 design-relevant repos, 160 are permissive and **104 have no
licence at all** — the same trap as the marketing-skills survey.

| Repo | Licence | For |
|---|---|---|
| ehmo/platform-design-skills | MIT | 300+ rules for Apple HIG, Material 3, WCAG |
| Leonxlnx/taste-skill | MIT | Anti-generic design heuristics |
| ibelick/ui-skills | MIT (Julien Thibeaut) | Design-engineer skills from a practitioner |
| nextlevelbuilder/ui-ux-pro-max-skill | MIT | Already installed locally |
| LottieFiles/motion-design-skill | MIT | Timing, easing, choreography |

**Epistemic note.** §1.1 and §1.2 are measured from the code. §1.3 is a calibration
judgement against known AI-design defaults, not a measurement. §2 is validated only
to the extent that a mockup was reviewed and preferred — it has not been tested with
a client, and the display face in the mockup is the system stack, so letterforms
are unverified. The first design attempt (broadcast/cutting-room, studio grey) was
built and rejected; that URL is kept above for contrast.
