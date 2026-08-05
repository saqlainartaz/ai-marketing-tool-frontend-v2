# Postiz — complete feature inventory

**Subject:** `gitroomhq/postiz-app` v1.47.0 · AGPL-3.0 · read at commit depth 1, Aug 2026
**Method:** cloned locally, ~700 TypeScript files read across four analysis passes — not a README skim.
**Stack:** NX/pnpm monorepo · NestJS 11 backend · Next.js 16 / React 19 frontend · Prisma 6 + Postgres ·
Temporal (durable workflows) · Redis (OAuth state + throttling only) · Stripe · 213 runtime dependencies.

**What it is, in one line:** a self-hostable Buffer/Hypefury alternative — a *distribution* tool.
Its own README positions it against Buffer, not against a content-strategy product.

---

## 1. Content composition — very substantial (~22,000 lines)

The core screen is a full-screen two-pane composer: channel picker + editor + per-channel
settings on the left, live platform previews on the right.

- **Write-once, fork-per-channel.** A global content array; clicking "Edit content" on a
  channel forks that channel into its own value set, with a "back to global" reset. This is
  the mechanism for per-platform customisation, and it's the right shape.
- **Editor** — TipTap, with four modes selected per provider (`none | normal | markdown | html`).
  Signature insertion, emoji picker, `@mention` autocomplete backed by live provider lookups,
  drag-drop and clipboard-paste upload, per-platform character counter, link sanitisation.
- **Threads / first comments.** Each channel's content is an ordered array. The *semantics
  differ per platform* — an array is a thread on X/Threads/Bluesky and a first comment on
  LinkedIn/Facebook. Items can be reordered and given per-item delays. An AI action splits a
  long post into a legal thread.
- **Rich previews** for LinkedIn, Facebook, Instagram, TikTok, Pinterest, YouTube; a generic
  fallback for the other 28.
- **Per-platform settings for 34 providers** — 76 frontend files. Real depth: TikTok's privacy
  level / duet / stitch / branded-content disclosure; YouTube's title, visibility,
  made-for-kids, custom thumbnail, tag-length validation; Reddit's per-subreddit array with
  required-flair detection; Instagram's collaborators and audio search with volume mixing;
  Google Business Profile's event/offer types, CTAs, coupon codes; LinkedIn's image-carousel
  (renders a PDF).
- **Server-side validation** returns per-channel `{emptyContent, valid, settingsError, errors,
  tooLong}`, and the modal focuses the offending channel and opens its settings panel.
  Non-bypassable. Drafts skip everything but the empty check.
- Also: saved channel+content **Sets**, **signatures**, automatic **URL shortening** (4
  providers), coloured **tags** that colour the calendar card.

## 2. Scheduling & calendar — very substantial

Four views (week / month / day / list), persisted in a cookie. Drag-and-drop rescheduling with
past slots drop-disabled; dragging a published post asks "update details" vs "reschedule".
Per-channel **time slots** (a posting queue) with a `find-slot` endpoint used by new posts,
duplication, autopost and the AI generator. Recurring posts are stored as an interval and
**computed virtually at read time**, not materialised. 16 locales with RTL.

## 3. Social platform integrations — 34 providers, ~18,400 lines

X, LinkedIn (personal + page), Facebook, Instagram (Business + standalone), Threads, YouTube,
TikTok, Pinterest, Reddit, Google Business Profile, Discord, Slack, Telegram, Mastodon,
Bluesky, Lemmy, Farcaster, Nostr, VK, Tumblr, Twitch, Kick, MeWe, Skool, Whop, Dribbble,
Moltbook, Medium, Dev.to, Hashnode, WordPress, ListMonk.

**No platform-side scheduling is used anywhere.** Every provider publishes *now*; scheduling is
entirely Postiz-side. Blog platforms aren't a separate subsystem — they're ordinary providers
with `editor: 'markdown' | 'html'`.

Capability spread is uneven and worth knowing:
- **Analytics:** only 11 of 34 providers. Personal LinkedIn, Bluesky, Mastodon, Discord,
  Slack, Telegram have none.
- **Threads/comments:** 22 of 34.
- **The pending state machine** (below): 6 — Facebook, Instagram ×2, Threads, TikTok, YouTube.

Auth spans OAuth 2.0 (+PKCE), OAuth 1.0a with hand-rolled HMAC-SHA1 (X), user-supplied
credentials (Bluesky app passwords, WordPress, Medium, Dev.to, Hashnode, Nostr private keys),
bot tokens (Telegram), and Chrome-extension cookie harvesting (Skool).

## 4. Background processing — Temporal, not a job queue

Six *versioned* post workflows (`v1.0.1`–`v1.0.6`) plus autopost, token refresh, missing-post,
digest-email and streak workflows. Per-provider concurrency via task queue name.

Three deliberately different retry policies, and the reasoning is in the source:

- normal activities — 3 attempts, 2-minute flat backoff
- status checks — 3 attempts, 10-second backoff
- **publish mutations — `maximumAttempts: 1`**, because "a retried activity whose previous
  (timed-out) attempt still completed in the background would publish twice"

## 5. AI — the largest differentiated surface

Vendors: OpenAI, fal.ai, ElevenLabs, Kie.ai (Google Veo 3), Transloadit, Tavily, HeyGen,
Reel.Farm. No Anthropic.

| Feature | Substance |
|---|---|
| **Post generator** — 12-node LangGraph: research → category → topic → *find your own past high-performing posts* → hook (primed with your past hooks) → content → fix → picture → schedule. Streams progress. | Very substantial |
| **Mastra conversational agent** — GPT-5.2 with Postgres-backed memory and 10 tools; schedules posts, requires confirmation first | Very substantial |
| **MCP server** with full OAuth 2.0 — external clients (Claude, ChatGPT) can drive Postiz | Substantial |
| **AI images** — prompt expansion + 14 style presets | Substantial |
| **AI video (narrated slideshow)** — GPT writes slides → fal.ai images + ElevenLabs TTS in parallel → SRT from measured audio → Transloadit merge with burned-in subtitles | Most complex single pipeline |
| **AI video (Veo 3)** via Kie.ai | Moderate |
| **Autopost** — RSS → AI description → optional image → schedule, on a Temporal cron | Substantial |
| **Post categoriser** — classifies inbound posts into 30+ categories / 82 topics and extracts the hook, building the corpus the generator later learns from | Moderate |
| CopilotKit inline assists, AI thread splitting, extract-posts-from-URL, HeyGen avatar video | Small–moderate |

**Nothing in Postiz generates or stores brand knowledge.** The generator's only "memory" is the
org's own past high-performing posts, retrieved by category. No document ingestion, no
embeddings, no provenance.

## 6. Media — very substantial

Library with search/pagination/preview; Uppy uploader with client-side image compression and
Transloadit transcoding; local-disk or Cloudflare R2/S3 storage; per-item **alt text** and
**custom video thumbnails** (canvas frame-grab). **Polotno** canvas design editor is embedded
as a full design tool.

Four distinct upload strategies, no shared abstraction: platform-pulls-URL, streamed multipart,
chunked/resumable, and buffer+sharp transform. YouTube's resumable implementation is the
strongest single piece of engineering in the repo — it can ask the session URI whether the
video was created, which is the cure for "the request timed out and I don't know if it posted."

## 7. Analytics — moderate

Per-channel metric cards with sparklines and trend indicators, 7/30/90-day ranges. Per-post
analytics for 11 providers. Short-link click stats. Admin instance stats and a paginated error
browser for super-admins.

**No cross-channel roll-up, no export, no scheduled reports, no client-facing report.**

## 8. Teams, agencies, approvals — thin, and the biggest gap

- **Organizations** with `SUPERADMIN | ADMIN | USER` roles, JWT team invites, and an
  impersonation console (1,133 lines — the largest layout file, with a full Stripe coupon UI).
- **Agencies:** the only primitive is `Customer` — a named grouping of channels. It gives a
  calendar filter and a customer-scoped composer. **No per-client login, no per-client
  approval, no per-client billing, no white-label.**
- **Post states are `QUEUE | PUBLISHED | ERROR | DRAFT`. There is no pending/approved state.**
  The de-facto client-feedback loop is a public share link (`/p/:id`) with a comment thread
  underneath — reading is public, commenting needs login. **No approve/reject action, no state
  change, no notification.**
- A legacy marketplace (orders, payouts, messages) survives in the schema; only the agency
  directory is still wired.

## 9. Public API, webhooks, OAuth provider

A ~600-line public API v1 (posts CRUD, upload, slots, analytics, integration settings, provider
tool invocation), a NodeJS SDK, N8N and Make.com integrations, outbound webhooks scoped to
channels, and Postiz acting as an **OAuth provider** with a consent screen and three scopes
(authorization-code only — no PKCE, no scope enforcement, no refresh tokens).

Notably, `integration-settings/:id` returns `{rules, maxLength, settings, tools}` explicitly
shaped for LLM consumption.

## 10. Other features

- **Plugs** — per-channel engagement automation on 5 providers: auto-repost at N likes,
  auto-comment at N likes, cross-account reposts and comments.
- **Billing** — ~2,100 lines: Stripe embedded checkout, prorate preview, 7-day trial,
  AppSumo-style stacking lifetime codes, and a cancellation retention flow with a discount
  offer and mandatory feedback.
- **Chrome extension** (composer + Skool cookie auth), **React Native WebView bridge**, **CLI**.
- Onboarding is two steps: connect channels, watch a tutorial video.

---

## 11. Engineering reality check

Read this before anyone proposes lifting code.

| Signal | Finding |
|---|---|
| **Tests** | **Zero test files in the entire repo.** No unit, integration or e2e. |
| `@ts-ignore` | **182** |
| TypeScript | `strict: true` but **`strictNullChecks: false`** and `strictPropertyInitialization: false` — which removes most of what strict buys you |
| Dependencies | 213 runtime + 56 dev |
| Dead code | Orphaned team-comments component (373 lines, no backend route), Gitroom GitHub-stars dashboards, GitHub onboarding, `r2.uploader.ts` (282 lines), a whole marketplace domain |
| Secrets | **`Integration.token` and `refreshToken` are stored in plaintext.** Only `customInstanceDetails` and API keys are encrypted, and that uses AES-256-CBC with key *and IV* derived from `JWT_SECRET` via legacy `EVP_BytesToKey`/MD5 — i.e. deterministic |
| Auth holes | The policy guard skips the two routes that actually add a channel; `PUT` bypasses `POST` quotas on webhooks and autopost; `POST /user/change-org` doesn't verify membership of the target org; `/copilot/chat` has no policy check; `POST /public/modify-subscription` and all `/enterprise/*` routes are unauthenticated, trusting only possession of the JWT signing secret |
| Self-host gating | When `STRIPE_PUBLISHABLE_KEY` is unset, `PermissionsService.check()` grants every policy unconditionally — every tier gate in the codebase becomes a no-op |

The provider layer is battle-tested by production traffic — YouTube's `handleErrors` has 22
branches, TikTok's ~24, each one a past incident. That accumulated knowledge is real and
valuable. The surrounding application is a fast-moving startup codebase with no test safety net.
