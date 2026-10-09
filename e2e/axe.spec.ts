import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  "/en",
  "/en/actors",
  "/en/actors/tang-yunqiu",
  "/en/license",
  "/en/works",
  "/en/cast",
];

for (const path of pages) {
  test(`has no serious accessibility violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    const builder = new AxeBuilder({ page });
    if (path === "/en/actors") builder.exclude('section[aria-label="Filters"]');
    const result = await builder.analyze();
    expect(
      result.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? "")),
    ).toEqual([]);
  });
}

test("sign-in guidance dialog has no serious accessibility violations", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu");
  const checkbox = page.locator('[data-asset-slot="face.front"] input').first();
  if (await checkbox.count()) await checkbox.check({ force: true });
  await page.getByRole("button", { name: /download selected/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? "")),
  ).toEqual([]);
});
