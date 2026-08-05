import { test, expect } from "@playwright/test";
import { DEMO_SCRIPT } from "../src/lib/demo/script";

/**
 * The demo path is driven in front of people, so it gets a test.
 *
 * Its real value isn't the sales call — it's that a path walked end to end
 * every week is a path whose dead ends get found. This asserts every stop
 * loads and nothing 404s or throws, which is exactly the failure that
 * would be most embarrassing live.
 */

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /dave · meridian roofing/i }).click();
  await page.waitForURL(/onboarding|today/);
}

test("every stop on the demo script loads without a dead end", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await signIn(page);

  for (const stop of DEMO_SCRIPT) {
    const res = await page.goto(stop.href);
    expect(
      res?.status(),
      `${stop.href} returned ${res?.status()}`,
    ).toBeLessThan(400);
    // Our own error boundary rendering counts as a dead end too.
    await expect(
      page.getByText(/This page didn't load|doesn't exist/),
      `${stop.href} rendered an error state`,
    ).toHaveCount(0);
    await expect(page.locator("h1").first()).toBeVisible();
  }

  expect(errors, "uncaught page errors during the demo walk").toEqual([]);
});

test("demo mode walks the script and can be ended", async ({ page }) => {
  await signIn(page);
  await page.goto("/demo");

  const bar = page.getByTestId("demo-bar");
  await expect(bar).toBeVisible();
  await expect(bar).toContainText(`1/${DEMO_SCRIPT.length}`);

  await page.getByRole("button", { name: /next stop/i }).click();
  await expect(bar).toContainText(`2/${DEMO_SCRIPT.length}`);

  await page.getByRole("button", { name: /end the demo/i }).click();
  await expect(bar).toBeHidden();
});

test("guidance explains the marketing, and only when asked", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await signIn(page);
  await page.goto("/today");

  // Pull, not push: nothing opens on arrival.
  await expect(page.getByTestId("guidance")).toHaveCount(0);

  await page.getByRole("button", { name: /why this matters/i }).click();
  const panel = page.getByTestId("guidance");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(/inconsistency/i);
});
