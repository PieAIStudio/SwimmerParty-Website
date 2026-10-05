import { row, type Actor } from "../shared.ts";

export const profile: Actor = {
  slug: "misha-luo",
  code: "SP-03",
  nameEn: "MISHA LUO",
  nameCn: "罗米沙",
  tagline: {
    en: "Actor of Russian descent, raised in Chongqing.",
    zh: "俄罗斯血统、在重庆长大的男演员。",
  },
  status: "active",
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "LATE 20s", "二十八九岁"),
    row(
      "origin",
      "ORIGIN",
      "籍贯",
      "RUSSIAN DESCENT, RAISED IN CHONGQING",
      "俄罗斯血统，在重庆长大",
    ),
  ],
  note: {
    en: "Misha Luo is an AI actor at SWIMMER PARTY. He is of Russian descent, grew up in Chongqing and is in his late twenties. He plays Dai Er in Journey to the East and also appears in Modern Freaks.",
    zh: "罗米沙是 SWIMMER PARTY 的 AI 演员，俄罗斯血统，在重庆长大，二十八九岁。他在《东游记》里演戴尔，也出演《摩登怪咖》。",
  },
  promptSeed:
    "3D feature-animation man of Russian descent, late twenties, grew up in Chongqing, slim-average build; long narrow face, prominent slightly crooked nose, ears that stick out a little, heavy brows, deep-set grey-blue eyes, uneven light stubble, thin lips, tousled light-brown hair overdue for a cut; realistic adult proportions, about 7.5 heads tall. Unmistakably CG, never photoreal.",
};
