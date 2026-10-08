"use client";
import { useEffect } from "react";
import posthog from "posthog-js";
export function PostHog() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false,
    });
    const onEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.name) posthog.capture(detail.name, detail.data);
    };
    window.addEventListener("swimmer-party-event", onEvent);
    return () => window.removeEventListener("swimmer-party-event", onEvent);
  }, []);
  return null;
}
