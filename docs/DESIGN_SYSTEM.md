# The design system

Binding. `tests/design/scale.test.ts` enforces the parts a test can see;
the rest is on review.

**Why it exists.** An audit in August 2026 found colour was the only
disciplined layer in this app — and the reason was simply that colour was
the only layer with tokens. Everything else had nothing to conform to, so
648 spacing values, ~21 font sizes and 7 elevation treatments were each
decided alone at the call site. The fix wasn't taste. It was giving the
other layers something to conform to.

---

## The five scales

### Spacing — a 4px grid, no half-steps

`1 · 2 · 3 · 4 · 6 · 8 · 12` (4→48px). Half-steps produce 2/6/10/14px,
which is what an improvised scale looks like: 27% of all spacing was
half-steps, and `gap-1.5` was the single most-used gap in the product.

`--spacing-nav` (72px) is the bottom bar's clearance. It used to be
guessed four different ways — `pb-24`, `pb-20`, `pb-16`, `bottom-[76px]`.

**Rule:** if a value needs to sit between two steps, one of the steps is
wrong. Fix the scale, not the call site.

### Type — eight roles, and nothing outside them

| Role | Size | Voice | For |
|---|---|---|---|
| `.t-display` | 32–44 | display | the moment on a screen |
| `.t-title` | 20 | display | a card's own name |
| `.t-lead` | 17 | body 600 | an object's title in a list |
| `.t-body` | 15 | body | reading text — draft bodies, paragraphs |
| `.t-ui` | 14 | body 500 | controls, rows, labels |
| `.t-sub` | 13 | body, ink-2 | secondary and help text |
| `.t-meta` | 11 | mono, ink-3 | metadata |
| `.t-label` | 10 | mono caps, ink-3 | eyebrows |

Each role binds **size + line-height + weight** together, because those
drifting apart is what produced 12 sizes inside a 5px band.

Three voices: **display** for moments, **body** for content, **mono** for
metadata. Mono is the craft signal — it says "this data is real" — so it
is reserved for things that literally are: timestamps, counts, sources,
provenance. Not wayfinding. Dense chrome that needs 11px sans takes
`t-meta font-sans` rather than a new role.

Hero type (≥32px) is set per-composition. A headline filling a brand panel
is a layout decision, not a reusable role — the gate allows it above 32px
and nothing below.

### Elevation — three levels, never a raw Tailwind shadow

`shadow-raise` (a resting object) · `shadow-float` (lifted, hover) ·
`shadow-overlay` (sheets, toasts).

All three read `--shadow-1/2/3`, which are **neutral per-theme tokens, not
mixed from `--ink`**. Deriving a shadow from the text colour meant every
card cast a *white glow* in the night theme. `shadow-lg`/`shadow-2xl` are
opaque black and ignore the theme entirely; the gate rejects them.

### Motion — two durations, two curves

`--motion-quick: 180ms` (a control answering you) ·
`--motion-enter: 380ms` (an object arriving). `--ease-enter` /
`--ease-exit`. Before this there were two CSS durations, **zero easings**,
and four GSAP durations with three easings applied by no rule.

Everything respects `prefers-reduced-motion`.

### Radius — says what a thing is

`sm 6` marks in dense rows · `md 8` calendar cells · `lg 12` buttons,
inputs, wells · `xl 16` cards · `2xl 20` sheets.

The docs claimed "cards 16 / buttons 12" from the day the rehaul shipped.
A multiplier chain computed 19.6 and 14, so the rule was fiction for
months. These are the stated numbers, set literally.

---

## Interaction

One definition each, in `globals.css`:

- **`.pressable`** — cursor, the transition, and a 1px press. A pressed
  state used to exist in exactly two places in the entire app.
- **`.selected`** — a 2px accent edge that doesn't shift layout. There
  were three competing visual languages for "chosen": an inset clay ring,
  a solid ink fill, and an inset line ring.
- **`.is-off`** — not available, *and visibly so*. Disabled must be
  legible as disabled; `ghost` and `quiet` buttons used to render
  identically whether disabled or not, so the only cue was a missing
  cursor.
- **`.stretch-target`** / **`.above-stretch`** — the whole row is the
  target. A content-rich row must not *be* a button, or its title,
  reasoning and source collapse into one long accessible name; the
  action stretches its hit area over the row instead.

### The rules

1. **If it reads as one thing, the whole of it is clickable.**
2. **A control that does nothing is worse than no control.** A chip
   without a handler renders as text; a calendar day with no work is a
   div; six tool tiles that can't be pressed don't wear the raised
   `surface` treatment, because in this system that treatment means "a
   prepared thing you can act on".
3. **44px for anything a thumb uses; 24px is the floor** (WCAG 2.2 SC
   2.5.8). Swept by e2e on every screen and both personas — the old gate
   ran on one screen, one persona, one work mode, so the branches that
   failed worst were never reached.
4. **Never pre-disable a submit.** A greyed-out button states no reason.
   Keep it live and say what's missing when it's pressed.
5. **Focus is not negotiable.** The rule is element+pseudo-class, not
   `:where()` — at zero specificity any single utility beat it, and three
   elements were already winning with `outline-none`, leaving the draft
   editor with no focus indicator at all.

---

## The three product primitives

This is the part a competitor can't lift, because it isn't decoration —
it's the product's argument made visible. Three beliefs no template has:
*every claim traces to your words*, *risky claims are softened before you
see them*, *nothing moves without your yes*.

- **`.mark-sourced`** — text that can show where it came from. One
  treatment, one open behaviour, one caption pattern.
- **`.mark-protected`** — a claim we changed on the client's behalf, and
  the diff that proves it.
- **`.mark-commitment`** — the one control on a screen that changes
  something, carrying its consequence.

They get tokens of their own so they stay identical wherever they appear,
and so a new surface inherits the argument instead of reinventing it.

---

## Colour

15 tokens × 4 themes in `src/lib/theme/tokens.css`, contrast-tested per
theme. Roles: `--clay` is the one action per screen, `--moss` is a win,
`--honey` is protection. Nothing else gets colour.

Each theme block is also exposed as `[data-theme-preview="…"]`, so an
element can borrow a whole palette locally. That is how the theme swatches
show their real colours — they used to be eight hex values copied by hand,
free to drift the moment a token changed.

**No hex outside the token file** (third-party brand marks excepted — they
are theme-invariant by definition). A hex in a component can't follow the
four themes and the contrast suite will never see it.

Opacity-modified colours are a smell: `bg-ink/30` was the modal scrim, and
in night `--ink` is near-white, so it *lightened* the page instead of
dimming it. There is a `--scrim` token now.

---

## How to check a screen

1. Squint. Is there exactly one thing the eye lands on first, and is it
   the thing that matters?
2. Does scanning order match task order, or does the rail steal attention
   from the decision?
3. Does every button name its object? ("Approve post", not "Good to go".)
4. Empty, slow, broken — is each one designed?
5. Can it be undone, and does it say so?
6. Tab through it. Can you reach and see everything?
7. All four themes, 390px and 1366px.

See `docs/UX_RULES.md` for copy, states and accessibility rules.
