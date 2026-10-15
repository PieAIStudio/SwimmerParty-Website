import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

const cards = "[data-actor-card]";
test("A5 a shared filter URL is applied on first render", async ({ page, request }) => {
  const path = "/en/actors?q=tang-yunqiu&voice=1&ref=shared";
  const response = await request.get(path);
  expect(response.status()).toBe(200);
  const renderedIds = [...(await response.text()).matchAll(/data-actor-card="([^"]+)"/g)].map(
    (match) => match[1],
  );
  expect(renderedIds).toEqual(["tang-yunqiu"]);
  await page.goto(path);
  await expect(page.locator(cards)).toHaveCount(1);
  await expect(page.locator(cards)).toHaveAttribute("data-actor-card", "tang-yunqiu");
  await page.reload();
  await expect(page.locator(cards)).toHaveCount(1);
});
test("A5 filters survive clear, back, reload and a shared Chinese URL", async ({ page }) => {
  await page.goto("/en/actors?ref=shared");
  await page.locator("#actor-role").selectOption("boss");
  await page.locator("#actor-voice label").click();
  await expect(page.locator("#actor-voice input")).toBeChecked();
  const ids = await page
    .locator(cards)
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-actor-card")));
  expect(ids.length).toBeGreaterThan(0);
  await expect(page).toHaveURL(/role=boss/);
  const url = page.url();
  await page
    .locator("[data-actor-filters]")
    .getByRole("button", { name: en["roster.clear"], exact: true })
    .click();
  expect(new URL(page.url()).searchParams.get("ref")).toBe("shared");
  await page.goBack();
  await expect(page.locator("#actor-role")).toHaveValue("boss");
  await expect(page.locator("#actor-voice input")).toBeChecked();
  await page.reload();
  expect(
    await page
      .locator(cards)
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-actor-card"))),
  ).toEqual(ids);
  await page.goto(url.replace("/en/", "/zh/"));
  expect(
    await page
      .locator(cards)
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-actor-card"))),
  ).toEqual(ids);
});
for (const locale of ["en", "zh"] as const)
  test(`A5 delayed hydration cannot lose the first filter choices ${locale}`, async ({
    page,
  }, testInfo) => {
    let release = () => {};
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async (route) => {
      await ready;
      await route.continue();
    });
    try {
      await page.goto(`/${locale}/actors?ref=hydration`, { waitUntil: "commit" });
      const role = page.locator("#actor-role");
      await expect(role).toBeVisible();
      const enabledBeforeHydration = await role.isEnabled();
      if (enabledBeforeHydration) {
        // Diagnostic only on the broken version: a native change can be accepted before its handler exists.
        await role.selectOption("boss");
        await testInfo.attach("lost-pre-hydration-choice", {
          body: JSON.stringify({
            enabledBeforeHydration,
            selectedValue: await role.inputValue(),
            url: page.url(),
          }),
          contentType: "application/json",
        });
      }
      await expect(role).toBeDisabled();
      const controls = page.locator(
        "[data-actor-filters] input, [data-actor-filters] select, [data-actor-filters] button",
      );
      for (const control of await controls.all()) await expect(control).toBeDisabled();
      release();
      await expect(role).toBeEnabled();
      await role.selectOption("boss");
      await page.locator("#actor-voice label").click();
      await expect(page).toHaveURL(/role=boss/);
      await expect(page).toHaveURL(/voice=1/);
      expect(new URL(page.url()).searchParams.get("ref")).toBe("hydration");
      await page.reload();
      await expect(role).toHaveValue("boss");
      await expect(page.locator("#actor-voice input")).toBeChecked();
    } finally {
      release();
      await page.unrouteAll({ behavior: "wait" });
    }
  });

test("A5 availability and zero results do not invent files", async ({ page }) => {
  await page.goto("/en/actors?video=1");
  expect(await page.locator(cards).count()).toBeGreaterThan(0);
  for (const card of await page.locator("[data-discovery-card]").all())
    await expect(card).toHaveAttribute("data-has-video", "true");
  await page
    .locator("#actor-look")
    .fill("this appearance is not in any authored description 903840");
  await expect(page.locator(cards)).toHaveCount(0);
  await expect(page.getByText(en["roster.noResults"], { exact: true })).toBeVisible();
});
for (const locale of ["en", "zh"] as const)
  for (const width of [390, 1440]) {
    test(`A5 filters fit the first screen ${locale} ${width}`, async ({ page }) => {
      const m = locale === "en" ? en : zh;
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/actors`);
      const filters = page.locator("[data-actor-filters]");
      await expect(filters).toBeVisible();
      if (width === 390) {
        const box = await filters.boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(844);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.locator("[data-discovery-group]").first()).toHaveAttribute(
        "data-discovery-group",
        "active",
      );
      await page.locator("#actor-origin").focus();
      await expect(page.locator("#actor-origin")).toBeFocused();
      await page.keyboard.press("Tab");
      await mkdir(".devspace-reports/next-stage/a5", { recursive: true });
      await page.screenshot({
        path: `.devspace-reports/next-stage/a5/filters-${locale}-${width}.png`,
      });
      await expect(
        page.getByRole("heading", { name: m["roster.metaTitle"], exact: true }),
      ).toBeVisible();
    });
  }
