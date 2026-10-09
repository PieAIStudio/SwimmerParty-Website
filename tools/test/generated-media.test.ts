import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { getActorAssets } from "../../src/features/assets/assets.ts";
import { actorDataRoot, promotedFixture, writeJson } from "./fixtures/actor-data.ts";
import { syntheticMp3 } from "./fixtures/audio.ts";
import { generateNewFaceAssets } from "../assets/generate-new-face-assets.ts";
import { generateAssetDerivatives } from "../assets/generate-asset-derivatives.ts";
import { generateOfficialSampleMedia } from "../assets/generate-official-samples.ts";
import { generateVoiceManifests } from "../assets/generate-voice-manifests.ts";
import { publicFile, sourceFile } from "../assets/generated-media-common.ts";
import { generateOgAssets } from "../site/generate-og-assets.ts";
import { generateLicenseExamples } from "../assets/generate-license-examples.ts";
import { creditSvg } from "../assets/credit-kit.ts";
import { LICENSE } from "../../src/content/license.ts";

async function rootFor(t: { after: (callback: () => Promise<void>) => void }, published = false) {
  const root = await actorDataRoot(published);
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
async function imageSource(root: string) {
  const file = path.join(root, "media-pack/library/fixtures/casting.png");
  await mkdir(path.dirname(file), { recursive: true });
  const bytes = await sharp({
    create: { width: 32, height: 48, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();
  await writeFile(file, bytes);
  return bytes;
}
const manifestPath = (root: string) =>
  path.join(root, "src/content/actors/fixture-actor/assets.json");
const manifestAt = async (root: string) => JSON.parse(await readFile(manifestPath(root), "utf8"));

test("new-face generation upserts only its image and preserves voice, looks and extensions", async (t) => {
  const root = await rootFor(t);
  const voice = getActorAssets("lin-xiaoman").items.find((item) => item.kind === "voice")!;
  const looks = promotedFixture().looks;
  await writeJson(root, "src/content/actors/fixture-actor/assets.json", {
    slug: "fixture-actor",
    looks,
    items: [voice],
    extension: "keep",
  });
  const bytes = await imageSource(root);
  await generateNewFaceAssets(root);
  const manifest = await manifestAt(root);
  assert.deepEqual(manifest.items[0], voice);
  assert.deepEqual(manifest.looks, looks);
  assert.equal(manifest.extension, "keep");
  const image = manifest.items[1];
  assert.equal(image.object, "fixture-actor/CC-999.png");
  assert.equal(image.sha256, createHash("sha256").update(bytes).digest("hex"));
  assert.equal(image.width, 32);
  assert.equal(image.height, 48);
  for (const url of [image.preview, image.large, image.thumb])
    assert.equal((await sharp(await readFile(publicFile(root, url))).metadata()).format, "webp");
  await generateNewFaceAssets(root);
  assert.deepEqual(await manifestAt(root), manifest);
});

test("missing or invalid new-face source cannot replace an existing delivery", async (t) => {
  const root = await rootFor(t);
  const before = await readFile(manifestPath(root));
  await assert.rejects(generateNewFaceAssets(root), /Missing source/);
  assert.deepEqual(await readFile(manifestPath(root)), before);
  await imageSource(root);
  await writeFile(path.join(root, "media-pack/library/fixtures/casting.png"), "not an image");
  await assert.rejects(generateNewFaceAssets(root));
  assert.deepEqual(await readFile(manifestPath(root)), before);
  await assert.rejects(access(path.join(root, "public")), { code: "ENOENT" });
});

test("derivatives stay under public and never rewrite master objects or metadata", async (t) => {
  const root = await rootFor(t);
  await imageSource(root);
  await generateNewFaceAssets(root);
  const before = await manifestAt(root);
  before.items[0].object = "immutable/approved-object.png";
  before.code = "production-owned-field";
  await writeJson(root, "src/content/actors/fixture-actor/assets.json", before);
  await generateAssetDerivatives(root, ["fixture-actor"]);
  const after = await manifestAt(root);
  const { large: _oldLarge, blur: _oldBlur, ...oldItem } = before.items[0];
  const { large: _newLarge, blur: _newBlur, ...newItem } = after.items[0];
  assert.deepEqual(newItem, oldItem);
  assert.equal(after.code, before.code);
  await access(publicFile(root, after.items[0].large));
  await assert.rejects(access(path.join(root, "media")), { code: "ENOENT" });
});

test("public/source path guards reject traversal before writing", () => {
  for (const url of ["/media/../private", "/outside/image.png", "/media\\outside.png"])
    assert.throws(() => publicFile("/fixture", url), /Invalid/);
  assert.throws(() => sourceFile("/fixture", "../outside.png"), /escapes/);
  assert.equal(publicFile("/fixture", "/media/image.webp"), "/fixture/public/media/image.webp");
});

test("official sample conversion separates metadata and requires every original first", async (t) => {
  const root = await rootFor(t, true);
  const sample = {
    ...promotedFixture(),
    officialSamples: {
      approvedOn: "2026-10-09",
      tools: ["Fixture tool"],
      media: [
        {
          kind: "image",
          source: "library/fixtures/casting.png",
          public: "/media/works/samples/fixture-actor/image-01.webp",
        },
        {
          kind: "video",
          source: "library/fixtures/video.mp4",
          public: "/media/works/samples/fixture-actor/video-01.mp4",
        },
      ],
    },
  };
  await writeJson(root, "media-pack/actors/fixture-actor.json", sample);
  await imageSource(root);
  await assert.rejects(generateOfficialSampleMedia(root), /Missing source/);
  await assert.rejects(access(path.join(root, "public")), { code: "ENOENT" });
  const video = Buffer.from("synthetic-copy-only-video-fixture");
  await writeFile(path.join(root, "media-pack/library/fixtures/video.mp4"), video);
  await generateOfficialSampleMedia(root);
  assert.deepEqual(await readFile(publicFile(root, sample.officialSamples.media[1].public)), video);
  assert.equal(
    (
      await sharp(
        await readFile(publicFile(root, sample.officialSamples.media[0].public)),
      ).metadata()
    ).format,
    "webp",
  );
});

test("OG bytes are reproducible and a hand edit is detected", async (t) => {
  const root = await rootFor(t);
  await imageSource(root);
  await generateNewFaceAssets(root);
  await generateOgAssets(root);
  await generateOgAssets(root, true);
  const file = path.join(root, "public/media/og/fixture-actor.jpg");
  const metadata = await sharp(await readFile(file)).metadata();
  assert.equal(metadata.width, 560);
  assert.equal(metadata.height, 560);
  await writeFile(file, "incorrect generated bytes");
  await assert.rejects(generateOgAssets(root, true), /Generated OG drift/);
});

test("license graphics use the canonical credit and fail before writes without originals", async (t) => {
  assert.ok(creditSvg("#FFFFFF").includes(`>${LICENSE.credit.en}</text>`));
  const root = await rootFor(t);
  await assert.rejects(generateLicenseExamples(root), /Missing source/);
  await assert.rejects(access(path.join(root, "public")), { code: "ENOENT" });
});

test("voice generation is isolated, repeatable and cannot erase a missing recording", async (t) => {
  const root = await rootFor(t);
  await imageSource(root);
  await generateNewFaceAssets(root);
  const image = (await manifestAt(root)).items[0];
  const voiceFile = path.join(
    root,
    "media-pack/library/voice/new-faces/fixture-actor/candidate-1.mp3",
  );
  await mkdir(path.dirname(voiceFile), { recursive: true });
  await writeFile(voiceFile, syntheticMp3());
  assert.equal(await generateVoiceManifests(root, ["fixture-actor"], () => 0.1), 1);
  const manifest = await manifestAt(root);
  assert.deepEqual(manifest.items[0], image);
  assert.equal(manifest.items[1].object, "voice/fixture-actor/candidate-1.mp3");
  assert.equal(manifest.items[1].transcript.text, "Test only.");
  await generateVoiceManifests(root, ["fixture-actor"], () => 0.1);
  assert.deepEqual(await manifestAt(root), manifest);
  await assert.rejects(
    generateVoiceManifests(root, ["fixture-actor"], () => NaN),
    /Invalid voice duration/,
  );
  assert.deepEqual(await manifestAt(root), manifest);
  await rm(voiceFile);
  await assert.rejects(
    generateVoiceManifests(root, ["fixture-actor"], () => 0.1),
    /Missing source/,
  );
  assert.deepEqual(await manifestAt(root), manifest);
});
