import { TBD, row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "su-xiao",
  code: "SP-11",
  nameEn: "SU XIAO",
  nameCn: "苏晓",
  tagline: {
    en: "Three hundred viewings shown. She sleeps in a partition inside the smallest one.",
    zh: "她带看过三百套房，自己住的是其中最小那套里隔出来的一间。",
  },
  status: "in-development",
  version: { current: 0, total: 10 },
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "26", "26"),
    row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
    ...devTail(
      "GRADUATED INTO A BAD YEAR",
      "毕业撞上不好的年份",
      "MANDARIN / SALES-BRIGHT, DROPS INSTANTLY OFF-CLOCK",
      "普通话 / 销售腔，一下班立刻掉档",
    ),
  ],
  note: {
    en:
      "A property agent sells other people the life she is not having. The performance is " +
      "flawless for eleven hours and collapses in the stairwell. Do not play the collapse for " +
      "pity — play it as a woman clocking out of a role, precisely, like an actor.",
    zh:
      "房产中介向别人兜售她自己没过上的生活。这场演出一天能撑十一个小时，" +
      "然后在楼梯间垮掉。别把垮掉演成可怜——要演成一个人精确地下戏，像个演员。",
  },
  castFor: {
    en: ["Urban comedy", "Sales-floor satire", "Ads: property / finance / fitness", "Young lead"],
    zh: ["都市喜剧", "销售场讽刺", "广告：地产 / 金融 / 健身", "年轻主角"],
  },
  promptSeed: null,
};
