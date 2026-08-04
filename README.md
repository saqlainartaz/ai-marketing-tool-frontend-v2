# marketing-tool-v2

The v2 client product: one card-based UI with persona-driven defaults and
backend personalization, wired to the Client Content Engine. Fresh Next.js
app, deployed on Vercel.

- **Master plan:** [docs/plans/2026-08-03-v2-master-plan.md](docs/plans/2026-08-03-v2-master-plan.md) (approved 2026-08-03)
- **Design source of truth:** `../AI Marketing Tool v2/` (spec, API sketch, research, wireframes — the visual contract)
- **Engine:** `../marketing tool/` (consumed via REST only; never modified from here)
- **Decisions + licence ledger:** [docs/DECISIONS.md](docs/DECISIONS.md)

## Status

**M1A complete** (2026-08-03): four-theme token system (Cobalt default),
primitives, first-run flow S1–S6 on fixtures (Dave + Amara), GSAP assembly
moment, mock Today card pager.

**M1B client auth complete** (2026-08-03): HMAC magic-link tokens →
`/api/client-login` → httpOnly session; the `(client)` layout is the gate
(no session → `/login`); components receive only the verified clientId.
27 unit tests + 4-theme e2e through the real auth path, all keyless.

**Complete client UI on fixtures**, redesigned 2026-08-04 as **"Desk"**
after a full screenshot audit: warm-paper canvas with raised white
objects, three type voices (Bricolage display / Inter body / JetBrains
mono metadata), labeled draft objects, a numbered work spine, the plan
as a document, and one commitment per screen. Four themes ship
switchable — paper (default) · cobalt · forest · night.
70 unit tests (incl. 36 WCAG contrast gates) + 6 e2e (4 themes, desktop
shell, and the complete product loop). Design report: the audit lives in
the plan file; screenshots via `scratchpad/audit-shots.js`.

**Deferred by decision** (2026-08-03): Supabase team auth + Vercel deploy —
resume when accounts exist.

## Run it

```bash
npm install
npm run dev        # → http://localhost:3000/login  (pick Dave or Amara)
npm test           # unit/component (keyless)
npm run e2e        # build + playwright: 4 themes + full product loop
```
