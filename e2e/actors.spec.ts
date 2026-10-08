import { test, expect } from "@playwright/test";
test("roster uses slug actors and exposes the free license", async ({ page }) => {
  await page.goto("/en/actors");
  await expect(page.locator('[data-actor-card="tang-yunqiu"]')).toBeVisible();
  await expect(page.getByText("Free License").first()).toBeVisible();
  await expect(page.locator('[data-actor-card="tang-yunqiu"]')).toBeVisible();
});
test("actor dossier has library and lightbox controls", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu");
  await expect(
    page.getByRole("link", { name: /starter pack|asset library/i }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /view larger|open/i }).first()).toBeVisible();
});
