import { test, expect } from "@playwright/test";
test("actor page holds the whole asset library", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu");
  await expect(page.getByRole("heading", { level: 1, name: /Tang Yunqiu/i })).toBeVisible();
  await expect(page.locator("[data-asset-slot]").first()).toBeVisible();
  await expect(page.locator("[data-voice-slot]").first()).toBeVisible();
  await expect(page.locator("#series-rules")).toBeVisible();
});
test("old asset library links land on the actor page", async ({ page }) => {
  await page.goto("/en/actors/agnes-lefevre/assets");
  await expect(page).toHaveURL(/\/en\/actors\/agnes-lefevre#assets$/);
  await expect(page.locator('[data-asset-slot="turnaround.front"]')).toBeVisible();
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
  const newFaceVoice = await request.get("/api/voice/lin-xiaoman/intro");
  expect(newFaceVoice.status()).toBe(200);
  expect(newFaceVoice.headers()["content-type"]).toContain("audio/mpeg");
  const durations = await page.evaluate(async () => {
    const audio = new AudioContext();
    try {
      const decodedDurations: number[] = [];
      for (const url of ["/api/voice/tang-yunqiu/intro", "/api/voice/lin-xiaoman/intro"]) {
        const response = await fetch(url);
        const decoded = await audio.decodeAudioData(await response.arrayBuffer());
        decodedDurations.push(decoded.duration);
      }
      return decodedDurations;
    } finally {
      await audio.close();
    }
  });
  expect(durations.every((duration) => duration > 0)).toBe(true);
});
