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

test("actor hero uses the large source and voice preview is playable", async ({
  page,
  request,
}) => {
  await page.goto("/en/actors/tang-yunqiu");
  const hero = page.locator('img[src*="large.webp"]').first();
  await expect(hero).toBeVisible();
  const box = await hero.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(600);

  const voice = await request.get("/api/voice/tang-yunqiu/intro");
  expect(voice.status()).toBe(200);
  expect(voice.headers()["content-type"]).toContain("audio/wav");
});
