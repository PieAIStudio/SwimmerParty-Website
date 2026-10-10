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

test("the actor page offers the character sheet and a help link beside the starter pack", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/actors/tang-yunqiu");
  // Web fonts reflow the row; measure and click only once the layout has settled.
  await page.evaluate(() => document.fonts.ready);
  const starter = page.getByRole("button", { name: /starter pack/i });
  const sheet = page.getByRole("link", { name: "Character sheet", exact: true });
  const cast = page.getByRole("button", { name: "Add to cast", exact: true });
  const help = page.getByRole("link", { name: "How it works", exact: true }).first();
  await expect(sheet).toHaveAttribute("href", "/en/actors/tang-yunqiu/sheet");
  await expect(help).toHaveAttribute("href", "/en/guide");
  // The row wraps on narrow columns; reading order (top to bottom, then left to right) must hold.
  const boxes = await Promise.all([starter, sheet, cast, help].map((item) => item.boundingBox()));
  const reading = boxes.map((box, index) => ({ index, x: box?.x ?? -1, y: box?.y ?? -1 }));
  const sorted = [...reading].sort((a, b) => a.y - b.y || a.x - b.x).map((item) => item.index);
  expect(sorted).toEqual([0, 1, 2, 3]);
  // Client-side navigation can stall while the whole suite runs in parallel, so the test follows
  // the link's own target with a plain load instead of depending on the router's timing.
  await page.goto((await help.getAttribute("href")) ?? "/en/guide");
  await expect(
    page.getByRole("heading", { level: 1, name: "Three ways to get an actor" }),
  ).toBeVisible();
});

test("an actor with a single casting photo has no character sheet button", async ({ page }) => {
  await page.goto("/en/actors/agnes-lefevre");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Character sheet", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "How it works", exact: true }).first()).toBeVisible();
});
