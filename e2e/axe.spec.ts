import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Cover the complex asset UI, the character sheet, the guide, legal layout and sign-in dialog, not every repeated shell.
const pages = [
  "/en/actors/tang-yunqiu",
  "/en/actors/tang-yunqiu/sheet",
  "/en/guide",
  "/en/license",
];
for (const path of pages) {
  test(`has no serious accessibility violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    const builder = new AxeBuilder({ page });
    const result = await builder.analyze();
    expect(
      result.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? "")),
    ).toEqual([]);
  });
}

test("sign-in guidance dialog has no serious accessibility violations", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu");
  const checkbox = page.locator('[data-asset-slot="face.front"] input').first();
  await checkbox.check({ force: true });
  const downloadSelected = page.getByRole("button", { name: /download selected/i });
  // aria-busy turns "false" once the page is interactive and the session is known.
  await expect(downloadSelected).toHaveAttribute("aria-busy", "false", { timeout: 15_000 });
  await downloadSelected.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? "")),
  ).toEqual([]);
});
