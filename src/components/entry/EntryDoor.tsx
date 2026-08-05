import { ArrowRight, CheckCheck, Quote, ShieldCheck } from "lucide-react";
import { createClientToken } from "@/lib/auth/client-token";
import { clientLoginSecret, isConfigured } from "@/lib/auth/session";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { QuietLink } from "@/components/ui/quiet-link";

const CLIENTS = [
  {
    id: "dave",
    name: "Dave",
    business: "Meridian Roofing",
    detail: "roofer · works from his phone",
    initial: "M",
  },
  {
    id: "amara",
    name: "Amara",
    business: "Osei Family Law",
    detail: "attorney · works at a desk",
    initial: "A",
  },
] as const;

const PROOF = [
  { icon: Quote, text: "Every claim traces to your words" },
  { icon: ShieldCheck, text: "Risky claims softened before you see them" },
  { icon: CheckCheck, text: "Published without your approval: 0" },
];

type EntryDoorProps = {
  /** The front door drops you into the product; the auth gate resumes setup. */
  destination: "/today" | "/onboarding";
  reason?: string;
};

/**
 * One door, two entrances.
 *
 * `/` is where someone lands with no context, so it has five seconds to
 * say what this is — and the two sample businesses say it faster than a
 * paragraph would. `/login` is the gate people arrive at when a session
 * has gone, and it resumes setup instead. Same component either way, so
 * the copy can't drift between them.
 */
export function EntryDoor({ destination, reason }: EntryDoorProps) {
  const secret = clientLoginSecret();
  const front = destination === "/today";
  const links = CLIENTS.map((c) => ({
    ...c,
    href: `/api/client-login?t=${encodeURIComponent(
      createClientToken(c.id, secret),
    )}&next=${destination}`,
  }));

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand */}
      <section className="flex flex-col justify-between bg-ink px-6 py-8 text-canvas lg:px-14 lg:py-12">
        <p className="t-meta tracking-[0.16em] uppercase opacity-70">
          InsideSuccess Marketing
        </p>
        <div className="py-10 lg:py-0">
          <h2 className="font-display text-[32px] leading-[1.05] font-semibold tracking-tight lg:text-[46px]">
            Your marketing,
            <br />
            prepared for you.
          </h2>
          <p className="mt-4 max-w-sm t-ui leading-relaxed opacity-75">
            We know your business, we draft in your voice, and nothing goes out
            without your yes.
          </p>
        </div>
        <ul className="space-y-2">
          {PROOF.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-2 t-meta opacity-70"
            >
              <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* Entry */}
      <section className="mx-auto flex w-full max-w-lg flex-col justify-center gap-6 px-6 py-12 lg:px-14">
        <div>
          <p className="t-label">{front ? "Sample accounts" : "Sign in"}</p>
          <h1 className="t-display mt-2 lg:text-[38px]">
            {front ? "Look at a real week of work." : "A personal link signs you in."}
          </h1>
          <p className="t-sub mt-3">
            {front
              ? "Two sample businesses, fully set up. Pick one and you're in — nothing here can publish."
              : "Clients enter through a personal link — no passwords, no signup."}
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
              className="pressable surface flex min-h-16 items-center gap-3 rounded-xl px-4 py-3 hover:-translate-y-px hover:border-ink-3 hover:shadow-float"
            >
              <span
                aria-hidden
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-paper font-display t-body font-bold"
              >
                {link.initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="t-ui block">
                  {link.name} · {link.business}
                </span>
                <span className="t-meta block">{link.detail}</span>
              </span>
              <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />
            </a>
          ))}
        </div>

        {front ? (
          <QuietLink href="/login" arrow={false} className="self-start">
            Start with the setup instead
          </QuietLink>
        ) : null}

        <div>
          <p className="t-label mb-2">Appearance</p>
          <ThemeSwitcher className="max-w-xs" />
        </div>

        <p className="t-meta">
          Sample data · nothing on these accounts can publish
          {isConfigured() ? "" : " · sessions reset when the site updates"}
        </p>
      </section>
    </main>
  );
}
