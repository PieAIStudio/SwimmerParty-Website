import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "hao-anquan",
  code: "SP-07",
  nameEn: "HAO ANQUAN",
  nameCn: "郝安全",
  tagline: {
    en: "Nineteen years in the passenger seat. His brake foot works better than yours.",
    zh: "副驾坐了十九年，他现在踩刹车比踩自己的还准。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "EARLY 50s", "50 出头"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "EX-ARMY DRIVER — DRIVING SCHOOL SINCE 2007",
      "退伍汽车兵 — 2007 年起在驾校",
      "MANDARIN / PARADE-GROUND VOLUME",
      "普通话 / 操场音量",
    ),
  ],
  note: {
    en:
      "He has taught four thousand people to drive and trusts none of them. The second brake pedal " +
      "on his side of the car is the only thing he believes in. Off duty he is startlingly " +
      "tender, which nobody in his class will ever find out.",
    zh:
      "他教会四千个人开车，一个也不信。副驾那个刹车是他唯一相信的东西。" +
      "下了班他其实温柔得吓人，但他班上的学员一辈子不会知道。",
  },
  castFor: {
    en: [
      "Situational comedy",
      "In-car two-handers",
      "Ads: automotive / insurance / safety",
      "Authority figure",
    ],
    zh: ["情境喜剧", "车内双人戏", "广告：汽车 / 保险 / 安全", "权威角色"],
  },
  promptSeed: null,
};
