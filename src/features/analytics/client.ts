"use client";

import { normalizeEvent, type PostHogEvent } from "./events.ts";

/** Local product channel only. PostHog is the sole, explicitly configured network consumer. */
export function trackProductEvent(name: PostHogEvent, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const detail = normalizeEvent(name, data);
  if (detail) window.dispatchEvent(new CustomEvent("swimmer-party-event", { detail }));
}
