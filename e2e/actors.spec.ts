import { test, expect } from "@playwright/test";
test("roster uses slug actors and exposes the free license", async ({ page }) => {
  await page.goto("/en/actors");
  await expect(page.locator('[data-actor-card="tang-yunqiu"]')).toBeVisible();
  await expect(page.getByText("Free License").first()).toBeVisible();
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

test("Ma Le's desktop dossier shows the full pack, voices and sample", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/actors/ma-le");
  await expect(page.getByRole("heading", { level: 1, name: /Ma Le/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /starter pack/i })).toBeVisible();
  await expect(page.locator('[data-asset-slot][data-delivered="true"]')).toHaveCount(55);
  await expect(page.locator("[data-voice-slot]")).toHaveCount(6);
  await expect(
    page.locator("[data-voice-slot] button").filter({ hasText: /show lines/i }),
  ).toHaveCount(6);
  await expect(page.locator('[data-actor-sample] [data-official-sample="ma-le"] img')).toHaveCount(
    2,
  );
  await expect(
    page.locator('[data-actor-sample] [data-official-sample="ma-le"] video'),
  ).toHaveCount(1);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(1440);
});
