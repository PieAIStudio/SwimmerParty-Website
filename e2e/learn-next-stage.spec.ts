import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { TOOL_TUTORIALS } from "../src/content/tutorials";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

for (const locale of ["en", "zh"] as const) {
  const m = locale === "en" ? en : zh;
  for (const tutorial of TOOL_TUTORIALS) {
    test(`A7 ${locale} ${tutorial.id} has a usable prompt but no false reproduction claim`, async ({
      page,
    }) => {
      await page.goto(`/${locale}/guide/tools/${tutorial.id}`);
      await expect(page.locator("[data-tool-guide]")).toHaveAttribute(
        "data-tool-guide",
        tutorial.id,
      );
      await expect(page.locator("[data-tool-steps] li")).toHaveCount(4);
      await expect(page.locator("[data-tool-access]")).toHaveText(tutorial.access[locale]);
      await expect(page.locator("[data-tutorial-prompt]")).toContainText(tutorial.prompt[locale]);
      await expect(page.locator("[data-reproduction-status]")).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText("Draft · not reproduced");
      await expect(page.locator("main")).not.toContainText("草稿 · 尚未实测复现");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.getByRole("link", { name: m["learn.openTool"] })).toHaveAttribute(
        "href",
        tutorial.entry,
      );
      expect(await page.locator("main video").count()).toBe(0);
    });
  }
  for (const width of [390, 1440]) {
    test(`A7 result-first guide and tool steps fit ${locale} ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/guide`);
      await expect(page.locator("[data-learn-outcome]")).toHaveCount(3);
      for (const card of await page.locator("[data-learn-outcome]").all()) {
        await expect(card.locator("ol li")).toHaveCount(3);
        await expect(card.locator("[data-download-account]")).toBeVisible();
        await expect(card.locator("img")).toBeVisible();
      }
      const urls = await page
        .locator("[data-learn-tools] a")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      expect(urls).toEqual(TOOL_TUTORIALS.map((t) => `/${locale}/guide/tools/${t.id}`));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await mkdir(".devspace-reports/next-stage/a7", { recursive: true });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `.devspace-reports/next-stage/a7/guide-${locale}-${width}.png`,
        fullPage: true,
      });
      await page.goto(`/${locale}/guide/tools/gemini`);
      await page.emulateMedia({ colorScheme: "dark" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: `.devspace-reports/next-stage/a7/tool-${locale}-${width}.png`,
        fullPage: true,
      });
    });
  }
}
test("A7 prompt really copies; unavailable tools give 404", async ({ page, context, request }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/guide/tools/gemini");
  await page
    .locator("[data-tutorial-prompt]")
    .getByRole("button", { name: en["common.copy"] })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(TOOL_TUTORIALS.find((t) => t.id === "gemini")!.prompt.en);
  expect((await request.get("/en/guide/tools/unknown")).status()).toBe(404);
});
