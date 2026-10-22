import test from "node:test";
import assert from "node:assert/strict";
import { projectOfficialSamples } from "../site/sample-data.ts";
import { productionSamplesSchema, type ProductionSample } from "../../src/contracts/samples.ts";

const clip = (id: string, actorSlugs = ["one"]): ProductionSample => ({
  sampleId: id,
  actorSlugs,
  label: actorSlugs.length === 2 ? "two-actors" : "solo",
  approvedOn: "2026-10-14",
  tools: ["Fixture"],
  approval: {
    rootStatus: "passed-fixture-only",
    evidence: "synthetic-test",
    evidenceSha256: "a".repeat(64),
    ownerReviewPending: true,
  },
  media: [
    {
      kind: "video",
      sourceRoot: "assets-inbox",
      source: `${id}.mp4`,
      sourceSha256: "b".repeat(64),
      public: `/media/samples/${id}.mp4`,
      transcode: true,
    },
  ],
});
const project = (clips: ProductionSample[]) =>
  projectOfficialSamples([{ slug: "one", officialSamples: clips }], ["one", "two"]);
test("zero, one and four delivered clips create exactly those cards with independent IDs", () => {
  assert.deepEqual(project([]), []);
  assert.equal(project([clip("a")]).length, 1);
  assert.deepEqual(
    project(["a", "b", "c", "d"].map((id) => clip(id))).map((s) => s.sampleId),
    ["a", "b", "c", "d"],
  );
  assert.throws(() => project(["a", "b", "c", "d", "e"].map((id) => clip(id))), /at most four/);
});
test("a two-actor film has one file and is associated with both identities", () => {
  const [result] = project([clip("shared", ["one", "two"])]);
  assert.deepEqual(result.actorSlugs, ["one", "two"]);
  assert.equal(result.video, "/media/samples/shared.mp4");
  assert.equal(result.slug, "one");
});
test("independent ensemble deliveries can show a co-star without duplicating that co-star's cards", () => {
  const first = { ...clip("first"), castSlugs: ["one", "two"], label: "two-actors" as const };
  const second = {
    ...clip("second", ["two"]),
    castSlugs: ["two", "one"],
    label: "two-actors" as const,
  };
  const result = projectOfficialSamples(
    [
      { slug: "one", officialSamples: first },
      { slug: "two", officialSamples: second },
    ],
    ["one", "two"],
  );
  assert.deepEqual(
    result.map((s) => s.actorSlugs),
    [["one"], ["two"]],
  );
  assert.deepEqual(result[0].castSlugs, ["one", "two"]);
  assert.throws(() => project([{ ...first, castSlugs: ["two"] }]), /cast association/);
});

test("missing scene stills use an actual extracted poster, not a fabricated extra card", () => {
  const [result] = project([clip("plain")]);
  assert.deepEqual(result.images, []);
  assert.equal(result.poster, "/media/samples/plain.poster.webp");
});
test("duplicate film IDs, duplicate video paths and unknown associations fail", () => {
  assert.throws(() => project([clip("a"), clip("a")]), /Duplicate sampleId/);
  const second = clip("b");
  second.media[0].public = "/media/samples/a.mp4";
  assert.throws(() => project([clip("a"), second]), /duplicate video/);
  assert.throws(() => project([clip("a", ["one", "unknown"])]), /association/);
});
test("new samples require Root proof, pinned source bytes and bounded conversion", () => {
  const item = clip("a");
  delete item.approval;
  assert.throws(() => project([item]), /Root review/);
  const unpinned = clip("b");
  delete unpinned.media[0].sourceSha256;
  assert.throws(() => project([unpinned]), /pinned source/);
  for (const state of ["proxy-reviewed-only", "rejected", "test-only", "correction-required"])
    assert.equal(
      productionSamplesSchema.safeParse({
        ...clip("c"),
        approval: { ...clip("c").approval, rootStatus: state },
      }).success,
      false,
    );
});
test("actor labels cannot quietly turn a solo into an ensemble", () => {
  assert.throws(() => project([{ ...clip("a"), label: "two-actors" }]), /label/);
  assert.throws(() => project([clip("a", ["one", "one"])]), /association/);
});
