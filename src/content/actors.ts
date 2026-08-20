/**
 * The roster.
 *
 * This file is the single source of truth for who exists. It is product
 * content, not governed documentation — it lives outside `docs/**` on
 * purpose (see AGENTS.md, "Governed surface").
 *
 * HONESTY RULE: `status` must reflect reality. An actor with no delivered
 * plate is `in-development` and says so on screen. Never dress a
 * placeholder as a finished asset, and never invent a credit, a brand
 * partner or a view count. This site is shown to people who will check.
 *
 * LOCALE RULE: every human sentence is `{ en, zh }`. Serial nomenclature
 * (`SP-01`, `VERSION 6 / 10`, `UNITS: CM`) stays latin in both locales the
 * way units on an engineering drawing do — that is notation, not prose.
 */

/** A string that exists in both authored locales. */
export type L = { en: string; zh: string };
/** A list that exists in both authored locales. */
export type LList = { en: string[]; zh: string[] };

export type ActorStatus = "active" | "in-development" | "concept";

export type SpecRow = {
  /** Stable identifier, used as the React key and never rendered. */
  id: string;
  /** Field name on the sheet. */
  label: L;
  value: L;
};

/**
 * Where the body landmarks sit inside this actor's plate, as a percentage
 * of frame height. Plates are framed by hand, so the station lines on the
 * spec sheet have to be told where the shoulders actually are — a single
 * hard-coded set drifts on every new plate.
 */
export type Landmarks = {
  crown: number;
  shoulder: number;
  waist: number;
  knee: number;
  base: number;
};

export const DEFAULT_LANDMARKS: Landmarks = {
  crown: 6,
  shoulder: 22,
  waist: 50,
  knee: 76,
  base: 96,
};

export type ReferenceView = { id: string; src: string; label: L };

export type Actor = {
  slug: string;
  /** Roster code. Reads as a serial number because that is the point. */
  code: string;
  nameEn: string;
  nameCn: string;
  /** One line that has to do all the work on a card. */
  tagline: L;
  status: ActorStatus;
  /** Design iteration count, shown as `VERSION n OF m` like a model sheet. */
  version: { current: number; total: number };
  accent: "acid" | "cyan" | "magenta" | "flare";
  /** Full-body plate on black. Null while the actor is still in development. */
  plate: string | null;
  /** Tight crop used on roster cards. Falls back to `plate`. */
  portrait: string | null;
  /** Per-plate station calibration; omit to use DEFAULT_LANDMARKS. */
  landmarks?: Landmarks;
  /**
   * Delivered reference angles beyond the front plate.
   *
   * Empty until the angles actually exist as files. Multi-reference is the
   * only thing that reliably holds one face across generations, so this is
   * the single most useful thing the open kit can hand over — which is
   * exactly why it must never be padded with angles we have not made.
   */
  views: ReferenceView[];
  spec: SpecRow[];
  /** Longer character note. Kept short — the spec sheet does the talking. */
  note: L;
  /** What this actor is castable for. Drives the /casting conversation. */
  castFor: LList;
  /**
   * A copy-pasteable character seed for the open kit.
   *
   * Only non-null when the look is actually locked, because this string is
   * a promise: paste it into an image model and you should get THIS person.
   * An actor still on the white model has no locked face to describe, so
   * the kit page says so rather than shipping a guess.
   */
  promptSeed: string | null;
};

/** Shorthand so the roster below stays readable. */
const row = (id: string, en: string, zh: string, ven: string, vzh: string): SpecRow => ({
  id,
  label: { en, zh },
  value: { en: ven, zh: vzh },
});

const TBD = ["TBD", "待定"] as const;
const NOT_BUILT = ["NOT BUILT", "尚未构建"] as const;
const IN_DEV = ["IN DEVELOPMENT", "研发中"] as const;
const NOT_YET = ["NOT YET", "尚未开放"] as const;

/** The eight rows every in-development actor shares below the line. */
const devTail = (originEn: string, originZh: string, registerEn: string, registerZh: string) => [
  row("build", "BUILD", "体型", TBD[0], TBD[1]),
  row("origin", "ORIGIN", "出身", originEn, originZh),
  row("register", "REGISTER", "语域", registerEn, registerZh),
  row("expression", "EXPRESSION SET", "表情组", NOT_BUILT[0], NOT_BUILT[1]),
  row("status", "STATUS", "状态", IN_DEV[0], IN_DEV[1]),
  row("license", "LICENSE", "授权", NOT_YET[0], NOT_YET[1]),
];

export const ACTORS: Actor[] = [
  {
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
    accent: "acid",
    plate: "/media/actors/hu-qian/plate.webp",
    portrait: "/media/actors/hu-qian/portrait.webp",
    landmarks: { crown: 4, shoulder: 20, waist: 51, knee: 78, base: 97 },
    views: [
      { id: "front", src: "/media/actors/hu-qian/plate.webp", label: { en: "FRONT", zh: "正面" } },
      {
        id: "three-quarter",
        src: "/media/actors/hu-qian/view-three-quarter.webp",
        label: { en: "THREE-QUARTER", zh: "四分之三侧" },
      },
      {
        id: "side",
        src: "/media/actors/hu-qian/view-side.webp",
        label: { en: "SIDE", zh: "正侧" },
      },
    ],
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
  },
  {
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
    accent: "cyan",
    plate: "/media/actors/qi-man/plate.webp",
    portrait: "/media/actors/qi-man/portrait.webp",
    landmarks: { crown: 5, shoulder: 21, waist: 49, knee: 74, base: 96 },
    views: [],
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
  },
  {
    slug: "dai-er",
    code: "SP-03",
    nameEn: "DAI ER",
    nameCn: "戴尔",
    tagline: {
      en: "Russian face. Chongqing mouth. Will not lie to you.",
      zh: "俄罗斯的脸，重庆的嘴，就是不撒谎。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "magenta",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", "LATE 20s — EARLY 30s", "快 30 到 30 出头"),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "RUSSIAN BORN — RAISED IN CHONGQING",
        "生于俄罗斯 — 在重庆长大",
        "CHONGQING DIALECT / BROKEN MANDARIN / SOME RUSSIAN / NO ENGLISH",
        "重庆话 / 塑料普通话 / 一点俄语 / 不会英语",
      ),
    ],
    note: {
      en:
        "Everyone reads the face first and never gets to the sentence. So he keeps being cast " +
        "as a foreigner he never auditioned for. His spine is not nationality, it is bluntness — " +
        "and his real trap was never the missing English. It is that a man who does not lie gets " +
        "pushed into carrying a lie all the way, to protect somebody else's dignity.",
      zh:
        "所有人先看脸，没人听他说话。于是他一次次被安排成一个他根本没想演的外国人。" +
        "他的轴不是民族性，是耿直——他真正的困境从来不是不会英语，" +
        "而是一个不撒谎的人，为了别人的体面，被迫把谎撒到底。",
    },
    castFor: {
      en: ["Absurdist street comedy", "Mistaken identity", "Series co-lead", "Dialect comedy"],
      zh: ["荒诞江湖喜剧", "身份错位", "系列剧双主角", "方言喜剧"],
    },
    promptSeed: null,
  },
  {
    slug: "ding-yi",
    code: "SP-04",
    nameEn: "DING YI",
    nameCn: "丁一",
    tagline: {
      en: "Came back fluent in everything except how it works here.",
      zh: "什么都会说，就是不懂这儿的规矩。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "flare",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", TBD[0], TBD[1]),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "CHINESE AMERICAN",
        "美籍华裔",
        "ENGLISH NATIVE / MANDARIN SECOND",
        "英语母语 / 普通话第二语言",
      ),
    ],
    note: {
      en: "Dai Er's opponent and Dai Er's mirror. The character is not locked; this page is a placeholder.",
      zh: "戴尔的对手，也是戴尔的镜子。设定尚未定稿，此页为占位。",
    },
    castFor: {
      en: ["Series co-lead", "Cross-cultural misfire", "Language comedy"],
      zh: ["系列剧双主角", "跨文化误会", "语言喜剧"],
    },
    promptSeed: null,
  },
  {
    slug: "luo-dajiang",
    code: "SP-05",
    nameEn: "LUO DAJIANG",
    nameCn: "罗大江",
    tagline: {
      en: "Runs forty riders. Every one of them is younger and faster than he is.",
      zh: "他管着四十个骑手，每一个都比他年轻，每一个都比他快。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "acid",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", "EARLY 40s", "40 出头"),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "HENAN — WORKED HIS WAY TO THE CITY",
        "河南人 — 一路干到城里",
        "MANDARIN / HENAN ACCENT UNDER PRESSURE",
        "普通话 / 一急就带河南口音",
      ),
    ],
    note: {
      en:
        "A delivery station manager is a middle manager with no office and no leverage. He " +
        "absorbs the platform's timer from above and forty men's excuses from below, and the " +
        "only thing he can actually control is whether he shouts. He has decided not to shout.",
      zh:
        "外卖站长是一个没有办公室、也没有筹码的中层。上面压他平台的秒表，" +
        "下面压他四十个人的理由，他唯一能控制的只有要不要吼——他决定不吼。",
    },
    castFor: {
      en: [
        "Workplace comedy",
        "Gig-economy stories",
        "Ads: logistics / mobility / food platforms",
        "The reluctant boss",
      ],
      zh: ["职场喜剧", "零工经济题材", "广告：物流 / 出行 / 餐饮平台", "被迫当头的人"],
    },
    promptSeed: null,
  },
  {
    slug: "bai-lu",
    code: "SP-06",
    nameEn: "BAI LU",
    nameCn: "白露",
    tagline: {
      en: "Does everyone's last makeup. Has no patience left for small talk.",
      zh: "她给每个人化最后一次妆。所以她没耐心听废话。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "cyan",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", "LATE 20s", "快 30"),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "SECOND-GENERATION FUNERAL TRADE",
        "殡葬业第二代",
        "MANDARIN / QUIET, PRECISE",
        "普通话 / 轻、准",
      ),
    ],
    note: {
      en:
        "A mortuary cosmetician is the last person to do you a kindness. She is not morbid and " +
        "she is not gentle — she is efficient, and she finds the living exhausting because the " +
        "living waste so much time. Comedy comes from putting her at a dinner party.",
      zh:
        "殡仪馆化妆师是最后一个对你好的人。她不阴森，也不温柔——她只是高效，" +
        "并且觉得活人很累，因为活人太浪费时间。把她放进一场饭局，喜剧就开始了。",
    },
    castFor: {
      en: ["Black comedy", "Dinner-table scenes", "Two-hander scenes", "Documentary-style shorts"],
      zh: ["黑色幽默", "饭局戏", "双人对手戏", "伪纪录片短片"],
    },
    promptSeed: null,
  },
  {
    slug: "hao-anquan",
    code: "SP-07",
    nameEn: "HAO ANQUAN",
    nameCn: "郝安全",
    tagline: {
      en: "Nineteen years in the passenger seat. His brake foot works better than yours.",
      zh: "副驾坐了十九年，他现在踩刹车比踩自己的还准。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "flare",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", "EARLY 50s", "50 出头"),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "EX-ARMY DRIVER — DRIVING SCHOOL SINCE 2007",
        "退伍汽车兵 — 2007 年起在驾校",
        "MANDARIN / PARADE-GROUND VOLUME",
        "普通话 / 操场音量",
      ),
    ],
    note: {
      en:
        "He has taught four thousand people to drive and trusts none of them. The second brake pedal " +
        "on his side of the car is the only thing he believes in. Off duty he is startlingly " +
        "tender, which nobody in his class will ever find out.",
      zh:
        "他教会四千个人开车，一个也不信。副驾那个刹车是他唯一相信的东西。" +
        "下了班他其实温柔得吓人，但他班上的学员一辈子不会知道。",
    },
    castFor: {
      en: [
        "Situational comedy",
        "In-car two-handers",
        "Ads: automotive / insurance / safety",
        "Authority figure",
      ],
      zh: ["情境喜剧", "车内双人戏", "广告：汽车 / 保险 / 安全", "权威角色"],
    },
    promptSeed: null,
  },
  {
    slug: "mi-xue",
    code: "SP-08",
    nameEn: "MI XUE",
    nameCn: "米雪",
    tagline: {
      en: "Someone else is on camera. Every button behind it is hers.",
      zh: "镜头前是别人，镜头后的一切都是她按的。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "magenta",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", "23", "23"),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "SMALL CITY — MOVED FOR THE JOB",
        "小城出来 — 为这份工作搬的家",
        "MANDARIN / INTERNET-NATIVE, VERY FAST",
        "普通话 / 网感极强、语速极快",
      ),
    ],
    note: {
      en:
        "The livestream operator writes the script, cues the price drop, mutes the host and " +
        "reads the room, all at once. She is the director of a show nobody credits her for. " +
        "Her comedy is competence with no applause.",
      zh:
        "直播中控同时在写台本、卡价格、掐主播的麦、读弹幕的风向。" +
        "她是一台没人给她署名的节目的导演。她的喜剧是「能干但没人鼓掌」。",
    },
    castFor: {
      en: [
        "Fast-cut comedy",
        "Screen-life format",
        "Ads: e-commerce / creator tools / phones",
        "Ensemble",
      ],
      zh: ["快节奏喜剧", "桌面电影形式", "广告：电商 / 创作者工具 / 手机", "群戏"],
    },
    promptSeed: null,
  },
  {
    slug: "jin-mantang",
    code: "SP-09",
    nameEn: "JIN MANTANG",
    nameCn: "金满堂",
    tagline: {
      en: "Eight hundred weddings blessed. He hosted his own.",
      zh: "他祝福过八百对新人，自己那场是他自己主持的。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "acid",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", "38", "38"),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "COUNTY RADIO HOST — THEN WEDDINGS",
        "县广播电台主持 — 后来转婚庆",
        "MANDARIN / BROADCAST DELIVERY, ALWAYS ON",
        "普通话 / 播音腔，永远在线",
      ),
    ],
    note: {
      en:
        "A wedding MC is paid to feel things on schedule. He is extremely good at it, which is " +
        "why nobody, including him, can tell any more which of his feelings are real. Play him " +
        "warm and you get a fraud; play him sincere and you get the joke.",
      zh:
        "婚庆司仪是被雇来按时动感情的人。他太熟练了，以至于没人分得清——" +
        "包括他自己——哪一份感情是真的。演得油就是个骗子，演得真才是笑点。",
    },
    castFor: {
      en: [
        "Ensemble comedy",
        "Banquet set pieces",
        "Ads: retail / spirits / jewellery",
        "Master of ceremonies",
      ],
      zh: ["群像喜剧", "宴席重场戏", "广告：零售 / 酒 / 珠宝", "主持人角色"],
    },
    promptSeed: null,
  },
  {
    slug: "lu-dekai",
    code: "SP-10",
    nameEn: "LU DEKAI",
    nameCn: "陆得开",
    tagline: {
      en: "Opens every door in the city. Won't change his own lock.",
      zh: "全城的门他都能开，就他自己家那把不肯换。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "cyan",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", "35", "35"),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "LICENSED LOCKSMITH — REGISTERED WITH THE PRECINCT",
        "持证开锁 — 在派出所备案",
        "MANDARIN / LOW, UNHURRIED",
        "普通话 / 低、慢",
      ),
    ],
    note: {
      en:
        "A registered locksmith arrives at the worst ten minutes of a stranger's day and says " +
        "almost nothing about it. He knows what is behind more doors in this city than anyone " +
        "and has never once told. The lock he refuses to replace is at his own front door.",
      zh:
        "备案开锁匠总是出现在陌生人一天里最糟的那十分钟，而且几乎不说话。" +
        "这座城市有多少门后面是什么样，他最清楚，也从没讲过。" +
        "他唯一不肯换的那把锁，在他自己家门上。",
    },
    castFor: {
      en: [
        "Neo-noir comedy",
        "Anthology device role",
        "Ads: security / smart home / property",
        "Quiet lead",
      ],
      zh: ["黑色喜剧", "单元剧串场角色", "广告：安防 / 智能家居 / 地产", "话少的主角"],
    },
    promptSeed: null,
  },
  {
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
    accent: "magenta",
    plate: null,
    portrait: null,
    views: [],
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
  },
  {
    slug: "guan-hai",
    code: "SP-12",
    nameEn: "GUAN HAI",
    nameCn: "关海",
    tagline: {
      en: "Remembers every licence plate. And everyone who won't say hello back.",
      zh: "他记得每一辆车的车牌，和每一个不愿意跟他打招呼的人。",
    },
    status: "in-development",
    version: { current: 0, total: 10 },
    accent: "flare",
    plate: null,
    portrait: null,
    views: [],
    spec: [
      row("age", "AGE", "年龄", "47", "47"),
      row("height", "HEIGHT", "身高", TBD[0], TBD[1]),
      ...devTail(
        "LAID OFF FROM A STATE FACTORY — SECURITY SINCE",
        "国企下岗 — 之后一直做保安",
        "MANDARIN / NORTHERN, FORMAL WHEN NERVOUS",
        "普通话 / 北方口音，一紧张就打官腔",
      ),
    ],
    note: {
      en:
        "A compound security captain has a uniform, a logbook and no authority whatsoever. He " +
        "runs the gate like a small state because it is the only jurisdiction he was ever " +
        "given. Treat the dignity as real and the comedy stops being cruel.",
      zh:
        "小区保安队长有制服、有登记本，没有任何权力。他把大门口当一个小国家来治理，" +
        "因为那是唯一交给过他的辖区。把这份体面当真，喜剧就不刻薄了。",
    },
    castFor: {
      en: [
        "Community comedy",
        "Gatehouse set piece",
        "Ads: property services / logistics / civic",
        "Supporting lead",
      ],
      zh: ["社区喜剧", "门岗重场戏", "广告：物业 / 快递 / 公共服务", "重要配角"],
    },
    promptSeed: null,
  },
];

export const ACCENT_VAR: Record<Actor["accent"], string> = {
  acid: "var(--color-acid)",
  cyan: "var(--color-cyan)",
  magenta: "var(--color-magenta)",
  flare: "var(--color-flare)",
};

export const STATUS_LABEL: Record<ActorStatus, L> = {
  active: { en: "CASTABLE", zh: "可出演" },
  "in-development": { en: "IN DEVELOPMENT", zh: "研发中" },
  concept: { en: "CONCEPT", zh: "概念" },
};

export function getActor(slug: string): Actor | undefined {
  return ACTORS.find((a) => a.slug === slug);
}
