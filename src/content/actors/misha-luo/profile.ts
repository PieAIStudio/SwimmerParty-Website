import { row, type Actor } from "../shared.ts";

export const profile: Actor = {
  slug: "misha-luo",
  nameEn: "Misha Luo",
  nameCn: "罗米沙",
  tagline: {
    en: "A Russian face with a Chongqing accent. Plays the CEO, eats hot pot like a local.",
    zh: "长着俄罗斯脸，一开口是重庆话。戏里演总裁，戏外吃火锅比谁都地道。",
  },
  status: "active",
  gender: "male",
  age: 28,
  portrait: "/media/assets/misha-luo/turnaround.front.webp",
  spec: [
    row("age", "Age", "年龄", "Late 20s", "二十八九岁"),
    row("origin", "From", "籍贯", "Russian descent, raised in Chongqing", "俄罗斯血统，在重庆长大"),
    row("language", "Speaks", "语言", "Chinese", "中文"),
  ],
  note: {
    en: "Misha Luo is an AI actor at SWIMMER PARTY. He is of Russian descent, grew up in Chongqing and is in his late twenties. He plays Dai Er in Journey to the East and also appears in Modern Freaks.",
    zh: "罗米沙是 SWIMMER PARTY 的 AI 演员，俄罗斯血统，在重庆长大，二十八九岁。他在《东游记》里演戴尔，也出演《摩登怪咖》。",
  },
  promptSeed:
    "3D feature-animation man of Russian descent, late twenties, grew up in Chongqing, slim-average build; long narrow face, prominent slightly crooked nose, ears that stick out a little, heavy brows, deep-set grey-blue eyes, uneven light stubble, thin lips, tousled light-brown hair overdue for a cut; realistic adult proportions, about 7.5 heads tall. Unmistakably CG, never photoreal.",
  version: "1.1.0",
  versionDate: "2026-10-08",
  versionNote: {
    en: "Voice added: 7 clips.",
    zh: "加入声音：7 段。",
  },
  versionHistory: [
    {
      version: "1.0.0",
      date: "2026-10-05",
      note: { en: "First release: 63 images.", zh: "首次发布：63 张图片。" },
    },
  ],
  voiceLanguage: "zh",
};
