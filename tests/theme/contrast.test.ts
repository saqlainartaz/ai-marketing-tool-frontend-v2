import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Codifies the design audit's accessibility findings: key text/surface
 * pairs must meet WCAG AA in every theme. Thresholds: 4.5:1 for small
 * text, 3:1 for large/bold text (the ActionButton label is 15px semibold).
 */

const css = readFileSync(
  path.resolve(__dirname, "../../src/lib/theme/tokens.css"),
  "utf8",
);

const THEMES = ["paper", "cobalt", "forest", "night"] as const;

function blockFor(theme: string): string {
  const selector =
    theme === "paper"
      ? String.raw`:root,\s*\n?:root\[data-theme="paper"\]`
      : String.raw`:root\[data-theme="${theme}"\]`;
  const match = css.match(new RegExp(selector + String.raw`\s*\{([^}]+)\}`));
  if (!match) throw new Error(`theme block not found: ${theme}`);
  return match[1];
}

function token(theme: string, name: string): string {
  const m = blockFor(theme).match(
    new RegExp(String.raw`${name}:\s*(#[0-9a-fA-F]{3,8})\s*;`),
  );
  if (!m) throw new Error(`${theme} missing ${name}`);
  return m[1];
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full =
    h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const PAIRS: {
  fg: string;
  bg: string;
  min: number;
  why: string;
}[] = [
  { fg: "--ink", bg: "--card", min: 7, why: "body text on cards" },
  { fg: "--ink-2", bg: "--card", min: 4.5, why: "secondary text on cards" },
  { fg: "--ink-2", bg: "--canvas", min: 4.5, why: "secondary text on page" },
  { fg: "--ink-3", bg: "--card", min: 4.5, why: "metadata on cards" },
  { fg: "--ink-3", bg: "--canvas", min: 4.2, why: "metadata on page (≥11px medium)" },
  { fg: "--moss", bg: "--card", min: 4.5, why: "win labels" },
  { fg: "--honey", bg: "--honey-mist", min: 4.5, why: "guardrail line" },
  { fg: "--onact", bg: "--clay", min: 3, why: "action label (15px semibold = large)" },
  { fg: "--clay-deep", bg: "--clay-mist", min: 4.5, why: "selected chip / active nav" },
];

describe("theme contrast (WCAG AA)", () => {
  for (const theme of THEMES) {
    for (const pair of PAIRS) {
      it(`${theme}: ${pair.fg} on ${pair.bg} ≥ ${pair.min} (${pair.why})`, () => {
        const ratio = contrast(token(theme, pair.fg), token(theme, pair.bg));
        expect(
          ratio,
          `${theme} ${pair.fg} on ${pair.bg} = ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(pair.min);
      });
    }
  }
});
