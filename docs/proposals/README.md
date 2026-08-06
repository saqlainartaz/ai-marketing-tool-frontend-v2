# Proposals — not decided

**Everything in this folder is a proposal awaiting Saqlain's approval. None of it
is a specification, and none of it may be treated as a decision.**

This folder is deliberately not `docs/specs/`. Documents in `docs/` are this
repo's source of truth; these are not. Do not move, rename, or promote anything
here into `docs/specs/`, `docs/plans/`, or `docs/DECISIONS.md` without an explicit
instruction from Saqlain naming the file.

## What's here

| File | Status | What it covers |
|---|---|---|
| `handoff-campaign-spine-draft.md` | Proposal | Product architecture: goal → plays → assets, data model, IA, failure behaviour, build stages |
| `handoff-play-catalogue-draft.md` | Proposal, **needs cutting** | 32 marketing plays tagged to business models and acquisition motions. The `Fits` tags are researched guesses, not verified |
| `handoff-design-direction-draft.md` | Design direction **approved** 2026-08-06; work orders are proposals | Design tokens and rules, client-editable guardrails, chat architecture. §7 holds the work orders |
| `mockup-now-quiet.html` | **Approved reference** | The visual contract for `/now`. Open it in a browser. Where a document and this mockup disagree on layout, the mockup wins |
| `mockup-now-screen.html` | **Rejected** | An earlier direction, kept only for contrast. Do not build from it |

## Precedence

1. Saqlain's instructions in the current conversation
2. `docs/UX_RULES.md` and `docs/DECISIONS.md` — both still binding; nothing here
   overrides them. Where a proposal puts pressure on a rule, it says so
   explicitly (see the design doc §4 on publishing and `UX_RULES` §2)
3. `mockup-now-quiet.html` for layout
4. The proposal documents for architecture

## Working from these

Do one work order at a time from `handoff-design-direction-draft.md` §7. Stop and
report after each. Do not chain them.

Author's note: these were written by an outside agent that read this repo, the
engine repo, and `../marketing tool/docs/PRODUCT_DIRECTION.md`. Claims measured
from code are marked as such; judgements are marked as judgements. The epistemic
notes at the end of each document are load-bearing — read them.
