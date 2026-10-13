import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { assetDeliverySchema, type AssetDelivery } from "../../src/contracts/asset-delivery.ts";
import type { AssetItem } from "../../src/contracts/assets.ts";

export async function loadAssetDelivery(root: string, slug: string): Promise<AssetDelivery | null> {
  try {
    const actor = JSON.parse(
      await readFile(path.join(root, "media-pack/actors", `${slug}.json`), "utf8"),
    );
    return actor.assetDelivery ? assetDeliverySchema.parse(actor.assetDelivery) : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export function verifyOriginalSource(source: Uint8Array, pin: { sha256: string; bytes: number }) {
  if (
    source.byteLength !== pin.bytes ||
    createHash("sha256").update(source).digest("hex") !== pin.sha256
  )
    throw new Error("Original source differs from the production delivery pin");
}
/** Preserve original bytes. Inspect the actual supplied canvas rather than repairing it secretly. */
export async function prepareSourceOriginal(
  source: Buffer,
  pin: AssetDelivery["images"][number],
  input: { slug: string; group: string; series: string; key: string; look: string | null },
) {
  verifyOriginalSource(source, pin);
  const image = sharp(source, { limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  if (metadata.format !== "png" || !metadata.width || !metadata.height)
    throw new Error("Source original must decode as PNG");
  const { data, info } = await image
    .clone()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width,
    top = info.height,
    right = 0,
    bottom = 0,
    transparent = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha === 0) transparent++;
      if (alpha > 0) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x + 1);
        bottom = Math.max(bottom, y + 1);
      }
    }
  if (!right || !bottom) throw new Error("Source original contains no visible pixels");
  const { slug, group, series, key, look } = input;
  const item: AssetItem = {
    kind: "image",
    slot: pin.slot,
    series,
    key,
    look,
    conformance: "source-original",
    version: pin.version,
    width: info.width,
    height: info.height,
    bytes: source.length,
    sha256: pin.sha256,
    sourceSha256: pin.sha256,
    bbox: {
      left: left / info.width,
      top: top / info.height,
      right: right / info.width,
      bottom: bottom / info.height,
    },
    format: "png",
    object: `${slug}/${pin.sha256.slice(0, 16)}/${slug}__${group}__${key}__v${pin.version}.png`,
    preview: `/media/assets/${slug}/${pin.slot}.webp`,
    thumb: `/media/assets/${slug}/${pin.slot}.thumb.webp`,
    sourceInspection: {
      transparentFraction: transparent / (info.width * info.height),
      hasAlpha: Boolean(metadata.hasAlpha),
      ownerReviewPending: true,
    },
  };
  const preview = await image
    .clone()
    .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();
  const thumb = await image
    .clone()
    .resize({ width: 384, height: 384, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer();
  let large: Buffer | undefined;
  if (pin.slot === "turnaround.front") {
    large = await image
      .clone()
      .resize({ width: 941, height: 1672, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    item.large = item.preview.replace(/\.webp$/, ".large.webp");
  }
  return { item, source, preview, thumb, large };
}
