import { test, expect } from "@playwright/test";
test("asset selection controls are present", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu");
  await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
});
