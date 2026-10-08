import type { L } from "./actors";

export type WorkStatus = "shooting" | "writing" | "development";
export const WORK_STATUS_LABEL: Record<WorkStatus, L> = {
  shooting: { en: "SHOOTING", zh: "制作中" },
  writing: { en: "WRITING", zh: "编剧中" },
  development: { en: "DEVELOPMENT", zh: "开发中" },
};
export type WorkRole = { id: string; name: L; note?: L };
export type Work = {
  code: string;
  title: L;
  status: WorkStatus;
  format: L;
  cast: { actor: string; role?: WorkRole }[];
  logline: L;
};

export const WORKS: Work[] = [
  {
    code: "W-01",
    title: { en: "JOURNEY TO THE EAST", zh: "《东游记》" },
    status: "development",
    format: { en: "AI comedy shorts", zh: "AI 喜剧短片" },
    cast: [
      {
        actor: "tang-yunqiu",
        role: {
          id: "he-jie",
          name: { en: "He Jie", zh: "何姐" },
          note: {
            en: "A middle-aged actress on the crew. She plays the maid in the short drama.",
            zh: "剧组里的中年女演员，在短剧里演女佣。",
          },
        },
      },
      {
        actor: "misha-luo",
        role: {
          id: "dai-er",
          name: { en: "Dai Er", zh: "戴尔" },
          note: {
            en: "An actor on the crew. He plays the domineering CEO in the short drama.",
            zh: "剧组里的男演员，在短剧里演霸道总裁。",
          },
        },
      },
    ],
    logline: {
      en: "A film crew shoots a domineering-CEO short drama in a villa. On camera it is deadly serious; off camera everything goes wrong.",
      zh: "一个剧组在别墅里拍霸总短剧。戏里一本正经，戏外状况百出。",
    },
  },
  {
    code: "W-02",
    title: { en: "MODERN FREAKS", zh: "《摩登怪咖》" },
    status: "development",
    format: { en: "AI sitcom series with superpowers", zh: "带超能力的 AI 情景喜剧系列" },
    cast: [{ actor: "tang-yunqiu" }, { actor: "misha-luo" }],
    logline: { en: "An AI sitcom with superpowers.", zh: "一部带超能力的 AI 情景喜剧。" },
  },
];
