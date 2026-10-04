import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "dai-er",
  code: "SP-03",
  nameEn: "DAI ER",
  nameCn: "戴尔",
  tagline: {
    en: "Russian face. Chongqing mouth. Will not lie to you.",
    zh: "俄罗斯的脸，重庆的嘴，就是不撒谎。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "LATE 20s — EARLY 30s", "快 30 到 30 出头"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "RUSSIAN BORN — RAISED IN CHONGQING",
      "生于俄罗斯 — 在重庆长大",
      "CHONGQING DIALECT / BROKEN MANDARIN / SOME RUSSIAN / NO ENGLISH",
      "重庆话 / 塑料普通话 / 一点俄语 / 不会英语",
    ),
  ],
  note: {
    en:
      "Everyone reads the face first and never gets to the sentence. So he keeps being cast " +
      "as a foreigner he never auditioned for. His spine is not nationality, it is bluntness — " +
      "and his real trap was never the missing English. It is that a man who does not lie gets " +
      "pushed into carrying a lie all the way, to protect somebody else's dignity.",
    zh:
      "所有人先看脸，没人听他说话。于是他一次次被安排成一个他根本没想演的外国人。" +
      "他的轴不是民族性，是耿直——他真正的困境从来不是不会英语，" +
      "而是一个不撒谎的人，为了别人的体面，被迫把谎撒到底。",
  },
  castFor: {
    en: ["Absurdist street comedy", "Mistaken identity", "Series co-lead", "Dialect comedy"],
    zh: ["荒诞江湖喜剧", "身份错位", "系列剧双主角", "方言喜剧"],
  },
  promptSeed: null,
};
