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
moment, mock Today card pager. 22 unit/component tests + 4-theme e2e, all
keyless.

**Next: M1B** — Supabase team auth + HMAC client magic links + Vercel deploy.
Blocked on Saqlain's setup: Vercel project · Supabase project · git remote.

## Run it

```bash
npm install
npm run dev        # → http://localhost:3000/onboarding  (Dave; ?c=amara for the lawyer)
npm test           # unit/component (keyless)
npm run e2e        # build + playwright, all four themes
```
