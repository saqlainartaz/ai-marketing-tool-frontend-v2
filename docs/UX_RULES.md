# UX rules

Binding rules for this app. Each one is here because a named source says
so, not because it sounded right. When a rule and a visual instinct
disagree, the rule wins — take it up here rather than in a component.

Our users are non-technical business owners, often older, usually on a
phone, usually short of time. Every rule below is weighted for them.

---

## 1. Action labels

**Verb + the object noun, mirroring what's on screen.** "Approve post",
"Approve reply", "Skip post", "Save changes", "Discard draft". The button
answers "approve *what*?" without the reader looking back at the card.

- Stripe's empty-state pattern calls this call-and-response: a "No
  customers" title takes an "Add customer" action, never "Get started".
  https://docs.stripe.com/stripe-apps/patterns/empty-state
- Carbon: use the {verb} + {noun} formula; never a bare noun; three words
  or fewer. https://carbondesignsystem.com/components/button/usage/
- Carbon distinguishes **Delete** (destroys, warn first) from **Remove**
  (takes out of a list) from **Discard** (throws away unsaved work). Pick
  the accurate one. https://carbondesignsystem.com/guidelines/content/action-labels/

**Banned:** OK, Submit, Done (inside a dialog), Learn more, Click here,
Get started, and anything that needs the surrounding sentence to make
sense.

**Wizards advance with "Continue", not "Next".**
https://design-system.service.gov.uk/patterns/question-pages/

**Sentence case everywhere.** Unanimous across Carbon, Material 3,
Atlassian and Intercom. All-caps is measurably slower to read, so the
mono `t-label` eyebrow is capped at short labels and never used for
sentences. https://carbondesignsystem.com/guidelines/content/writing-style/

---

## 2. Confirm vs undo

**Act, then offer undo. Don't interrupt.** Nothing in this product is
irreversible — no screen can publish — so no action earns a confirmation
dialog. Every decision goes through `StatusProvider.announce()` with an
undo callback and an 8-second window.

Confirmation is reserved for actions that destroy something we cannot
rebuild. If one ever appears, its confirm button must repeat the verb from
the dialog title (Carbon), and dismiss sits left of confirm.

---

## 3. Feedback

- One channel: `useStatus().announce(message, { undo, tone })`.
- Messages stay short — Stripe caps toasts at roughly four words / 30
  characters. "Approved", "Skipped", "Copied", "Marked as posted".
  https://docs.stripe.com/stripe-apps/patterns/communicating-state
- The live region is `role="status"` + `aria-live="polite"`. It announces
  without interrupting and **never** takes focus.
- A failure never wears success styling. `tone: "problem"` exists so a
  clipboard error can't render as a green tick — that bug was real.

---

## 4. Errors

Structure: what happened → what it means for them → what to do next.

- No blame, no jargon, no error codes in front of a client.
- No "please" (it implies a choice), and "sorry" only for a genuine
  system failure. https://design-system.service.gov.uk/components/error-message/
- Validate on submit, not on keystroke. Show the message between the
  label and the field, tie it with `aria-describedby`, set `aria-invalid`,
  and move focus to the field.
- **Never pre-disable a submit button.** A greyed-out button states no
  reason and leaves the user guessing. Keep it live; when pressed without
  an answer, say what's missing.
- When something breaks, lead with the promise that survives it: nothing
  was sent, nothing was lost.

---

## 5. Empty states

Anatomy (Stripe): title states what's missing, as a short phrase with a
period. Body is under 14 words, active voice, and says when content will
appear. The action repeats the title's noun.

**"Nothing scheduled this week" and "nothing in the record" are different
states and must read differently.** Never offer "create your first X" when
items exist but are filtered out.

---

## 6. Loading

Skeletons that hold the page's real shape, not spinners — content lands
where the eye already is. Route-level `loading.tsx` carries a visually
hidden `role="status"` so the wait is announced too.

`AssemblyMoment` is the exception: when we are genuinely working, we show
the work, step by step. It respects `prefers-reduced-motion`.

---

## 7. Forms

- Visible label above every field. Never a placeholder as a label — it
  vanishes on typing, isn't reliably announced, and usually fails
  contrast. https://www.nngroup.com/articles/form-design-placeholders/
- Examples live in hint text, not in the placeholder. Hint text uses
  `.t-hint` (readable sans), **not** the mono metadata voice.
- One question per screen. Closed questions beat open ones, and
  "Not sure — you decide" is always a real answer.
  https://www.gov.uk/service-manual/design/designing-good-questions
- Mark the exception: nearly everything here is required, so optional
  fields get "(optional)" and nothing gets an asterisk.
  https://design-system.service.gov.uk/patterns/question-pages/

---

## 8. Accessibility

Target: **WCAG 2.2 AA**. It is what every current regulation actually
references; APCA is not normative anywhere and is used only as a
second opinion on dark themes.

- Accessible name must equal the visible label, and start with it — a
  speech-input user says what they see. `ActionButton` attaches its
  consequence line with `aria-describedby` and `aria-hidden` for exactly
  this reason. https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html
- Minimum target size 24×24 (WCAG 2.2 SC 2.5.8); aim for 44 where the
  thumb lands. There is an e2e gate on this for Today.
- Tooltips are descriptions, never names. `title` alone is not a label.
- Never convey status by colour alone. The week ribbon's dots carry a
  visually hidden sentence saying the same thing.
- Skip link first in the tab order; focus moves to `#main` on every route
  change; sheets and dialogs close on Escape and return focus to their
  trigger.
- Icons that aren't controls are `aria-hidden`. A control that does
  nothing when pressed is a bug, not a placeholder.
- Contrast is gated by unit test across all four themes.

---

## 9. Copy

- Plain words: need not require, give not provide, use not utilise.
  https://monzo.com/tone-of-voice
- Active voice. Short sentences — split anything over 25 words.
- **No metaphors.** They don't say what we mean and slow comprehension.
  "The door in the back" became "Ask for anything" for this reason.
- Read it aloud. If we wouldn't say it to the client's face, rewrite it.
- Never leak internal vocabulary — no milestone names, no "M2", no
  component names.
- One number per idea. Two counters with different denominators on one
  screen ("02/6" beside "Question 1 of 4") is a comprehension tax.

---

## 10. How to check a screen

Run these against anything before calling it done:

1. What is the user trying to do here, in one sentence?
2. Is the next action the most prominent thing on screen?
3. Does every button name its object?
4. What happens if it's empty, slow, or broken — is each designed?
5. Can it be undone, and does it say so?
6. Tab through it. Can you reach and see everything?
7. Squint. Does the hierarchy survive?
