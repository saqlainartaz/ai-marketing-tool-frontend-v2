"use client";

import { useEffect, useState } from "react";

export const THEMES = ["cobalt", "clay", "forest", "night"] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "v2theme";
const DEFAULT_THEME: Theme = "cobalt";

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

export function ThemeSwitcher() {
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
      /* storage unavailable — theme still applies for this visit */
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className="flex gap-1 rounded-full border border-line bg-card p-1"
    >
      {THEMES.map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          onClick={() => apply(t)}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
            theme === t ? "bg-clay text-onact" : "text-ink-2 hover:text-ink"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
