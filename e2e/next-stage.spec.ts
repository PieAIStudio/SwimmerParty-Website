import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";
import { MACHINE_LOCALES } from "../src/i18n/routing";
import { localMember } from "./fixtures/download";

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

for (const [locale, messages, width] of [
  ["en", en, 1440],
  ["zh", zh, 390],
] as const) {
  test(`A1 review guest is noindex with no queue request or contents: ${locale}`, async ({
    page,
    request,
  }) => {
    let queueRequests = 0;
    await page.route("**/api/community/review", (route) => {
      queueRequests += 1;
      return route.fulfill({ status: 403, json: { error: "owner-required" } });
    });
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(`/${locale}/admin/review`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex.*nofollow/,
    );
    await expect(page.getByText(messages["community.reviewSignIn"], { exact: true })).toBeVisible();
    await expect(page.getByText(messages["community.reviewEmpty"], { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: messages["community.reviewTitle"] }),
    ).toHaveCount(0);
    expect(queueRequests).toBe(0);
    expect((await request.get("/api/community/review")).status()).toBe(401);
    await screenshot(page, `a1-review-guest-${locale}-${width}`);
  });
}

for (const [status, message] of [
  [401, "community.reviewSignIn"],
  [403, "community.reviewForbidden"],
  [503, "community.reviewUnavailable"],
] as const) {
  test(`A1 refused review request is not an empty queue: ${status}`, async ({ page, context }) => {
    await localMember(context);
    await page.route("**/api/community/review", (route) =>
      route.fulfill({ status, json: { error: "test-refused" } }),
    );
    await page.goto("/en/admin/review");
    await expect(page.getByText(en[message], { exact: true })).toBeVisible();
    await expect(page.getByText(en["community.reviewEmpty"], { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: en["community.reviewTitle"] })).toHaveCount(0);
    await screenshot(page, `a1-review-${status}`);
  });
}

test("A1 successful owner read alone may show an empty queue; malformed data is an error", async ({
  page,
  context,
}) => {
  await localMember(context);
  let malformed = true;
  await page.route("**/api/community/review", (route) =>
    route.fulfill({ json: malformed ? { invalid: [] } : { posts: [] } }),
  );
  await page.goto("/en/admin/review");
  await expect(page.getByText(en["community.reviewUnavailable"], { exact: true })).toBeVisible();
  await expect(page.getByText(en["community.reviewEmpty"], { exact: true })).toHaveCount(0);
  malformed = false;
  await page.getByRole("button", { name: en["community.reviewRetry"], exact: true }).click();
  await expect(page.getByRole("heading", { name: en["community.reviewTitle"] })).toBeVisible();
  await expect(page.getByText(en["community.reviewEmpty"], { exact: true })).toBeVisible();
});

test("A1 failed moderation never reports success or leaves private queue content visible", async ({
  page,
  context,
}) => {
  await localMember(context);
  await page.route("**/api/community/review", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({ status: 403, json: { error: "owner-required" } })
      : route.fulfill({
          json: {
            posts: [
              {
                id: "a1-pending",
                kind: "image",
                title: "Private test submission",
                author: "Test creator",
                actorSlugs: ["tang-yunqiu"],
                likes: 0,
                createdAt: "2026-10-13T00:00:00Z",
                status: "pending",
              },
            ],
          },
        }),
  );
  await page.goto("/en/admin/review");
  await expect(page.getByRole("heading", { name: "Private test submission" })).toBeVisible();
  await page.getByRole("button", { name: en["community.approve"], exact: true }).click();
  await expect(page.getByText(en["community.reviewForbidden"], { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Private test submission" })).toHaveCount(0);
});

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
