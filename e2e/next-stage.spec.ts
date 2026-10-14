import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import en from "../messages/en/messages.json";
import { MACHINE_LOCALES } from "../src/i18n/routing";

const REPORT = ".devspace-reports/next-stage";
async function screenshot(page: Page, name: string) {
  await mkdir(REPORT, { recursive: true });
  await page.screenshot({ path: `${REPORT}/${name}.png`, fullPage: false });
}

for (const { code } of MACHINE_LOCALES) {
  test(`A1 ${code} prefix redirects root, nested page and query to the translation proxy`, async ({
    request,
  }) => {
    for (const [suffix, expected] of [
      ["", "/en"],
      ["/license", "/en/license"],
      ["/cast?a=tang-yunqiu", "/en/cast"],
    ]) {
      const response = await request.get(`/${code}${suffix}`, {
        maxRedirects: 0,
        headers: { cookie: "NEXT_LOCALE=zh", "accept-language": "zh-CN" },
      });
      expect(response.status()).toBe(307);
      const url = new URL(response.headers().location);
      expect(url.hostname).toBe("swimmerparty-swiminai-com.translate.goog");
      expect(url.pathname).toBe(expected);
      expect(url.searchParams.get("_x_tr_sl")).toBe("en");
      expect(url.searchParams.get("_x_tr_tl")).toBe(code);
      if (suffix.includes("?")) expect(url.searchParams.get("a")).toBe("tang-yunqiu");
    }
  });
}

for (const [language, cookie, locale] of [
  ["ja-JP,ja;q=0.9", "", "en"],
  ["es-ES,es;q=0.9", "", "en"],
  ["", "", "en"],
  ["ja", "NEXT_LOCALE=zh", "zh"],
  ["zh-CN", "NEXT_LOCALE=en", "en"],
  ["zh-TW", "NEXT_LOCALE=invalid", "zh"],
  ["fr,en;q=0.7,zh;q=0.8", "", "zh"],
  ["zh;q=0,fr", "", "en"],
]) {
  test(`A1 language fallback: ${language || "absent"}, ${cookie || "no cookie"}`, async ({
    request,
  }) => {
    const response = await request.get("/actors?q=kept", {
      maxRedirects: 0,
      headers: { "accept-language": language, cookie },
    });
    expect(response.status()).toBe(307);
    const redirect = new URL(response.headers().location, response.url());
    expect(redirect.pathname).toBe(`/${locale}/actors`);
    expect(redirect.search).toBe("?q=kept");
    expect(response.headers().vary).toContain("Accept-Language");
    expect(response.headers().vary).toContain("Cookie");
  });
}

test("A1 explicit authored locale wins; prefetch does not replace the stored choice", async ({
  request,
}) => {
  const response = await request.get("/en/guide", {
    headers: {
      cookie: "NEXT_LOCALE=zh",
      "accept-language": "zh",
      "sec-fetch-dest": "document",
    },
  });
  expect(response.status()).toBe(200);
  expect(response.headers()["set-cookie"]).toContain("NEXT_LOCALE=en");
  for (const headers of [
    { "next-router-prefetch": "1", rsc: "1", "sec-fetch-dest": "empty" },
    { purpose: "prefetch", "sec-fetch-dest": "document" },
    { "sec-purpose": "prefetch", "sec-fetch-dest": "document" },
  ] as Record<string, string>[]) {
    const prefetch = await request.get("/en/guide", {
      headers: { cookie: "NEXT_LOCALE=zh", ...headers },
    });
    expect(prefetch.headers()["set-cookie"] ?? "").not.toContain("NEXT_LOCALE=en");
  }
});

test("A1 fetching another locale in the browser cannot overwrite its selected language", async ({
  page,
  context,
}) => {
  await page.goto("/zh/guide");
  await expect
    .poll(
      async () => (await context.cookies()).find((cookie) => cookie.name === "NEXT_LOCALE")?.value,
    )
    .toBe("zh");
  const status = await page.evaluate(async () => {
    const response = await fetch("/en/guide?_rsc=a1-prefetch", {
      headers: { rsc: "1", "next-router-prefetch": "1" },
    });
    await response.text();
    return response.status;
  });
  expect(status).toBe(200);
  expect((await context.cookies()).find((cookie) => cookie.name === "NEXT_LOCALE")?.value).toBe(
    "zh",
  );
});

// The v1 review surface is now closed by default. Enabled authority/error cases live in community-v3.spec.ts.
for (const [locale, width] of [
  ["en", 1440],
  ["zh", 390],
] as const) {
  test(`C1 closed community pages are noindex and never fetch private data: ${locale}`, async ({
    page,
    request,
  }) => {
    let calls = 0;
    await page.route("**/api/community/**", (route) => {
      calls++;
      return route.abort();
    });
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/admin/review",
      "/community/new",
      "/community/mine",
      "/works/p/33333333-3333-4333-8333-333333333333",
    ]) {
      const response = await page.goto(`/${locale}${path}`);
      expect(response?.status()).toBe(404);
      await expect(
        page.locator(
          "[data-review-desk], [data-community-composer], [data-my-works], [data-community-post]",
        ),
      ).toHaveCount(0);
      expect(calls).toBe(0);
    }
    expect((await request.get("/api/community/v3/list_review_queue")).status()).toBe(503);
    expect((await request.get("/api/community/review")).status()).toBe(503);
    await page.goto(`/${locale}/works`);
    await expect(page.locator("[data-community-feed]")).toHaveCount(0);
    await expect(page.locator('a[href*="/community/new"]')).toHaveCount(0);
    expect(calls).toBe(0);
  });
}

test("A1 English breadcrumb is English", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/works/journey-to-the-east");
  await expect(page.getByRole("navigation", { name: "Breadcrumb", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "当前位置" })).toHaveCount(0);
  await screenshot(page, "a1-breadcrumb-en-1440");
});

type ProductEvent = { name: string; data: Record<string, unknown> };
async function events(page: Page) {
  return page.evaluate(() => (window as Window & { a1Events?: ProductEvent[] }).a1Events ?? []);
}

test("A1 all five funnel steps emit locally, with no analytics network request or replay double count", async ({
  page,
}) => {
  const network: string[] = [];
  page.on("request", (request) => {
    if (/posthog\.com|posthog\.io/.test(request.url())) network.push(request.url());
  });
  await page.addInitScript(() => {
    const target = window as Window & { a1Events?: ProductEvent[] };
    target.a1Events = [];
    window.addEventListener("swimmer-party-event", (event) =>
      target.a1Events?.push((event as CustomEvent<ProductEvent>).detail),
    );
  });
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({ json: { user: null, mode: "swimmer" } }),
  );
  await page.route("**/api/auth/sso-start", (route) =>
    route.fulfill({ status: 503, json: { error: "isolated-test" } }),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/actors/tang-yunqiu");
  await expect
    .poll(async () => (await events(page)).filter((event) => event.name === "actor_viewed").length)
    .toBe(1);
  const sample = page.locator("[data-actor-sample] [data-sample-id]").first();
  const video = sample.locator("video");
  await sample.getByRole("button", { name: /Play sample/ }).click();
  await expect(video).toHaveAttribute("src", /\.mp4$/);
  await video.evaluate(async (element: HTMLVideoElement) => {
    element.muted = true;
    await element.play();
    element.pause();
    await element.play();
    element.pause();
  });
  await expect
    .poll(async () => (await events(page)).filter((event) => event.name === "sample_viewed").length)
    .toBe(1);
  await page.getByRole("button", { name: en["cast.add"], exact: true }).click();
  await page.getByRole("button", { name: en["cast.added"], exact: true }).click();
  expect((await events(page)).filter((event) => event.name === "cast_changed")).toHaveLength(1);
  await page.getByRole("button", { name: en["actor.openLibrary"], exact: true }).click();
  await expect
    .poll(
      async () =>
        (await events(page)).filter((event) => event.name === "sign_in_prompt_shown").length,
    )
    .toBe(1);
  expect((await events(page)).filter((event) => event.name === "download_started")).toHaveLength(1);
  for (const event of await events(page)) {
    for (const key of Object.keys(event.data))
      expect(key).not.toMatch(/email|name|text|prompt|query|title|description|recipe|url|token/i);
  }
  expect(network).toEqual([]);
  await screenshot(page, "a1-funnel-en-1440");
});
