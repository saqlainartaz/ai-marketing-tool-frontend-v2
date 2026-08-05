"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const THEMES = ["studio", "paper", "cobalt", "forest"] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "v2theme";
const DEFAULT_THEME: Theme = "studio";

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
            "pressable t-meta flex min-h-11 items-center gap-2 rounded-lg border px-3 capitalize",
            theme === t
              ? "selected border-clay font-semibold text-ink"
              : "border-line text-ink-2 hover:border-ink-3 hover:text-ink",
          )}
        >
          {/* The swatch borrows the real palette rather than repeating it:
           * data-theme-preview scopes that theme's tokens to this element,
           * so a token change can never leave the picker lying. */}
          <span
            aria-hidden
            data-theme-preview={t}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line bg-canvas"
          >
            <span className="h-2 w-2 rounded-full bg-clay" />
          </span>
          {t}
        </button>
      ))}
    </div>
  );
}
