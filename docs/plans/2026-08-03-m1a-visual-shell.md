# M1A — Visual Shell Implementation Plan

> Executed inline (executing-plans) with per-task commits. Master plan:
> `2026-08-03-v2-master-plan.md`. Visual contract: `../AI Marketing Tool v2/wireframes/`.
> No real auth, no DB — fixtures only. M1B follows.

**Goal:** Dave's journey (S1→S6→Home) as a real Next.js app in all four
themes, mock-backed, component-tested, e2e-covered.

## Tasks

### T1 — Scaffold + theme system
- create-next-app (TS, Tailwind v4, App Router, src dir) merged into this repo
- `src/lib/theme/tokens.css`: 4 palettes as `[data-theme]` CSS vars (14 token
  names from the wireframes; default cobalt on :root)
- `ThemeSwitcher` client component (persists to localStorage, sets
  documentElement data-theme; matches wireframe themebar)
- next/font: Bricolage Grotesque (display) + Inter (body) → CSS vars
  `--font-display` / `--font-body`
- Vitest + Testing Library wired (`npm test` keyless)
- Test: `tokens.test.ts` — every theme block defines all 14 tokens
- Licence ledger rows for everything installed
- Commit: `feat(m1a): scaffold, four-theme token system, fonts, vitest`

### T2 — Base primitives (shadcn + tokens)
- shadcn init (new-york, CSS vars) + Button, Badge as vendored base
- `components/ui/`: `ActionButton` (clay action + consequence-line slot),
  `CardShell`, `DialPill` (3-position work-mode), `Chip` (on/locked states),
  `PostPreview` (facebook | linkedin | google_business framing: avatar, name,
  meta line, body with optional provenance spans, optional image slot,
  action row)
- Component tests: render + variant behavior per primitive
- Commit: `feat(m1a): base primitives styled to tokens`

### T3 — Fixtures + first-run flow S1→S6
- `src/lib/fixtures/clients.ts`: Dave (Meridian Roofing, operator defaults)
  + Amara (family law, elevated risk) — profile, checks, questions, plan,
  cards — copy verbatim from the walkthrough
- Routes `app/(client)/onboarding/{confirm,goal,obstacle,channels,never,plan}`
  with shared progress dots, Back, "Not sure — you decide" on every question;
  answers held in a client-side OnboardingProvider (fixtures; BFF in M2)
- S5 renders locked compliance chips from fixture risk level
- S6 plan reveal reads assembled plan from fixture
- Tests: flow navigation (goal → obstacle...), locked chips unremovable
- Commit: `feat(m1a): first-run flow S1–S6 on fixtures`

### T4 — Assembly moment (GSAP)
- `components/motion/AssemblyMoment.tsx`: crossfade fallback FIRST (works
  with zero JS animation), then GSAP timeline via `@gsap/react` `useGSAP` —
  fact lines drift in + click together → plan sections assemble; respects
  `prefers-reduced-motion` (skips to final state)
- Licence ledger: gsap (GSAP Standard License, verified)
- Commit: `feat(m1a): plan assembly moment (gsap + reduced-motion fallback)`

### T5 — Mock Home ("Today")
- `app/(client)/today`: greeting (display font), wins strip (moss), DialPill,
  card stack from fixture action_cards — one-at-a-time pager on mobile
  (approve → stamp → next), stack list ≥768px; "Open workspace" quiet door
  (dead link M1); approve buttons carry consequence lines
- Tests: card pager advance on approve; dial renders fixture default
- Commit: `feat(m1a): mock Today home with card pager`

### T6 — E2E demo path
- Playwright: login stub page → S1 → answer 4 → assembly → plan → Today →
  approve card 1 → stamp visible; parameterized across all 4 themes
- CI script `npm run e2e` (builds + starts + runs)
- Commit: `test(m1a): e2e demo path across four themes`

## Done when
`npm test` green keyless · e2e green · manual run of Dave's journey in
Cobalt and one other theme · checkpoint with Saqlain → critique → M1B.
