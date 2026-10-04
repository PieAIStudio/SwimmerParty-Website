import { mkdtemp, mkdir, writeFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { ASSET_FRAMES, type AssetFrame } from "../../src/features/assets/asset-series.ts";

/** Geometric fixtures only: never generated actor images or published assets. */
export async function fixtureRoot() {
  return mkdtemp(path.join(os.tmpdir(), "swimmer-assets-test-"));
}
export async function syntheticImage(frame: AssetFrame = "full", corner?: [number, number]) {
  const { width, height } = ASSET_FRAMES[frame];
  const shape = Buffer.from(`<svg width="${width}" height="${height}"><rect x="${width / 3}" y="${height / 4}" width="${width / 3}" height="${height / 2}" fill="#808080"/></svg>`);
  const layers = [{ input: shape, left: 0, top: 0 }];
  if (corner) layers.push({ input: await sharp({ create: { width: 1, height: 1, channels: 4, background: { r: 1, g: 1, b: 1, alpha: 1 } } }).png().toBuffer(), left: corner[0], top: corner[1] });
  return sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(layers).png().toBuffer();
}
export async function input(root: string, name: string, bytes: Uint8Array, code = "SP-01") {
  const directory = path.join(root, "assets-inbox", code);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), bytes);
}
export async function emptyInbox(root: string, code = "SP-01") {
  const directory = path.join(root, "assets-inbox", code);
  for (const file of await readdir(directory)) await rm(path.join(directory, file));
}
