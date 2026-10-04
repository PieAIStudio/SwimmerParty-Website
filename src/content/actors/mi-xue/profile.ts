import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "mi-xue",
  code: "SP-08",
  nameEn: "MI XUE",
  nameCn: "米雪",
  tagline: {
    en: "Someone else is on camera. Every button behind it is hers.",
    zh: "镜头前是别人，镜头后的一切都是她按的。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "23", "23"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "SMALL CITY — MOVED FOR THE JOB",
      "小城出来 — 为这份工作搬的家",
      "MANDARIN / INTERNET-NATIVE, VERY FAST",
      "普通话 / 网感极强、语速极快",
    ),
  ],
  note: {
    en:
      "The livestream operator writes the script, cues the price drop, mutes the host and " +
      "reads the room, all at once. She is the director of a show nobody credits her for. " +
      "Her comedy is competence with no applause.",
    zh:
      "直播中控同时在写台本、卡价格、掐主播的麦、读弹幕的风向。" +
      "她是一台没人给她署名的节目的导演。她的喜剧是「能干但没人鼓掌」。",
  },
  castFor: {
    en: [
      "Fast-cut comedy",
      "Screen-life format",
      "Ads: e-commerce / creator tools / phones",
      "Ensemble",
    ],
    zh: ["快节奏喜剧", "桌面电影形式", "广告：电商 / 创作者工具 / 手机", "群戏"],
  },
  promptSeed: null,
};
