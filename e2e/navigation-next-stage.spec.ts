import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

for (const locale of ["en", "zh"] as const) {
  for (const width of [390, 768, 1440]) {
    test(`A3 four tasks and footer routes ${locale} ${width}`, async ({ page }) => {
      const m = locale === "en" ? en : zh;
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/cast`);
      if (width < 1024)
        await page.getByRole("button", { name: m["common.menu"], exact: true }).click();
      const nav = page
        .getByRole("navigation", { name: m["common.mainNav"], exact: true })
        .filter({ visible: true });
      const links = nav.getByRole("link");
      await expect(links).toHaveText(
        locale === "en"
          ? ["Actors", "Samples", "Learn", "Your cast"]
          : ["演员", "样片", "学着做", "我的选角单"],
      );
      await expect(links.last()).toHaveAttribute("aria-current", "page");
      expect(
        await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
      ).toEqual([
        `/${locale}/actors`,
        `/${locale}/works#samples`,
        `/${locale}/guide`,
        `/${locale}/cast`,
      ]);
      if (width < 1024) {
        const signIn = page
          .getByRole("dialog")
          .getByRole("button", { name: m["assets.signIn"], exact: true });
        const box = await signIn.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      }
      await mkdir(".devspace-reports/next-stage/a3", { recursive: true });
      await page.screenshot({ path: `.devspace-reports/next-stage/a3/nav-${locale}-${width}.png` });
      if (width < 1024) {
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
    .getByRole("link", { name: "Your cast", exact: true })
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
  await page.screenshot({ path: ".devspace-reports/next-stage/a3/download-terms-en-390.png" });
});
