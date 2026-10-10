// The whole page state lives in the query string, so a shared link or a sign-in round trip restores it.
// Pure functions only; the component mirrors the result with history.replaceState.
import type { SheetBackground, SheetLabels } from "../assets/render-sheet.ts";
import { fitSheetSlots } from "../assets/contracts.ts";
import {
  availablePresets,
  SHEET_PRESETS,
  type SheetItem,
  type SheetPreset,
} from "./sheet-presets.ts";

export const SHEET_LABEL_CHOICES: readonly SheetLabels[] = ["none", "zh", "en"];
export const SHEET_BACKGROUND_CHOICES: readonly SheetBackground[] = ["grey", "white", "dark"];

export type SheetState = {
  preset: SheetPreset;
  /** The user's ticks; only meaningful for `custom`, always empty otherwise. */
  slots: string[];
  labels: SheetLabels;
  background: SheetBackground;
  voice: boolean;
  video: boolean;
  prompt: boolean;
};

export const DEFAULT_SHEET_STATE: SheetState = {
  preset: "recommended",
  slots: [],
  labels: "none",
  background: "grey",
  voice: false,
  video: false,
  prompt: false,
};

type ActorSheetInput = {
  items: readonly SheetItem[];
  looks: readonly { id: string }[];
  hasPrompt: boolean;
};

/** Reads the query string; unknown or invalid values fall back to the default. */
export function readSheetState(search: string, actor: ActorSheetInput): SheetState {
  const params = new URLSearchParams(search);
  const available = availablePresets(actor.items, actor.looks);
  const requested = params.get("preset");
  const preset = (SHEET_PRESETS as readonly string[]).includes(requested ?? "")
    ? (requested as SheetPreset)
    : null;
  const chosen =
    preset && available.includes(preset)
      ? preset
      : available.includes("recommended")
        ? "recommended"
        : "custom";
  const labels = params.get("labels");
  const background = params.get("bg");
  return {
    preset: chosen,
    slots:
      chosen === "custom"
        ? fitSheetSlots((params.get("slots") ?? "").split(",").filter(Boolean), actor.items)
        : [],
    labels: SHEET_LABEL_CHOICES.includes(labels as SheetLabels) ? (labels as SheetLabels) : "none",
    background: SHEET_BACKGROUND_CHOICES.includes(background as SheetBackground)
      ? (background as SheetBackground)
      : "grey",
    voice: params.get("voice") === "1" && actor.items.some((item) => item.kind === "voice"),
    video: params.get("video") === "1" && actor.items.some((item) => item.kind === "video"),
    prompt: params.get("prompt") === "1" && actor.hasPrompt === true,
  };
}

/** Only non-default values are written, so a plain preset link stays short. */
export function sheetSearch(state: SheetState): string {
  const parts = [`preset=${state.preset}`];
  if (state.preset === "custom") parts.push(`slots=${state.slots.join(",")}`);
  if (state.labels !== "none") parts.push(`labels=${state.labels}`);
  if (state.background !== "grey") parts.push(`bg=${state.background}`);
  if (state.voice) parts.push("voice=1");
  if (state.video) parts.push("video=1");
  if (state.prompt) parts.push("prompt=1");
  return `?${parts.join("&")}`;
}
