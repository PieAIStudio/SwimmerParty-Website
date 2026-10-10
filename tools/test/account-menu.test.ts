import assert from "node:assert/strict";
import test from "node:test";
import { planArrival, withoutSwimmerSso } from "../../src/features/account/arrival.ts";
import { accountProfile } from "../../src/features/account/profile.ts";
import {
  createProductSource,
  productCatalogSchema,
  productsFor,
} from "../../src/features/account/products.ts";

const catalogFixture = {
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
  ],
};

test("accountProfile follows the name order and trims, then caps at 40 characters", () => {
  const base = { id: "u1", email: "fish@example.test" };
  assert.equal(
    accountProfile({ ...base, user_metadata: { display_name: "  小鱼  ", full_name: "Full" } }).name,
    "小鱼",
  );
  assert.equal(accountProfile({ ...base, user_metadata: { full_name: "Full" } }).name, "Full");
  assert.equal(accountProfile({ ...base, user_metadata: { name: "Named" } }).name, "Named");
  assert.equal(accountProfile({ ...base, user_metadata: { display_name: "   " } }).name, "fish");
  assert.equal(accountProfile({ ...base, user_metadata: {} }).name, "fish");
  assert.equal(accountProfile({ id: "u2", email: null }).name, "Swimmer");
  assert.equal(accountProfile({ id: "u3", email: "@example.test" }).name, "Swimmer");
  assert.equal(accountProfile({ id: "u4", user_metadata: { display_name: "x".repeat(60) } }).name.length, 40);
  assert.equal(
    accountProfile({ id: "u5", user_metadata: { display_name: "鱼".repeat(45) } }).name,
    "鱼".repeat(40),
  );
});

test("accountProfile keeps email and accepts only https avatars", () => {
  assert.equal(accountProfile({ id: "u1", email: "a@example.test" }).email, "a@example.test");
  assert.equal(accountProfile({ id: "u2", email: null }).email, null);
  assert.equal(
    accountProfile({
      id: "u3",
      user_metadata: { avatar_url: "https://images.example.test/a.png" },
    }).avatarUrl,
    "https://images.example.test/a.png",
  );
  for (const avatar of ["http://images.example.test/a.png", "javascript:alert(1)", "not a url", 42]) {
    assert.equal(accountProfile({ id: "u4", user_metadata: { avatar_url: avatar } }).avatarUrl, null);
  }
});

test("withoutSwimmerSso removes only the exact marker and keeps the rest as written", () => {
  assert.equal(withoutSwimmerSso("?swimmer_sso=1"), "");
  assert.equal(withoutSwimmerSso("?a=1&swimmer_sso=1&b=2"), "?a=1&b=2");
  assert.equal(withoutSwimmerSso("?swimmer_sso=1&a=tang,misha"), "?a=tang,misha");
  assert.equal(withoutSwimmerSso("?a=tang,misha&swimmer_sso=1"), "?a=tang,misha");
  assert.equal(withoutSwimmerSso("?swimmer_sso=10"), null);
  assert.equal(withoutSwimmerSso("?x_swimmer_sso=1"), null);
  assert.equal(withoutSwimmerSso("?a=1"), null);
  assert.equal(withoutSwimmerSso(""), null);
});

test("planArrival starts one swimmer sign-in only for a signed-out arrival with the marker", () => {
  assert.deepEqual(planArrival({ search: "", mode: "swimmer", signedIn: false }), {
    search: null,
    startSignIn: false,
  });
  assert.deepEqual(planArrival({ search: "?swimmer_sso=1", mode: "swimmer", signedIn: false }), {
    search: "",
    startSignIn: true,
  });
  assert.deepEqual(planArrival({ search: "?swimmer_sso=1", mode: "swimmer", signedIn: true }), {
    search: "",
    startSignIn: false,
  });
  assert.deepEqual(planArrival({ search: "?swimmer_sso=1", mode: "mock", signedIn: false }), {
    search: "",
    startSignIn: false,
  });
  assert.deepEqual(planArrival({ search: "?swimmer_sso=1", mode: null, signedIn: false }), {
    search: "",
    startSignIn: false,
  });
});

test("the catalog schema accepts the published shape and rejects unsafe or malformed input", () => {
  assert.equal(productCatalogSchema.safeParse(catalogFixture).success, true);
  assert.equal(
    productCatalogSchema.safeParse({ ...catalogFixture, version: 2 }).success,
    false,
  );
  assert.equal(
    productCatalogSchema.safeParse({
      ...catalogFixture,
      products: [{ ...catalogFixture.products[1], url: "http://tools.example.test" }],
    }).success,
    false,
  );
  assert.equal(
    productCatalogSchema.safeParse({
      ...catalogFixture,
      products: [{ ...catalogFixture.products[1], clientId: "not-a-uuid" }],
    }).success,
    false,
  );
  assert.equal(
    productCatalogSchema.safeParse({
      ...catalogFixture,
      products: [{ ...catalogFixture.products[1], name: { zh: "只有中文" } }],
    }).success,
    false,
  );
  const withExtra = productCatalogSchema.parse({
    ...catalogFixture,
    generatedAt: "2026-10-10",
    products: [{ ...catalogFixture.products[1], logo: "ignored" }],
  });
  assert.equal("logo" in withExtra.products[0], false);
});

test("products map by locale, add the SSO marker only with a clientId, and mark the current product", () => {
  const catalog = productCatalogSchema.parse(catalogFixture);
  const zh = productsFor(catalog, "zh");
  const en = productsFor(catalog, "en");
  assert.deepEqual(zh[0], {
    id: "swimmerparty",
    name: "SWIMMER PARTY",
    description: "原创 AI 动画演员",
    href: "https://swimmerparty.swiminai.com/?swimmer_sso=1",
    current: true,
  });
  assert.equal(en[0].description, "Original AI animated actors");
  assert.equal(zh[1].description, "只用于测试");
  assert.equal(en[1].description, "Test fixture only");
  // Without a clientId the href is the product URL, untouched.
  assert.equal(zh[1].href, "https://tools.example.test/");
  assert.equal(zh[1].current, false);
});

test("the product source caches for five minutes and warns once when the catalog fails", async () => {
  let clock = 0;
  const warnings: string[] = [];
  let calls = 0;
  let failing = false;
  const source = createProductSource(
    async () => {
      calls++;
      if (failing) throw new Error("network");
      return catalogFixture;
    },
    { now: () => clock, warn: (message) => warnings.push(message) },
  );

  assert.equal((await source("en")).length, 2);
  clock += 4 * 60_000;
  assert.equal((await source("zh"))[0].name, "SWIMMER PARTY");
  assert.equal(calls, 1, "a fresh catalog is reused across locales");

  clock += 2 * 60_000;
  failing = true;
  assert.deepEqual(await source("en"), []);
  assert.equal(calls, 2);
  assert.equal(warnings.length, 1);

  clock += 5 * 60_000 + 1;
  assert.deepEqual(await source("en"), []);
  assert.equal(calls, 3);
  assert.equal(warnings.length, 1, "the warning is not repeated");
});

test("an invalid catalog returns no products and warns", async () => {
  const warnings: string[] = [];
  const source = createProductSource(async () => ({ version: 1, products: "nope" }), {
    now: () => 0,
    warn: (message) => warnings.push(message),
  });
  assert.deepEqual(await source("en"), []);
  assert.equal(warnings.length, 1);
});
