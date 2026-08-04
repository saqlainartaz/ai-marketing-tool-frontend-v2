import { ArrowRight, ShieldCheck } from "lucide-react";
import { createClientToken } from "@/lib/auth/client-token";
import { clientLoginSecret } from "@/lib/auth/session";

/**
 * The door. A personal link is the whole login — so the page's job is to
 * make that feel deliberate and premium rather than sparse. Desktop gets
 * the brand panel; phones get a compact brand band so the first
 * impression is never a floating list on white.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const secret = clientLoginSecret();
  const links = [
    {
      id: "dave",
      name: "Dave",
      business: "Meridian Roofing",
      detail: "roofer · phone",
      initial: "M",
    },
    {
      id: "amara",
      name: "Amara",
      business: "Osei Family Law",
      detail: "attorney · desktop",
      initial: "A",
    },
  ].map((c) => ({
    ...c,
    href: `/api/client-login?t=${encodeURIComponent(createClientToken(c.id, secret))}`,
  }));

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand */}
      <section className="flex flex-col justify-between bg-ink px-6 py-8 text-canvas lg:px-14 lg:py-12">
        <p className="font-mono text-[11px] tracking-[0.16em] uppercase opacity-70">
          InsideSuccess Marketing
        </p>
        <div className="py-10 lg:py-0">
          <h2 className="font-display text-[32px] leading-[1.05] font-semibold tracking-tight lg:text-[46px]">
            Your marketing,
            <br />
            prepared for you.
          </h2>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed opacity-75">
            We know your business, we draft in your voice, and nothing goes out
            without your yes.
          </p>
        </div>
        <p className="flex items-center gap-2 font-mono text-[11px] opacity-60">
          <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
          Every claim traces back to your own words.
        </p>
      </section>

      {/* Entry */}
      <section className="mx-auto flex w-full max-w-lg flex-col justify-center gap-6 px-6 py-12 lg:px-14">
        <div>
          <p className="t-label">Sign in</p>
          <h1 className="t-display mt-2 lg:text-[38px]">
            Your link is your key.
          </h1>
          <p className="t-sub mt-3">
            Clients enter through a personal link — no passwords, no signup.
            {reason === "expired"
              ? " That link has expired — here are fresh ones."
              : ""}
          </p>
        </div>

        <div className="space-y-2">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="surface flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all hover:-translate-y-px hover:border-ink-3"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paper font-display text-sm font-bold"
              >
                {link.initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold">
                  {link.name} · {link.business}
                </span>
                <span className="t-meta block">{link.detail}</span>
              </span>
              <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />
            </a>
          ))}
        </div>

        <p className="t-meta">
          Demo links for the sample clients · your real link arrives by email
        </p>
      </section>
    </main>
  );
}
