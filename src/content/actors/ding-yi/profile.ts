import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "ding-yi",
  code: "SP-04",
  nameEn: "DING YI",
  nameCn: "丁一",
  tagline: {
    en: "Came back fluent in everything except how it works here.",
    zh: "什么都会说，就是不懂这儿的规矩。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", TBD[0], TBD[1]),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "CHINESE AMERICAN",
      "美籍华裔",
      "ENGLISH NATIVE / MANDARIN SECOND",
      "英语母语 / 普通话第二语言",
    ),
  ],
  note: {
    en: "Dai Er's opponent and Dai Er's mirror. The character is not locked; this page is a placeholder.",
    zh: "戴尔的对手，也是戴尔的镜子。设定尚未定稿，此页为占位。",
  },
  castFor: {
    en: ["Series co-lead", "Cross-cultural misfire", "Language comedy"],
    zh: ["系列剧双主角", "跨文化误会", "语言喜剧"],
  },
  promptSeed: null,
};
