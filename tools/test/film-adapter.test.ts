import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
test("film adapter maps Directing blocking fields and reports unsupported props", async () => {
  const source = await readFile(new URL("../../src/features/scene/film-adapter.ts", import.meta.url), "utf8");
  assert.match(source, /floorPlan\.spots/); assert.match(source, /floorPlan\.cameraSpots/); assert.match(source, /unsupported/); assert.match(source, /shotSize/); assert.match(source, /eyeLine/);
});
