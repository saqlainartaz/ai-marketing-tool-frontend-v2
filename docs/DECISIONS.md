# Decisions & Licence Ledger — marketing-tool-v2

Append-only. Every dependency gets a ledger row at install time.

## Decisions

| Date | Decision | By |
|---|---|---|
| 2026-08-03 | Master plan approved (docs/plans/2026-08-03-v2-master-plan.md) after two review rounds (ChatGPT cross-AI + Saqlain's final tweaks) | Saqlain |
| 2026-08-03 | Universal approval gate — no publish-on-silence code paths, ever | Saqlain |
| 2026-08-03 | Unnamed "we" — no named assistant character | Saqlain |
| 2026-08-03 | Four palettes switchable; default Cobalt | Saqlain |
| 2026-08-03 | Fresh repo + Vercel hosting; Supabase for auth+Postgres; clients are HMAC sessions (BFF-only access), team/assistants are Supabase Auth users | Saqlain |
| 2026-08-03 | Workspace v1 = M3 stretch (committed v2 scope); email = M3 conditional | Saqlain |

## Licence ledger

| Dependency | Version | Licence | Verified | Notes |
|---|---|---|---|---|
| _(rows added at install time — see master plan §Stack licence ledger for expected values)_ | | | | |

### Ledger entries — 2026-08-03 (T1)

| Dependency | Version | Licence | Verified | Notes |
|---|---|---|---|---|
| next | 16.2.12 | MIT | npm | |
| react / react-dom | 19.2.4 | MIT | npm | |
| tailwindcss / @tailwindcss/postcss | ^4 | MIT | npm | |
| typescript | ^5 | Apache-2.0 | npm | |
| eslint / eslint-config-next | ^9 / 16.2.12 | MIT | npm | |
| vitest | ^4 | MIT | npm | |
| jsdom | latest | MIT | npm | |
| @vitejs/plugin-react | latest | MIT | npm | |
| @testing-library/react / jest-dom / user-event | latest | MIT | npm | |
| Bricolage Grotesque, Inter (next/font) | — | SIL OFL 1.1 | Google Fonts | self-hosted at build |
