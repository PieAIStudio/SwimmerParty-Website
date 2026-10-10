"use client";

import { useSyncExternalStore } from "react";

/** Saved cast in localStorage; shared links and the header count both read it through here. */
export const CAST_EVENT = "sp-cast-change";
const STORAGE_KEY = "sp-cast";

export function readSavedCast(): string[] {
  try {
    return (localStorage.getItem(STORAGE_KEY) ?? "").split(",").filter(Boolean);
  } catch {
    return [];
  }
}

export function writeSavedCast(next: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, next.join(","));
  } catch {}
  window.dispatchEvent(new Event(CAST_EVENT));
}

export function subscribeCast(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CAST_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CAST_EVENT, callback);
  };
}

/** How many actors are saved in this browser; updates when the cast changes. */
export function useCastCount(): number {
  return useSyncExternalStore(
    subscribeCast,
    () => readSavedCast().length,
    () => 0,
  );
}
