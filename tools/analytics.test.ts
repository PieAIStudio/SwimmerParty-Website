import test from "node:test";
import assert from "node:assert/strict";
import { isApprovedEvent, normalizeEvent } from "../src/features/analytics/events.ts";

test("PostHog accepts only the approved event vocabulary", () => {
  assert.equal(isApprovedEvent("asset_downloaded"), true);
  assert.equal(isApprovedEvent("bundle_download"), false);
  assert.equal(isApprovedEvent("email"), false);
  assert.equal(normalizeEvent("bundle_download")?.name, "asset_downloaded");
  assert.equal(normalizeEvent("unknown"), null);
});
