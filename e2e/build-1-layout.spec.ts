import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

for (const locale of ["en", "zh"] as const) {
  for (const width of [1440, 390]) {
    test(`build-1 layout ${locale} ${width}`, async ({ page }) => {
      test.setTimeout(60_000); // Three cold navigations, including the actor's media library.
      await mkdir("run-1/shots", { recursive: true });
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
        await page.screenshot({ path: `run-1/shots/A-after-${name}-${locale}-${width}.png` });
      }
      await page.goto(`/${locale}/actors/tang-yunqiu`, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const terms = page.locator("[data-download-terms]").first();
      await page.screenshot({ path: `run-1/shots/A-after-actor-${locale}-${width}.png` });
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
      await page.screenshot({ path: `run-1/shots/A-after-tabs-${locale}-${width}.png` });
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
