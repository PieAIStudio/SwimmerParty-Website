/** Current v1.0 policy and immutable delivery wording are owned here, not by exporters. */
export const STARTER_LICENSE = {
  en: "Free for any use, even commercial. License:",
  zh: "用在哪都免费，赚钱的也行。授权：",
} as const;

/**
 * Existing member ZIP payload, preserved verbatim by the round-eight contract.
 * It contradicts LICENSE v1.0 below and is NOT the current website policy.
 * Changing these delivered terms requires an explicit Owner decision, not a refactor.
 */
export const LEGACY_MEMBER_LICENSE_RULES = [
  {
    head: { en: "Make anything non-commercial", zh: "非商业的，随便做" },
    body: {
      en: "Fan films, comics, memes, games, music videos, edits. It’s free and you don’t need to ask.",
      zh: "同人片、漫画、表情包、游戏、MV、剪辑，都免费，不用打招呼。",
    },
  },
  {
    head: { en: "Keep their name", zh: "保留演员名字" },
    body: {
      en: "Credit the actor by name, for example “Tang Yunqiu (SWIMMER PARTY)”. No logo or link required.",
      zh: "署名写演员名字就行，比如“唐韵秋（SWIMMER PARTY）”。不用放 logo，也不用挂链接。",
    },
  },
  {
    head: { en: "Don’t put words in their mouth", zh: "别让他们说不该说的话" },
    body: {
      en: "No impersonating real people, no political endorsements, no sexual content, no harassment, nothing illegal where you live.",
      zh: "不冒充真人，不替政治立场代言，不做色情内容，不攻击具体的人，不做你当地违法的事。",
    },
  },
  {
    head: { en: "Don’t make them look real", zh: "别把他们做成真人" },
    body: {
      en: "No photoreal versions and no swapping in a real person’s face. They stay animated.",
      zh: "不做写实版，不换上真人的脸。他们一直是动画角色。",
    },
  },
  {
    head: { en: "Ask before you sell", zh: "要赚钱，先说一声" },
    body: {
      en: "If money changes hands — a brand pays you, you sell prints, you run ads — that’s a license. Write to us first. It’s a short conversation.",
      zh: "只要涉及收钱，比如品牌付你钱、卖周边、投广告，就需要授权。先给我们写信，很快就能谈完。",
    },
  },
] as const;

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
      bodyEn: "What you make is yours. Anything you post here always shows who made it.",
      bodyZh: "你做的东西归你。你在这里发布的作品，我们永远写明是谁做的。",
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

export const LICENSE_WHERE = [
  {
    en: "Video",
    bodyEn: "Films, series, ads, YouTube",
    whereEn:
      "At the start (on the title card or within the first 10 seconds) and in the end credits",
    sizeEn:
      "Small but readable: at least 1/50 of the frame height (about 22 px at 1080p), on screen for 2 seconds or more",
    zh: "视频",
    bodyZh: "电影、剧集、广告、YouTube",
    whereZh: "开头（片名处或前 10 秒内）和片尾字幕各一次",
    sizeZh: "小而看得清：字高至少是画面高度的 1/50（1080p 约 22 像素），停留 2 秒以上",
  },
  {
    en: "Short video under 60 seconds",
    bodyEn: "Short video under 60 seconds",
    whereEn: "Once on screen, plus in the caption",
    sizeEn: "Same as above",
    zh: "60 秒以内的短视频",
    bodyZh: "60 秒以内的短视频",
    whereZh: "画面里出现一次，再写进文案",
    sizeZh: "同上",
  },
  {
    en: "Images: posters, comics, thumbnails, posts",
    bodyEn: "Images: posters, comics, thumbnails, posts",
    whereEn: "In a corner. For a comic or a set, once per page or once per post",
    sizeEn: "At least 1/60 of the shorter side (18 px on a 1080 px image)",
    zh: "图片：海报、漫画、封面、帖子",
    bodyZh: "图片：海报、漫画、封面、帖子",
    whereZh: "角落。漫画或组图，每页或每帖一次",
    sizeZh: "字高至少是短边的 1/60（1080 像素的图约 18 像素）",
  },
  {
    en: "Audio: podcasts, songs, audiobooks, voice-overs",
    bodyEn: "In the description, show notes or track info",
    whereEn: "In the description, show notes or track info",
    sizeEn: "—",
    zh: "声音：播客、歌曲、有声书、配音",
    bodyZh: "简介、节目说明或歌曲信息里",
    whereZh: "简介、节目说明或歌曲信息里",
    sizeZh: "—",
  },
  {
    en: "Games and apps",
    bodyEn: "On the credits screen and the store page",
    whereEn: "On the credits screen and the store page",
    sizeEn: "—",
    zh: "游戏和应用",
    bodyZh: "制作人员名单页和商店页面",
    whereZh: "制作人员名单页和商店页面",
    sizeZh: "—",
  },
  {
    en: "Livestreams and VTubing",
    bodyEn: "In the stream title or description, or as a small overlay",
    whereEn: "In the stream title or description, or as a small overlay",
    sizeEn: "—",
    zh: "直播、虚拟主播",
    bodyZh: "直播标题或简介里，或者画面上一个小角标",
    whereZh: "直播标题或简介里，或者画面上一个小角标",
    sizeZh: "—",
  },
  {
    en: "Print and merch",
    bodyEn: "On the item, its tag or its packaging · Small is fine",
    whereEn: "On the item, its tag or its packaging",
    sizeEn: "Small is fine",
    zh: "印刷品和周边",
    bodyZh: "商品本身、吊牌或包装上 · 小字就行",
    whereZh: "商品本身、吊牌或包装上",
    sizeZh: "小字就行",
  },
] as const;
// Pictures come from tools/assets/generate-license-examples.ts as <image>.<locale>.webp.
export const LICENSE_EXAMPLES = [
  {
    image: "/media/license/opening",
    en: "Opening shot: small credit under the title",
    zh: "开头：片名下面一行小字",
  },
  {
    image: "/media/license/end-credits",
    en: "End credits: one line in the cast list",
    zh: "片尾：演员表里一行",
  },
  {
    image: "/media/license/image",
    en: "Image: bottom corner",
    zh: "图片：右下角",
  },
  {
    image: "/media/license/game",
    en: "Game: credits screen",
    zh: "游戏：制作人员名单",
  },
] as const;
export const LICENSE_FAQ = [
  [
    "My YouTube channel makes money. Is that OK?",
    "Yes. Credit Swim In AI in the video and you’re set.",
    "我的 YouTube 频道有收入，可以用吗？",
    "可以。视频里署上 Swim In AI 就行。",
  ],
  [
    "A brand is paying me to make an ad with one of your actors.",
    "Go ahead. A small credit at the start and on the end card. If the brand wants an actor nobody else can use, that’s a custom actor. Talk to us.",
    "品牌付钱让我用你们的演员拍广告。",
    "去拍吧。开头一行小字，结尾画面一行。如果品牌想要一个别人不能用的演员，那是定制演员，来找我们。",
  ],
  [
    "Can I use them in a feature film?",
    "Yes. Once at the start, once in the end credits.",
    "能拍电影吗？",
    "能。开头一次，片尾字幕一次。",
  ],
  [
    "Do I have to tell you?",
    "No. But we’d love to see it.",
    "要告诉你们吗？",
    "不用。但我们很想看。",
  ],
  [
    "Can someone else use the same actor?",
    "Yes. The roster is open to everyone. If you need exclusivity, ask about a custom actor.",
    "别人能用同一位演员吗？",
    "能，名单对所有人开放。要独家，问问定制演员。",
  ],
  [
    "Can I change how they look?",
    "Clothes, hair, setting and art style, yes. If you change them into someone else, don’t use their name.",
    "能改他们的样子吗？",
    "衣服、发型、场景、画风都能改。改得不像本人了，就别用他们的名字。",
  ],
  [
    "Can I use only the voice?",
    "Yes. Same rule: credit Swim In AI in the description or credits.",
    "只用声音可以吗？",
    "可以，规则一样：在简介或致谢里署上 Swim In AI。",
  ],
  [
    "Who owns what I make?",
    "You do. The actors stay ours; your work is yours.",
    "我做的东西归谁？",
    "归你。演员归我们，作品归你。",
  ],
  [
    "I forgot the credit.",
    "Add it when you can. If we notice first, we’ll ask nicely.",
    "我忘了署名。",
    "能补就补上。我们先看到的话，会客气地提醒你。",
  ],
  [
    "What if you change these rules later?",
    "Whatever you made keeps the license version it was made under. This is v1.0, effective 8 October 2026.",
    "以后规则变了怎么办？",
    "你已经做好的东西，按做的时候的版本算。本页是 v1.0，2026 年 10 月 8 日生效。",
  ],
  [
    "Why credit Swim In AI and not SWIMMER PARTY?",
    "Swim In AI is our home. SWIMMER PARTY is one of its projects, and the credit helps people find all of them.",
    "为什么署 Swim In AI，不署 SWIMMER PARTY？",
    "Swim In AI 是我们的总站，SWIMMER PARTY 是其中一个项目。署 Swim In AI，大家能找到我们所有的项目。",
  ],
] as const;
