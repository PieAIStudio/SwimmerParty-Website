import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

const report = process.env.PLAYWRIGHT_REPORT_DIR
  ? `${process.env.PLAYWRIGHT_REPORT_DIR}/navigation`
  : ".reports/next-stage/a3";
for (const locale of ["en", "zh"] as const) {
  for (const width of [390, 768, 1024, 1440]) {
    test(`A3 creator tasks, license, studio and footer routes ${locale} ${width}`, async ({
      page,
    }) => {
      const m = locale === "en" ? en : zh;
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/cast`);
      if (width < 1280)
        await page.getByRole("button", { name: m["common.menu"], exact: true }).click();
      const nav = page
        .getByRole("navigation", { name: m["common.mainNav"], exact: true })
        .filter({ visible: true });
      const links = nav.getByRole("link");
      await expect(links).toHaveText(
        locale === "en"
          ? ["Actors", "Samples", "How to use", "My cast", "Free License", "Studio"]
          : ["演员", "样片", "怎么用", "选角单", "免费商用", "工作室"],
      );
      await expect(nav.locator(`a[href="/${locale}/cast"]`)).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(
        await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
      ).toEqual([
        `/${locale}/actors`,
        `/${locale}/works#samples`,
        `/${locale}/guide`,
        `/${locale}/cast`,
        `/${locale}/license`,
        `/${locale}/studio`,
      ]);
      if (width < 1280) {
        const signIn = page
          .getByRole("dialog")
          .getByRole("button", { name: m["assets.signIn"], exact: true });
        const box = await signIn.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      await mkdir(report, { recursive: true });
      await page.screenshot({ path: `${report}/nav-${locale}-${width}.png` });
      if (width < 1280) {
        await page.keyboard.press("Escape");
        await expect(
          page.getByRole("button", { name: m["common.menu"], exact: true }),
        ).toBeFocused();
      }
      for (const path of ["license", "studio", "privacy", "terms"])
        await expect(page.locator(`footer a[href="/${locale}/${path}"]`)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}
test("A3 samples link reaches samples and cast is reachable without an account", async ({
  page,
}) => {
  await page.goto("/en");
  const nav = page
    .getByRole("navigation", { name: en["common.mainNav"], exact: true })
    .filter({ visible: true });
  await nav.getByRole("link", { name: "Samples", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/works#samples$/);
  await expect(page.locator("[data-official-samples]")).toBeInViewport();
  await page
    .getByRole("navigation", { name: en["common.mainNav"], exact: true })
    .filter({ visible: true })
    .getByRole("link", { name: "My cast", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/cast$/);
});
test("A3 the starter action has a visible linked credit summary", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/actors/tang-yunqiu");
  await expect(page.locator("[data-download-terms]").first()).toBeVisible();
  await expect(page.locator("[data-download-terms]").first().getByRole("link")).toHaveAttribute(
    "href",
    "/en/license#credit",
  );
  await page.locator("[data-download-terms]").first().scrollIntoViewIfNeeded();
  await mkdir(report, { recursive: true });
  await page.screenshot({ path: `${report}/download-terms-en-390.png` });
});
