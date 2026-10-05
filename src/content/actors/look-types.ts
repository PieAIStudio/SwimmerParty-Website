import type { L } from "./shared.ts";

export type Look = {
  id: string;
  kind: "personal" | "role";
  label: L;
  prompt: string;
  role?: { work: string; id: string };
  extras: { key: string; label: L; direction: string }[];
};
