import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { ingest } from "../assets/assets-ingest.ts";
import { assetDeliverySchema } from "../../src/contracts/asset-delivery.ts";
import { loadAssetDelivery, prepareSourceOriginal } from "../assets/source-originals.ts";

const sha = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");
const filename = "zhang-qiang__turnaround__front__v1.png";
async function fixture(t: { after: (fn: () => Promise<void>) => void }, opaque = false) {
  const root = await mkdtemp(path.join(tmpdir(), "swimmer-source-original-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const image = await sharp({
    create: {
      width: 125,
      height: 125,
      channels: 4,
      background: { r: 50, g: 80, b: 90, alpha: opaque ? 1 : 0.7 },
    },
  })
    .png()
    .toBuffer();
  const pin = {
    slot: "turnaround.front",
    source: `zhang-qiang/${filename}`,
    nativeSource: "synthetic fixture only",
    sha256: sha(image),
    bytes: image.length,
    version: 1,
  };
  const delivery = {
    mode: "source-originals" as const,
    candidateAuthorizedOn: "2026-10-14",
    ownerReviewPending: true,
    sourceEvidence: ["synthetic fixture"],
    images: [pin],
    voices: [],
  };
  await mkdir(path.join(root, "assets-inbox/zhang-qiang"), { recursive: true });
  await mkdir(path.join(root, "media-pack/actors"), { recursive: true });
  await writeFile(path.join(root, "assets-inbox", pin.source), image);
  await writeFile(
    path.join(root, "media-pack/actors/zhang-qiang.json"),
    JSON.stringify({ slug: "zhang-qiang", assetDelivery: delivery }),
  );
  return { root, image, pin, delivery };
}
test("source originals preserve arbitrary alpha and exact PNG bytes, without claiming v1 compliance", async (t) => {
  const { root, image } = await fixture(t);
  const result = await ingest("zhang-qiang", { root, sourceOriginals: true });
  const item = result.manifest.items[0];
  assert.equal(item.conformance, "source-original");
  assert.equal(item.width, 125);
  assert.equal(item.sha256, sha(image));
  assert.equal(item.sha256, item.sourceSha256);
  assert.deepEqual(await readFile(path.join(root, ".assets-local", item.object)), image);
  assert.ok(item.large);
  for (const file of [item.preview, item.thumb, item.large]) {
    const meta = await sharp(await readFile(path.join(root, "public", file!))).metadata();
    assert.equal(meta.width, 125, "never enlarge the supplied source");
    assert.equal(meta.format, "webp");
  }
  assert.deepEqual(
    (await ingest("zhang-qiang", { root, sourceOriginals: true })).manifest,
    result.manifest,
  );
});
test("standard ingest remains strict; opting in without exact production pins still fails", async (t) => {
  const { root } = await fixture(t);
  await assert.rejects(ingest("zhang-qiang", { root }), /Asset validation failed/);
  await rm(path.join(root, "media-pack/actors/zhang-qiang.json"));
  assert.equal(await loadAssetDelivery(root, "zhang-qiang"), null);
  await assert.rejects(
    ingest("zhang-qiang", { root, sourceOriginals: true }),
    /explicit production/,
  );
  await assert.rejects(access(path.join(root, "public")));
});
test("source pin mismatch is rejected before any master, preview or manifest write", async (t) => {
  const { root, delivery } = await fixture(t);
  delivery.images[0].sha256 = "0".repeat(64);
  await writeFile(
    path.join(root, "media-pack/actors/zhang-qiang.json"),
    JSON.stringify({ assetDelivery: delivery }),
  );
  await assert.rejects(
    ingest("zhang-qiang", { root, sourceOriginals: true }),
    /Asset validation failed/,
  );
  for (const folder of ["public", "src", ".assets-local"])
    await assert.rejects(access(path.join(root, folder)));
});
test("opaque source is retained explicitly and dry-run does not claim a transparent v1 asset", async (t) => {
  const { root, image } = await fixture(t, true);
  const result = await ingest("zhang-qiang", { root, sourceOriginals: true, dryRun: true });
  assert.equal(result.manifest.items[0].conformance, "source-original");
  assert.equal(result.manifest.items[0].sha256, sha(image));
  for (const folder of ["public", "src", ".assets-local"])
    await assert.rejects(access(path.join(root, folder)));
});
test("delivery paths, duplicated identities and unexpected inbox files fail closed", async (t) => {
  const { root, delivery } = await fixture(t);
  assert.equal(
    assetDeliverySchema.safeParse({ ...delivery, images: [...delivery.images, ...delivery.images] })
      .success,
    false,
  );
  assert.equal(
    assetDeliverySchema.safeParse({
      ...delivery,
      images: [{ ...delivery.images[0], source: "../escape.png" }],
    }).success,
    false,
  );
  await writeFile(path.join(root, "assets-inbox/zhang-qiang/unlisted.png"), "not admitted");
  await assert.rejects(
    ingest("zhang-qiang", { root, sourceOriginals: true }),
    /pinned image set differ/,
  );
});
test("a completely transparent original is not a usable actor reference", async () => {
  const image = await sharp({
    create: { width: 30, height: 30, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();
  await assert.rejects(
    prepareSourceOriginal(
      image,
      {
        slot: "face.front",
        source: "one/a.png",
        nativeSource: "synthetic",
        sha256: sha(image),
        bytes: image.length,
        version: 1,
      },
      { slug: "one", group: "face", series: "face", key: "front", look: null },
    ),
    /no visible pixels/,
  );
});
