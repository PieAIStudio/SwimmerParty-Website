import { ACTORS } from "./actors/index.ts";
import { getActorAssets } from "./assets.ts";
import { KIT_MANIFEST, type KitItem } from "./kit.ts";

/** Availability is computed from delivered files, never from a promised set. */
export function getKitManifest(root = process.cwd()): KitItem[] {
  const delivered = new Set(
    ACTORS.flatMap((actor) => getActorAssets(actor.slug, root).items.map((item) => item.series)),
  );
  const series: Record<string, string> = {
    plates: "turnaround",
    expressions: "expression",
    wardrobe: "wardrobe",
  };
  return KIT_MANIFEST.map((item) =>
    series[item.id]
      ? {
          ...item,
          status: delivered.has(series[item.id])
            ? "live"
            : item.status === "live"
              ? "preparing"
              : item.status,
        }
      : item,
  );
}
