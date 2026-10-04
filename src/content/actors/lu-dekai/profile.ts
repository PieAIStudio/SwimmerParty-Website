import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "lu-dekai",
  code: "SP-10",
  nameEn: "LU DEKAI",
  nameCn: "陆得开",
  tagline: {
    en: "Opens every door in the city. Won't change his own lock.",
    zh: "全城的门他都能开，就他自己家那把不肯换。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "35", "35"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "LICENSED LOCKSMITH — REGISTERED WITH THE PRECINCT",
      "持证开锁 — 在派出所备案",
      "MANDARIN / LOW, UNHURRIED",
      "普通话 / 低、慢",
    ),
  ],
  note: {
    en:
      "A registered locksmith arrives at the worst ten minutes of a stranger's day and says " +
      "almost nothing about it. He knows what is behind more doors in this city than anyone " +
      "and has never once told. The lock he refuses to replace is at his own front door.",
    zh:
      "备案开锁匠总是出现在陌生人一天里最糟的那十分钟，而且几乎不说话。" +
      "这座城市有多少门后面是什么样，他最清楚，也从没讲过。" +
      "他唯一不肯换的那把锁，在他自己家门上。",
  },
  castFor: {
    en: [
      "Neo-noir comedy",
      "Anthology device role",
      "Ads: security / smart home / property",
      "Quiet lead",
    ],
    zh: ["黑色喜剧", "单元剧串场角色", "广告：安防 / 智能家居 / 地产", "话少的主角"],
  },
  promptSeed: null,
};
