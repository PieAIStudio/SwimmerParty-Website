import { test, expect } from "@playwright/test";
test("asset library renders image and voice sections", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu/assets");
  await expect(page.getByRole("heading", { name: /Tang Yunqiu/i })).toBeVisible();
  await expect(page.locator("[data-asset-slot]").first()).toBeVisible();
  await expect(page.locator("[data-voice-slot]").first()).toBeVisible();
});
test("new face asset route is available", async ({ page }) => {
  await page.goto("/en/actors/agnes-lefevre/assets");
  await expect(page).toHaveURL(/agnes-lefevre\/assets/);
  await expect(page.getByRole("heading").first()).toBeVisible();
});
