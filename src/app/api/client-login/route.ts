import { NextRequest, NextResponse } from "next/server";
import { verifyClientToken } from "@/lib/auth/client-token";
import { CLIENT_COOKIE, clientLoginSecret } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * The magic-link door: /api/client-login?t=<token>
 * Valid token → httpOnly session cookie → onboarding (or ?next=).
 * Invalid/expired → back to /login with a plain-language reason.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const result = verifyClientToken(token, clientLoginSecret());

  if (!result) {
    return NextResponse.redirect(
      new URL("/login?reason=expired", request.nextUrl.origin),
    );
  }

  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(
    new URL(next, request.nextUrl.origin),
  );
  response.cookies.set(CLIENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
