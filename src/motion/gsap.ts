"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect } from "react";

/* GSAP and ScrollTrigger are free for commercial use as of the 2025
 * relicense — no membership, no key, no auth token. Registering once here
 * keeps every component importing from a single module, so the plugin can
 * never be missing on one route and present on another. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** `useLayoutEffect` on the client, `useEffect` on the server pass. */
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** True when the visitor has asked the OS to calm animation down. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export { gsap, ScrollTrigger };
