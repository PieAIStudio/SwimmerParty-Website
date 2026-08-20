import type { L } from "@/content/actors";

/** Brand constants. Change the name here and it changes everywhere. */
export const SITE = {
  name: "SWIMMER PARTY",
  nameCn: "游泳派对",
  /** The positioning line, in both authored locales. */
  claim: {
    en: "WE DO NOT CAST ACTORS. WE BUILD THEM.",
    zh: "我们不找演员。我们造演员。",
  } satisfies L,
  description: {
    en: "SWIMMER PARTY is a synthetic talent house. We design, build and license original AI actors — full character specifications, expression sets and performance range, ready to cast.",
    zh: "SWIMMER PARTY 是一间合成演员工厂。我们设计、制造并授权原创 AI 演员——完整人设规格、表情组与表演区间，可直接选角。",
  } satisfies L,
  /** Canonical production origin. The translate proxy is derived from it. */
  url: "https://swimmerparty.vercel.app",
  founded: "2026",
  contact: "casting@pieflow.app",
} as const;

export const NAV = [
  { href: "/actors", key: "roster" },
  { href: "/works", key: "works" },
  { href: "/kit", key: "kit" },
  { href: "/studio", key: "studio" },
  { href: "/casting", key: "casting" },
] as const;

/** Linked from the footer and the open kit, not from the main rail. */
export const SECONDARY_NAV = [{ href: "/pact", key: "pact" }] as const;
