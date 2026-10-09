"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { PostHog as PostHogClient } from "posthog-js";
import { normalizeEvent, pageKind } from "./events";

// Matches the privacy page: no cookies (memory persistence), no session recording and
// no free-text properties. Extra collectors follow the shared PostHog project settings.
// Off when no key is configured.
const PRIVACY_OPTIONS = {
  persistence: "memory",
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  disable_session_recording: true,
  person_profiles: "identified_only",
} as const;

export function PostHog() {
  const client = useRef<Promise<PostHogClient | null> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    client.current = import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(key, {
          ...PRIVACY_OPTIONS,
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        });
        posthog.register({ app: "swimmerparty" });
        return posthog;
      })
      .catch(() => null);
    const onEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const normalized = normalizeEvent(detail?.name, detail?.data);
      if (normalized)
        void client.current?.then((posthog) => posthog?.capture(normalized.name, normalized.data));
    };
    window.addEventListener("swimmer-party-event", onEvent);
    return () => window.removeEventListener("swimmer-party-event", onEvent);
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const { page, locale } = pageKind(pathname);
    void client.current?.then((posthog) => posthog?.capture("page_viewed", { page, locale }));
  }, [pathname]);

  return null;
}
