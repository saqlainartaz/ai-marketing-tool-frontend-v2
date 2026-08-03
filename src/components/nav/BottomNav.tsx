"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/today", label: "Today", icon: "☀" },
  { href: "/library", label: "Library", icon: "▤" },
  { href: "/plan", label: "Plan", icon: "◎" },
] as const;

/**
 * Three sections, one quiet menu. The Workspace door and Settings live
 * behind ☰ — present, never in the beginner's path.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-ink/40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-4 bottom-20 left-4 mx-auto max-w-md rounded-2xl border border-line bg-card p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href="/workspace"
              className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-clay-mist"
              onClick={() => setMenuOpen(false)}
            >
              Open workspace
              <span className="block text-xs font-normal text-ink-2">
                Chat, and what we know about how you sound
              </span>
            </Link>
            <Link
              href="/profile"
              className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-clay-mist"
              onClick={() => setMenuOpen(false)}
            >
              Your profile
              <span className="block text-xs font-normal text-ink-2">
                Everything we know about you — every line correctable
              </span>
            </Link>
            <Link
              href="/settings"
              className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-clay-mist"
              onClick={() => setMenuOpen(false)}
            >
              Settings
              <span className="block text-xs font-normal text-ink-2">
                Your never-do list, how much we handle
              </span>
            </Link>
            <div className="mt-2 flex items-center justify-between border-t border-line px-3 pt-3">
              <span className="text-xs text-ink-2">Appearance</span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      ) : null}

      <nav className="sticky bottom-0 z-30 mt-6 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px]",
                  active ? "font-semibold text-clay-deep" : "text-ink-2",
                )}
              >
                <span aria-hidden className="text-base leading-none">
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            aria-label="More"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex min-w-16 cursor-pointer flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] text-ink-2"
          >
            <span aria-hidden className="text-base leading-none">
              ☰
            </span>
            More
          </button>
        </div>
      </nav>
    </>
  );
}
