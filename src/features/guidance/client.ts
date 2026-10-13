"use client";
import type { FirstUseKind } from "./first-use.ts";

/** Only completed/explicit user actions call this; it does not send analytics or open a dialog. */
export function announceFirstUse(kind: FirstUseKind) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent("sp-first-use", { detail: { kind } }));
}
