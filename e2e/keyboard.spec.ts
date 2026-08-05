import { test, expect } from "@playwright/test";

/**
 * The keyboard pass, kept.
 *
 * Doing this by hand once proves nothing a week later — the interesting
 * failures (a focus ring lost to a later utility class, a modal with no way
 * out, a skip link that skips nowhere) all arrive by regression. So the
 * walk is a test.
 */

const PAGES = [
  "/today",
  "/library",
  "/plan",
  "/voice",
  "/documents",
  "/profile",
  "/settings",
  "/workspace",
];

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /dave · meridian roofing/i }).click();
  await page.waitForURL(/onboarding|today/);
}

test("every page can be entered and left by keyboard alone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await signIn(page);

  for (const href of PAGES) {
    await page.goto(href);

    // The first stop is the skip link, and it has to go somewhere real.
    await page.keyboard.press("Tab");
    const first = page.locator(":focus");
    await expect(first, `${href}: first tab stop`).toHaveText(
      /skip to main content/i,
    );
    await first.press("Enter");
    await expect(page.locator("#main")).toBeFocused();

    // Then walk. Nothing may take focus and refuse to give it back, and
    // every stop must be something a person can see.
    const seen: string[] = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const el = page.locator(":focus");
      if ((await el.count()) === 0) break;
      const box = await el.boundingBox();
      // A zero-size focus stop is a stop the eye can't follow.
      expect(
        box === null || (box.width > 0 && box.height > 0),
        `${href}: focus landed on something with no box`,
      ).toBeTruthy();
      seen.push((await el.getAttribute("data-testid")) ?? (await el.evaluate((n) => n.tagName)));
    }
    expect(seen.length, `${href}: nothing focusable after main`).toBeGreaterThan(0);
  }
});

test("focus is always visible, never removed by a later rule", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await signIn(page);
  await page.goto("/today");

  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const el = page.locator(":focus");
    if ((await el.count()) === 0) break;
    const ring = await el.evaluate((n) => {
      const s = getComputedStyle(n);
      return {
        outlineWidth: s.outlineWidth,
        outlineStyle: s.outlineStyle,
        boxShadow: s.boxShadow,
      };
    });
    const visible =
      (ring.outlineStyle !== "none" && parseFloat(ring.outlineWidth) > 0) ||
      (ring.boxShadow !== "none" && ring.boxShadow !== "");
    expect(visible, `focus stop ${i} had no visible ring`).toBeTruthy();
  }
});

test("the guidance panel can be opened, read and escaped without a mouse", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await signIn(page);
  await page.goto("/today");

  const trigger = page.getByRole("button", { name: /why this matters/i });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("guidance")).toBeVisible();

  // Focus moves in, so the next Tab is inside the panel, not back at the
  // top of the page behind it.
  await expect(page.getByRole("button", { name: /close/i })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("guidance")).toHaveCount(0);
  // And it hands focus back, so the keyboard user keeps their place.
  await expect(trigger).toBeFocused();
});
