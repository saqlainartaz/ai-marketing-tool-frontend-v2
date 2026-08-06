import { test, expect } from "@playwright/test";

/**
 * The claim we don't make.
 *
 * Every competitor's dashboard puts a post going out next to a number
 * going up and lets the client draw the line between them. We can't: a
 * `logged` goal admits only operator-counted outcomes, so approving and
 * posting cannot move it. This spec is the end-to-end proof of that, and
 * it exists because the property is invisible when it's working — nobody
 * notices a lie that isn't being told, so only a test will catch the day
 * someone wires the two together for a nicer demo.
 */

async function signInAsDave(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /dave · meridian roofing/i }).click();
  await page.waitForURL(/onboarding|today/);
  await page.goto("/today");
}

test("the goal states its target and who counts it", async ({ page }) => {
  await signInAsDave(page);

  const goal = page.getByTestId("goal-line");
  await expect(goal).toBeVisible();
  // The client's own sentence, not our paraphrase of it.
  await expect(goal).toContainText("Book 6 jobs by the end of September");
  // The number is never separable from its source.
  await expect(goal).toContainText("2 of 6");
  await expect(goal).toContainText(/logged by your strategist/i);
});

test("approving and posting moves the record, never the goal", async ({
  page,
}) => {
  await signInAsDave(page);
  const goal = page.getByTestId("goal-line");
  await expect(goal).toContainText("2 of 6");

  await page.getByRole("button", { name: /approve (post|reply|email)/i }).click();
  await expect(page.getByText(/Lakeway Ave/)).toBeVisible({ timeout: 5000 });

  // Post it for real.
  await page.getByRole("link", { name: /library/i }).click();
  await page.getByRole("button", { name: /everything/i }).click();
  await page.getByText(/Hail season/).click();
  await expect(page.getByTestId("handoff-sheet")).toBeVisible();
  await page.getByRole("button", { name: /mark as posted/i }).click();
  await expect(page.getByTestId("status-toast")).toContainText(/Marked as posted/);

  // The record moved.
  await expect(page.getByText(/Hail season/).first()).toBeVisible();

  // The goal did not. We didn't book him a job; his work does that.
  await page.goto("/today");
  await expect(goal).toContainText("2 of 6");
  await expect(goal).not.toContainText("3 of 6");
});
