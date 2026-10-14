import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { NAV, SECONDARY_NAV } from "../../src/content/site.ts";

test("primary navigation follows the four creator tasks without unopened community", () => {
  assert.deepEqual(
    NAV.map(({ key }) => key),
    ["actors", "samples", "learn", "cast"],
  );
  assert.equal(NAV.find(({ key }) => String(key) === "cast")?.href, "/cast");
});
test("legal and studio routes remain discoverable in the footer", () => {
  assert.deepEqual(
    SECONDARY_NAV.map(({ href }) => href),
    ["/license", "/studio", "/privacy", "/terms"],
  );
});
test("mobile and desktop menus consume the same primary catalog", async () => {
  const source = await readFile(new URL("../../src/site/SiteHeader.tsx", import.meta.url), "utf8");
  assert.equal((source.match(/navigation\.map/g) ?? []).length, 2);
  assert.match(source, /const navigation = communityVisible/);
  assert.match(source, /communityVisible = false/);
  assert.doesNotMatch(source, /\.\.\.SECONDARY_NAV/);
});
