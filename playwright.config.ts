import { defineConfig, devices } from "@playwright/test";

// Playwright builds this checkout once, then starts it with isolated local fixtures.
// pnpm verify delegates here; it must not build a second time.
const PORT = 3399;
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
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
    },
    url: `http://127.0.0.1:${PORT}`,
    // A passing run must serve this checkout, never another session's server.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
