import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 390, height: 844 }, // mobile-first: the Operator's phone
  },
  webServer: {
    command: "npx next start -p 3100",
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      // next start is production mode, which (correctly) refuses to boot
      // without a signing secret — e2e provides one the way Vercel will.
      CLIENT_LOGIN_SECRET:
        process.env.CLIENT_LOGIN_SECRET ?? "e2e-secret-not-for-production",
    },
  },
});
