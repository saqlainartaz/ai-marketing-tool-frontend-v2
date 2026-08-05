import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { verifyClientToken } from "@/lib/auth/client-token";

export const CLIENT_COOKIE = "client_session";

const MIN_SECRET_LENGTH = 16;

/** True when a real secret is configured; false in sample-data mode. */
export function isConfigured(): boolean {
  const secret = process.env.CLIENT_LOGIN_SECRET;
  return Boolean(secret && secret.length >= MIN_SECRET_LENGTH);
}

/**
 * A per-deployment signing key, derived rather than stored.
 *
 * It must be identical across every instance of one deployment — a
 * per-process random key would sign a cookie on one lambda that fails to
 * verify on the next, silently logging the visitor out mid-session. It
 * must also differ between deployments, so sessions don't outlive a
 * rebuild. The deployment's own commit SHA gives both. Nothing secret is
 * committed to the repository.
 */
function deploymentKey(): string {
  /* Deterministic, not random. A per-process random value looked safer but
   * broke sign-in outright: the page that mints a token and the route that
   * verifies it are separate server bundles, so each got a different key
   * and every link came back "expired". */
  const seed =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_DEPLOYMENT_ID ??
    process.env.VERCEL_URL ??
    /* Local and preview builds with no deployment identity. Intentionally
     * fixed and intentionally public — it signs sessions for two fixture
     * businesses and guards no real data. Set CLIENT_LOGIN_SECRET before
     * any actual client is behind this door. */
    "insidesuccess-v2-sample-data";
  return createHash("sha256")
    .update(`client-login:${seed}`)
    .digest("base64url");
}

/**
 * The signing key for client magic-link tokens.
 *
 * This build is a mockup over sample fixtures: `/login` mints valid tokens
 * for both sample clients and hands them to whoever opens the page, so the
 * signature currently protects no real data. It is the mechanism M2 needs,
 * when the BFF scopes every query by a verified clientId — at which point
 * CLIENT_LOGIN_SECRET should become required again.
 *
 * Until then a missing variable must not be fatal. It previously threw in
 * production, so one unset value took down every route and the site served
 * our own error screen everywhere — indistinguishable, to anyone looking,
 * from a broken product.
 */
export function clientLoginSecret(): string {
  const secret = process.env.CLIENT_LOGIN_SECRET;
  if (secret && secret.length >= MIN_SECRET_LENGTH) return secret;
  return deploymentKey();
}

/** Resolves the logged-in client from the httpOnly cookie. Null = not logged in. */
export async function getClientId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(CLIENT_COOKIE)?.value;
  if (!token) return null;
  return verifyClientToken(token, clientLoginSecret())?.clientId ?? null;
}
