import type { Look } from "../look-types.ts";

export const looks: Look[] = [
  {
    id: "personal",
    kind: "personal",
    label: { en: "Personal style", zh: "个人风格" },
    prompt:
      "Personal style: faded olive-green cotton bomber jacket worn open; plain white crew-neck T-shirt; mid-blue straight jeans; clean white low-top sneakers. His own tousled light-brown hair.",
    extras: [
      { key: "portrait", label: { en: "Close-up", zh: "近景" }, direction: "close-up" },
      {
        key: "side-glance",
        label: { en: "Side-glance close-up", zh: "侧目近景" },
        direction: "side-glance close-up",
      },
      {
        key: "walk-pockets",
        label: { en: "Walking, hands in pockets", zh: "插兜走路" },
        direction: "walking, hands in pockets",
      },
      { key: "noodles", label: { en: "Eating noodles", zh: "吃面" }, direction: "eating noodles" },
    ],
  },
  {
    id: "ceo",
    kind: "role",
    label: { en: "Journey to the East · Misha Luo as the CEO", zh: "《东游记》罗米沙（演霸总）" },
    prompt:
      "Role look (Misha Luo playing the CEO): his own tousled light-brown hair combed back with too much gel, ends still sticking up; slim glossy deep royal-blue suit with shiny black satin lapels, white shirt, wide shiny silver tie, white pocket square stuffed in carelessly, pointed glossy black-brown shoes. Too flashy and trying too hard — funny, not cool. Unbranded.",
    role: { work: "W-01", id: "misha-luo" },
    extras: [
      {
        key: "portrait",
        label: { en: "Smirk close-up", zh: "歪嘴笑近景" },
        direction: "smirk close-up",
      },
      {
        key: "sky-gaze",
        label: { en: "Gazing skyward", zh: "仰望天空" },
        direction: "gazing skyward",
      },
      {
        key: "tie-watch",
        label: { en: "Tie and watch", zh: "扯领带看表" },
        direction: "tie and watch",
      },
      {
        key: "on-set-break",
        label: { en: "On-set break", zh: "片场休息" },
        direction: "on-set break",
      },
    ],
  },
];
