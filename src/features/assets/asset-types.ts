import type { L } from "../../content/actors/index.ts";

export type AssetConformance = "v1" | "legacy";
export type AssetItem = {
  slot: string;
  series: string;
  key: string;
  look: string | null;
  conformance: AssetConformance;
  version: number;
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  format: "png" | "webp";
  object: string;
  preview: string;
  thumb: string;
};
export type ActorAssets = {
  code: string;
  slug: string;
  looks: { id: string; label: L; prompt: string }[];
  items: AssetItem[];
};
