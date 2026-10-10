/** Shared public contracts and pure catalog functions; no I/O or UI. */

export { listSeries } from "./asset-series.ts";
export { starterSlots } from "./starter-pack.ts";

/** One sheet holds at most 16 images, and at most 8 of them full-body. */
export const SHEET_MAX_IMAGES = 16;
export const SHEET_MAX_FULL_BODY = 8;

const FULL_BODY_SERIES = ["turnaround", "wardrobe", "pose"];
export function isFullBodySeries(series: string): boolean {
  return FULL_BODY_SERIES.includes(series);
}

type SheetCandidate = { slot: string; kind: string; series: string };

/**
 * Keeps the requested order and adds each image only while the sheet limits still hold,
 * the same rule a tick follows. Unknown, duplicate and non-image slots are dropped.
 */
export function fitSheetSlots<T extends SheetCandidate>(
  slots: readonly string[],
  items: readonly T[],
): string[] {
  const known = new Map(items.map((item) => [item.slot, item]));
  const picked: string[] = [];
  let fullBody = 0;
  for (const slot of slots) {
    const item = known.get(slot);
    if (!item || item.kind !== "image" || picked.includes(slot)) continue;
    const body = isFullBodySeries(item.series) ? 1 : 0;
    if (picked.length >= SHEET_MAX_IMAGES || fullBody + body > SHEET_MAX_FULL_BODY) continue;
    picked.push(slot);
    fullBody += body;
  }
  return picked;
}

/** The link the member dialog offers: the same picks, already within the sheet limits. */
export function sheetHref(slug: string, items: readonly SheetCandidate[]): string {
  const slots = fitSheetSlots(
    items.map((item) => item.slot),
    items,
  );
  return `/actors/${slug}/sheet?preset=custom&slots=${slots.join(",")}`;
}
