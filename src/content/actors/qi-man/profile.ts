import { row, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "qi-man",
  code: "SP-02",
  nameEn: "QI MAN",
  nameCn: "齐满",
  tagline: {
    en: "Night shift. Sees everything. Says almost nothing.",
    zh: "上夜班。什么都看见了。基本不说。",
  },
  status: "active",
  version: { current: 2, total: 10 },
  heightCm: 165,
  portrait: "/media/actors/qi-man/portrait.webp",
  spec: [
    row("age", "AGE", "年龄", "MID 20s", "25 上下"),
    row("height", "HEIGHT", "身高", "165 CM", "165 CM"),
    row("build", "BUILD", "体型", "SLIM", "瘦"),
    row(
      "occupation",
      "OCCUPATION",
      "职业",
      "24H CONVENIENCE STORE — CASHIER",
      "24 小时便利店 — 收银",
    ),
    row("register", "REGISTER", "语域", "MANDARIN / DEADPAN", "普通话 / 面无表情"),
    row(
      "expression",
      "EXPRESSION SET",
      "表情组",
      "2 — NEUTRAL / HALF SMILE",
      "2 组 — 中性 / 半个笑",
    ),
    row("status", "STATUS", "状态", "CASTABLE", "可出演"),
    row("license", "LICENSE", "授权", "ON REQUEST", "面谈"),
  ],
  note: {
    en:
      "The register is the best observation post in the city. She does not comment; she just " +
      "holds your eye half a second too long when she pushes the change back. That half " +
      "second is the line. Her comedy lives entirely in not answering.",
    zh:
      "收银台是全城最好的观察位。她不评价，只是把找零推过来的时候多看你一眼——" +
      "那一眼就是台词。她的喜剧全在不接话上。",
  },
  castFor: {
    en: [
      "Deadpan comedy",
      "Late-night scenes",
      "Ads: convenience retail / drinks / payments / city services",
      "The observer role",
    ],
    zh: ["冷幽默", "深夜场景", "广告：便利店 / 饮品 / 支付 / 城市服务", "旁观者视角"],
  },
  promptSeed:
    "Stylised 3D animated character, feature-animation look, NOT photorealistic. A Chinese " +
    "woman in her mid twenties, 165cm, slim, dark hair swept up and loosely pinned with " +
    "strands falling free, rendered as clean grouped shapes. Large calm eyes, graphic " +
    "eyebrows, simplified skin shading, a small closed half-smile. Blue and grey convenience " +
    "store uniform waistcoat with a red stripe over a pale collared shirt, name badge. " +
    "Expression: deadpan, alert, withholding. Seamless pure black backdrop, cool cyan rim " +
    "light from behind-left. Do not show any lamp, tube, strip or light fixture in frame. " +
    "Full body, facial structure strictly identical to the reference. Do not render as a " +
    "real human, do not add photographic skin detail.",
};
