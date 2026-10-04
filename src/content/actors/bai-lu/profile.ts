import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "bai-lu",
  code: "SP-06",
  nameEn: "BAI LU",
  nameCn: "白露",
  tagline: {
    en: "Does everyone's last makeup. Has no patience left for small talk.",
    zh: "她给每个人化最后一次妆。所以她没耐心听废话。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "LATE 20s", "快 30"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "SECOND-GENERATION FUNERAL TRADE",
      "殡葬业第二代",
      "MANDARIN / QUIET, PRECISE",
      "普通话 / 轻、准",
    ),
  ],
  note: {
    en:
      "A mortuary cosmetician is the last person to do you a kindness. She is not morbid and " +
      "she is not gentle — she is efficient, and she finds the living exhausting because the " +
      "living waste so much time. Comedy comes from putting her at a dinner party.",
    zh:
      "殡仪馆化妆师是最后一个对你好的人。她不阴森，也不温柔——她只是高效，" +
      "并且觉得活人很累，因为活人太浪费时间。把她放进一场饭局，喜剧就开始了。",
  },
  castFor: {
    en: ["Black comedy", "Dinner-table scenes", "Two-hander scenes", "Documentary-style shorts"],
    zh: ["黑色幽默", "饭局戏", "双人对手戏", "伪纪录片短片"],
  },
  promptSeed: null,
};
