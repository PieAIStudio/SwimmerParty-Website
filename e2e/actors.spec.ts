import { test, expect } from "@playwright/test";
test("roster uses slug actors and exposes the free license", async ({ page }) => {
  await page.goto("/en/actors");
  await expect(page.locator('[data-actor-card="tang-yunqiu"]')).toBeVisible();
  await expect(page.getByText("Free License").first()).toBeVisible();
  await expect(page.locator('[data-actor-card="tang-yunqiu"]')).toBeVisible();
});
test("actor dossier has library and lightbox controls", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu");
  await expect(page.getByRole("button", { name: /starter pack/i }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /view larger|open/i }).first()).toBeVisible();
});

test("Yan Lin's mobile dossier opens at the hero with the full pack and sample", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/zh/actors/yan-lin");
  await expect(page.getByRole("heading", { level: 1, name: /严琳/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "领取懒人包" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('[data-asset-slot][data-delivered="true"]')).toHaveCount(55);
  await expect(page.locator("[data-voice-slot]")).toHaveCount(6);
  await expect(
    page.locator('[data-actor-sample] [data-official-sample="yan-lin"] img'),
  ).toHaveCount(1);
  await expect(
    page.locator('[data-actor-sample] [data-official-sample="yan-lin"] video'),
  ).toHaveCount(1);
});
