"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUser,
  LibraryBig,
  Map,
  Menu,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/library", label: "Library", icon: LibraryBig },
  { href: "/plan", label: "Plan", icon: Map },
] as const;

const MORE = [
  {
    href: "/workspace",
    label: "Workspace",
    desc: "Tell us what's happening · what we can make",
    icon: Sparkles,
  },
  {
    href: "/profile",
    label: "Your profile",
    desc: "Everything we know about you",
    icon: CircleUser,
  },
  {
    href: "/settings",
    label: "Settings",
    desc: "Never-do list, how much we handle",
    icon: Settings,
  },
] as const;

/** Three sections, one quiet sheet. The workspace door is present, never in the path. */
export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  /* A sheet that can only be closed by tapping outside it is a trap for
   * anyone using a keyboard. Escape closes it, focus moves in on open and
   * returns to the button that opened it. */
  useEffect(() => {
    if (!menuOpen) return;
    sheet.current?.querySelector<HTMLElement>("a, button")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
          onClick={() => setMenuOpen(false)}
        >
          <div
            ref={sheet}
            role="dialog"
            aria-modal="true"
            aria-label="More"
            className="absolute right-3 bottom-[76px] left-3 mx-auto max-w-md overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {MORE.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0 active:bg-paper"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-ink-3"
                  />
                  <span>
                    <span className="block text-[13.5px] font-semibold">
                      {item.label}
                    </span>
                    <span className="t-meta block">{item.desc}</span>
                  </span>
                </Link>
              );
            })}
            <div className="bg-paper px-4 py-3">
              <p className="t-label mb-2">Appearance</p>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      ) : null}

      <nav className="sticky bottom-0 z-30 mt-6 border-t border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-w-16 flex-col items-center gap-1 px-3 pt-3 pb-2.5 text-[11px]",
                  active ? "font-semibold text-ink" : "text-ink-2",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-clay"
                  />
                ) : null}
                <Icon
                  aria-hidden
                  className={cn("h-5 w-5", active ? "text-clay" : "text-ink-3")}
                  strokeWidth={2}
                />
                {tab.label}
              </Link>
            );
          })}
          <button
            ref={trigger}
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex min-w-16 cursor-pointer flex-col items-center gap-1 px-3 pt-3 pb-2.5 text-[11px] text-ink-2"
          >
            <Menu aria-hidden className="h-5 w-5 text-ink-3" strokeWidth={2} />
            More
          </button>
        </div>
      </nav>
    </>
  );
}
