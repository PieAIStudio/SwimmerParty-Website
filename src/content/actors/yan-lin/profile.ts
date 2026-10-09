import { row, type Actor } from "../shared.ts";

export const profile: Actor = {
  slug: "yan-lin",
  nameEn: "Yan Lin",
  nameCn: "严琳",
  tagline: {
    en: "High forehead, fine brows, hair pulled into a tight low bun.",
    zh: "额头高，眉毛细，发髻扎得一丝不苟。",
  },
  status: "active",
  gender: "female",
  age: 41,
  heightCm: 165,
  portrait: "/media/assets/yan-lin/turnaround.front.webp",
  spec: [
    row("age", "AGE", "年龄", "41", "41 岁"),
    row("height", "HEIGHT", "身高", "165 CM", "165 厘米"),
    row("origin", "FROM", "来自", "BEIJING", "北京"),
    row("language", "SPEAKS", "语言", "CHINESE", "中文"),
  ],
  note: {
    en: "Yan Lin is an AI actress at SWIMMER PARTY. She is from Beijing, 41 years old and 165 cm tall. Her high forehead, fine brows and tight low bun are her signature features.",
    zh: "严琳是 SWIMMER PARTY 的 AI 演员，北京人，41 岁，身高 165 厘米。高额头、细眉和一丝不苟的低发髻是她鲜明的特征。",
  },
  promptSeed:
    "3D feature-animation woman of East Asian appearance, 41, from Beijing, 165 cm, slim and upright; high forehead, thin precise eyebrows, calm narrow eyes, black hair pulled into a tight low bun; realistic adult proportions, about 7 heads tall. Unmistakably CG, never photoreal.",
  version: "1.0.0",
  versionDate: "2026-10-09",
  versionNote: {
    en: "First release: 55 images and 6 voice clips.",
    zh: "首次上线：55 张图片和 6 段声音。",
  },
  voiceLanguage: "zh",
};
