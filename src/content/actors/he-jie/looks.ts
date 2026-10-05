import type { Look } from "../look-types.ts";

export const looks: Look[] = [
  {
    id: "personal",
    kind: "personal",
    label: { en: "Personal style", zh: "个人风格" },
    prompt:
      "Personal style: soft camel fine-knit long cardigan worn open; ivory silk blouse with a soft collar, tucked in; high-waisted soft charcoal-grey wide-leg trousers; tan leather loafers; small plain gold stud earrings. Her own dark brown shoulder-length waves worn down.",
    extras: [
      { key: "portrait", label: { en: "Close-up", zh: "近景" }, direction: "close-up" },
      {
        key: "earring",
        label: { en: "Hair-tuck close-up", zh: "拨发近景" },
        direction: "hair-tuck close-up",
      },
      {
        key: "walk-coffee",
        label: { en: "Walking with coffee", zh: "拿咖啡走路" },
        direction: "walking with coffee",
      },
      {
        key: "sit-laugh",
        label: { en: "Seated laugh", zh: "坐着大笑" },
        direction: "seated laugh",
      },
    ],
  },
  {
    id: "maid",
    kind: "role",
    label: { en: "Journey to the East · He Jie as the maid", zh: "《东游记》何姐（演女佣）" },
    prompt:
      "Role look (He Jie playing the maid): perfectly neat, glossy, heavily hair-sprayed bun with a large white lace maid headpiece; short-drama glam makeup with slightly too-long false lashes, slightly too-red lipstick and two round rosy blush spots; deep navy knee-length maid dress with puffed short sleeves, oversized white lace collar, layered white ruffled apron with an extra-large bow at the back, white cuffs, dark grey flat shoes.",
    role: { work: "W-01", id: "he-jie" },
    extras: [
      {
        key: "portrait",
        label: { en: "Shy close-up", zh: "捂嘴害羞近景" },
        direction: "shy close-up",
      },
      { key: "tray", label: { en: "Serving tray", zh: "端托盘" }, direction: "serving tray" },
      {
        key: "duster",
        label: { en: "Eavesdropping with a duster", zh: "鸡毛掸子偷听" },
        direction: "eavesdropping with a duster",
      },
      {
        key: "on-set-break",
        label: { en: "On-set break", zh: "片场休息" },
        direction: "on-set break",
      },
    ],
  },
];
