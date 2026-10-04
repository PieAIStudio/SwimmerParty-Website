import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "jin-mantang",
  code: "SP-09",
  nameEn: "JIN MANTANG",
  nameCn: "金满堂",
  tagline: {
    en: "Eight hundred weddings blessed. He hosted his own.",
    zh: "他祝福过八百对新人，自己那场是他自己主持的。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "38", "38"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "COUNTY RADIO HOST — THEN WEDDINGS",
      "县广播电台主持 — 后来转婚庆",
      "MANDARIN / BROADCAST DELIVERY, ALWAYS ON",
      "普通话 / 播音腔，永远在线",
    ),
  ],
  note: {
    en:
      "A wedding MC is paid to feel things on schedule. He is extremely good at it, which is " +
      "why nobody, including him, can tell any more which of his feelings are real. Play him " +
      "warm and you get a fraud; play him sincere and you get the joke.",
    zh:
      "婚庆司仪是被雇来按时动感情的人。他太熟练了，以至于没人分得清——" +
      "包括他自己——哪一份感情是真的。演得油就是个骗子，演得真才是笑点。",
  },
  castFor: {
    en: [
      "Ensemble comedy",
      "Banquet set pieces",
      "Ads: retail / spirits / jewellery",
      "Master of ceremonies",
    ],
    zh: ["群像喜剧", "宴席重场戏", "广告：零售 / 酒 / 珠宝", "主持人角色"],
  },
  promptSeed: null,
};
