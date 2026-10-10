// Pure rules for the character sheet page: which images each preset means and when a sheet exists.
// Relative imports only, so the node test runner can load this module directly.
import type { AssetItem } from "../assets/asset-types.ts";
import { fitSheetSlots } from "../assets/contracts.ts";

export const SHEET_PRESETS = [
  "recommended",
  "turnaround",
  "expressions",
  "wardrobe",
  "custom",
] as const;
export type SheetPreset = (typeof SHEET_PRESETS)[number];

/** A sheet needs at least this many images in the library; below it the page is not offered. */
export const SHEET_MIN_IMAGES = 4;

/** The fields a sheet reads from a manifest item; the full AssetItem satisfies it. */
export type SheetItem = Pick<AssetItem, "slot" | "kind" | "series" | "key" | "look">;
type Sheetable = SheetItem;
type Look = { id: string };

const RECOMMENDED = [
  "turnaround.front",
  "turnaround.three-quarter",
  "turnaround.side",
  "turnaround.back",
  "face.front",
  "face.three-quarter",
  "expression.smile",
  "expression.angry",
  "expression.sad",
  "expression.surprised",
];
const EXPRESSIONS = [
  "neutral",
  "smile",
  "laugh",
  "sad",
  "cry",
  "annoyed",
  "angry",
  "surprised",
  "scared",
  "disgusted",
  "embarrassed",
  "tired",
].map((key) => `expression.${key}`);

/** Slots a preset stands for, in the order the sheet shows them. `custom` has no derived list. */
export function presetSlots(
  preset: SheetPreset,
  items: readonly Sheetable[],
  looks: readonly Look[],
): string[] {
  const images = items.filter((item) => item.kind === "image");
  let wanted: string[];
  switch (preset) {
    case "recommended":
      wanted = RECOMMENDED;
      break;
    case "turnaround":
      wanted = images.filter((item) => item.series === "turnaround").map((item) => item.slot);
      break;
    case "expressions":
      wanted = EXPRESSIONS;
      break;
    case "wardrobe":
      // Each look contributes its front; a look without one contributes its first outfit image.
      wanted = looks.flatMap((look) => {
        const own = images.filter((item) => item.series === "wardrobe" && item.look === look.id);
        const pick = own.find((item) => item.key === "front") ?? own[0];
        return pick ? [pick.slot] : [];
      });
      break;
    case "custom":
      return [];
  }
  return fitSheetSlots(wanted, images);
}

/** Presets with something to show for this actor; custom is always offered. */
export function availablePresets(
  items: readonly Sheetable[],
  looks: readonly Look[],
): SheetPreset[] {
  return SHEET_PRESETS.filter(
    (preset) => preset === "custom" || presetSlots(preset, items, looks).length > 0,
  );
}

/** The sheet page and its download button are offered only when the library has enough images. */
export function canMakeSheet(items: readonly Pick<AssetItem, "kind">[]): boolean {
  return items.filter((item) => item.kind === "image").length >= SHEET_MIN_IMAGES;
}
