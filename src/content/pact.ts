import type { L } from "./actors";

/**
 * THE PACT — 共赢契约.
 *
 * The house position on who gets paid, published where anyone can hold us
 * to it. Two constraints shaped this file:
 *
 *  1. It is marked DRAFT on screen, everywhere, because these numbers have
 *     not been through a contract. Publishing a rate we have not honoured
 *     yet as if it were settled is the same failure mode as a fake client
 *     logo — it is checkable, and being caught costs the whole site.
 *  2. It is a page rather than a line in the footer because a revenue
 *     split stated in public is a position, and a position stated in a
 *     footer is a decoration.
 */
export const PACT_VERSION = "DRAFT v0.1";

export type Clause = {
  id: string;
  n: string;
  head: L;
  body: L;
  /** The one-line version, used on the home teaser. */
  short: L;
};

export const CLAUSES: Clause[] = [
  {
    id: "free-to-play",
    n: "01",
    head: { en: "THE KIT IS FREE, PERMANENTLY", zh: "物料包永远免费" },
    short: { en: "Play for free.", zh: "玩，免费。" },
    body: {
      en: "Every open kit stays free for non-commercial work, and we will not retroactively paywall one. If a kit ever moves behind a licence, the version you already downloaded keeps the terms it shipped with.",
      zh: "所有开放物料包对非商业创作永远免费，我们不会事后把它关进收费墙。就算某个包以后转成授权制，你已经下载的那一版，继续按当时的条款算。",
    },
  },
  {
    id: "you-brought-it",
    n: "02",
    head: { en: "YOU BROUGHT THE JOB, YOU GET A CUT", zh: "单子是你带来的，分你" },
    short: { en: "You bring a job, you get paid.", zh: "你带单，你分钱。" },
    body: {
      en: "If a brand reaches us because of your work with one of our actors, you are in the deal — not thanked in a reply. Target share for an introduced booking is a fixed percentage of the licence fee, agreed in writing before we sign anything.",
      zh: "如果某个品牌是因为你用我们演员做的东西才找过来的，你在这单里有份，而不是收到一句「谢谢」。介绍成交的目标分成是授权费的一个固定比例，签约前先跟你书面谈定。",
    },
  },
  {
    id: "you-made-them",
    n: "03",
    head: { en: "YOU MADE THEM FAMOUS, YOU GET FIRST CALL", zh: "他是你演火的，后面先找你" },
    short: { en: "You break them out, you get first call.", zh: "你把他做火，后面先找你。" },
    body: {
      en: "If a roster actor breaks out through your remix, you get first refusal on the official work that follows — direction, writing, voice, edit, whichever seat you actually want. Credited on the roster page, by name.",
      zh: "如果名册上某个演员是靠你的二创火起来的，后续的官方项目你有优先选择权——导演、编剧、配音、剪辑，你想坐哪个位置都行。名册页上署你的名。",
    },
  },
  {
    id: "we-dont-take",
    n: "04",
    head: { en: "WE DO NOT SELL YOUR WORK", zh: "我们不拿你的作品去卖" },
    short: { en: "We never resell your work.", zh: "不拿你的东西去卖。" },
    body: {
      en: "Your remix is yours. We will repost it and say who made it; we will never license it, bundle it into a pitch deck as our own, or train on it without asking you first, in writing, each time.",
      zh: "你的二创是你的。我们会转发并写清楚是谁做的；我们不会拿它去授权、不会当成自己的东西塞进提案、也不会未经你书面同意拿去训练——每一次都要单独问。",
    },
  },
  {
    id: "character-stays",
    n: "05",
    head: { en: "THE CHARACTER STAYS WITH THE HOUSE", zh: "角色归厂牌，作品归你" },
    short: { en: "Character ours, film yours.", zh: "角色归我们，片子归你。" },
    body: {
      en: "The actor is the house's asset — that is what makes them worth building and worth protecting. What you make with them is yours outright. Nobody has to lose for the other to win, which is the entire point of writing this down.",
      zh: "演员是厂牌的资产——正因如此他才值得被造出来、也值得被保护。你用他做出来的东西完全归你。没有谁必须输掉，另一方才能赢，这就是把这几条写下来的全部意义。",
    },
  },
];

/** What a percentage is not yet. Rendered as an honest placeholder table. */
export type Term = { id: string; label: L; value: L; settled: boolean };

export const TERMS: Term[] = [
  {
    id: "noncommercial",
    label: { en: "NON-COMMERCIAL REMIX", zh: "非商业二创" },
    value: { en: "FREE — NO PERMISSION NEEDED", zh: "免费 — 不用问" },
    settled: true,
  },
  {
    id: "attribution",
    label: { en: "ATTRIBUTION", zh: "署名要求" },
    value: { en: "NAME + ROSTER CODE", zh: "名字 + 编号" },
    settled: true,
  },
  {
    id: "introduced",
    label: { en: "INTRODUCED BOOKING SHARE", zh: "介绍成交分成" },
    value: { en: "TO BE FIXED IN CONTRACT", zh: "以正式合同为准" },
    settled: false,
  },
  {
    id: "coproduction",
    label: { en: "CO-PRODUCTION SPLIT", zh: "联合出品分账" },
    value: { en: "TO BE FIXED IN CONTRACT", zh: "以正式合同为准" },
    settled: false,
  },
  {
    id: "training",
    label: { en: "TRAINING ON YOUR WORK", zh: "用你的作品训练" },
    value: { en: "NEVER WITHOUT WRITTEN CONSENT", zh: "没有书面同意，绝不" },
    settled: true,
  },
];
