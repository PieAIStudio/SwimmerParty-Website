/**
 * The roster.
 *
 * This file is the single source of truth for who exists. It is product
 * content, not governed documentation — it lives outside `docs/**` on
 * purpose (see AGENTS.md, "Governed surface").
 *
 * HONESTY RULE: `status` must reflect reality. An actor with no delivered
 * plate is `in-development` and says so on screen. Never dress a
 * placeholder as a finished asset, and never invent a credit, a brand
 * partner or a view count. This site is shown to people who will check.
 */

export type ActorStatus = "active" | "in-development" | "concept";

export type SpecRow = {
  /** Short technical key, rendered in mono uppercase on the blueprint. */
  key: string;
  /** Chinese label shown beneath the key. */
  keyCn: string;
  value: string;
};

/**
 * Where the body landmarks sit inside this actor's plate, as a percentage
 * of frame height. Plates are framed by hand, so the station lines on the
 * spec sheet have to be told where the shoulders actually are — a single
 * hard-coded set drifts on every new plate.
 */
export type Landmarks = {
  crown: number;
  shoulder: number;
  waist: number;
  knee: number;
  base: number;
};

export const DEFAULT_LANDMARKS: Landmarks = {
  crown: 6,
  shoulder: 22,
  waist: 50,
  knee: 76,
  base: 96,
};

export type Actor = {
  slug: string;
  /** Roster code. Reads as a serial number because that is the point. */
  code: string;
  nameEn: string;
  nameCn: string;
  /** One line that has to do all the work on a card. */
  tagline: string;
  taglineCn: string;
  status: ActorStatus;
  /** Design iteration count, shown as `VERSION n OF m` like a model sheet. */
  version: { current: number; total: number };
  accent: "acid" | "cyan" | "magenta" | "flare";
  /** Full-body plate on black. Null while the actor is still in development. */
  plate: string | null;
  /** Tight crop used on roster cards. Falls back to `plate`. */
  portrait: string | null;
  /** Per-plate station calibration; omit to use DEFAULT_LANDMARKS. */
  landmarks?: Landmarks;
  spec: SpecRow[];
  /** Longer character note. Kept short — the spec sheet does the talking. */
  note: string;
  /** What this actor is castable for. Drives the /casting conversation. */
  castFor: string[];
};

export const ACTORS: Actor[] = [
  {
    slug: "hu-qian",
    code: "SP-01",
    nameEn: "HU QIAN",
    nameCn: "胡谦",
    tagline: "Broke, tired, and still the most reasonable man in the room.",
    taglineCn: "没钱，很累，但全场就他讲道理。",
    status: "active",
    version: { current: 6, total: 10 },
    accent: "acid",
    plate: "/media/actors/hu-qian/plate.webp",
    portrait: "/media/actors/hu-qian/portrait.webp",
    landmarks: { crown: 4, shoulder: 20, waist: 51, knee: 78, base: 97 },
    spec: [
      { key: "AGE", keyCn: "年龄", value: "EARLY 30s" },
      { key: "HEIGHT", keyCn: "身高", value: "178 CM" },
      { key: "BUILD", keyCn: "体型", value: "SLIM–AVERAGE" },
      { key: "OCCUPATION", keyCn: "职业", value: "AUTO REPAIR HELPER" },
      { key: "REGISTER", keyCn: "语域", value: "MANDARIN / STREET" },
      {
        key: "EXPRESSION SET",
        keyCn: "表情组",
        value: "4 — NEUTRAL / AWKWARD SMILE / WORRIED / SERIOUS",
      },
      { key: "STATUS", keyCn: "状态", value: "CASTABLE" },
      { key: "LICENSE", keyCn: "授权", value: "ON REQUEST" },
    ],
    note:
      "好脾气不是软弱，是他算过账——发火解决不了任何问题，还得赔一个下午的工时。" +
      "演他不需要演惨，只需要演一个精确知道自己还剩多少钱的人。",
    castFor: ["都市喜剧", "生活流短片", "广告：汽车 / 五金 / 外卖 / 保险", "双人对手戏"],
  },
  {
    slug: "qi-man",
    code: "SP-02",
    nameEn: "QI MAN",
    nameCn: "齐满",
    tagline: "Night shift. Sees everything. Says almost nothing.",
    taglineCn: "上夜班。什么都看见了。基本不说。",
    status: "active",
    version: { current: 2, total: 10 },
    accent: "cyan",
    plate: "/media/actors/qi-man/plate.webp",
    portrait: "/media/actors/qi-man/portrait.webp",
    landmarks: { crown: 5, shoulder: 21, waist: 49, knee: 74, base: 96 },
    spec: [
      { key: "AGE", keyCn: "年龄", value: "MID 20s" },
      { key: "HEIGHT", keyCn: "身高", value: "165 CM" },
      { key: "BUILD", keyCn: "体型", value: "SLIM" },
      { key: "OCCUPATION", keyCn: "职业", value: "24H CONVENIENCE STORE — CASHIER" },
      { key: "REGISTER", keyCn: "语域", value: "MANDARIN / DEADPAN" },
      { key: "EXPRESSION SET", keyCn: "表情组", value: "2 — NEUTRAL / HALF SMILE" },
      { key: "STATUS", keyCn: "状态", value: "CASTABLE" },
      { key: "LICENSE", keyCn: "授权", value: "ON REQUEST" },
    ],
    note:
      "收银台是全城最好的观察位。她不评价，只是把找零推过来的时候多看你一眼——" +
      "那一眼就是台词。她的喜剧全在不接话上。",
    castFor: ["冷幽默", "深夜场景", "广告：便利店 / 饮品 / 支付 / 城市服务", "旁观者视角"],
  },
  {
    slug: "dai-er",
    code: "SP-03",
    nameEn: "DAI ER",
    nameCn: "戴尔",
    tagline: "Russian face. Chongqing mouth. Will not lie to you.",
    taglineCn: "俄罗斯的脸，重庆的嘴，就是不撒谎。",
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "magenta",
    plate: null,
    portrait: null,
    spec: [
      { key: "AGE", keyCn: "年龄", value: "LATE 20s — EARLY 30s" },
      { key: "HEIGHT", keyCn: "身高", value: "TBD" },
      { key: "BUILD", keyCn: "体型", value: "TBD" },
      { key: "ORIGIN", keyCn: "出身", value: "RUSSIAN BORN — RAISED IN CHONGQING" },
      {
        key: "REGISTER",
        keyCn: "语域",
        value: "CHONGQING DIALECT / BROKEN MANDARIN / SOME RUSSIAN / NO ENGLISH",
      },
      { key: "EXPRESSION SET", keyCn: "表情组", value: "NOT BUILT" },
      { key: "STATUS", keyCn: "状态", value: "IN DEVELOPMENT" },
      { key: "LICENSE", keyCn: "授权", value: "NOT YET" },
    ],
    note:
      "所有人先看脸，没人听他说话。于是他一次次被安排成一个他根本没想演的外国人。" +
      "他的轴不是民族性，是耿直——他真正的困境从来不是不会英语，" +
      "而是一个不撒谎的人，为了别人的体面，被迫把谎撒到底。",
    castFor: ["荒诞江湖喜剧", "身份错位", "系列剧双主角", "方言喜剧"],
  },
  {
    slug: "ding-yi",
    code: "SP-04",
    nameEn: "DING YI",
    nameCn: "丁一",
    tagline: "Came back fluent in everything except how it works here.",
    taglineCn: "什么都会说，就是不懂这儿的规矩。",
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "flare",
    plate: null,
    portrait: null,
    spec: [
      { key: "AGE", keyCn: "年龄", value: "TBD" },
      { key: "HEIGHT", keyCn: "身高", value: "TBD" },
      { key: "BUILD", keyCn: "体型", value: "TBD" },
      { key: "ORIGIN", keyCn: "出身", value: "CHINESE AMERICAN" },
      { key: "REGISTER", keyCn: "语域", value: "ENGLISH NATIVE / MANDARIN SECOND" },
      { key: "EXPRESSION SET", keyCn: "表情组", value: "NOT BUILT" },
      { key: "STATUS", keyCn: "状态", value: "IN DEVELOPMENT" },
      { key: "LICENSE", keyCn: "授权", value: "NOT YET" },
    ],
    note: "戴尔的对手，也是戴尔的镜子。设定尚未定稿，此页为占位。",
    castFor: ["系列剧双主角", "跨文化误会", "语言喜剧"],
  },
];

export const ACCENT_VAR: Record<Actor["accent"], string> = {
  acid: "var(--color-acid)",
  cyan: "var(--color-cyan)",
  magenta: "var(--color-magenta)",
  flare: "var(--color-flare)",
};

export const STATUS_LABEL: Record<ActorStatus, { en: string; cn: string }> = {
  active: { en: "CASTABLE", cn: "可出演" },
  "in-development": { en: "IN DEVELOPMENT", cn: "研发中" },
  concept: { en: "CONCEPT", cn: "概念" },
};

export function getActor(slug: string): Actor | undefined {
  return ACTORS.find((a) => a.slug === slug);
}
