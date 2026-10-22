import assert from "node:assert/strict";
import test from "node:test";
import { selectHomeContent } from "../../src/features/home/home-catalog.ts";
import type { OfficialSample } from "../../src/content/official-samples.generated.ts";

const ready = {
  slug: "ready",
  status: "active" as const,
  versionDate: "2026-10-01",
  versionNote: { en: "7 voice clips added.", zh: "新增 7 段声音。" },
};
const face = { ...ready, slug: "new", status: "new-face" as const };
const sample = (slug: string, video = "/fixtures/sample.mp4"): OfficialSample => ({
  slug,
  sampleId: video,
  actorSlugs: [slug],
  label: "solo",
  video,
  poster: "",
  images: [],
  tools: ["fixture"],
  approvedOn: "2026-10-01",
});

test("home broadens the first look using authored regions and languages", () => {
  const original = {
    ...face,
    voiceLanguage: "zh" as const,
    spec: [
      { id: "origin", label: { en: "From", zh: "来自" }, value: { en: "Town A", zh: "甲城" } },
    ],
  };
  const same = { ...original, slug: "same" };
  const other = {
    ...original,
    slug: "other",
    voiceLanguage: "en" as const,
    spec: [{ ...original.spec[0], value: { en: "Town B", zh: "乙城" } }],
  };
  assert.deepEqual(
    selectHomeContent([original, same, other], []).featuredFaces.map((actor) => actor.slug),
    ["new", "other"],
  );
  assert.deepEqual(selectHomeContent([face], []).featuredFaces, [face]);
});

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
  const result = selectHomeContent(
    [ready, face],
    [sample("missing"), sample("new"), sample("ready", "")],
  );
  assert.equal(result.hero, null);
  assert.deepEqual(result.featured, []);
});
test("one approved clip produces one hero, not filler cards", () => {
  const clip = sample("ready");
  const result = selectHomeContent([ready], [clip]);
  assert.equal(result.hero?.sample, clip);
  assert.deepEqual(result.featured, []);
});
test("homepage shows one approved clip per actor and does not require posters", () => {
  const clips = [
    sample("ready", "/fixtures/1.mp4"),
    sample("ready", "/fixtures/2.mp4"),
    sample("second", "/fixtures/3.mp4"),
    sample("third", "/fixtures/4.mp4"),
  ];
  const actors = [ready, { ...ready, slug: "second" }, { ...ready, slug: "third" }];
  const result = selectHomeContent(actors, clips);
  assert.equal(result.hero?.sample, clips[0]);
  assert.deepEqual(
    result.featured.map((entry) => entry.sample),
    clips.slice(2),
  );
  assert.deepEqual(
    [result.hero, ...result.featured].map((entry) => entry?.actor.slug),
    ["ready", "second", "third"],
  );
  assert.equal(result.hero?.sample.poster, "");
});
test("hero compares the same actor in two actual tools, without inventing a second clip", () => {
  const clips = [
    { ...sample("ready", "/grok.mp4"), tools: ["ChatGPT", "Grok"] },
    { ...sample("ready", "/grok-other.mp4"), tools: ["Grok"] },
    { ...sample("ready", "/vids.mp4"), tools: ["Google Vids"] },
  ];
  assert.deepEqual(
    selectHomeContent([ready], clips).heroSamples.map((entry) => entry.sample),
    [clips[0], clips[2]],
  );
  assert.equal(selectHomeContent([ready], clips.slice(0, 2)).heroSamples.length, 1);
  assert.deepEqual(selectHomeContent([ready], []).heroSamples, []);
});
test("updates use dated production notes, not generated release claims", () => {
  const actors = [
    ready,
    { ...face, versionDate: "2026-10-03" },
    { ...ready, slug: "undated", versionDate: "" },
    { ...ready, slug: "silent", versionNote: undefined },
  ];
  const result = selectHomeContent(actors, []);
  assert.deepEqual(
    result.updates.map((actor) => actor.slug),
    ["new", "ready"],
  );
  assert.equal(result.updates[1].versionNote, ready.versionNote);
});
