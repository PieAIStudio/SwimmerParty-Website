import { row, devTail, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "he-jie",
  code: "SP-13",
  nameEn: "HE JIE",
  nameCn: "何姐",
  tagline: { en: "Says it's nothing. Never stops working.", zh: "嘴上说没事，手上一直没停。" },
  status: "in-development",
  version: { current: 0, total: 10 },
  heightCm: 163,
  portrait: null,
  spec: [
    row("age", "AGE", "年龄", "43", "43 岁"),
    row("height", "HEIGHT", "身高", "163 CM", "163 CM"),
    row(
      "occupation",
      "OCCUPATION",
      "职业",
      "STAFF AT A SMALL HOME-COOKING RESTAURANT",
      "家常菜小店员工",
    ),
    ...devTail(
      "OLD-TOWN CHONGQING — WORKS IN SHANGHAI",
      "重庆老城区 — 在上海工作",
      "CHONGQING DIALECT / MANDARIN",
      "重庆话 / 普通话",
    ),
  ],
  note: {
    en: "She grew up in old-town Chongqing and moved to Shanghai for housekeeping and restaurant work. Her warmth is not politeness; her hands are simply faster than her mouth, and the dish arrives before the sentence ends. Playing her is not about hardship. It is about someone who makes an ordinary day taste good.",
    zh: "在重庆老城区长大，后来到上海做家政和餐饮。她的热心不是客气，是手比嘴快——话还没说完，菜已经端上来了。演她不用演苦，只要演一个把平凡日子过得有滋味的人。",
  },
  castFor: {
    en: [
      "Slice-of-life shorts",
      "Family comedy",
      "Ads: food / home services / local services / condiments",
      "Warm supporting role",
    ],
    zh: ["生活流短片", "家庭喜剧", "广告：餐饮 / 家政 / 生活服务 / 调味品", "温情配角"],
  },
  promptSeed: null,
};
