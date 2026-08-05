import { test } from "@playwright/test";
import { THEMES } from "../src/components/theme/ThemeSwitcher";

/**
 * The gallery — every screen, every theme, both viewports, to disk.
 *
 * Not a test. It asserts nothing; it exists so the whole app can be looked
 * at in one sitting instead of clicked through 96 times. Skipped unless
 * GALLERY=1, so the normal suite stays fast.
 *
 *   GALLERY=1 npx playwright test e2e/gallery.spec.ts --project=chromium
 */

test.skip(!process.env.GALLERY, "gallery run only");

const OUT = process.env.GALLERY_OUT ?? "gallery";

const SCREENS = [
  { name: "01-login", href: "/", signedIn: false },
  { name: "02-onboarding-goal", href: "/onboarding/goal" },
  { name: "03-onboarding-obstacle", href: "/onboarding/obstacle" },
  { name: "04-onboarding-never", href: "/onboarding/never" },
  { name: "05-onboarding-channels", href: "/onboarding/channels" },
  { name: "06-onboarding-confirm", href: "/onboarding/confirm" },
  { name: "07-onboarding-plan", href: "/onboarding/plan" },
  { name: "08-today", href: "/today" },
  { name: "09-workspace", href: "/workspace" },
  { name: "10-library", href: "/library" },
  { name: "11-plan", href: "/plan" },
  { name: "12-voice", href: "/voice" },
  { name: "13-documents", href: "/documents" },
  { name: "14-profile", href: "/profile" },
  { name: "15-settings", href: "/settings" },
  { name: "16-review", href: "/review/dave-2", signedIn: false },
] as const;

const VIEWPORTS = [
  { name: "phone", width: 390, height: 844 },
  { name: "desk", width: 1440, height: 900 },
] as const;

for (const theme of THEMES) {
  for (const vp of VIEWPORTS) {
    test(`gallery ${theme} ${vp.name}`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Seed the theme before first paint so nothing is captured mid-swap.
      await page.addInitScript((t) => {
        window.localStorage.setItem("v2theme", t);
      }, theme);

      await page.goto("/");
      await page.getByRole("link", { name: /dave · meridian roofing/i }).click();
      await page.waitForURL(/onboarding|today/);

      for (const screen of SCREENS) {
        if (screen.signedIn === false) {
          await page.context().clearCookies();
        }
        await page.goto(screen.href);
        await page.waitForLoadState("networkidle");
        // Motion settles; stamps and enters are ≤320ms.
        await page.waitForTimeout(450);
        await page.screenshot({
          path: `${OUT}/${theme}-${vp.name}-${screen.name}.png`,
          fullPage: true,
        });
        if (screen.signedIn === false) {
          await page.goto("/");
          await page
            .getByRole("link", { name: /dave · meridian roofing/i })
            .click()
            .catch(() => {});
          await page.waitForURL(/onboarding|today/).catch(() => {});
        }
      }
    });
  }
}
