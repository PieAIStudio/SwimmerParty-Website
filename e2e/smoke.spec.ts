import { expect, test } from "@playwright/test";

/**
 * Smoke coverage for the surfaces a caster actually lands on. These assert
 * structure and the honesty rules — not pixels — so they stay useful while
 * the visual design keeps moving.
 */

/**
 * The bare root negotiates from `Accept-Language` rather than always
 * landing on the default. That is the point of shipping two authored
 * locales: a reader whose browser asks for English should not have to find
 * the switcher. `zh` is only the fallback when nothing matches.
 */
test("the unprefixed root negotiates a locale from the browser", async ({ browser }) => {
  for (const [accept, expected] of [
    ["zh-CN,zh;q=0.9", "/zh"],
    ["en-GB,en;q=0.9", "/en"],
    ["fi-FI,fi;q=0.9", "/zh"],
  ] as const) {
    const ctx = await browser.newContext({ locale: accept.split(",")[0] });
    const page = await ctx.newPage();
    await page.setExtraHTTPHeaders({ "accept-language": accept });
    await page.goto("/");
    expect(new URL(page.url()).pathname, accept).toBe(expected);
    await ctx.close();
  }
});

test("home renders the claim, the roster and a live WebGL stage", async ({ page }) => {
  await page.goto("/zh");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("我们自己造");

  // The stage is the point of the hero; a dead canvas is a regression.
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  await expect
    .poll(async () => canvas.evaluate((el: HTMLCanvasElement) => el.width * el.height))
    .toBeGreaterThan(0);

  // The footer links every actor, so this resolves whatever the rail is doing.
  await expect(page.getByRole("link", { name: /SP-01/ }).first()).toBeVisible();
});

test("the English build is English, not English with Chinese in it", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("WE BUILD THEM.");
  // The one deliberate exception is the brand name and the serial codes.
  const body = (await page.locator("main").innerText()).replace(/SWIMMER PARTY/g, "");
  expect(body).not.toMatch(/[一-鿿]/);
});

test("the Chinese build is Chinese, not Chinese with English prose in it", async ({ page }) => {
  await page.goto("/zh");
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("WE BUILD");
});

for (const locale of ["zh", "en"] as const) {
  test(`every actor has a reachable dossier (${locale})`, async ({ page }) => {
    for (const slug of ["hu-qian", "qi-man", "dai-er", "guan-hai"]) {
      const res = await page.goto(`/${locale}/actors/${slug}`);
      expect(res?.status(), `/${locale}/actors/${slug}`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test(`an actor with no delivered plate says so instead of faking one (${locale})`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/actors/dai-er`);
    await expect(
      page.getByText(locale === "zh" ? "尚未交付定妆板" : "NO PLATE DELIVERED"),
    ).toBeVisible();
    // No image may stand in for the missing plate on this dossier.
    await expect(page.locator('main img[alt*="SP-03"]')).toHaveCount(0);
  });
}

/**
 * The house position is a commercial commitment, not decoration. If a
 * redesign drops it off the site, that is a regression worth failing on.
 */
test("the stance is stated on the home page and argued on the pact page", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: /NOT A REAL PERSON/i })).toBeVisible();

  await page.goto("/en/pact");
  await expect(page.getByText("EVERY ACTOR IS ANIMATED")).toBeVisible();
  await expect(page.getByText("NO REAL PERSON'S FACE")).toBeVisible();
  // Unsettled commercial terms must never render as settled.
  await expect(page.getByText("TO BE FIXED IN CONTRACT").first()).toBeVisible();
});

test("the open kit ships a seed for delivered actors and admits the gap for the rest", async ({
  page,
}) => {
  await page.goto("/en/kit");
  await expect(page.getByText("SP-01 / CHARACTER SEED")).toBeVisible();
  await expect(page.getByText("NO SEED YET — STILL ON THE WHITE MODEL")).toBeVisible();
});

test("unknown actor returns the roster 404, not a crash", async ({ page }) => {
  const res = await page.goto("/zh/actors/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("不在");
});

test("sitemap lists every actor in every authored locale", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  for (const locale of ["zh", "en"]) {
    for (const slug of ["hu-qian", "qi-man", "dai-er", "ding-yi", "guan-hai"]) {
      expect(xml).toContain(`/${locale}/actors/${slug}`);
    }
    expect(xml).toContain(`/${locale}/kit`);
    expect(xml).toContain(`/${locale}/pact`);
  }
});
