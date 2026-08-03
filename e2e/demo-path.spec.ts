import { test, expect } from "@playwright/test";

/**
 * The 60-second demo path (M1A, mock-backed): Dave's first login →
 * S1 confirm → 4 questions → assembly → plan reveal → Today → approve
 * the first card. Runs once per theme — a token missing in any palette
 * shows up here as an invisible control.
 */
const THEMES = ["cobalt", "clay", "forest", "night"] as const;

for (const theme of THEMES) {
  test(`Dave's journey in ${theme}`, async ({ page }) => {
    await page.addInitScript((t) => {
      window.localStorage.setItem("v2theme", t);
    }, theme);

    // S1 — confirm
    await page.goto("/onboarding/confirm");
    await expect(
      page.getByRole("heading", { name: /here.s what we already know/i }),
    ).toBeVisible();
    await expect(page.getByText(/Meridian Roofing/).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: /that's me/i }).click();

    // S2 — goal
    await expect(
      page.getByRole("heading", { name: /what do you want more of/i }),
    ).toBeVisible();
    const next = page.getByRole("button", { name: /next/i });
    await expect(next).toBeDisabled();
    await page
      .getByRole("button", { name: /more calls & booked jobs/i })
      .click();
    await page.getByRole("button", { name: "Do it for me" }).click();
    await next.click();

    // S3 — obstacle ("not sure" path)
    await expect(
      page.getByRole("heading", { name: /what's been in the way/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /not sure — you decide/i }).click();

    // S4 — channels
    await expect(
      page.getByRole("heading", { name: /where does your business show up/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^Facebook$/ }).click();
    await page.getByRole("button", { name: /next/i }).click();

    // S5 — never-do (locked chips visible)
    await expect(
      page.getByRole("heading", { name: /what should we never do/i }),
    ).toBeVisible();
    await expect(page.getByText(/No guarantee claims/)).toBeVisible();
    await page.getByRole("button", { name: /nothing salesy/i }).click();
    await page.getByRole("button", { name: /build my plan/i }).click();

    // S6 — assembly then reveal
    await expect(page.getByTestId("assembly")).toBeVisible();
    await expect(page.getByTestId("plan-reveal")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Google Business first/)).toBeVisible();
    await page
      .getByRole("button", { name: /start with this week/i })
      .click();

    // Today — approve card 1
    await expect(page).toHaveURL(/\/today/);
    await expect(
      page.getByRole("heading", { name: /3 ready/i }),
    ).toBeVisible();
    await expect(page.getByText(/412 neighbors/)).toBeVisible();
    await page.getByRole("button", { name: /good to go/i }).click();
    await expect(page.getByTestId("stamp")).toHaveText(/ON ITS WAY/);
  });
}
