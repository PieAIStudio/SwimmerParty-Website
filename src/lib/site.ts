/** Brand constants. Change the name here and it changes everywhere. */
export const SITE = {
  name: "SWIMMER PARTY",
  nameCn: "游泳派对",
  /** The positioning line. Everything on the site serves this sentence. */
  claim: "WE DO NOT CAST ACTORS. WE BUILD THEM.",
  claimCn: "我们不找演员。我们造演员。",
  description:
    "SWIMMER PARTY is a synthetic talent house. We design, build and license original AI actors — full character specifications, expression sets and performance range, ready to cast.",
  descriptionCn:
    "SWIMMER PARTY 是一间合成演员工厂。我们设计、制造并授权原创 AI 演员——完整人设规格、表情组与表演区间，可直接选角。",
  url: "https://pieflow.app",
  locale: "zh-CN",
  founded: "2026",
  contact: "casting@pieflow.app",
} as const;

export const NAV = [
  { href: "/actors", label: "ROSTER", labelCn: "演员名册" },
  { href: "/works", label: "WORKS", labelCn: "作品" },
  { href: "/studio", label: "STUDIO", labelCn: "工作室" },
  { href: "/casting", label: "CASTING", labelCn: "合作" },
] as const;
