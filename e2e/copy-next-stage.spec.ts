import { test, expect } from "@playwright/test";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";
import { mkdir } from "node:fs/promises";

for (const locale of ["en", "zh"] as const) {
  test(`A4 pack account condition is visible before a download ${locale}`, async ({ page }) => {
    const m = locale === "en" ? en : zh;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}/actors/tang-yunqiu`);
    const note = page.locator("[data-download-account]").first();
    await expect(note).toHaveText(m["downloads.accountRequired"]);
    await note.scrollIntoViewIfNeeded();
    await expect(note).toBeInViewport();
    await mkdir(".devspace-reports/next-stage/a4", { recursive: true });
    await page.screenshot({
      path: `.devspace-reports/next-stage/a4/account-condition-${locale}.png`,
    });
  });
  test(`A4 project copy uses concrete references rather than a model guarantee ${locale}`, async ({
    page,
  }) => {
    const m = locale === "en" ? en : zh;
    await page.goto(`/${locale}/studio`);
    await expect(page.getByText(m["studio.beliefs.0.body"], { exact: true })).toBeVisible();
    await expect(page.getByText(m["studio.beliefs.1.body"], { exact: true })).toBeVisible();
  });
}
test("A4 automatic translation says new tab and preserves shared page state", async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { opened?: string }).opened = undefined;
    window.open = (url) => {
      (window as Window & { opened?: string }).opened = String(url);
      return null;
    };
  });
  await page.goto("/en/cast?a=tang-yunqiu#credit");
  await page
    .getByRole("button", { name: /English/ })
    .filter({ visible: true })
    .click();
  await expect(page.getByText("Authored", { exact: true })).toHaveCount(0);
  await page.getByRole("menuitemradio", { name: /日本語/ }).click();
  const opened = await page.evaluate(() => (window as Window & { opened?: string }).opened);
  const url = new URL(opened!);
  expect(url.hostname).toBe("swimmerparty-swiminai-com.translate.goog");
  expect(url.pathname).toBe("/en/cast");
  expect(url.searchParams.get("a")).toBe("tang-yunqiu");
  expect(url.searchParams.get("_x_tr_tl")).toBe("ja");
  expect(url.hash).toBe("#credit");
});
