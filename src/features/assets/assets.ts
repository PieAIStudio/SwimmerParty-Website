import { readFileSync } from "node:fs";
import path from "node:path";
import { getActor } from "../../content/actors/index.ts";
import { assetSlotOrder, listSeries, requiredSlots } from "./asset-series.ts";
import type { ActorAssets, AssetItem } from "./asset-types.ts";
export type { ActorAssets, AssetItem } from "./asset-types.ts";

/** Server/build-time read. Client islands receive the public manifest as props. */
export function getActorAssets(slug: string, root = process.cwd()): ActorAssets {
  const actor = getActor(slug);
  if (!actor) throw new Error(`Unknown actor: ${slug}`);
  let data: ActorAssets;
  try {
    data = JSON.parse(
      readFileSync(path.join(root, "src/content/actors", slug, "assets.json"), "utf8"),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { code: actor.code, slug, looks: [], items: [] };
    throw error;
  }
  if (
    data.code !== actor.code ||
    data.slug !== slug ||
    !Array.isArray(data.looks) ||
    !Array.isArray(data.items)
  ) {
    throw new Error(`Invalid asset manifest: ${slug}`);
  }
  const order = assetSlotOrder(data.looks);
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
  return data;
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
