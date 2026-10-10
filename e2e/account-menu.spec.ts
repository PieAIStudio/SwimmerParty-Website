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
    "https://accounts.swiminai.com/account",
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
  await expect(panel.getByText("0 actors", { exact: true })).toBeVisible();
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

test("a swimmer arrival starts exactly one sign-in, returning to the cleaned path", async ({
  page,
}) => {
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
        url: "https://accounts.swiminai.com/oauth/authorize?fixture=1",
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
  await page.goto("/en/guide?swimmer_sso=1");
  await expect.poll(() => starts.length).toBe(1);
  expect(JSON.parse(starts[0]).redirectPath).toBe("/en/guide");
  await page.waitForURL("https://accounts.swiminai.com/**");
  await page.waitForTimeout(500);
  expect(starts.length).toBe(1);
});

test("the help tip stays inside the viewport, and phones do not show it", async ({ page }) => {
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/actors/tang-yunqiu");
    // Let the session check finish so the page has settled before pointing at the help icon.
    await expect(page.getByRole("button", SIGN_IN).first()).toBeVisible();
    const help = page.locator("main").getByRole("link", { name: "How it works" });
    await help.scrollIntoViewIfNeeded();
    await help.hover();
    const tip = page.getByRole("tooltip").filter({ hasText: "Starter pack" });
    await expect(tip).toHaveCSS("opacity", "1");
    const box = await tip.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/actors/tang-yunqiu");
  await expect(page.getByRole("tooltip").filter({ hasText: "Starter pack" })).toBeHidden();
});
