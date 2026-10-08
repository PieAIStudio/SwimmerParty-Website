import { row, type Actor } from "../shared.ts";

export const profile: Actor = {
  slug: "chen-wei",
  nameEn: "CHEN WEI",
  nameCn: "陈伟",
  tagline: {
    en: "Looks half asleep. Sees everything.",
    zh: "眼睛像没睡醒，其实啥都看见了。",
  },
  status: "active",
  gender: "male",
  age: 46,
  heightCm: 173,
  portrait: "/media/assets/chen-wei/turnaround.front.webp",
  spec: [
    row("origin", "From", "籍贯", "Chengdu, Sichuan", "四川成都"),
    row("age", "Age", "年龄", "46", "46"),
    row("height", "Height", "身高", "173 cm", "173 cm"),
    row("language", "Speaks", "语言", "Chinese", "中文"),
  ],
  note: {
    en: "Chen Wei is a SWIMMER PARTY AI actor from Chengdu. Forty-six, round-faced and heavy-lidded. He plays the crew's grip in Journey to the East.",
    zh: "陈伟是 SWIMMER PARTY 的 AI 演员，成都人，四十六岁，圆脸，眼睛半眯。他在《东游记》里演场务大哥。",
  },
  version: "1.0.0",
  versionDate: "2026-10-08",
  versionNote: {
    en: "First release: 21 images, including a turnaround, faces and 14 expressions.",
    zh: "首次上线：21 张图片，包括转面、脸部和 14 个表情。",
  },
  voiceLanguage: "zh",
  promptSeed:
    "The same fictional Chinese man of East Asian appearance as the reference: about 46 years old, slightly heavy build, about 173 cm, realistic adult body proportions around 7.25–7.5 heads tall; at this height, crown-to-chin is about 23–24 cm, with natural neck, torso, pelvis and leg lengths; no large head, long neck, short torso or elongated fashion-model legs. Signature features: a broad face with full cheeks, half-lidded eyes with slightly downturned outer corners, a full lower lip, and a naturally uneven mouth line. Natural short black hair with light stubble. Keep these features recognizable in every angle, expression and wardrobe. Do not make him a generic comic sidekick or an average face.",
};
