import test from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { ACTORS } from "../../src/content/actors/index.ts";
import { OFFICIAL_SAMPLES } from "../../src/content/official-samples.generated.ts";
import { getActorAssets } from "../../src/features/assets/assets.ts";
import { actorAssetsSchema } from "../../src/contracts/assets.ts";
import { loadActorProjection, projectActorData } from "../site/actor-data.ts";
import { generateActorData } from "../site/generate-actor-data.ts";
import {
  actorDataRoot,
  castingFixture,
  promotedFixture,
  writeJson,
} from "./fixtures/actor-data.ts";

async function rootFor(t: { after: (callback: () => Promise<void>) => void }, published = false) {
  const root = await actorDataRoot(published);
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test("production projection owns every public actor, release, look and sample", async () => {
  const data = await loadActorProjection();
  assert.deepEqual(data.actors, ACTORS);
  assert.deepEqual(data.samples, OFFICIAL_SAMPLES);
  for (const actor of data.active)
    assert.deepEqual(data.looks[actor.slug], getActorAssets(actor.slug).looks);
  assert.equal(data.actors.filter((actor) => actor.slug === "yan-lin").length, 1);
  assert.equal(data.actors.find((actor) => actor.slug === "misha-luo")?.heightCm, undefined);
});

test("validation preserves authored JSON ordering and manifest extensions", async (t) => {
  const casting = castingFixture();
  casting.actors[0].tagline = { zh: "测试文案", en: "Fixture copy" };
  const actor = projectActorData([], casting).actors[0];
  assert.equal(JSON.stringify(actor.tagline), JSON.stringify(casting.actors[0].tagline));
  assert.equal(JSON.stringify(actor.note), JSON.stringify(casting.actors[0].tagline));
  const root = await rootFor(t);
  const manifest = {
    items: [],
    slug: "fixture-actor",
    looks: [
      {
        label: { zh: "个人", en: "Personal" },
        id: "personal",
        kind: "personal",
        extras: [],
        prompt: "fixture",
        producerExtension: true,
      },
    ],
    producerExtension: { preserved: true },
  };
  await writeJson(root, "src/content/actors/fixture-actor/assets.json", manifest);
  assert.equal(JSON.stringify(getActorAssets("fixture-actor", root)), JSON.stringify(manifest));
});

test("fixture promotion publishes exactly one unchanged identity at 1.0.0", async (t) => {
  const root = await rootFor(t);
  await generateActorData(root);
  const before = await loadActorProjection(root);
  assert.equal(before.actors[0].status, "new-face");
  await writeJson(root, "media-pack/actors/fixture-actor.json", promotedFixture());
  await writeJson(root, "media-pack/actors/not-published.json", {
    slug: "not-published",
    productionOnly: true,
  });
  await assert.rejects(generateActorData(root, true), /Generated data (missing|drift)/);
  await generateActorData(root);
  await generateActorData(root, true);
  const after = await loadActorProjection(root);
  assert.equal(after.actors.length, 1);
  assert.equal(after.newFaces.length, 0);
  assert.equal(after.actors[0].slug, before.actors[0].slug);
  assert.equal(after.actors[0].nameEn, before.actors[0].nameEn);
  assert.equal(after.actors[0].nameCn, before.actors[0].nameCn);
  assert.equal(after.actors[0].status, "active");
  assert.equal(after.actors[0].version, "1.0.0");
  const manifest = JSON.parse(
    await readFile(path.join(root, "src/content/actors/fixture-actor/assets.json"), "utf8"),
  );
  assert.deepEqual(manifest.productionExtension, { preserved: true });
  assert.deepEqual(manifest.items, []);
  assert.equal(manifest.looks[0].id, "personal");
});

test("source and generated-file drift fail; generation preserves delivery items", async (t) => {
  const root = await rootFor(t, true);
  const file = "src/content/actors/fixture-actor/assets.json";
  const original = {
    slug: "fixture-actor",
    looks: [],
    items: [{ slot: "voice.intro", opaqueDelivery: "not rewritten" }],
  };
  await writeJson(root, file, original);
  await generateActorData(root);
  let manifest = JSON.parse(await readFile(path.join(root, file), "utf8"));
  assert.deepEqual(manifest.items, original.items);
  const actor = promotedFixture();
  actor.release.note.en = "New approved release note";
  await writeJson(root, "media-pack/actors/fixture-actor.json", actor);
  await assert.rejects(generateActorData(root, true), /profile.ts/);
  await generateActorData(root);
  manifest = JSON.parse(await readFile(path.join(root, file), "utf8"));
  manifest.looks[0].prompt = "Wrong hand edit";
  await writeJson(root, file, manifest);
  await assert.rejects(generateActorData(root, true), /assets.json/);
  await generateActorData(root);
  await generateActorData(root, true);
  const output = "src/content/actors/new-face-profiles.generated.ts";
  await writeJson(root, output, "Wrong hand edit");
  await assert.rejects(generateActorData(root, true), /new-face-profiles.generated.ts/);
});

test("invalid, duplicate and identity-changing production inputs fail with their source", () => {
  const casting = castingFixture();
  assert.throws(
    () => projectActorData([], { ...casting, actors: [...casting.actors, casting.actors[0]] }),
    /duplicate fixture-actor/,
  );
  const actor = promotedFixture();
  assert.throws(() => projectActorData([actor, actor], casting), /duplicate fixture-actor/);
  assert.throws(
    () =>
      projectActorData([{ ...actor, name: { ...actor.name, en: "Different person" } }], casting),
    /preserve casting name/,
  );
  assert.throws(
    () => projectActorData([{ ...actor, proportions: { heightCm: null } }], casting),
    /requires confirmed/,
  );
  assert.throws(
    () =>
      projectActorData([{ ...actor, demographics: { ...actor.demographics, age: "28" } }], casting),
    /fixture-actor.json: demographics.age/,
  );
  assert.throws(
    () =>
      projectActorData(
        [{ ...actor, website: { ...actor.website, visibleLooks: ["missing"] } }],
        casting,
      ),
    /missing/,
  );
  assert.throws(
    () =>
      projectActorData(
        [{ ...actor, status: { ...actor.status, siteProfile: "wrong.ts" } }],
        casting,
      ),
    /siteProfile/,
  );
});

test("a missing delivery manifest prevents every generated write", async (t) => {
  const root = await rootFor(t, true);
  await rm(path.join(root, "src/content/actors/fixture-actor/assets.json"));
  await assert.rejects(generateActorData(root), { code: "ENOENT" });
  await assert.rejects(readFile(path.join(root, "src/content/actors/fixture-actor/profile.ts")), {
    code: "ENOENT",
  });
});

test("asset schema and inferred types share the manifest boundary", () => {
  const manifest = getActorAssets("tang-yunqiu");
  assert.deepEqual(actorAssetsSchema.parse(manifest), manifest);
  assert.equal(
    actorAssetsSchema.safeParse({ ...manifest, items: [{ ...manifest.items[0], bytes: "123" }] })
      .success,
    false,
  );
  assert.equal(
    actorAssetsSchema.safeParse({ ...manifest, items: [{ ...manifest.items[0], kind: "unknown" }] })
      .success,
    false,
  );
  assert.equal(actorAssetsSchema.safeParse({ ...manifest, slug: "../outside" }).success, false);
  const extended = {
    ...manifest,
    operatorNote: "kept",
    items: [{ ...manifest.items[0], extension: true }],
  };
  assert.deepEqual(actorAssetsSchema.parse(extended), extended);
});
