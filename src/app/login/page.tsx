import { createClientToken } from "@/lib/auth/client-token";
import { clientLoginSecret } from "@/lib/auth/session";

/**
 * M1 stand-in for the real login-link delivery (email; later the internal
 * cockpit issues these). Mints valid magic links for the two fixture
 * clients so the full auth path is real end-to-end. Replaced in M4 by
 * link issuance from /internal.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const secret = clientLoginSecret();
  const links = [
    { id: "dave", label: "Dave · Meridian Roofing (roofer, phone)" },
    { id: "amara", label: "Amara · Osei Family Law (attorney, desktop)" },
  ].map((c) => ({
    ...c,
    href: `/api/client-login?t=${encodeURIComponent(createClientToken(c.id, secret))}`,
  }));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Your link is your key.
      </h1>
      <p className="text-sm text-ink-2">
        Clients enter through a personal link — no passwords, no signup.
        {reason === "expired"
          ? " That link has expired — here are fresh ones."
          : ""}
      </p>
      <div className="space-y-2.5">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className="block rounded-2xl border border-line bg-card p-4 text-sm font-semibold transition-colors hover:border-clay"
          >
            {link.label} →
          </a>
        ))}
      </div>
      <p className="text-xs text-ink-3">
        Demo links for the fixture clients · real links are issued by the
        team in M4
      </p>
    </main>
  );
}
