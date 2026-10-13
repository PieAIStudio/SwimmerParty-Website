import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { generateOgAssets } from "../site/generate-og-assets.ts";

test("OG regeneration removes only stale generated actor JPEGs and check detects them", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "swimmer-og-retirement-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "public/media/assets/current-actor"), { recursive: true });
  await mkdir(path.join(root, "public/media/og"), { recursive: true });
  const source = await sharp({
    create: { width: 40, height: 60, channels: 4, background: { r: 40, g: 70, b: 90, alpha: 1 } },
  })
    .webp()
    .toBuffer();
  await writeFile(
    path.join(root, "public/media/assets/current-actor/turnaround.front.webp"),
    source,
  );
  await generateOgAssets(root);
  const current = await readFile(path.join(root, "public/media/og/current-actor.jpg"));
  await writeFile(path.join(root, "public/media/og/retired-actor.jpg"), "stale generated image");
  await writeFile(path.join(root, "public/media/og/notes.txt"), "not a generated actor JPEG");
  await assert.rejects(generateOgAssets(root, true), /Retired OG/);
  await generateOgAssets(root);
  await assert.rejects(readFile(path.join(root, "public/media/og/retired-actor.jpg")), {
    code: "ENOENT",
  });
  assert.deepEqual(await readFile(path.join(root, "public/media/og/current-actor.jpg")), current);
  assert.equal(
    await readFile(path.join(root, "public/media/og/notes.txt"), "utf8"),
    "not a generated actor JPEG",
  );
  await generateOgAssets(root, true);
});
