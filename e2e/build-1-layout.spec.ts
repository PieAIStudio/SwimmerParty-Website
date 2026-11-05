import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const report = process.env.PLAYWRIGHT_REPORT_DIR
  ? `${process.env.PLAYWRIGHT_REPORT_DIR}/layout`
  : ".reports/build-1/shots";
for (const locale of ["en", "zh"] as const) {
  for (const width of [1440, 390]) {
    test(`build-1 layout ${locale} ${width}`, async ({ page }) => {
      test.setTimeout(60_000); // Three cold navigations, including the actor's media library.
      await mkdir(report, { recursive: true });
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const [path, name, selector] of [
        ["", "home", '[data-home-section="ready"] h2'],
        ["/actors", "roster", '[data-discovery-group="active"] h2'],
      ]) {
        await page.goto(`/${locale}${path}`, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => document.fonts.ready);
        const heading = page.locator(selector);
        // The original failure was a natural scroll, not just a hash jump.
        await heading.evaluate((el) =>
          window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 20),
        );
        expect(
          await page
            .locator("body > header, body header")
            .first()
            .evaluate((el) => getComputedStyle(el).position),
        ).toBe("static");
        await expect(heading).toBeInViewport();
        await page.screenshot({ path: `${report}/A-after-${name}-${locale}-${width}.png` });
      }
      await page.goto(`/${locale}/actors/tang-yunqiu`, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const terms = page.locator("[data-download-terms]").first();
      await page.screenshot({ path: `${report}/A-after-actor-${locale}-${width}.png` });
      const starter = page.locator("[data-starter-action]");
      await expect(starter.locator("[data-starter-facts]")).toBeVisible();
      await expect(starter.locator("[data-download-terms]")).toContainText(
        locale === "en" ? "free Swimmer account" : "免费泳者账号",
      );
      if (width === 390) {
        const portrait = page.locator("[data-actor-portrait]");
        await expect(portrait).toBeInViewport({ ratio: 1 });
        expect(
          (await portrait.boundingBox())!.y + (await portrait.boundingBox())!.height,
        ).toBeLessThan((await starter.boundingBox())!.y);
        // Picture-first phones reach the terms with the download choices, not before the portrait.
        await terms.scrollIntoViewIfNeeded();
      }
      await expect(terms).toBeInViewport({ ratio: 1 });
      const toolbar = page.locator("#assets");
      await toolbar.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 160));
      const nav = toolbar.locator("nav");
      expect(await nav.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
      for (const button of await nav.getByRole("button").all()) {
        const bounds = await button.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
      await page.screenshot({ path: `${report}/A-after-tabs-${locale}-${width}.png` });
      await nav.getByRole("button").first().click();
      const heading = page.locator("#series-turnaround h2");
      const headingBox = await heading.boundingBox();
      const barBox = await toolbar.boundingBox();
      expect(headingBox!.y).toBeGreaterThanOrEqual(barBox!.y + barBox!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}
