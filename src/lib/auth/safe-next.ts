const ALLOWED_NEXT = [
  "/today",
  "/onboarding",
  "/library",
  "/plan",
  "/profile",
  "/settings",
  "/workspace",
  "/create",
];

/**
 * Where a magic link is allowed to land.
 *
 * The `next` parameter used to go straight into `new URL(next, …)`, which
 * honours an absolute URL — so a crafted link could hand someone a
 * freshly-minted session cookie and then send them to another origin.
 * Only our own routes get through.
 *
 * Lives apart from session.ts so it can be tested: that module imports
 * `server-only`, which by design refuses to load outside a server bundle.
 */
export function safeNext(raw: string | null): string {
  if (!raw) return "/onboarding";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return "/onboarding";
  }
  const path = raw.split("?")[0].split("#")[0];
  const ok = ALLOWED_NEXT.some((p) => path === p || path.startsWith(`${p}/`));
  return ok ? raw : "/onboarding";
}
