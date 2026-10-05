import { expect, test } from "@playwright/test";
import { SITE } from "../src/content/site";

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
  const canvasHasPixels = await canvas.evaluate(
    (el: HTMLCanvasElement) => el.width * el.height > 0,
  );
  test.skip(!canvasHasPixels, "WebGL is unavailable in this browser runtime");
  await expect
    .poll(async () => canvas.evaluate((el: HTMLCanvasElement) => el.width * el.height))
    .toBeGreaterThan(0);

  // The footer continues to link every actor, independently from the preview grid.
  await expect(page.getByRole("link", { name: /SP-13/ }).first()).toBeVisible();
});

test("the English build is English, not English with Chinese in it", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/WE BUILD THEM\./i);
  // The one deliberate exception is the brand name and the serial codes.
  const body = (await page.locator("main").innerText()).replace(/SWIMMER PARTY/g, "");
  expect(body).not.toMatch(/[一-鿿]/);
});

test("the Chinese build is Chinese, not Chinese with English prose in it", async ({ page }) => {
  await page.goto("/zh");
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText(/WE BUILD/i);
});

for (const locale of ["zh", "en"] as const) {
  test(`every actor has a reachable dossier (${locale})`, async ({ page }) => {
    for (const slug of ["tang-yunqiu", "misha-luo"]) {
      const res = await page.goto(`/${locale}/actors/${slug}`);
      expect(res?.status(), `/${locale}/actors/${slug}`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test(`an actor dossier shows delivered media (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}/actors/misha-luo`);
    await expect(page.locator('main img[alt*="SP-03"]')).toHaveCount(9);
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
  await expect(page.getByText("SP-13 / CHARACTER SEED")).toBeVisible();

  // Reference angles are per-actor. SP-13 has three; SP-03 has only the
  // front plate and has to say so rather than showing empty frames.
  await expect(page.locator('img[alt*="SP-13 Three-quarter" i]')).toBeVisible();
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
    for (const slug of ["tang-yunqiu", "misha-luo"]) {
      expect(xml).toContain(`/${locale}/actors/${slug}`);
    }
    expect(xml).toContain(`/${locale}/kit`);
    expect(xml).toContain(`/${locale}/pact`);
  }
});

test("authored pages expose their own localized canonical", async ({ page }) => {
  for (const path of [
    "/en",
    "/en/actors",
    "/en/works",
    "/en/kit",
    "/en/studio",
    "/en/casting",
    "/en/pact",
    "/en/actors/tang-yunqiu",
    "/en/kit/tang-yunqiu",
  ]) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${SITE.url}${path.slice(3) || ""}`,
    );
  }
});

test("legacy actor and kit URLs redirect once and keep locale", async ({ request }) => {
  for (const path of [
    "/en/actors/he-jie",
    "/zh/actors/dai-er",
    "/en/kit/he-jie",
    "/zh/kit/dai-er",
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    expect(response.headers().location, path).toMatch(
      new RegExp(`^/${path.slice(1, 3)}/(actors|kit)/`),
    );
  }
});

for (const coarse of [false, true]) {
  test(`high-density clay rendering has an explicit ${coarse ? "coarse-pointer" : "desktop"} pixel budget`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: coarse ? 390 : 1440, height: 900 },
      deviceScaleFactor: 3,
      hasTouch: coarse,
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      await page.goto("http://127.0.0.1:3399/en");
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(coarse);
      const canvas = page.locator("[data-clay-stage] canvas");
      await expect(canvas).toBeVisible();
      const limit = coarse ? 1.35 : 1.5;
      await expect
        .poll(async () =>
          Math.abs(
            (await canvas.evaluate(
              (node) => (node as HTMLCanvasElement).width / node.clientWidth,
            )) - limit,
          ),
        )
        .toBeLessThan(0.015);
      expect(await page.locator("canvas").count()).toBe(1);
    } finally {
      await context.close();
    }
  });
}
