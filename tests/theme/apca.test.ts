import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * APCA — the design check for the dark palette.
 *
 * WCAG 2's contrast formula is symmetric and flare-compensated, which makes
 * it measurably wrong at the dark end: it will pass light-grey-on-black
 * pairs that are genuinely hard to read, because the +0.05 flare constant
 * dominates when both luminances approach zero. Our four-theme WCAG suite
 * (contrast.test.ts) stays as the legal floor — every regulation in force
 * points at WCAG 2 AA, and APCA is normative nowhere. This runs alongside
 * it as the *design* check for `studio`, the dark default.
 *
 * Algorithm: APCA-W3 0.0.98G-4g-base-W3. Validated against the two
 * published anchors — black on white = Lc 106, white on black = Lc -107.9.
 *
 * Thresholds used (from the APCA readability criterion):
 *   Lc 75  minimum for columns of body text
 *   Lc 60  minimum for content text that is not body text
 *   Lc 45  minimum for large or heavy text
 *   Lc 30  absolute minimum for any text (placeholder, disabled)
 */

const css = readFileSync(
  path.resolve(__dirname, "../../src/lib/theme/tokens.css"),
  "utf8",
);

function blockFor(theme: string): string {
  const selector = String.raw`:root\[data-theme="${theme}"\]`;
  const match = css.match(new RegExp(selector + String.raw`[^{]*\{([^}]+)\}`));
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

const MAIN_TRC = 2.4;
const [RCO, GCO, BCO] = [0.2126729, 0.7151522, 0.072175];
const NORM_BG = 0.56;
const NORM_TXT = 0.57;
const REV_TXT = 0.62;
const REV_BG = 0.65;
const BLK_THRS = 0.022;
const BLK_CLMP = 1.414;
const SCALE = 1.14;
const LO_OFFSET = 0.027;
const LO_CLIP = 0.1;
const DELTA_Y_MIN = 0.0005;

function screenLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) =>
    Math.pow(parseInt(full.slice(i, i + 2), 16) / 255, MAIN_TRC),
  );
  const y = RCO * r + GCO * g + BCO * b;
  // Soft-clamp the black end; without it, near-black pairs report far more
  // contrast than the eye sees.
  return y < BLK_THRS ? y + Math.pow(BLK_THRS - y, BLK_CLMP) : y;
}

/** Lightness contrast. Positive = dark text on light; negative = the reverse. */
function apca(textHex: string, bgHex: string): number {
  const ytxt = screenLuminance(textHex);
  const ybg = screenLuminance(bgHex);
  if (Math.abs(ybg - ytxt) < DELTA_Y_MIN) return 0;

  if (ybg > ytxt) {
    const sapc =
      (Math.pow(ybg, NORM_BG) - Math.pow(ytxt, NORM_TXT)) * SCALE;
    return sapc < LO_CLIP ? 0 : (sapc - LO_OFFSET) * 100;
  }
  const sapc = (Math.pow(ybg, REV_BG) - Math.pow(ytxt, REV_TXT)) * SCALE;
  return sapc > -LO_CLIP ? 0 : (sapc + LO_OFFSET) * 100;
}

describe("APCA implementation", () => {
  it("reproduces the published anchors", () => {
    expect(Math.round(apca("#000000", "#ffffff"))).toBe(106);
    expect(Math.round(apca("#ffffff", "#000000"))).toBe(-108);
  });

  it("catches what WCAG 2 misses at the dark end", () => {
    // #767676 on black passes WCAG AA at 4.62:1 and is barely readable.
    // APCA rates it around Lc 30 — placeholder text, not content.
    expect(Math.abs(apca("#767676", "#000000"))).toBeLessThan(45);
  });
});

describe("studio (the dark default) reads on dark", () => {
  const t = (name: string) => token("studio", name);

  const pairs: { text: string; bg: string; min: number; use: string }[] = [
    { text: "--ink", bg: "--card", min: 75, use: "body text on a card" },
    { text: "--ink", bg: "--canvas", min: 75, use: "body text on the page" },
    { text: "--ink-2", bg: "--card", min: 60, use: "secondary text (t-sub)" },
    { text: "--ink-2", bg: "--canvas", min: 60, use: "secondary text on page" },
    { text: "--ink-3", bg: "--card", min: 45, use: "metadata (t-meta, mono)" },
    { text: "--ink-3", bg: "--canvas", min: 45, use: "metadata on the page" },
    { text: "--moss", bg: "--card", min: 45, use: "win markers" },
    { text: "--honey", bg: "--card", min: 45, use: "protection markers" },
    { text: "--clay", bg: "--canvas", min: 45, use: "accent text on page" },
    { text: "--onact", bg: "--clay", min: 60, use: "label on the one action" },
  ];

  for (const { text, bg, min, use } of pairs) {
    it(`${text} on ${bg} ≥ Lc ${min} (${use})`, () => {
      const lc = Math.abs(apca(t(text), t(bg)));
      expect(
        Number(lc.toFixed(1)),
        `${t(text)} on ${t(bg)} = Lc ${lc.toFixed(1)}`,
      ).toBeGreaterThanOrEqual(min);
    });
  }
});
