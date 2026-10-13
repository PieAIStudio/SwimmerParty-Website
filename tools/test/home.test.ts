import assert from "node:assert/strict";
import test from "node:test";
import { selectHomeContent } from "../../src/features/home/home-catalog.ts";
import type { OfficialSample } from "../../src/content/official-samples.generated.ts";

const ready = { slug: "ready", status: "active" as const, versionDate: "2026-10-01", versionNote: { en: "7 voice clips added.", zh: "新增 7 段声音。" } };
const face = { ...ready, slug: "new", status: "new-face" as const };
const sample = (slug: string, video = "/fixtures/sample.mp4"): OfficialSample => ({ slug, video, poster: "", images: [], tools: ["fixture"], approvedOn: "2026-10-01" });

test("home counts separate active actors from new faces without mutating the catalog", () => {
  const actors = Object.freeze([face, ready]);
  const result = selectHomeContent(actors, []);
  assert.deepEqual(result.ready, [ready]);
  assert.deepEqual(result.newFaces, [face]);
  assert.deepEqual(actors, [face, ready]);
});
test("home does not manufacture clips when none are delivered", () => {
  const result = selectHomeContent([ready], []);
  assert.equal(result.hero, null);
  assert.deepEqual(result.featured, []);
  assert.deepEqual(selectHomeContent([], []).ready, []);
});
test("home ignores unknown and new-face sample associations and empty video paths", () => {
  const result = selectHomeContent([ready, face], [sample("missing"), sample("new"), sample("ready", "")]);
  assert.equal(result.hero, null);
  assert.deepEqual(result.featured, []);
});
test("one approved clip produces one hero, not filler cards", () => {
  const clip = sample("ready");
  const result = selectHomeContent([ready], [clip]);
  assert.equal(result.hero?.sample, clip);
  assert.deepEqual(result.featured, []);
});
test("featured clips follow the hero without repeating it or requiring a poster", () => {
  const clips = [1, 2, 3, 4].map((n) => sample("ready", `/fixtures/${n}.mp4`));
  const result = selectHomeContent([ready], clips);
  assert.equal(result.hero?.sample, clips[0]);
  assert.deepEqual(result.featured.map((entry) => entry.sample), clips.slice(1, 3));
  assert.equal(result.hero?.sample.poster, "");
});
test("updates use dated production notes, not generated release claims", () => {
  const actors = [ready, { ...face, versionDate: "2026-10-03" }, { ...ready, slug: "undated", versionDate: "" }, { ...ready, slug: "silent", versionNote: undefined }];
  const result = selectHomeContent(actors, []);
  assert.deepEqual(result.updates.map((actor) => actor.slug), ["new", "ready"]);
  assert.equal(result.updates[1].versionNote, ready.versionNote);
});
