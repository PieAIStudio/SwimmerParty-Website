import { test, expect } from "@playwright/test";
test("single asset download control is available without sign in", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu/assets");
  await expect(page.getByRole("link", { name: /download/i }).first()).toBeVisible();
});
