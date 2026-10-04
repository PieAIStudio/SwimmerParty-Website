import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "guan-hai",
  code: "SP-12",
  nameEn: "GUAN HAI",
  nameCn: "关海",
  tagline: {
    en: "Remembers every licence plate. And everyone who won't say hello back.",
    zh: "他记得每一辆车的车牌，和每一个不愿意跟他打招呼的人。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "47", "47"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "LAID OFF FROM A STATE FACTORY — SECURITY SINCE",
      "国企下岗 — 之后一直做保安",
      "MANDARIN / NORTHERN, FORMAL WHEN NERVOUS",
      "普通话 / 北方口音，一紧张就打官腔",
    ),
  ],
  note: {
    en:
      "A compound security captain has a uniform, a logbook and no authority whatsoever. He " +
      "runs the gate like a small state because it is the only jurisdiction he was ever " +
      "given. Treat the dignity as real and the comedy stops being cruel.",
    zh:
      "小区保安队长有制服、有登记本，没有任何权力。他把大门口当一个小国家来治理，" +
      "因为那是唯一交给过他的辖区。把这份体面当真，喜剧就不刻薄了。",
  },
  castFor: {
    en: [
      "Community comedy",
      "Gatehouse set piece",
      "Ads: property services / logistics / civic",
      "Supporting lead",
    ],
    zh: ["社区喜剧", "门岗重场戏", "广告：物业 / 快递 / 公共服务", "重要配角"],
  },
  promptSeed: null,
};
