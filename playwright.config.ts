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
    /* A real page, not `port`. A port probe passes the moment the socket
     * is listening, which `next start` does before it can actually render
     * a route — so the first test of a cold run raced the server and failed
     * on its own once. Waiting for /login to return means ready is ready. */
    url: "http://localhost:3100/login",
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
