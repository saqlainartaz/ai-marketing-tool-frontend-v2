import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Client magic-link tokens — the pattern cherry-picked from the engine-repo
 * frontend: base64url(clientId.expiresAtMs) + "." + HMAC-SHA256 signature.
 * Clients are NOT Supabase Auth users; this token → httpOnly cookie IS their
 * session, and the BFF scopes every query by the verified clientId.
 */

const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createClientToken(
  clientId: string,
  secret: string,
  expiresAtMs: number = Date.now() + DEFAULT_TTL_MS,
): string {
  const payload = Buffer.from(`${clientId}.${expiresAtMs}`, "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyClientToken(
  token: string,
  secret: string,
): { clientId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  const sep = decoded.lastIndexOf(".");
  if (sep <= 0) return null;
  const clientId = decoded.slice(0, sep);
  const expiresAtMs = Number(decoded.slice(sep + 1));
  if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) return null;

  return { clientId };
}
