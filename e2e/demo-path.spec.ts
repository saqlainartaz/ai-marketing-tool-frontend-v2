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

    // The gate: /onboarding without a session bounces to /login.
    await page.goto("/onboarding/confirm");
    await expect(page).toHaveURL(/\/login/);

    // Magic link in → session cookie → S1.
    await page.getByRole("link", { name: /dave · meridian roofing/i }).click();
    await expect(page).toHaveURL(/\/onboarding\/confirm/);
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
      page.getByRole("heading", { name: /\d+ ready/i }),
    ).toBeVisible();
    await expect(page.getByText(/412 neighbors/).first()).toBeVisible();
    await page.getByRole("button", { name: /good to go/i }).click();
    await expect(page.getByTestId("stamp")).toHaveText(/ON ITS WAY/);
  });
}

test("desktop is a real app: sidebar, two-column Today, context rail", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 850 });
  await page.goto("/login");
  // Desktop login shows the brand panel.
  await expect(page.getByText(/Every claim in every draft/)).toBeVisible();
  await page.getByRole("link", { name: /amara · osei family law/i }).click();
  await page.goto("/today");
  // Sidebar with full nav, no bottom tab bar duplication in view.
  await expect(page.getByTestId("sidebar")).toBeVisible();
  await expect(
    page.getByTestId("sidebar").getByRole("link", { name: /workspace/i }),
  ).toBeVisible();
  // Two-column: context rail present alongside the card column.
  await expect(page.getByTestId("context-rail")).toBeVisible();
  await expect(
    page.getByTestId("context-rail").getByText(/89 people in your network/),
  ).toBeVisible();
  // Amara's provenance opens on desktop too.
  await page
    .getByRole("button", { name: /fifteen years of family practice/i })
    .click();
  await expect(page.getByTestId("source-pop")).toHaveText(
    /your onboarding call, Mar 12/,
  );
});

test("the complete product loop: create → library → handoff → plan → settings → workspace", async ({
  page,
}) => {
  // In as Dave.
  await page.goto("/login");
  await page.getByRole("link", { name: /dave · meridian roofing/i }).click();
  await page.goto("/today");

  // Clear the three prepared drafts (approve, approve, skip).
  await page.getByRole("button", { name: /good to go/i }).click();
  await expect(page.getByText(/Lakeway Ave/)).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: /good to go/i }).click();
  await expect(page.getByText(/#1 question/)).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: /not this one/i }).click();

  // The MAKE card appears → guided create.
  await page.getByRole("link", { name: /tell the story/i }).click();
  await page.getByRole("button", { name: /full replacement/i }).click();
  await page.getByRole("button", { name: /next/i }).click();
  await page.getByRole("button", { name: /explained everything/i }).click();
  await page.getByRole("button", { name: /write it for me/i }).click();
  // C2 shows its work, then C3 review.
  await expect(page.getByTestId("assembly")).toBeVisible();
  await expect(page.getByText(/no surprises up there/i)).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("button", { name: /good to go/i }).click();
  await expect(page).toHaveURL(/\/today/);

  // Library: three approved items; handoff marks one as posted.
  await page.getByRole("link", { name: /library/i }).click();
  await expect(page.getByText(/Published without your approval/)).toBeVisible();
  await page.getByText(/Hail season/).click();
  await expect(page.getByTestId("handoff-sheet")).toBeVisible();
  await page.getByRole("button", { name: /mark as posted/i }).click();
  await expect(page.getByText(/Marked as posted/)).toBeVisible();

  // Plan answers "why".
  await page.getByRole("link", { name: /^plan/i }).click();
  await expect(page.getByText(/Why this plan/)).toBeVisible();

  // Settings: the dial is the client's to change.
  await page.goto("/settings");
  await page
    .getByRole("radio", { name: /show me ideas/i })
    .click();

  // Workspace: a note becomes a card on Today.
  await page.goto("/workspace");
  await page
    .getByLabel(/what's happening at the business/i)
    .fill("We're running a spring gutter discount");
  await page.getByRole("button", { name: /turn it into a post/i }).click();
  await expect(page.getByTestId("ws-done")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("link", { name: /review it now/i }).click();
  await expect(page.getByText(/spring gutter discount/)).toBeVisible();
});
