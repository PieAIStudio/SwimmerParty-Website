import test from "node:test";
import assert from "node:assert/strict";
import { ACTORS } from "../src/content/actors/index.ts";
import { WORKS } from "../src/content/works.ts";

test("round six roster has the selected order and all 95 new faces", () => {
  assert.equal(ACTORS.length, 99);
  assert.deepEqual(ACTORS.slice(0, 4).map((actor) => actor.slug), ["tang-yunqiu", "misha-luo", "zhang-qiang", "chen-wei"]);
  assert.equal(ACTORS.slice(4).filter((actor) => actor.status === "new-face").length, 95);
  assert.equal(new Set(ACTORS.map((actor) => actor.slug)).size, ACTORS.length);
  assert.ok(ACTORS.every((actor) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(actor.slug)));
});

test("works use actor slugs", () => {
  assert.ok(WORKS.every((work) => work.cast.every((credit) => ACTORS.some((actor) => actor.slug === credit.actor))));
});
