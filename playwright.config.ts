import { defineConfig, devices } from "@playwright/test";

// Verification price (2026-10-04, macOS arm64, Node 24.19.0, 10 logical CPUs):
// serial quick checks: i18n 2.27s, typecheck 10.65s, lint 2.92s,
// format 3.76s, tools 7.67s; production build 47.85s. Playwright uses
// five workers and took 22.15s then 18.94s (50/50 both runs). The first
// concurrent baseline was contended by another project's browsers (46/50,
// 229.87s); it is retained in R0 logs and is not a stability measurement.
// Re-measure when the suite, runner or machine changes materially.
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
