import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { ACTORS } from "../src/content/actors";

for (const locale of ["zh", "en"] as const) {
  test(`asset library renders delivered files and all 21 required slots (${locale})`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/kit/tang-yunqiu`);
    await expect(page.locator("[data-core-progress=\'21/21\']")).toBeVisible();
    await expect(page.locator("[data-asset-slot]")).toHaveCount(55);
    await expect(page.locator("[data-delivered=\'true\']")).toHaveCount(55);
    await page.goto(`/${locale}/kit/misha-luo`);
    await expect(page.locator("[data-core-progress=\'21/21\']")).toBeVisible();
    await expect(page.locator("[data-delivered=\'true\']")).toHaveCount(55);
  });
}

test("asset HTML is complete before JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/zh/kit/tang-yunqiu");
  await expect(page.locator("[data-asset-slot]")).toHaveCount(55);
  await expect(page.locator("[data-delivered='true'] img")).toHaveCount(55);
  await context.close();
});

test("unknown libraries return the localized 404", async ({ page }) => {
  const response = await page.goto("/zh/kit/not-an-actor");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("不在");
});

test("closing the invitation, reloading and changing language preserve selection", async ({
  page,
}) => {
  await page.goto("/zh/kit/tang-yunqiu");
  const check = page.getByRole("checkbox", { name: "选择 正面", exact: true }).first();
  // UIKit intentionally clips the native input; users click its visible label.
  await page.locator("label").filter({ has: check }).first().click();
  await expect(check).toBeChecked();
  await check.focus();
  await page.keyboard.press("Space");
  await expect(check).not.toBeChecked();
  await page.keyboard.press("Space");
  await expect(check).toBeChecked();
  await page.getByRole("button", { name: "下载所选", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("li")).toHaveText(["University", "Directing"]);
  await page.keyboard.press("Escape");
  await expect(check).toBeChecked();
  await page.reload();
  await expect(check).toBeChecked();
  await page.getByRole("button", { name: /中文|English/ }).click();
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Select Front", exact: true }).first(),
  ).toBeChecked();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByRole("button", { name: "Download selected", exact: true })).toBeEnabled();
});

test("profile JSON is free, bilingual and does not call the asset API", async ({ page }) => {
  const assetRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/assets/"))
      assetRequests.push(request.url());
  });
  await page.goto("/en/kit/tang-yunqiu");
  for (let index = 0; index < 2; index++) {
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download profile (JSON)", exact: true }).click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe("character.json");
    const profile = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(profile.name).toEqual({ zh: "唐韵秋", en: "TANG YUNQIU" });
    expect(profile.heightCm).toBe(163);
    expect(profile.slots).toHaveLength(63);
    expect(profile.note.en).toBeTruthy();
    expect(profile.note.zh).toBeTruthy();
  }
  expect(assetRequests).toEqual([]);
});

test("sitemap includes all thirteen actor libraries in both authored locales", async ({
  request,
}) => {
  const xml = await request.get("/sitemap.xml").then((response) => response.text());
  expect(ACTORS).toHaveLength(2);
  for (const actor of ACTORS)
    for (const locale of ["zh", "en"]) expect(xml).toContain(`/${locale}/kit/${actor.slug}`);
});

for (const width of [390, 1440])
  for (const theme of ["light", "dark"] as const) {
    test(`asset-library layout ${width} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      for (const locale of ["zh", "en"])
        for (const slug of ["tang-yunqiu", "misha-luo"]) {
          await page.goto(`/${locale}/kit/${slug}`);
          await page.evaluate(() => document.fonts.ready);
          await expect(page.locator("html")).toHaveAttribute("data-game-ui-theme", theme);
          const overflow = await page.evaluate(() => ({
            width: document.documentElement.scrollWidth,
            offenders: [...document.querySelectorAll("body *")]
              .filter((node) => {
                const rect = node.getBoundingClientRect();
                return rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1);
              })
              .slice(0, 12)
              .map((node) => ({
                tag: node.tagName,
                class: node.className,
                width: node.getBoundingClientRect().width,
              })),
          }));
          expect(overflow.width, JSON.stringify({ locale, slug, ...overflow })).toBeLessThanOrEqual(
            width,
          );
          await expect(page.locator("[data-asset-slot]")).toHaveCount(55);
          if (process.env.CAPTURE_ASSETS === "1")
            await page.screenshot({
              path: `.devspace-reports/swimmer-family-rebuild/step4/${locale}-${slug}-${theme}-${width}.png`,
              fullPage: true,
            });
        }
      await page.goto("/en/kit/tang-yunqiu");
      const front = page.getByRole("checkbox", { name: "Select Front", exact: true }).first();
      await page.locator("label").filter({ has: front }).first().click();
      await expect(front).toBeChecked();
      await expect(
        page.locator(`[data-selection-bar='${width < 768 ? "mobile" : "desktop"}']`),
      ).toBeVisible();
      await expect(
        page.locator(`[data-selection-bar='${width < 768 ? "desktop" : "mobile"}']`),
      ).not.toBeVisible();
    });
  }

test("empty selection never downloads and all three selection controls work at 1280", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  let downloads = 0;
  page.on("request", (request) => {
    if (/\/api\/assets\/.+\/(download|bundle)/.test(request.url())) downloads++;
  });
  await page.goto("/en/kit/tang-yunqiu");
  const trigger = page.getByRole("button", { name: "Download selected", exact: true });
  await trigger.click();
  await expect(page.locator('[data-asset-notice="selectFirst"]')).toBeVisible();
  expect(downloads).toBe(0);
  const tile = page.locator('[data-asset-slot="turnaround.front"]');
  const select = tile.getByRole("button", { name: "Select Front", exact: true });
  await select.click();
  await expect(tile.getByRole("checkbox")).toBeChecked();
  await select.click({ position: { x: 50, y: 120 } });
  await expect(tile.getByRole("checkbox")).not.toBeChecked();
  await tile.getByRole("checkbox").focus();
  await page.keyboard.press("Space");
  await expect(tile.getByRole("checkbox")).toBeChecked();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading")).toBeFocused();
  await expect(page.locator(".game-ui-button--primary:visible")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
