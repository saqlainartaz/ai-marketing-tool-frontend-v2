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
  },
});
