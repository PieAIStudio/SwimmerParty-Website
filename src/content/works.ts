import type { L } from "./actors";

/**
 * The slate.
 *
 * HONESTY RULE: nothing here is presented as released until it is. No
 * invented view counts, no invented brand partners, no invented awards.
 * A new house that says "slate 01, shooting" is more credible than one
 * claiming fifty campaigns nobody can find.
 */
export type WorkStatus = "shooting" | "writing" | "development";

export const WORK_STATUS_LABEL: Record<WorkStatus, L> = {
  shooting: { en: "SHOOTING", zh: "制作中" },
  writing: { en: "WRITING", zh: "编剧中" },
  development: { en: "DEVELOPMENT", zh: "开发中" },
};

export type Work = {
  code: string;
  title: L;
  status: WorkStatus;
  format: L;
  /** Roster codes, resolved to names at render time. */
  cast: string[];
  logline: L;
  accent: "acid" | "cyan" | "magenta" | "flare";
};

export const WORKS: Work[] = [
  {
    code: "W-01",
    title: { en: "THE ENGLISH TEACHER", zh: "《我是他英语老师》" },
    status: "shooting",
    format: {
      en: "Absurdist street comedy · 3–5 min per episode",
      zh: "荒诞江湖喜剧 · 单集 3–5 分钟",
    },
    cast: ["SP-03"],
    logline: {
      en: "A man who takes 'I do not lie' seriously tells his first lie — to save the last scrap of dignity of a man who wanted to hit him ten minutes ago, in front of that man's mother. The lie then forces two disasters to actually learn English.",
      zh: "一个把「我不骗人」看得很重的人，为了保住一个刚刚还想揍他的男人在母亲面前的最后一点体面，第一次撒了谎。结果这个谎逼着两个烂人真的开始学英语。",
    },
    accent: "acid",
  },
  {
    code: "W-02",
    title: { en: "NIGHT SHIFT", zh: "《夜班》" },
    status: "writing",
    format: {
      en: "Deadpan short series · 2–3 min per episode",
      zh: "冷幽默短片系列 · 单集 2–3 分钟",
    },
    cast: ["SP-02"],
    logline: {
      en: "Three in the morning at a convenience store is the best observation post in the city. She never comments — she just holds your eye half a second too long when she pushes the change back.",
      zh: "凌晨三点的便利店是全城最好的观察位。她不评价，只是把找零推过来的时候多看你一眼。",
    },
    accent: "cyan",
  },
  {
    code: "W-03",
    title: { en: "UNTITLED — TWO HANDS", zh: "《暂名：两只手》" },
    status: "development",
    format: { en: "Two-lead series", zh: "双主角系列剧" },
    cast: ["SP-03", "SP-04"],
    logline: {
      en: "A man misread on sight, and a man who can say anything but understands nothing about how it works here. Premise not locked.",
      zh: "一个只看脸就被误会的人，和一个什么都会说却不懂规矩的人。设定尚未定稿。",
    },
    accent: "magenta",
  },
  {
    code: "W-04",
    title: { en: "THE GATE", zh: "《门岗》" },
    status: "development",
    format: { en: "Single-location community comedy", zh: "单一场景社区喜剧" },
    cast: ["SP-12", "SP-05"],
    logline: {
      en: "One gatehouse, one logbook, and a captain who governs six metres of tarmac like a sovereign state. Premise not locked.",
      zh: "一个门岗，一本登记簿，一个把六米柏油路当主权国家治理的队长。设定尚未定稿。",
    },
    accent: "flare",
  },
];
