import { test, expect } from "@playwright/test";
test("single asset download control is available without sign in", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu");
  const tile = page.locator('[data-asset-slot="turnaround.front"]');
  await expect(tile.getByRole("button", { name: /download/i })).toBeVisible();
});
