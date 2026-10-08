export type LicenseLine = { en: string; zh: string };
export const LICENSE = {
  version: "1.0",
  effective: "8 October 2026",
  title: { en: "Free License", zh: "免费商用" },
  description: {
    en: "Use SWIMMER PARTY actors in anything, including paid work, for free. Just credit Swim In AI. Here’s how.",
    zh: "SWIMMER PARTY 的演员可以免费用在任何地方，包括赚钱的项目，署上 Swim In AI 就好。下面是具体做法。",
  },
  intro: {
    en: "Films, ads, YouTube, games, comics, music, merch. Paid or unpaid, big or small. You don’t pay us, you don’t fill in a form, you don’t ask. You put three small words where people can see them.",
    zh: "电影、广告、YouTube、游戏、漫画、音乐、周边。赚不赚钱、项目大小都一样：不用给钱，不用填表，不用问。只要在别人看得到的地方，放上一行小字。",
  },
  credit: { en: "Swim In AI", zh: "Swim In AI" },
  creditLines: ["Swim In AI", "Actors: Swim In AI", "Tang Yunqiu · Swim In AI", "swiminai.com"],
  promises: [
    {
      en: "Free stays free",
      zh: "免费的一直免费",
      bodyEn:
        "Any actor you can download today stays free under the license it came with. We won’t put a paywall behind you.",
      bodyZh: "今天能下载的演员，一直按下载时的授权免费用。不会事后收费。",
    },
    {
      en: "Your work stays yours",
      zh: "作品永远是你的",
      bodyEn: "What you make is yours. If you post it in Works, we always show who made it.",
      bodyZh: "你做的东西归你。发到“作品”里，我们永远写明是谁做的。",
    },
    {
      en: "We don’t sell or train on your work",
      zh: "不卖你的作品，不拿它训练",
      bodyEn:
        "We won’t license, resell or train AI on what you post, unless you agree in writing, each time.",
      bodyZh: "你发上来的东西，我们不拿去授权、不转卖，也不拿去训练 AI，除非你每次都书面同意。",
    },
    {
      en: "You made them famous, you get first call",
      zh: "他是你演火的，后面先找你",
      bodyEn:
        "If one of our actors takes off because of your work, you get first refusal on the official work that follows: directing, writing, voice or editing.",
      bodyZh:
        "如果哪位演员是靠你的作品火起来的，后续官方项目你优先选：导演、编剧、配音、剪辑都行。",
    },
    {
      en: "The actors stay with the house",
      zh: "演员留在厂牌",
      bodyEn: "We keep them consistent and protected. That’s what makes them worth casting.",
      bodyZh: "我们负责让他们始终如一、不被滥用。正因为这样，他们才值得用。",
    },
  ],
} as const;
export const LICENSE_RULES = {
  can: [
    [
      "Make money with them",
      "Ads, client work, brand films, YouTube and TikTok income, crowdfunding, selling your film or game.",
      "用他们赚钱",
      "广告、接单、品牌片、YouTube 和 TikTok 收入、众筹、卖你的片子或游戏。",
    ],
    [
      "Put them in anything",
      "Films, series, comics, books, music videos, games, merch, memes.",
      "用在任何作品里",
      "电影、剧集、漫画、书、MV、游戏、周边、表情包。",
    ],
    [
      "Direct them your way",
      "New outfits, new scenes, new stories, new art styles, as long as they stay animated.",
      "随你导",
      "换衣服、换场景、写新故事、换画风，只要还是动画角色。",
    ],
    [
      "Use any tool",
      "Any image, video, voice or 3D tool, including ones that don’t exist yet.",
      "用任何工具",
      "任何图像、视频、声音、三维工具都行，以后出的新工具也行。",
    ],
    [
      "Train for your own projects",
      "You can train a model, like a LoRA, on them for your own work. Don’t share or sell the model itself.",
      "为自己的项目训练模型",
      "可以拿他们训练模型（比如 LoRA）给自己的作品用。模型本身别分享、别卖。",
    ],
  ],
  cannot: [
    [
      "Make them look real",
      "No photoreal versions. No swapping a real person’s face in or out.",
      "把他们做成真人",
      "不做写实版。不把真人的脸换进来，也不把他们的脸换到真人身上。",
    ],
    [
      "Fool people",
      "No pretending to be a real person, no fake endorsements, no misinformation, no political campaigns.",
      "拿来骗人",
      "不冒充真人，不做虚假代言，不造谣，不做政治竞选宣传。",
    ],
    [
      "Make harmful content",
      "No sexual content, hate, harassment, attacks on real people, or anything illegal where you live.",
      "做有害的内容",
      "不做色情、仇恨、骚扰，不攻击具体的人，不做你当地违法的事。",
    ],
    [
      "Resell the raw files",
      "Sell what you make, not our files. Don’t resell or give away our images, voices or prompts as asset packs, stock, templates or datasets.",
      "转卖原始文件",
      "卖你做出来的东西，别卖我们的文件。我们的图片、声音、提示词不能打包转卖或转送，不能当素材库、模板或数据集。",
    ],
    [
      "Claim them",
      "Don’t trademark them, register them as your own characters or say you created them.",
      "据为己有",
      "不注册商标，不登记成你自己的角色，不说是你创造的。",
    ],
  ],
} as const;
