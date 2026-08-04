"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUser,
  LibraryBig,
  Map,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { BottomNav } from "@/components/nav/BottomNav";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { DialPill } from "@/components/ui/dial-pill";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { useContentItems } from "@/lib/store/content";
import { useWorkMode } from "@/lib/store/settings";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/library", label: "Library", icon: LibraryBig },
  { href: "/plan", label: "Plan", icon: Map },
] as const;

const NAV_QUIET = [
  { href: "/workspace", label: "Workspace", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: CircleUser },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

/**
 * The desk: a persistent rail on desktop (identity, work, quiet tools),
 * the bottom bar on phones. Same product, native furniture per device.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const workMode = useWorkMode(clientId);
  const items = useContentItems(clientId);
  const main = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  /* A client-side route change replaces the page without telling a screen
   * reader anything happened, and leaves keyboard focus wherever the old
   * link was. Moving focus to the new main region restores both, which is
   * the behaviour users get for free on a server-rendered site. */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    main.current?.focus();
  }, [pathname]);

  const pendingQuestions = client.questionCards.filter(
    (qc) => !items.some((i) => i.id === `${qc.id}-out`),
  ).length;
  const todayCount =
    items.filter((i) => i.status === "ready").length + pendingQuestions;

  function navLink(
    item: { href: string; label: string; icon: typeof Sun },
    count?: number,
  ) {
    const active = pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
          active
            ? "bg-card font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line)]"
            : "text-ink-2 hover:bg-card/60 hover:text-ink",
        )}
      >
        <Icon
          aria-hidden
          className={cn("h-4 w-4", active ? "text-clay" : "text-ink-3")}
          strokeWidth={2}
        />
        {item.label}
        {count ? (
          <span className="t-meta ml-auto rounded-full bg-paper px-1.5 py-px">
            {count}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div className="flex min-h-dvh">
      {/* First stop for a keyboard user: jump past the rail to the work. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2.5 focus:text-[13px] focus:font-semibold focus:text-paper"
      >
        Skip to main content
      </a>
      <aside
        data-testid="sidebar"
        className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line bg-canvas px-3 py-5 lg:flex"
      >
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-card/60"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clay font-display text-sm font-bold text-onact"
          >
            {client.avatarInitial}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13.5px] leading-tight font-semibold">
              {client.businessName}
            </span>
            <span className="t-meta block truncate">{client.firstName}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="mt-6 space-y-0.5">
          {navLink(NAV[0], todayCount)}
          {navLink(NAV[1])}
          {navLink(NAV[2])}
        </nav>

        <nav
          aria-label="Account"
          className="mt-6 space-y-0.5 border-t border-line pt-4"
        >
          {NAV_QUIET.map((item) => navLink(item))}
        </nav>

        <div className="mt-auto space-y-3 px-1">
          <div>
            <p className="t-label mb-1.5">Right now</p>
            <DialPill mode={workMode} />
          </div>
          <div>
            <p className="t-label mb-1.5">Appearance</p>
            <ThemeSwitcher />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main
          id="main"
          ref={main}
          tabIndex={-1}
          className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6 pb-4 outline-none lg:max-w-[980px] lg:px-12 lg:pt-10"
        >
          {children}
        </main>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
