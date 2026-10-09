import { readFileSync } from "node:fs";
import path from "node:path";
import { assetSlotOrder, listSeries, requiredSlots } from "./asset-series.ts";
import type { ActorAssets, AssetItem } from "./asset-types.ts";
import { actorAssetsSchema } from "../../contracts/assets.ts";
export type { ActorAssets, AssetItem } from "./asset-types.ts";

/** Server/build-time read. Client islands receive the public manifest as props. */
export function getActorAssets(slug: string, root = process.cwd()): ActorAssets {
  let data: ActorAssets;
  try {
    const input: unknown = JSON.parse(
      readFileSync(path.join(root, "src/content/actors", slug, "assets.json"), "utf8"),
    );
    const parsed = actorAssetsSchema.safeParse(input);
    if (!parsed.success)
      throw new Error(
        `Invalid asset manifest ${slug}: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`,
      );
    // Validation only; preserve property ordering and producer-owned extensions.
    data = input as ActorAssets;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { slug, looks: [], items: [] };
    throw error;
  }
  const registeredLooks = data.looks;
  if (data.slug !== slug || !Array.isArray(data.items)) {
    throw new Error(`Invalid asset manifest: ${slug}`);
  }
  const order = assetSlotOrder(registeredLooks);
  const seen = new Set<string>();
  for (const item of data.items) {
    if (
      !order.includes(item.slot) ||
      seen.has(item.slot) ||
      !["v1", "legacy"].includes(item.conformance)
    ) {
      throw new Error(`Invalid or duplicate asset slot: ${slug}/${item.slot}`);
    }
    seen.add(item.slot);
  }
  return { ...data, looks: registeredLooks };
}

export function coreProgress(slug: string, root = process.cwd()) {
  const delivered = new Set(getActorAssets(slug, root).items.map((item) => item.slot));
  const required = requiredSlots();
  return {
    done: required.filter((slot) => delivered.has(slot.slot)).length,
    total: required.length,
  };
}

export function itemsBySeries(slug: string, root = process.cwd()): Record<string, AssetItem[]> {
  const { items } = getActorAssets(slug, root);
  return Object.fromEntries(
    listSeries().map((series) => [series.id, items.filter((item) => item.series === series.id)]),
  );
}

export function firstImage(
  slug: string,
  order: readonly string[],
  root = process.cwd(),
): AssetItem | undefined {
  const { items } = getActorAssets(slug, root);
  for (const slot of order) {
    const item = items.find((candidate) => candidate.slot === slot);
    if (item) return item;
  }
}
