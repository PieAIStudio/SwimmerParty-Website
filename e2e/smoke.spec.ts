import { expect, test } from "@playwright/test";

/**
 * Smoke coverage for the surfaces a caster actually lands on. These assert
 * structure and the honesty rules — not pixels — so they stay useful while
 * the visual design keeps moving.
 */

test("home renders the claim, the roster and a live WebGL stage", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("WE BUILD THEM.");

  // The stage is the point of the hero; a dead canvas is a regression.
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  await expect
    .poll(async () => canvas.evaluate((el: HTMLCanvasElement) => el.width * el.height))
    .toBeGreaterThan(0);

  // The footer links every actor too. The roster card is the one whose
  // accessible name carries the status gauge and the Chinese name.
  await expect(page.getByRole("link", { name: /SP-01 CASTABLE .*HU QIAN/ })).toBeVisible();
});

test("every actor has a reachable dossier", async ({ page }) => {
  for (const slug of ["hu-qian", "qi-man", "dai-er", "ding-yi"]) {
    const res = await page.goto(`/actors/${slug}`);
    expect(res?.status(), `/actors/${slug}`).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("SPECIFICATION 规格书")).toBeVisible();
  }
});

test("an actor with no delivered plate says so instead of faking one", async ({ page }) => {
  await page.goto("/actors/dai-er");
  await expect(page.getByText("NO PLATE DELIVERED")).toBeVisible();
  await expect(page.locator('img[alt*="定妆"]')).toHaveCount(0);
});

test("unknown actor returns the roster 404, not a crash", async ({ page }) => {
  const res = await page.goto("/actors/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("NOT ON")).toBeVisible();
});

test("sitemap lists every actor", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  for (const slug of ["hu-qian", "qi-man", "dai-er", "ding-yi"]) {
    expect(xml).toContain(`/actors/${slug}`);
  }
});
