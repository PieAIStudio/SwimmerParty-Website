import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { localMember } from "./fixtures/download";

const PRODUCTS_URL = "https://accounts.swiminai.com/products.json";
const SIGN_IN = { name: "Sign in with Swimmer" };
const ACCOUNT_TRIGGER = { name: "Account: Local member" };

// A fixture catalog in the published shape. The live account center is never reached from tests.
const products = {
  version: 1,
  products: [
    {
      id: "swimmerparty",
      name: { zh: "SWIMMER PARTY", en: "SWIMMER PARTY" },
      description: { zh: "原创 AI 动画演员", en: "Original AI animated actors" },
      url: "https://swimmerparty.swiminai.com",
      clientId: "6f1d6b1e-2c1a-4f4e-9a55-2b0c8f7e1d11",
    },
    {
      id: "fixture-tools",
      name: { zh: "测试工具", en: "Fixture tools" },
      description: { zh: "只用于测试", en: "Test fixture only" },
      url: "https://tools.example.test/",
    },
    {
      id: "fixture-studio",
      name: { zh: "测试工作室", en: "Fixture studio" },
      description: { zh: "只用于测试", en: "Test fixture two" },
      url: "https://studio.example.test",
      clientId: "3c9d2a7e-8b41-4e0f-a2d6-5f7c1e9b0a22",
    },
  ],
};

async function serveProducts(page: Page) {
  const hits = { count: 0 };
  await page.route(PRODUCTS_URL, (route) => {
    hits.count++;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(products),
    });
  });
  return hits;
}

// Canonical AuthKit response paired with an explicitly local image fixture.
// This verifies the browser contract only, not hosted account/SSO acceptance.
for (const { locale, width, nickname, menu } of [
  { locale: "zh", width: 1280, nickname: "粉色机器人", menu: "" },
  { locale: "en", width: 390, nickname: "Pink robot", menu: "Menu" },
]) {
  test(`shared avatar: ${locale} ${width} displays the canonical nickname and image, then refreshes or clears them`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    const image = `https://portraits.example.test/profile-avatar-portrait/v1/${"a".repeat(64)}.svg`;
    let profile: { id: string; name: string; email: string; avatarUrl: string } | null = {
      id: "synthetic-owner",
      name: nickname,
      email: "synthetic@example.test",
      avatarUrl: image,
    };
    await serveProducts(page);
    await page.route("https://portraits.example.test/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect x="12" y="12" width="72" height="72" rx="8" fill="pink"/><circle cx="32" cy="40" r="6"/><circle cx="64" cy="40" r="6"/></svg>',
      }),
    );
    await page.route("**/api/auth/session", (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "cache-control": "private, no-store" },
        body: JSON.stringify(
          profile
            ? {
                user: { id: profile.id, email: profile.email, is_anonymous: false },
                profile,
              }
            : { user: null },
        ),
      }),
    );
    await page.goto(`/${locale}/guide`);
    if (menu) await page.getByRole("button", { name: menu, exact: true }).click();
    const trigger = page.locator(".game-ui-account-menu-trigger:visible");
    await expect(trigger).toHaveAttribute("aria-label", new RegExp(nickname));
    await expect(trigger.locator("img")).toHaveAttribute("src", image);
    await expect
      .poll(() => trigger.locator("img").evaluate((img) => (img as HTMLImageElement).naturalWidth))
      .toBe(96);
    await page.screenshot({
      path: `.devspace-reports/authkit-avatar/menu-${locale}-${width}.png`,
      fullPage: true,
    });
    profile = {
      ...profile!,
      name: `${nickname} 2`,
      avatarUrl: image.replace("a".repeat(64), "b".repeat(64)),
    };
    await page.reload();
    if (menu) await page.getByRole("button", { name: menu, exact: true }).click();
    await expect(trigger).toHaveAttribute("aria-label", new RegExp(`${nickname} 2`));
    await expect(trigger.locator("img")).toHaveAttribute("src", profile.avatarUrl);
    profile = null;
    await page.reload();
    if (menu) await page.getByRole("button", { name: menu, exact: true }).click();
    await expect(page.locator(".game-ui-account-menu-trigger")).toHaveCount(0);
    const label = locale === "en" ? "Sign in with Swimmer" : "用泳者账号登录";
    await expect(page.getByRole("button", { name: label, exact: true }).first()).toBeVisible();
  });
}

test("signed in, the header shows the avatar and name", async ({ page, context }) => {
  await localMember(context);
  await serveProducts(page);
  await page.goto("/en/guide");
  await expect(page.getByRole("button", ACCOUNT_TRIGGER)).toBeVisible();
  await expect(page.getByRole("button", ACCOUNT_TRIGGER)).toContainText("Local member");
});

test("on a phone the trigger is avatar only, inside the site menu", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await localMember(context);
  await serveProducts(page);
  await page.goto("/en/guide");
  await page.getByRole("button", { name: "Menu" }).click();
  const trigger = page.getByRole("button", ACCOUNT_TRIGGER);
  await expect(trigger).toBeVisible();
  await expect(trigger.locator(".game-ui-account-menu-trigger-name")).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});

test("the open panel has three tabs; products show Current and only real links", async ({
  page,
  context,
}) => {
  await localMember(context);
  await serveProducts(page);
  await page.goto("/en/guide");
  await page.getByRole("button", ACCOUNT_TRIGGER).click();
  const panel = page.locator(".game-ui-account-menu-panel");
  await expect(page.getByRole("tab", { name: "Site" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Products" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Account" })).toBeVisible();

  await page.getByRole("tab", { name: "Products" }).click();
  await expect(panel.getByText("Current", { exact: true })).toBeVisible();
  // The current product is not a link; a product without clientId keeps its plain URL.
  await expect(panel.getByRole("link", { name: /Fixture tools/ })).toHaveAttribute(
    "href",
    "https://tools.example.test/",
  );
  await expect(panel.getByRole("link", { name: /Fixture studio/ })).toHaveAttribute(
    "href",
    "https://studio.example.test/?swimmer_sso=1",
  );
  await expect(panel.getByRole("link", { name: /^SWIMMER PARTY/ })).toHaveCount(0);

  const result = await new AxeBuilder({ page }).analyze();
  expect(
    result.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? "")),
  ).toEqual([]);
});

test("the account tab links to the account center and signs out", async ({ page, context }) => {
  await localMember(context);
  await serveProducts(page);
  await page.goto("/en/guide");
  await page.getByRole("button", ACCOUNT_TRIGGER).click();
  await page.getByRole("tab", { name: "Account" }).click();
  const panel = page.locator(".game-ui-account-menu-panel");
  await expect(panel.getByRole("link", { name: "Account and security" })).toHaveAttribute(
    "href",
    "https://accounts.swiminai.com/account?ui_locales=en",
  );
  await panel.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("button", SIGN_IN).first()).toBeVisible({ timeout: 15_000 });
});

test("the site tab lists the cast with its count, and the guide", async ({ page, context }) => {
  await localMember(context);
  await serveProducts(page);
  await page.goto("/en/guide");
  await page.getByRole("button", ACCOUNT_TRIGGER).click();
  const panel = page.locator(".game-ui-account-menu-panel");
  await expect(panel.getByRole("link", { name: "Your cast" })).toHaveAttribute("href", "/en/cast");
  await expect(panel.getByText("Actors: 0", { exact: true })).toBeVisible();
  await expect(panel.getByRole("link", { name: "How it works" })).toHaveAttribute(
    "href",
    "/en/guide",
  );
});

test("the catalog is requested only for a signed-in visitor, once", async ({ page, context }) => {
  const hits = await serveProducts(page);
  await page.goto("/en/guide");
  await expect(page.getByRole("button", SIGN_IN).first()).toBeVisible();
  await page.waitForTimeout(1500);
  expect(hits.count).toBe(0);

  await localMember(context);
  await page.reload();
  await expect(page.getByRole("button", ACCOUNT_TRIGGER)).toBeVisible();
  await expect.poll(() => hits.count).toBe(1);
  await page.waitForTimeout(500);
  expect(hits.count).toBe(1);
});

test("a product arrival marker is removed, and a mock account never starts a sign-in", async ({
  page,
}) => {
  let signIns = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/auth/mock/sign-in")) signIns++;
  });
  await page.goto("/en/guide?swimmer_sso=1&a=tang-yunqiu");
  await expect.poll(() => new URL(page.url()).search).toBe("?a=tang-yunqiu");
  await expect(page.getByRole("button", SIGN_IN).first()).toBeVisible();
  await page.waitForTimeout(800);
  expect(signIns).toBe(0);
});

for (const locale of ["en", "zh"] as const)
  test(`a ${locale} swimmer arrival starts once and keeps its language, query and hash`, async ({
    page,
  }) => {
    const native =
      "https://backend.example.test/auth/v1/oauth/authorize?state=synthetic-state&nonce=synthetic-nonce&code_challenge=synthetic-challenge";
    const starts: string[] = [];
    await page.route("**/api/auth/session", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "cache-control": "no-store" },
        body: JSON.stringify({ user: null, mode: "swimmer" }),
      }),
    );
    await page.route("**/api/auth/sso-start", (route) => {
      starts.push(route.request().postData() ?? "");
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "redirect",
          url: native,
        }),
      });
    });
    await page.route("https://accounts.swiminai.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>Fixture</title>",
      }),
    );
    await page.goto(`/${locale}/guide?swimmer_sso=1&from=cast#help`);
    await expect.poll(() => starts.length).toBe(1);
    expect(JSON.parse(starts[0]).redirectPath).toBe(`/${locale}/guide?from=cast#help`);
    await page.waitForURL("https://accounts.swiminai.com/**");
    const target = new URL(page.url());
    expect(target.pathname).toBe("/authorize/start");
    expect(target.searchParams.get("ui_locales")).toBe(locale);
    expect(target.searchParams.get("authorization_url")).toBe(native);
    await page.waitForTimeout(500);
    expect(starts.length).toBe(1);
  });
