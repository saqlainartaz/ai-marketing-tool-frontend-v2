"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const THEMES = ["paper", "cobalt", "forest", "night"] as const;
export type Theme = (typeof THEMES)[number];

/** Swatch previews so the choice is visual, not a word-guess. */
const SWATCH: Record<Theme, { bg: string; dot: string }> = {
  paper: { bg: "#f6f3ee", dot: "#201d18" },
  cobalt: { bg: "#f4f6f9", dot: "#1f37c7" },
  forest: { bg: "#f1f4ef", dot: "#1c5c3d" },
  night: { bg: "#0e1013", dot: "#d8f34a" },
};

const STORAGE_KEY = "v2theme";
const DEFAULT_THEME: Theme = "paper";

function readTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && (THEMES as readonly string[]).includes(saved)) {
      return saved as Theme;
    }
  } catch {
    /* storage unavailable — default */
  }
  return DEFAULT_THEME;
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* theme still applies for this visit */
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className={cn("grid grid-cols-2 gap-1.5", className)}
    >
      {THEMES.map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          onClick={() => apply(t)}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] capitalize transition-colors",
            theme === t
              ? "border-clay font-semibold text-ink shadow-[inset_0_0_0_1px_var(--clay)]"
              : "border-line text-ink-2 hover:border-ink-3 hover:text-ink",
          )}
        >
          <span
            aria-hidden
            className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-line"
            style={{ background: SWATCH[t].bg }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: SWATCH[t].dot }}
            />
          </span>
          {t}
        </button>
      ))}
    </div>
  );
}
