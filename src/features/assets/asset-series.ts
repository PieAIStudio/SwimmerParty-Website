import vocabulary from "../../content/asset-series.json" with { type: "json" };
import type { MessageContracts } from "../../i18n/message-contracts.ts";
type AssetLabelKey = Extract<keyof MessageContracts, `assets.slot.${string}`>;

export type AssetFrame = keyof typeof vocabulary.frames;
type SlotDefinition = {
  key: string;
  required: boolean;
  direction: string;
  tier?: string;
};
export type SeriesDefinition = {
  id: string;
  frame: AssetFrame;
  required: boolean;
  perLook: boolean;
  prompt: string;
  slots: readonly SlotDefinition[];
};
export type ResolvedSlot = SlotDefinition & {
  series: string;
  frame: AssetFrame;
  look: string | null;
  slot: string;
};
type LookWithExtras = {
  id: string;
  extras?: readonly { key: string; label?: unknown; direction?: string }[];
};

// The checked-in JSON is the shared protocol for UI, ingest, TODO and export.
const series = vocabulary.series as readonly SeriesDefinition[];
export const ASSET_FRAMES = vocabulary.frames;
export const listSeries = (): readonly SeriesDefinition[] => series;

export function seriesOf(id: string): SeriesDefinition {
  const item = series.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown asset series: ${id}`);
  return item;
}

export function slotsOf(id: string, look: string | null = null): ResolvedSlot[] {
  const item = seriesOf(id);
  return item.slots.map((slot) => ({
    ...slot,
    series: id,
    frame: item.frame,
    look,
    slot: [id, ...(look ? [look] : []), slot.key].join("."),
  }));
}

export function slotsForLook(id: string, look: LookWithExtras): ResolvedSlot[] {
  return [
    ...slotsOf(id, look.id),
    ...(look.extras ?? []).map((extra) => ({
      key: extra.key,
      required: false,
      direction: extra.direction ?? extra.key,
      series: id,
      frame: seriesOf(id).frame,
      look: look.id,
      slot: `${id}.${look.id}.${extra.key}`,
    })),
  ];
}

export function requiredSlots(): ResolvedSlot[] {
  return series
    .filter((item) => !item.perLook)
    .flatMap((item) => slotsOf(item.id).filter((slot) => slot.required));
}

export function slotLabelKey(seriesId: string, key: string): AssetLabelKey {
  const definition = seriesOf(seriesId);
  if (seriesId === "voice" || seriesId === "video") {
    const camel = key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    return `assets.${seriesId}.${camel}` as AssetLabelKey;
  }
  if (!definition.slots.some((slot) => slot.key === key)) {
    if (definition.perLook) return `assets.series.${seriesId}` as AssetLabelKey;
    throw new Error(`Unknown asset slot: ${seriesId}.${key}`);
  }
  // Both catalogs are checked against every vocabulary key by test:tools.
  return `assets.slot.${seriesId}.${key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())}` as AssetLabelKey;
}

/** Vocabulary order, then registered look order, then slot order; never filenames. */
export function assetSlotOrder(looks: readonly { id: string }[] = []): string[] {
  return series.flatMap((item) =>
    item.perLook
      ? looks.flatMap((look) => [...slotsForLook(item.id, look).map((slot) => slot.slot)])
      : slotsOf(item.id).map((slot) => slot.slot),
  );
}
