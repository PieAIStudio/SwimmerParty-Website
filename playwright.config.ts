import { defineConfig, devices } from "@playwright/test";

// Playwright builds this checkout once, then starts it with isolated local fixtures.
// pnpm verify delegates here; it must not build a second time.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3399);
const COMMUNITY_TEST = process.env.PLAYWRIGHT_COMMUNITY === "1";
export default defineConfig({
  testDir: "./e2e",
  ...(COMMUNITY_TEST
    ? { testMatch: "**/community-v3*.spec.ts" }
    : { testIgnore: "**/community-v3*.spec.ts" }),
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    env: {
      ASSET_STORE: "local",
      ACCOUNT_MODE: "mock",
      GUEST_LIMITER: "memory",
      ASSET_LOCAL_ROOT: "e2e/fixtures/assets-store",
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_PUBLIC_COMMUNITY_ENABLED: COMMUNITY_TEST ? "1" : "0",
      NEXT_PUBLIC_POSTHOG_KEY: "",
    },
    url: `http://127.0.0.1:${PORT}`,
    // A passing run must serve this checkout, never another session's server.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
