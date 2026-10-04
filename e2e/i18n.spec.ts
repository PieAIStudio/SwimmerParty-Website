import { expect, test } from "@playwright/test";
import source from "../messages/zh-CN/messages.json";

test("native ICU executes in Node", async () => {
  const { createI18n } = await import("@pieai/swimmer-i18n-kit");
  const instance = createI18n({ sourceLocale: "zh-CN", source, catalogs: { "zh-CN": source } });
  expect(instance.resolve("zh-Hans")).toBe("zh-CN");
  expect(instance.translator().t("common.skipToContent")).toBe(source["common.skipToContent"]);
});

for (const locale of ["zh", "en"]) {
  test(`SSR language and canonical: ${locale}`, async ({ request }) => {
    const response = await request.get(`/${locale}/actors`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    const lang = locale === "zh" ? "zh-Hans" : locale === "pt-br" ? "pt-BR" : locale;
    expect(html).toContain(`lang="${lang}"`);
    expect(html).toContain(`/${locale}/actors`);
    expect(html).not.toMatch(/useI18n must be used|MISSING_MESSAGE|INVALID_MESSAGE/);
  });
}

for (const width of [1280, 390]) {
  test(`language menu preserves authored locale ${width}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 850 });
    await page.goto("/en/actors");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    if (width < 1024) await page.getByRole("button", { name: /^MENU$/i }).click();
    await page.getByRole("button", { name: /English|中文/ }).click();
    await page.getByRole("menuitemradio", { name: /中文/ }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hans");
    expect(errors).toEqual([]);
    await page.screenshot({ path: `/tmp/SwimmerParty-Website-i18n-${width}.png`, fullPage: false });
  });
}

test("locale redirect keeps query and stored preference", async ({ request }) => {
  const response = await request.get("/actors?q=icu", {
    maxRedirects: 0,
    headers: { cookie: "NEXT_LOCALE=en", "accept-language": "zh" },
  });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toMatch(/\/en\/actors\?q=icu$/);
});
