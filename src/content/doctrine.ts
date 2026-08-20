import type { L } from "./actors";

/**
 * THE STANCE — 立场.
 *
 * The house refuses to build photoreal human likenesses. This file is the
 * single source for that position so it can be quoted identically on the
 * home page, the pact page, every actor dossier and the kit rules — a
 * position restated in four slightly different ways reads as marketing,
 * and a position stated once reads as a rule.
 *
 * Worth recording for whoever edits this next: the roster was already
 * stylised CG before this was written down. Nothing on the site had to be
 * re-shot to comply. That ordering is why the claim is safe to make loudly.
 */

/** The hard lines. Deliberately short — a rule you cannot recite is not a rule. */
export type Refusal = { id: string; n: string; head: L; body: L };

export const REFUSALS: Refusal[] = [
  {
    id: "animated",
    n: "01",
    head: { en: "EVERY ACTOR IS ANIMATED", zh: "全都是动画角色" },
    body: {
      en: "CG, drawn, obviously not a person. You can tell in a second, and you are supposed to. There is no roster tier where that stops being true.",
      zh: "CG 的、画出来的、一眼就能看出不是真人。你一秒就分得清，这是故意的。名册上没有哪一档是例外。",
    },
  },
  {
    id: "photoreal",
    n: "02",
    head: { en: "NO PHOTOREAL PASS", zh: "不往写实上做" },
    body: {
      en: "Nobody here gets pushed toward real skin, real pores, real camera grain. Not as an upgrade, not as a premium tier, not for a client who asks nicely.",
      zh: "没有人会被推向真皮肤、真毛孔、真机器的颗粒感。不作为升级项，不作为高价档，客户好声好气地问也不行。",
    },
  },
  {
    id: "no-face",
    n: "03",
    head: { en: "NO REAL PERSON'S FACE", zh: "不用任何真人的脸" },
    body: {
      en: "We do not scan, lift, blend or approach a living person's likeness. Not a celebrity, not a stranger in a dataset, not a friend who said it was fine.",
      zh: "我们不扫描、不搬用、不融合、也不去靠近任何活人的长相。明星不行，数据集里的陌生人不行，说「没关系」的朋友也不行。",
    },
  },
  {
    id: "no-conversion",
    n: "04",
    head: { en: "YOU CANNOT TAKE THEM THERE EITHER", zh: "你也不能把他们做成真人" },
    body: {
      en: "The kit is free and almost everything is allowed. Converting one of these characters into something that reads as a real human being is the one thing that is not. That is not a remix; that is the thing we are here to not do.",
      zh: "物料包是免费的，几乎什么都能做。唯独把这些角色转成「看起来像真人」的东西不行。那不是二创，那正是我们开这家公司要避开的事。",
    },
  },
];

/**
 * The argument, in the house's own voice.
 *
 * Written as short paragraphs rather than one block because this is the
 * only long-form prose on the site and it has to survive being read on a
 * phone by somebody who is deciding whether we are serious.
 */
export const WHY: { id: string; body: L }[] = [
  {
    id: "cant",
    body: {
      en: "It is not that photoreal is out of reach. It is that we are not going there.",
      zh: "不是做不到写实。是我们不做。",
    },
  },
  {
    id: "life",
    body: {
      en: "A real actor has one thing we cannot copy: they walk into a room and a whole life walks in with them. Thirty-eight years of it. A divorce, a bad back, a father. That is not ours, and we are not going to go and take it.",
      zh: "真人演员身上有一样东西我们复制不了——他走进来，他的一生也跟着走进来。三十八年，一场离婚，一个坏了的腰，一个父亲。那个东西不归我们，我们也不打算去拿。",
    },
  },
  {
    id: "job",
    body: {
      en: "Somebody will say we are leaving money on the table. We are. It is on a table we do not want to sit at — the one where the machine takes the actor's job and calls it progress.",
      zh: "有人会说这是自断一条财路。是的。但那张桌子我们本来就不想坐——坐在那儿的人，正在把抢演员饭碗这件事说成进步。",
    },
  },
  {
    id: "protect",
    body: {
      en: "Protecting that work is not charity. Anyone who makes things for a living is standing on the same floor. Pull it out from under actors this year and it is under all of us next year.",
      zh: "护住那份工作不是做慈善。所有靠做东西吃饭的人，站的是同一层地板。今年把演员脚下这块抽走，明年就轮到我们自己。",
    },
  },
  {
    id: "instead",
    body: {
      en: "So we build the other thing. A character no human could play. A face that does not exist anywhere. A person who only works because somebody drew him that way. That is not a replacement for an actor. It is one more thing in the world.",
      zh: "所以我们做另一种东西。一个真人演不了的角色，一张现实里不存在的脸，一个只有被画成这样才成立的人。这不是替代谁，这是世界上多了一样东西。",
    },
  },
];

/**
 * The one-line version.
 *
 * Used in the footer, on actor dossiers and as the OpenGraph subtitle. If
 * only one sentence of this file survives a redesign, it should be this.
 */
export const STANCE_LINE: L = {
  en: "ANIMATED CHARACTERS ONLY — NEVER A HUMAN LIKENESS",
  zh: "只做动画角色 — 绝不做真人形象",
};

/** The short badge that sits on every roster card and dossier. */
export const CG_BADGE: L = {
  en: "CG ACTOR / NOT A REAL PERSON",
  zh: "动画角色 / 非真人",
};
