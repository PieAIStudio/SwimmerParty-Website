import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("A5 touch and keyboard operate the shared UIKit checkbox without hidden controls", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/actors?gender=female");
    await page.getByRole("button", { name: "More filters" }).click();
    await page.locator("#actor-video label").tap();
    await expect(page.locator("#actor-video input")).toBeChecked();
    await expect(page).toHaveURL(/video=1/);
    await page.locator("#actor-video input").focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#actor-video input")).not.toBeChecked();
    expect(new URL(page.url()).searchParams.has("video")).toBe(false);
    await page.emulateMedia({ colorScheme: "dark" });
    const result = await new AxeBuilder({ page }).include("[data-actor-filters]").analyze();
    expect(
      result.violations.filter((issue) => ["critical", "serious"].includes(issue.impact ?? "")),
    ).toEqual([]);
    await page.screenshot({ path: ".devspace-reports/next-stage/a5/filters-en-390-dark.png" });
  } finally {
    await context.close();
  }
});
