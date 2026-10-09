import type { L } from "./actors";
export type WorkStatus = "shooting" | "writing" | "development";
export const WORK_STATUS_LABEL: Record<WorkStatus, L> = {
  shooting: { en: "SHOOTING", zh: "制作中" },
  writing: { en: "WRITING", zh: "编剧中" },
  development: { en: "DEVELOPMENT", zh: "开发中" },
};
export type WorkRole = { id: string; name: L; note?: L; look?: string };
export type Work = {
  slug: string;
  code: string;
  title: L;
  status: WorkStatus;
  format: L;
  cast: { actor: string; role?: WorkRole }[];
  logline?: L;
  episodes?: { id: string; title: L; status: WorkStatus }[];
};
export const WORKS: Work[] = [
  {
    slug: "journey-to-the-east",
    code: "W-01",
    title: { en: "Journey to the East", zh: "《东游记》" },
    status: "development",
    format: { en: "AI comedy shorts", zh: "AI 喜剧短片" },
    logline: {
      en: "A film crew shoots a domineering-CEO short drama in a riverside villa. On camera, everything is deadly serious. Off camera, everything goes wrong.",
      zh: "一个剧组在江边别墅里拍霸总短剧。镜头里一本正经，镜头外状况百出。",
    },
    cast: [
      {
        actor: "tang-yunqiu",
        role: {
          id: "he-jie",
          look: "maid",
          name: { en: "He Jie", zh: "何姐" },
          note: {
            en: "An actress on the crew. On camera she plays the timid maid; off camera she runs the whole set.",
            zh: "剧组里的女演员。镜头前演胆小的女佣，镜头后整个片场都归她管。",
          },
        },
      },
      {
        actor: "misha-luo",
        role: {
          id: "dai-er",
          look: "ceo",
          name: { en: "Dai Er", zh: "戴尔" },
          note: {
            en: "An actor on the crew with a foreign face and a Chongqing accent. On camera he plays the domineering CEO.",
            zh: "剧组里长着外国脸、一开口是重庆话的男演员。镜头前演霸道总裁。",
          },
        },
      },
      {
        actor: "zhang-qiang",
        role: { id: "director", name: { en: "the Director", zh: "导演" } },
      },
      {
        actor: "chen-wei",
        role: { id: "grip-big-brother", name: { en: "the Grip", zh: "场务大哥" } },
      },
    ],
    episodes: [
      {
        id: "EP01",
        title: { en: "EP01 · On Camera, Off Camera", zh: "EP01 · 《戏里戏外》" },
        status: "development",
      },
    ],
  },
  {
    slug: "modern-freaks",
    code: "W-02",
    title: { en: "Modern Freaks", zh: "《摩登怪咖》" },
    status: "development",
    format: { en: "AI sitcom with superpowers", zh: "带超能力的 AI 情景喜剧" },
    cast: [{ actor: "tang-yunqiu" }, { actor: "misha-luo" }],
  },
];
