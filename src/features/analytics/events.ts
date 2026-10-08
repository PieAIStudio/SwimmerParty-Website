export const POSTHOG_EVENTS = new Set([
  "page_viewed",
  "actor_viewed",
  "voice_played",
  "asset_downloaded",
  "sign_in_prompt_shown",
  "sign_in_started",
  "cast_changed",
  "cast_shared",
  "post_started",
  "post_published",
  "post_liked",
  "post_reported",
  "actor_voted",
  "credit_copied",
  "filter_used",
  "share_clicked",
] as const);
export type PostHogEvent = typeof POSTHOG_EVENTS extends Set<infer T> ? T : never;
export function isApprovedEvent(name: unknown): name is PostHogEvent {
  return typeof name === "string" && POSTHOG_EVENTS.has(name as PostHogEvent);
}
export function normalizeEvent(name: unknown, data: Record<string, unknown> = {}) {
  if (isApprovedEvent(name)) return { name, data };
  if (name === "guest_download" || name === "member_download" || name === "bundle_download")
    return {
      name: "asset_downloaded" as const,
      data: {
        ...data,
        kind: name === "bundle_download" ? "selection" : "image",
        signed_in: name !== "guest_download",
      },
    };
  if (name === "sign_in_prompt")
    return { name: "sign_in_prompt_shown" as const, data: { ...data, trigger: "pack" } };
  if (name === "sign_in_start")
    return { name: "sign_in_started" as const, data: { ...data, trigger: "pack" } };
  return null;
}
