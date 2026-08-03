import { NextRequest, NextResponse } from "next/server";
import { verifyClientToken } from "@/lib/auth/client-token";
import { CLIENT_COOKIE, clientLoginSecret } from "@/lib/auth/session";

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
      new URL("/login?reason=expired", request.url),
    );
  }

  const next = request.nextUrl.searchParams.get("next") ?? "/onboarding";
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(CLIENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
