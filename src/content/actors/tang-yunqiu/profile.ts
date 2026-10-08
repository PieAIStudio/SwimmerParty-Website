import { row, type Actor } from "../shared.ts";

export const profile: Actor = {
  slug: "tang-yunqiu",
  nameEn: "TANG YUNQIU",
  nameCn: "唐韵秋",
  tagline: { en: "Actress from Chongqing, 43.", zh: "重庆女演员，43 岁。" },
  status: "active",
  gender: "female",
  age: 43,
  heightCm: 163,
  portrait: "/media/assets/tang-yunqiu/turnaround.front.webp",
  spec: [
    row("age", "AGE", "年龄", "43", "43 岁"),
    row("height", "HEIGHT", "身高", "163 CM", "163 CM"),
    row("origin", "FROM", "来自", "CHONGQING", "重庆"),
    row("language", "SPEAKS", "语言", "CHINESE", "中文"),
  ],
  note: {
    en: "Tang Yunqiu is an AI actress at SWIMMER PARTY. She is from Chongqing, 43 years old and 163 cm tall. She plays He Jie in Journey to the East and also appears in Modern Freaks.",
    zh: "唐韵秋是 SWIMMER PARTY 的 AI 演员，重庆人，43 岁，身高 163 厘米。她在《东游记》里演何姐，也出演《摩登怪咖》。",
  },
  promptSeed:
    "3D feature-animation woman, 43, Chinese, from Chongqing, 163 cm, slim-average build; gentle smile lines, faint crow's feet, noticeably full lips; dark brown shoulder-length waves worn down with a few fine grey strands; noticeably enlarged expressive eyes, smooth stylized skin, hair in clean grouped clumps; realistic adult proportions, about 7 heads tall. Unmistakably CG, never photoreal.",
  version: "1.1.0",
  versionDate: "2026-10-08",
  versionNote: {
    en: "Voice added: 7 clips. The self-introduction doubles as a voice reference.",
    zh: "加入声音：7 段。自我介绍可以直接当参考音用。",
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
