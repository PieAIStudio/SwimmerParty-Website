import { requiredSlots, ASSET_FRAMES } from "../../../src/features/assets/asset-series.ts";
import type { ActorAssets } from "../../../src/features/assets/asset-types.ts";

/** Synthetic metadata for exercising twenty references, never written to production manifests. */
export function syntheticAssetRecords(): ActorAssets {
  return {
    slug: "zhang-qiang",
    looks: [],
    items: requiredSlots()
      .slice(0, 20)
      .map((slot) => ({
        kind: "image",
        slot: slot.slot,
        series: slot.series,
        key: slot.key,
        look: null,
        conformance: "v1",
        version: 1,
        width: ASSET_FRAMES[slot.frame].width,
        height: ASSET_FRAMES[slot.frame].height,
        bytes: 1,
        sha256: "0".repeat(64),
        sourceSha256: "0".repeat(64),
        bbox: { left: 0, top: 0, right: 1, bottom: 1 },
        format: "png",
        object: `zhang-qiang/0123456789abcdef/zhang-qiang__${slot.series}__${slot.key}__v1.png`,
        preview: "/__synthetic-image.png",
        thumb: "/__synthetic-image.png",
      })),
  };
}
