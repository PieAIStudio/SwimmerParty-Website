import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "luo-dajiang",
  code: "SP-05",
  nameEn: "LUO DAJIANG",
  nameCn: "罗大江",
  tagline: {
    en: "Runs forty riders. Every one of them is younger and faster than he is.",
    zh: "他管着四十个骑手，每一个都比他年轻，每一个都比他快。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "EARLY 40s", "40 出头"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "HENAN — WORKED HIS WAY TO THE CITY",
      "河南人 — 一路干到城里",
      "MANDARIN / HENAN ACCENT UNDER PRESSURE",
      "普通话 / 一急就带河南口音",
    ),
  ],
  note: {
    en:
      "A delivery station manager is a middle manager with no office and no leverage. He " +
      "absorbs the platform's timer from above and forty men's excuses from below, and the " +
      "only thing he can actually control is whether he shouts. He has decided not to shout.",
    zh:
      "外卖站长是一个没有办公室、也没有筹码的中层。上面压他平台的秒表，" +
      "下面压他四十个人的理由，他唯一能控制的只有要不要吼——他决定不吼。",
  },
  castFor: {
    en: [
      "Workplace comedy",
      "Gig-economy stories",
      "Ads: logistics / mobility / food platforms",
      "The reluctant boss",
    ],
    zh: ["职场喜剧", "零工经济题材", "广告：物流 / 出行 / 餐饮平台", "被迫当头的人"],
  },
  promptSeed: null,
};
