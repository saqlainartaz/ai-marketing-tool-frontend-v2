import "server-only";
import { cookies } from "next/headers";
import { verifyClientToken } from "@/lib/auth/client-token";

export const CLIENT_COOKIE = "client_session";

/**
 * The signing secret. Falls back to a dev value locally so keyless dev and
 * tests work; refuses to boot without a real secret in production.
 */
export function clientLoginSecret(): string {
  const secret = process.env.CLIENT_LOGIN_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CLIENT_LOGIN_SECRET must be set in production");
  }
  return "dev-secret-do-not-use-in-prod";
}

/** Resolves the logged-in client from the httpOnly cookie. Null = not logged in. */
export async function getClientId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(CLIENT_COOKIE)?.value;
  if (!token) return null;
  return verifyClientToken(token, clientLoginSecret())?.clientId ?? null;
}
