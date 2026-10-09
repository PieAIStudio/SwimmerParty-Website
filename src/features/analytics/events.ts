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
// Never send personal or free-text fields, whatever a caller passes.
const BLOCKED_KEYS = /email|name|text|prompt|query|title|description|recipe|url|token/i;
function safeData(data: Record<string, unknown>) {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(data))
    if (
      !BLOCKED_KEYS.test(key) &&
      (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    )
      out[key] = typeof value === "string" ? value.slice(0, 80) : value;
  return out;
}

/** Coarse page type for page_viewed; never the full path. */
export function pageKind(pathname: string): { page: string; locale: string } {
  const [, locale = "", first = "", second = "", third = ""] = pathname.split("/");
  const page =
    first === ""
      ? "home"
      : first === "actors"
        ? third === "assets"
          ? "assets"
          : second
            ? "actor"
            : "actors"
        : first === "works"
          ? second === "p"
            ? "post"
            : second
              ? "work"
              : "works"
          : ["license", "studio", "cast", "privacy", "terms"].includes(first)
            ? first
            : "other";
  return { page, locale };
}

export function normalizeEvent(name: unknown, rawData: Record<string, unknown> = {}) {
  const data = safeData(rawData);
  if (isApprovedEvent(name)) return { name, data };
  if (
    name === "guest_download" ||
    name === "member_download" ||
    name === "bundle_download" ||
    name === "starter_download"
  )
    return {
      name: "asset_downloaded" as const,
      data: {
        ...data,
        kind:
          name === "bundle_download"
            ? "selection"
            : name === "starter_download"
              ? "starter"
              : "image",
        signed_in: name !== "guest_download",
      },
    };
  if (name === "sign_in_prompt")
    return { name: "sign_in_prompt_shown" as const, data: { ...data, trigger: "pack" } };
  if (name === "sign_in_start")
    return { name: "sign_in_started" as const, data: { ...data, trigger: "pack" } };
  return null;
}
