import type { L } from "@/content/actors/index";

/** Brand constants. Change the name here and it changes everywhere. */
export const SITE = {
  name: "SWIMMER PARTY",
  nameCn: "游泳派对",
  /** The positioning line, in both authored locales. */
  claim: {
    en: "WE MAKE AND LICENSE ORIGINAL AI ACTORS.",
    zh: "我们制作并授权原创 AI 演员。",
  } satisfies L,
  description: {
    en: "SWIMMER PARTY makes and licenses original animated AI actors.",
    zh: "SWIMMER PARTY 制作并授权原创 AI 动画演员。",
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
