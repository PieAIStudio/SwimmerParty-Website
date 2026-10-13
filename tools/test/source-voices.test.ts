import test from "node:test";
import assert from "node:assert/strict";
import { readFile, rm, access, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { actorDataRoot, promotedFixture, writeJson } from "./fixtures/actor-data.ts";
import { syntheticWav } from "./fixtures/audio.ts";
import { generateVoiceManifests } from "../assets/generate-voice-manifests.ts";
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
async function fixture(t: { after: (fn: () => Promise<void>) => void }) {
  const root = await actorDataRoot(true);
  t.after(() => rm(root, { recursive: true, force: true }));
  const bytes = syntheticWav();
  const pin = {
    slot: "intro",
    source: "voices/fixture-actor/intro.wav",
    nativeSource: "synthetic",
    sha256: sha(bytes),
    bytes: bytes.length,
    version: 1,
  };
  const actor = {
    ...promotedFixture(),
    assetDelivery: {
      mode: "source-originals",
      candidateAuthorizedOn: "2026-10-14",
      ownerReviewPending: true,
      sourceEvidence: ["synthetic"],
      images: [{ ...pin, slot: "turnaround.front", source: "fixture-actor/front.png" }],
      voices: [pin],
    },
  };
  await writeJson(root, "media-pack/actors/fixture-actor.json", actor);
  const file = path.join(root, "assets-inbox", pin.source);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, bytes);
  return {
    root,
    bytes,
    pin,
    actor,
    file,
    manifest: path.join(root, "src/content/actors/fixture-actor/assets.json"),
  };
}
test("explicit voice delivery dry-run makes no manifest or private-master writes", async (t) => {
  const f = await fixture(t),
    before = await readFile(f.manifest);
  assert.equal(await generateVoiceManifests(f.root, ["fixture-actor"], () => 0.1, true), 1);
  assert.deepEqual(await readFile(f.manifest), before);
  await assert.rejects(access(path.join(f.root, ".assets-local")), { code: "ENOENT" });
});
test("changed voice bytes use a new immutable object and leave the old recording intact", async (t) => {
  const f = await fixture(t);
  await generateVoiceManifests(f.root, ["fixture-actor"], () => 0.1);
  const old = JSON.parse(await readFile(f.manifest, "utf8")).items[0];
  assert.deepEqual(await readFile(path.join(f.root, ".assets-local", old.object)), f.bytes);
  assert.equal(old.sha256, f.pin.sha256);
  const updated = Buffer.from(f.bytes);
  updated[44] = 1;
  f.actor.assetDelivery.voices[0] = { ...f.pin, sha256: sha(updated) };
  await writeJson(f.root, "media-pack/actors/fixture-actor.json", f.actor);
  await writeFile(f.file, updated);
  await generateVoiceManifests(f.root, ["fixture-actor"], () => 0.1);
  const current = JSON.parse(await readFile(f.manifest, "utf8")).items[0];
  assert.notEqual(current.object, old.object);
  assert.equal(current.conformance, "source-original");
  assert.equal(
    current.transcript,
    undefined,
    "do not reuse an old transcript for a new performance",
  );
  assert.deepEqual(await readFile(path.join(f.root, ".assets-local", old.object)), f.bytes);
  assert.deepEqual(await readFile(path.join(f.root, ".assets-local", current.object)), updated);
});
test("invalid voice pins or durations fail before committing the manifest", async (t) => {
  const f = await fixture(t),
    before = await readFile(f.manifest);
  await assert.rejects(
    generateVoiceManifests(f.root, ["fixture-actor"], () => NaN),
    /duration/,
  );
  await writeFile(f.file, Buffer.from("not the pinned voice"));
  await assert.rejects(
    generateVoiceManifests(f.root, ["fixture-actor"], () => 0.1),
    /differs/,
  );
  assert.deepEqual(await readFile(f.manifest), before);
  await assert.rejects(access(path.join(f.root, ".assets-local")), { code: "ENOENT" });
});
