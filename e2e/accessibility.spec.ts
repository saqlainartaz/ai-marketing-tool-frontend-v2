import { test, expect } from "@playwright/test";

/**
 * The accessibility promises that automated unit tests can't see, because
 * they need a real browser: focus behaviour, hit areas, and reduced motion.
 * Our users skew older and phone-first, so these are not edge cases.
 */

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("link", { name: /dave · meridian roofing/i }).click();
  await page.waitForURL(/onboarding|today/);
  if (page.url().includes("onboarding")) {
    await page.goto("/today");
  }
}

test("a keyboard user can skip the rail and land on the work", async ({
  page,
}) => {
  await signIn(page);
  await page.keyboard.press("Tab");

  const skip = page.getByRole("link", { name: /skip to main content/i });
  await expect(skip).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("changing page moves focus, so a screen reader isn't left behind", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page);
  await page.getByTestId("sidebar").getByRole("link", { name: /library/i }).click();
  await page.waitForURL(/library/);
  await expect(page.locator("#main")).toBeFocused();
});

const SCREENS = [
  "/today",
  "/library",
  "/plan",
  "/workspace",
  "/profile",
  "/settings",
];

/**
 * WCAG 2.2 SC 2.5.8 sets 24px as the floor. This used to run on Today
 * alone, for Dave alone, in one work mode — so the branches that failed
 * worst were never reached. It now sweeps every screen, and Amara as well
 * as Dave, because their fixtures render different controls.
 */
async function sweepTargets(page: import("@playwright/test").Page) {
  const undersized: string[] = [];
  for (const route of SCREENS) {
    await page.goto(route);
    await page.waitForTimeout(300);
    const controls = page.locator(
      "main button:visible, main a:visible, main [role=button]:visible, main [role=radio]:visible",
    );
    const count = await controls.count();
    for (let i = 0; i < count; i++) {
      const control = controls.nth(i);
      const box = await control.boundingBox();
      if (!box) continue;
      // Inline provenance spans are text, not targets — 2.5.8 exempts
      // controls whose function is available in a sentence's flow.
      const inline = await control.evaluate(
        (el) => getComputedStyle(el).display === "inline",
      );
      if (inline) continue;
      if (box.height < 24 || box.width < 24) {
        const label = (await control.textContent())?.trim().slice(0, 30);
        undersized.push(`${route} · ${label} → ${box.width}×${box.height}`);
      }
    }
  }
  return undersized;
}

test("every control clears the 24px minimum, on every screen (Dave)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  expect(await sweepTargets(page)).toEqual([]);
});

test("every control clears the 24px minimum, on every screen (Amara)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await page.getByRole("link", { name: /amara · osei family law/i }).click();
  await page.waitForURL(/onboarding|today/);
  expect(await sweepTargets(page)).toEqual([]);
});

test("the work-mode dial's other position is swept too", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  // Dave's fixture is "handle", so "show me ideas" renders controls the
  // sweep would otherwise never see.
  await page.goto("/settings");
  await page.getByRole("radio", { name: /show me ideas/i }).click();
  expect(await sweepTargets(page)).toEqual([]);
});

test("the decision is announced, and can be taken back", async ({ page }) => {
  await signIn(page);
  await page.getByRole("button", { name: /^skip (post|reply|email)$/i }).click();

  const toast = page.getByTestId("status-toast");
  await expect(toast).toContainText(/skipped/i);
  // The toast must not grab focus away from where the user is working.
  await expect(page.getByRole("button", { name: /undo/i })).not.toBeFocused();

  await page.getByRole("button", { name: /undo/i }).click();
  await expect(toast).toBeHidden();
});
