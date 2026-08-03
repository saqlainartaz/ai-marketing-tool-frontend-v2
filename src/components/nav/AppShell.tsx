"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/nav/BottomNav";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { DialPill } from "@/components/ui/dial-pill";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { useWorkMode } from "@/lib/store/settings";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/today", label: "Today", icon: "☀" },
  { href: "/library", label: "Library", icon: "▤" },
  { href: "/plan", label: "Plan", icon: "◎" },
  { href: "/workspace", label: "Workspace", icon: "✳" },
  { href: "/settings", label: "Settings", icon: "⚙" },
] as const;

/**
 * The client app shell: a real sidebar on desktop (the Professional's
 * device), the bottom nav on phones (the Operator's). Same product,
 * same routes — density adapts, structure doesn't fork.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const workMode = useWorkMode(clientId);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside
        data-testid="sidebar"
        className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-card px-4 py-6 lg:flex"
      >
        <div className="px-2">
          <p className="font-display text-[15px] font-semibold">
            {client.businessName}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-3">
            with InsideSuccess — nothing goes out without your yes
          </p>
        </div>
        <nav className="mt-6 space-y-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-clay-mist font-semibold text-clay-deep"
                    : "text-ink-2 hover:bg-paper hover:text-ink",
                )}
              >
                <span aria-hidden className="w-4 text-center">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 px-2">
          <DialPill mode={workMode} />
          <ThemeSwitcher />
        </div>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6 pb-3 lg:max-w-5xl lg:px-10 lg:pt-10">
          {children}
        </main>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
