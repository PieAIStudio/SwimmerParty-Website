import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { OFFICIAL_SAMPLES } from "../src/content/official-samples.generated";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

const OUT = ".devspace-reports/next-stage/site-fixes-20261021/after";
const HEIGHT = 844;

for (const locale of ["en", "zh"] as const) {
  const m = locale === "en" ? en : zh;
  for (const width of [390, 1440]) {
    test("site fix first looks " + locale + " " + width, async ({ page }) => {
      await mkdir(OUT, { recursive: true });
      await page.setViewportSize({ width, height: HEIGHT });
      await page.goto("/" + locale);
      await expect(page.locator("main")).toContainText(m["home.heroLines.0"]);
      await page.screenshot({
        path: OUT + "/home-" + locale + "-" + width + ".png",
        animations: "disabled",
      });

      await page.goto("/" + locale + "/actors");
      const filters = page.locator("[data-actor-filters]");
      const first = page.locator("[data-actor-card]").first();
      await expect(first).toBeVisible();
      if (width === 390) {
        await expect(filters.locator("#actor-role")).toBeHidden();
        const box = await first.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y).toBeLessThan(HEIGHT);
        await page.screenshot({
          path: OUT + "/roster-" + locale + "-390.png",
          animations: "disabled",
        });
        await filters.getByRole("button", { name: m["roster.moreFilters"] }).click();
        await expect(filters.locator("#actor-role")).toBeVisible();
        await page.screenshot({
          path: OUT + "/roster-expanded-" + locale + "-390.png",
          animations: "disabled",
        });
      } else {
        await expect(filters.locator("#actor-role")).toBeVisible();
        await page.screenshot({
          path: OUT + "/roster-" + locale + "-1440.png",
          animations: "disabled",
        });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );

      await page.goto("/" + locale + "/actors/tang-yunqiu");
      const title = page.getByRole("heading", { level: 1 });
      await expect(title).toBeVisible();
      await expect(page.locator("[data-starter-facts]")).toContainText("2");
      await expect(page.locator("[data-full-pack-facts]")).toBeVisible();
      await expect(page.locator("[data-free-front-download]")).toBeVisible();
      await expect(page.locator("[data-all-files-download]")).toBeVisible();
      await expect(page.locator("[data-actor-voice] audio")).toBeVisible();
      const titleBox = await title.boundingBox();
      const voiceBox = await page.locator("[data-actor-voice] audio").boundingBox();
      expect(titleBox!.y).toBeLessThan(HEIGHT);
      if (width === 390) expect(voiceBox!.y).toBeLessThan(HEIGHT);
      await page.screenshot({
        path: OUT + "/actor-" + locale + "-" + width + ".png",
        animations: "disabled",
      });
    });
  }
}

test("mobile language bottom option is inside screen and responds to a real click", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/actors");
  await page.getByRole("button", { name: zh["common.menu"], exact: true }).click();
  const dialog = page.locator("#site-menu");
  await dialog.locator(".game-ui-language-trigger").click();
  const options = dialog.getByRole("menuitemradio");
  await expect(options.last()).toBeVisible();
  await options.last().scrollIntoViewIfNeeded();
  const box = await options.last().boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  await page.screenshot({ path: OUT + "/language-bottom-zh-390.png", animations: "disabled" });
  await page.evaluate(() => {
    (window as Window & { testLanguageLink?: string }).testLanguageLink = "";
    window.open = (url) => {
      (window as Window & { testLanguageLink?: string }).testLanguageLink = String(url);
      return null;
    };
  });
  await options.last().click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as Window & { testLanguageLink?: string }).testLanguageLink),
    )
    .not.toBe("");
});

test("a roster sample plays on tap and cast state follows to actor details", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/actors");
  const card = page.locator('[data-actor-card="tang-yunqiu"]');
  await card.scrollIntoViewIfNeeded();
  await card.getByRole("button", { name: en["samples.play"] }).click();
  const video = card.locator("video");
  await expect(video).toBeVisible();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
    .toBeGreaterThanOrEqual(2);
  await card.getByRole("button", { name: en["samples.closePreview"] }).click();
  await card.getByRole("button", { name: en["cast.add"] }).click();
  await expect(card.locator('[data-in-cast="true"]')).toBeVisible();
  await card.getByRole("link", { name: "Tang Yunqiu" }).first().click();
  await expect(page.locator('[data-in-cast="true"]')).toBeVisible();
});

test("landscape sample keeps its real width when displayed", async ({ page }) => {
  const sample = OFFICIAL_SAMPLES.find((item) =>
    item.video.includes("tang-yunqiu-misha-luo-google-vids-04"),
  );
  expect(sample).toBeTruthy();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/works#samples");
  const card = page.locator('[data-sample-id="' + sample!.sampleId + '"]').first();
  await card.scrollIntoViewIfNeeded();
  const video = card.locator("video");
  await expect
    .poll(async () => {
      const aspect = await video.evaluate((element) => getComputedStyle(element).aspectRatio);
      const pair = aspect.split("/").map((item) => Number(item.trim()));
      return pair.length === 2 ? pair[0] / pair[1] : Number(aspect);
    })
    .toBeGreaterThan(1.2);
  const box = await video.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(box!.height);
  await page.screenshot({ path: OUT + "/landscape-en-1440.png", animations: "disabled" });
});
