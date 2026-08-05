import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * The drift gate.
 *
 * The audit that prompted this system found 648 spacing values across 60
 * distinct steps, ~21 font sizes with 12 of them inside a 5px band, and 91
 * inline font-size overrides routing around the seven type classes that
 * already existed. None of that was anyone's decision — it happened because
 * `@theme` defined colour and nothing else, so there was nothing to conform
 * to and every call site decided alone.
 *
 * Tokens fixed the cause. This fixes the recurrence: it fails when new
 * off-scale values appear, so the next drift is caught the day it lands
 * rather than in the next audit.
 */

const SRC = path.resolve(__dirname, "../../src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

const FILES = walk(SRC).map((file) => ({
  file: path.relative(SRC, file),
  text: readFileSync(file, "utf8"),
}));

/**
 * Hero type is deliberately set per-composition — a headline that fills a
 * brand panel is a layout decision, not a reusable role. Everything at or
 * below the body scale must come from a t-* class.
 */
const DISPLAY_FLOOR_PX = 32;

describe("type scale", () => {
  it("has no inline font sizes below the display scale", () => {
    const offenders: string[] = [];
    for (const { file, text } of FILES) {
      for (const match of text.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)) {
        if (Number(match[1]) < DISPLAY_FLOOR_PX) {
          offenders.push(`${file}: ${match[0]}`);
        }
      }
    }
    expect(
      offenders,
      "Use a t-* role (t-display/title/lead/body/ui/sub/meta/label) instead " +
        "of an inline size. If none fits, the scale is missing a role — add " +
        "it to globals.css rather than a one-off here.",
    ).toEqual([]);
  });

  it("has no rem/em inline font sizes either", () => {
    const offenders: string[] = [];
    for (const { file, text } of FILES) {
      for (const match of text.matchAll(/text-\[[\d.]+(?:rem|em)\]/g)) {
        offenders.push(`${file}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("spacing scale", () => {
  /**
   * Half-steps produce 2/6/10/14px, which is what an improvised scale looks
   * like — 27% of all spacing in the app was half-steps, and `gap-1.5` was
   * the single most-used gap. A few remain where they are genuinely optical
   * (hairline gaps between an icon and its label); the gate holds the line
   * at today's count so it can only go down.
   */
  const HALF_STEP =
    /\b(?:-)?(?:m|p)(?:[trblxy])?-\d*\.5\b|\bgap(?:-[xy])?-\d*\.5\b|\bspace-[xy]-\d*\.5\b/g;

  const BASELINE = 150;

  it("does not add new half-step spacing", () => {
    const count = FILES.reduce(
      (total, { text }) => total + (text.match(HALF_STEP)?.length ?? 0),
      0,
    );
    expect(
      count,
      `Half-step spacing count rose above the baseline (${BASELINE}). Use the ` +
        "4px scale: 1/2/3/4/6/8/12. If a value truly needs to sit between " +
        "two steps, one of the steps is wrong.",
    ).toBeLessThanOrEqual(BASELINE);
  });
});

describe("elevation and colour", () => {
  it("uses no raw Tailwind shadows", () => {
    // shadow-lg / shadow-2xl are opaque black and ignore the theme, so
    // they were wrong on dark and merely lucky on the light themes.
    const offenders: string[] = [];
    for (const { file, text } of FILES) {
      for (const match of text.matchAll(
        /\bshadow-(?:sm|md|lg|xl|2xl)\b/g,
      )) {
        offenders.push(`${file}: ${match[0]}`);
      }
    }
    expect(
      offenders,
      "Use shadow-raise / shadow-float / shadow-overlay — they read the " +
        "theme's own --shadow-* tokens.",
    ).toEqual([]);
  });

  it("hardcodes no hex colours outside the token file and brand marks", () => {
    const offenders: string[] = [];
    for (const { file, text } of FILES) {
      // Third-party brand colours are theme-invariant by definition.
      if (file.includes("platform-mark")) continue;
      for (const match of text.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
        offenders.push(`${file}: ${match[0]}`);
      }
    }
    expect(
      offenders,
      "Colour belongs in src/lib/theme/tokens.css. A hex here can't follow " +
        "the four themes, and the contrast suite will never see it.",
    ).toEqual([]);
  });
});
