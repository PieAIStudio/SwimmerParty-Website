import { test, expect } from "@playwright/test";
import { downloadFrom } from "./fixtures/download";

test("a guest downloads a real PNG with the public filename", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": "198.51.100.10" });
  await page.goto("/en/actors/tang-yunqiu");
  const tile = page.locator('[data-asset-slot="turnaround.front"]');
  const result = await downloadFrom(page, tile.getByRole("button", { name: /download/i }));
  expect(result.name).toBe("tang-yunqiu__turnaround__front.png");
  expect(result.bytes.subarray(1, 4).toString()).toBe("PNG");
});
