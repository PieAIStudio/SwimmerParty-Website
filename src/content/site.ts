import type { L } from "@/content/actors/index";

/** Brand constants. Change the name here and it changes everywhere. */
export const SITE = {
  name: "SWIMMER PARTY",
  nameCn: "游泳派对",
  /** The positioning line, in both authored locales. */
  claim: {
    en: "Original AI actors, free to use",
    zh: "原创 AI 演员，免费商用",
  } satisfies L,
  description: {
    en: "Original animated AI actors with free image and voice packs. Free for commercial use; just credit Swim In AI.",
    zh: "原创 AI 动画演员，免费图片和声音素材包。商用免费，署名 Swim In AI 即可。",
  } satisfies L,
  /** Canonical production origin. The translate proxy is derived from it. */
  url: "https://swimmerparty.swiminai.com",
  founded: "2026",
  /** Owner's personal inbox until the brand mailbox is set up (Owner, 2026-10-06). */
  contact: "pieai@hotmail.com",
} as const;

export const NAV = [
  { href: "/actors", key: "actors" },
  { href: "/works", key: "works" },
  { href: "/license", key: "license" },
  { href: "/studio", key: "studio" },
] as const;

export const SECONDARY_NAV = [
  { href: "/privacy", key: "privacy" },
  { href: "/terms", key: "terms" },
] as const;
