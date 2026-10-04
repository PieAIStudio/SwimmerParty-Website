import { row, type Actor } from "../shared.ts";
export const profile: Actor = {
  slug: "hu-qian",
  code: "SP-01",
  nameEn: "HU QIAN",
  nameCn: "胡谦",
  tagline: {
    en: "Broke, tired, and still the most reasonable man in the room.",
    zh: "没钱，很累，但全场就他讲道理。",
  },
  status: "active",
  version: { current: 6, total: 10 },
  heightCm: 178,
  portrait: "/media/actors/hu-qian/portrait.webp",
  spec: [
    row("age", "AGE", "年龄", "EARLY 30s", "30 出头"),
    row("height", "HEIGHT", "身高", "178 CM", "178 CM"),
    row("build", "BUILD", "体型", "SLIM–AVERAGE", "偏瘦到中等"),
    row("occupation", "OCCUPATION", "职业", "AUTO REPAIR HELPER", "汽修店帮工"),
    row("register", "REGISTER", "语域", "MANDARIN / STREET", "普通话 / 市井"),
    row(
      "expression",
      "EXPRESSION SET",
      "表情组",
      "4 — NEUTRAL / AWKWARD SMILE / WORRIED / SERIOUS",
      "4 组 — 中性 / 尴尬笑 / 发愁 / 认真",
    ),
    row("status", "STATUS", "状态", "CASTABLE", "可出演"),
    row("license", "LICENSE", "授权", "ON REQUEST", "面谈"),
  ],
  note: {
    en:
      "His temper is not softness, it is arithmetic. Losing it solves nothing and costs him " +
      "an afternoon of billable hours. Playing him does not mean playing poor — it means " +
      "playing a man who knows exactly how much money he has left.",
    zh:
      "好脾气不是软弱，是他算过账——发火解决不了任何问题，还得赔一个下午的工时。" +
      "演他不需要演惨，只需要演一个精确知道自己还剩多少钱的人。",
  },
  castFor: {
    en: [
      "Urban comedy",
      "Slice-of-life shorts",
      "Ads: automotive / hardware / delivery / insurance",
      "Two-hander scenes",
    ],
    zh: ["都市喜剧", "生活流短片", "广告：汽车 / 五金 / 外卖 / 保险", "双人对手戏"],
  },
  promptSeed:
    "Stylised 3D animated character, feature-animation look, NOT photorealistic. A Chinese " +
    "man in his early thirties, 178cm, slim-average build, sculpted spiky black hair rendered " +
    "as clean grouped shapes, large expressive eyes, simplified skin shading with soft " +
    "subsurface, thick graphic eyebrows, faint stubble suggested as texture not hair. Worn " +
    "dark work jacket over a hooded sweatshirt and a grey tee, fabric weathering painted in. " +
    "Expression: patient, slightly guarded, never theatrical. Seamless pure black backdrop, " +
    "cold key light from front-right, cyan rim from behind-left. Do not show any lamp, tube, " +
    "strip or light fixture in frame. Full body, facial structure strictly identical to the " +
    "reference. Do not render as a real human, do not add photographic skin detail.",
};
