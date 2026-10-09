import test from "node:test";
import assert from "node:assert/strict";
import { isApprovedEvent, normalizeEvent, pageKind } from "../../src/features/analytics/events.ts";

test("PostHog accepts only the approved event vocabulary", () => {
  assert.equal(isApprovedEvent("asset_downloaded"), true);
  assert.equal(isApprovedEvent("bundle_download"), false);
  assert.equal(isApprovedEvent("email"), false);
  assert.equal(normalizeEvent("bundle_download")?.name, "asset_downloaded");
  assert.equal(normalizeEvent("unknown"), null);
});

test("analytics never forwards personal or free-text fields", () => {
  const out = normalizeEvent("actor_viewed", {
    slug: "tang-yunqiu",
    email: "someone@example.com",
    displayName: "Pie",
    query: "maid",
    nested: { a: 1 },
  });
  assert.deepEqual(out?.data, { slug: "tang-yunqiu" });
});

test("page views report a coarse page type, not the path", () => {
  assert.deepEqual(pageKind("/en"), { page: "home", locale: "en" });
  assert.deepEqual(pageKind("/zh/actors/tang-yunqiu/assets"), { page: "assets", locale: "zh" });
  assert.deepEqual(pageKind("/en/actors/lin-xiaoman"), { page: "actor", locale: "en" });
  assert.deepEqual(pageKind("/en/works/p/abc"), { page: "post", locale: "en" });
  assert.deepEqual(pageKind("/en/license"), { page: "license", locale: "en" });
});
