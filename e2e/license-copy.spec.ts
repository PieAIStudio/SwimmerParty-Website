import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  LICENSE,
  LICENSE_RULES,
  LICENSE_FAQ,
  LICENSE_WHERE,
  LICENSE_EXAMPLES,
} from "../src/content/license";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

const report = ".devspace-reports/next-stage/a4-license-approved";
for (const locale of ["en", "zh"] as const) {
  for (const width of [390, 1440]) {
    test(`approved license copy and unchanged terms: ${locale} ${width}`, async ({
      page,
      context,
    }) => {
      const m = locale === "en" ? en : zh;
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.emulateMedia({ colorScheme: "light" });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`/${locale}/license`);
      const main = page.locator("main#main");
      const heading = main.getByRole("heading", { level: 1 });
      await expect(heading).toHaveText(`${m["license.heroLines.0"]}${m["license.heroLines.1"]}`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        m["license.metaDescription"],
      );
      await expect(main.getByText(m["license.intro"], { exact: true })).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`/${locale}/license$`),
      );
      await expect(main.getByText(m["license.badge"], { exact: true })).toBeVisible();

      // All retained legal sections, including collapsed FAQ bodies, must still
      // render their complete canonical text. The source bytes have a unit guard.
      const text = await main.textContent();
      for (const rule of [...LICENSE_RULES.can, ...LICENSE_RULES.cannot]) {
        for (const value of locale === "en" ? rule.slice(0, 2) : rule.slice(2, 4))
          expect(text).toContain(value);
      }
      for (const row of LICENSE_WHERE) {
        expect(text).toContain(row[locale]);
        expect(text).toContain(locale === "en" ? row.whereEn : row.whereZh);
        expect(text).toContain(locale === "en" ? row.sizeEn : row.sizeZh);
      }
      for (const line of LICENSE.creditLines) expect(text).toContain(line);
      for (const example of LICENSE_EXAMPLES) expect(text).toContain(example[locale]);
      expect(LICENSE.promises).toHaveLength(5);
      for (const promise of LICENSE.promises) {
        expect(text).toContain(promise[locale]);
        expect(text).toContain(locale === "en" ? promise.bodyEn : promise.bodyZh);
      }
      const faqs = main.locator("details");
      await expect(faqs).toHaveCount(LICENSE_FAQ.length);
      for (const [index, faq] of LICENSE_FAQ.entries()) {
        const item = faqs.nth(index);
        const summary = item.locator("summary");
        await expect(summary).toHaveText(locale === "en" ? faq[0] : faq[2]);
        await summary.click();
        await expect(item.locator("p")).toHaveText(locale === "en" ? faq[1] : faq[3]);
        await expect(item.locator("p")).toBeVisible();
        await summary.click();
      }
      if (width === 390) {
        const placement = main.getByRole("region", { name: m["license.whereTitle"], exact: true });
        await placement.focus();
        await expect(placement).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect
          .poll(() => placement.evaluate((element) => element.scrollLeft))
          .toBeGreaterThan(0);
        await placement.evaluate((element) => {
          element.scrollLeft = 0;
          element.blur();
        });
      }
      await page.evaluate(() => document.fonts.ready);
      for (const image of await main.locator("img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate(
              (element: HTMLImageElement) => element.complete && element.naturalWidth > 0,
            ),
          )
          .toBe(true);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const accessibility = await new AxeBuilder({ page }).analyze();
      expect(
        accessibility.violations.filter((item) =>
          ["critical", "serious"].includes(item.impact ?? ""),
        ),
      ).toEqual([]);
      await mkdir(report, { recursive: true });
      await page.screenshot({ path: `${report}/license-${locale}-${width}.png`, fullPage: true });
      const lowerText = await main.locator("section").allTextContents();
      await writeFile(
        `${report}/license-${locale}-${width}.json`,
        JSON.stringify(
          {
            locale,
            width,
            canonical: await page.locator('link[rel="canonical"]').getAttribute("href"),
            description: await page.locator('meta[name="description"]').getAttribute("content"),
            lowerSectionsSha256: createHash("sha256")
              .update(JSON.stringify(lowerText))
              .digest("hex"),
            faqCount: LICENSE_FAQ.length,
            promiseCount: LICENSE.promises.length,
            seriousOrCriticalAccessibilityViolations: 0,
          },
          null,
          2,
        ) + "\n",
      );
      await main.getByRole("button", { name: m["license.copyCredit"], exact: true }).click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe(LICENSE.credit[locale]);
      expect(errors).toEqual([]);
    });
  }
}
