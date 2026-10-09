import type { L } from "./actors";

/**
 * THE OPEN KIT — 开放物料包.
 *
 * The commercial argument for this page: a synthetic actor gets valuable
 * the same way a human one does, by being used. Handing the crowd a real,
 * runnable character seed costs us nothing per copy and buys reach no ad
 * spend buys. This is the reach engine of the house, not a downloads page.
 *
 * HONESTY RULE applies with force here, because this page makes a promise
 * a visitor can test in thirty seconds. `live` means the artefact exists
 * today and is on this site. Anything not yet made is `preparing` or
 * `planned` and says so — a broken promise here is worse than a missing
 * feature, because the visitor finds out by pasting it into a model.
 */
export type KitItemStatus = "live" | "preparing" | "planned";

export const KIT_STATUS_LABEL: Record<KitItemStatus, L> = {
  live: { en: "AVAILABLE", zh: "已开放" },
  preparing: { en: "IN PREPARATION", zh: "筹备中" },
  planned: { en: "PLANNED", zh: "规划中" },
};

export type KitItem = {
  id: string;
  index: string;
  name: L;
  format: string;
  body: L;
  status: KitItemStatus;
};

export const KIT_MANIFEST: KitItem[] = [
  {
    id: "seed",
    index: "K-01",
    name: { en: "CHARACTER SEED", zh: "角色种子" },
    format: "TXT / PROMPT",
    body: {
      en: "The paragraph we ourselves paste into an image model to get this exact person. Face, build, wardrobe, lighting and the invariants that keep them the same person across ten films.",
      zh: "我们自己用来生成这个人的那段提示词。脸、体型、服装、光线，以及保证他在十条片子里还是同一个人的那些不变量。",
    },
    status: "live",
  },
  {
    id: "images",
    index: "K-02",
    name: { en: "IMAGE ORIGINALS", zh: "透明背景 PNG 原图" },
    format: "PNG / 941×1672",
    body: {
      en: "Transparent PNG originals, listed per actor and look. The current manifests contain 63 images per delivered actor.",
      zh: "透明背景 PNG 原图，按演员和造型列出。当前每位已交付演员的清单有 63 张图片。",
    },
    status: "live",
  },
  {
    id: "profile",
    index: "K-03",
    name: { en: "CHARACTER PROFILE", zh: "角色资料 JSON" },
    format: "JSON",
    body: {
      en: "A bilingual character profile with the actor code, specification, prompt seed, looks and delivered slots.",
      zh: "双语角色资料，含演员编号、规格、角色种子、造型和已交付图片格位。",
    },
    status: "live",
  },
  {
    id: "licence",
    index: "K-04",
    name: { en: "LICENCE TERMS", zh: "授权说明" },
    format: "TXT / JSON",
    body: {
      en: "The current non-commercial use terms and the restrictions that protect the animated characters.",
      zh: "当前非商业使用条款，以及保护动画角色的限制。",
    },
    status: "live",
  },
  {
    id: "expressions",
    index: "K-05",
    name: { en: "EXPRESSION SHEET", zh: "表情组" },
    format: "WEBP / 2K",
    body: {
      en: "The delivered expression set as a contact sheet — neutral, awkward smile, worried, serious. Comedy lives between two of these, never inside one.",
      zh: "已交付的表情组，排成一张联系表——中性、尴尬笑、发愁、认真。喜剧永远发生在两个表情之间，不在某一个里面。",
    },
    status: "preparing",
  },
  {
    id: "wardrobe",
    index: "K-06",
    name: { en: "WARDROBE SHEET", zh: "造型组" },
    format: "WEBP / 2K",
    body: {
      en: "Three looks per actor, each shot from three angles. Same person, different day — the sheet exists so a remix can change the clothes without losing the human.",
      zh: "每人三套造型，每套三个角度。同一个人，不同的一天——这张表存在的意义，是让二创换得了衣服而不丢人。",
    },
    status: "preparing",
  },
  {
    id: "turntable",
    index: "K-07",
    name: { en: "TURNTABLE SEQUENCE", zh: "转台序列" },
    format: "WEBP SEQ",
    body: {
      en: "Sixteen frames around the figure, scrubable. Intended as a rig reference for anyone building their own 3D version of a roster actor.",
      zh: "绕人物一圈十六帧，可拖动。给想自己做一个名册演员 3D 版本的人当绑定参考。",
    },
    status: "planned",
  },
  {
    id: "loop",
    index: "K-08",
    name: { en: "MOTION LOOP", zh: "循环动态" },
    format: "MP4 / 4s",
    body: {
      en: "A four-second idle loop on black. Drop-in b-roll for a thumbnail, a stream overlay or a title card.",
      zh: "黑底四秒待机循环。可以直接拿去当封面、直播挂件或者片头。",
    },
    status: "planned",
  },
];
