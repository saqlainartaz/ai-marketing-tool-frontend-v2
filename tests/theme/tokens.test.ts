import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The token contract: every theme must define all 14 tokens the wireframes
 * (and every component) rely on. A missing token in one theme = invisible
 * text or a transparent button in that theme only — this test catches it.
 */
const TOKENS = [
  "--canvas",
  "--paper",
  "--ink",
  "--ink-2",
  "--ink-3",
  "--clay",
  "--clay-deep",
  "--clay-mist",
  "--moss",
  "--moss-mist",
  "--honey",
  "--honey-mist",
  "--card",
  "--line",
  "--onact",
] as const;

const THEMES = ["paper", "cobalt", "forest", "night"] as const;

const css = readFileSync(
  path.resolve(__dirname, "../../src/lib/theme/tokens.css"),
  "utf8",
);

function blockFor(theme: string): string {
  // Each block's selector list also carries [data-theme-preview="…"], so
  // anchor on the theme's own selector and skip the rest of the list.
  const selector = String.raw`:root\[data-theme="${theme}"\]`;
  const match = css.match(new RegExp(selector + String.raw`[^{]*\{([^}]+)\}`));
  if (!match) throw new Error(`theme block not found: ${theme}`);
  return match[1];
}

describe("theme tokens", () => {
  for (const theme of THEMES) {
    it(`${theme} defines all ${TOKENS.length} tokens with hex values`, () => {
      const block = blockFor(theme);
      for (const token of TOKENS) {
        const rule = new RegExp(
          String.raw`${token}:\s*#[0-9a-fA-F]{3,8}\s*;`,
        );
        expect(block, `${theme} is missing ${token}`).toMatch(rule);
      }
    });
  }

  it("paper is the default (:root) theme", () => {
    expect(css).toMatch(/:root,\s*\n?:root\[data-theme="paper"\]/);
  });
});
