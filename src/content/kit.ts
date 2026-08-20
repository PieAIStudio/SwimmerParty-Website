import type { L } from "./actors";

/**
 * THE OPEN KIT — 开放物料包.
 *
 * The commercial argument for this page: a synthetic actor gets valuable
 * the same way a human one does, by being used. Handing the crowd a real,
 * runnable character seed costs us nothing per copy and buys reach no ad
 * spend buys. This is the reach engine of the house, not a downloads page.
 *
 * HONESTY RULE applies with force here, because this page makes a promise
 * a visitor can test in thirty seconds. `live` means the artefact exists
 * today and is on this site. Anything not yet made is `preparing` or
 * `planned` and says so — a broken promise here is worse than a missing
 * feature, because the visitor finds out by pasting it into a model.
 */
export type KitItemStatus = "live" | "preparing" | "planned";

export const KIT_STATUS_LABEL: Record<KitItemStatus, L> = {
  live: { en: "AVAILABLE", zh: "已开放" },
  preparing: { en: "IN PREPARATION", zh: "筹备中" },
  planned: { en: "PLANNED", zh: "已排期" },
};

export type KitItem = {
  id: string;
  index: string;
  name: L;
  format: string;
  body: L;
  status: KitItemStatus;
};

export const KIT_MANIFEST: KitItem[] = [
  {
    id: "seed",
    index: "K-01",
    name: { en: "CHARACTER SEED", zh: "角色种子" },
    format: "TXT / PROMPT",
    body: {
      en: "The paragraph we ourselves paste into an image model to get this exact person. Face, build, wardrobe, lighting and the invariants that keep them the same person across ten films.",
      zh: "我们自己用来生成这个人的那段提示词。脸、体型、服装、光线，以及保证他在十条片子里还是同一个人的那些不变量。",
    },
    status: "live",
  },
  {
    id: "register",
    index: "K-02",
    name: { en: "VOICE & REGISTER", zh: "语域说明" },
    format: "TXT",
    body: {
      en: "How this actor talks: speed, accent under pressure, what they never say, and the beat they hold instead. Feed it to a writing model and the dialogue stops sounding generic.",
      zh: "这个人怎么说话：语速、一急就冒出来的口音、他绝不会说的话，以及他用什么停顿代替。喂给写作模型，台词就不再是通用腔。",
    },
    status: "live",
  },
  {
    id: "negatives",
    index: "K-03",
    name: { en: "NEGATIVE LIST", zh: "排除项清单" },
    format: "TXT",
    body: {
      en: "The things that break the character on sight — wrong age band, wrong glamour level, a lamp painted into the rim light. It opens with the line that matters most: do not render as a real human. Half of holding a face steady is knowing what to forbid.",
      zh: "一眼就会让角色垮掉的东西——年龄段错、精致度错、模型把轮廓光画成一根灯管。第一条是最要紧的那条：不要渲染成真人。锁住一张脸，一半靠禁止什么。",
    },
    status: "live",
  },
  {
    id: "plates",
    index: "K-04",
    name: { en: "REFERENCE PLATES", zh: "参考图组" },
    format: "WEBP / 2K",
    body: {
      en: "Front, three-quarter and back on seamless black. Multi-reference is the only thing that actually holds a face across generations; one image is a coin flip.",
      zh: "正面、四分之三侧、背面，纯黑无缝底。多参考图是真正锁住一张脸的唯一办法，单张图只是碰运气。",
    },
    status: "preparing",
  },
  {
    id: "expressions",
    index: "K-05",
    name: { en: "EXPRESSION SHEET", zh: "表情组" },
    format: "WEBP / 2K",
    body: {
      en: "The delivered expression set as a contact sheet — neutral, awkward smile, worried, serious. Comedy lives between two of these, never inside one.",
      zh: "已交付的表情组，排成一张联系表——中性、尴尬笑、发愁、认真。喜剧永远发生在两个表情之间，不在某一个里面。",
    },
    status: "preparing",
  },
  {
    id: "wardrobe",
    index: "K-06",
    name: { en: "WARDROBE SHEET", zh: "造型组" },
    format: "WEBP / 2K",
    body: {
      en: "Three looks per actor, each shot from three angles. Same person, different day — the sheet exists so a remix can change the clothes without losing the human.",
      zh: "每人三套造型，每套三个角度。同一个人，不同的一天——这张表存在的意义，是让二创换得了衣服而不丢人。",
    },
    status: "preparing",
  },
  {
    id: "turntable",
    index: "K-07",
    name: { en: "TURNTABLE SEQUENCE", zh: "转台序列" },
    format: "WEBP SEQ",
    body: {
      en: "Sixteen frames around the figure, scrubable. Intended as a rig reference for anyone building their own 3D version of a roster actor.",
      zh: "绕人物一圈十六帧，可拖动。给想自己做一个名册演员 3D 版本的人当绑定参考。",
    },
    status: "planned",
  },
  {
    id: "loop",
    index: "K-08",
    name: { en: "MOTION LOOP", zh: "循环动态" },
    format: "MP4 / 4s",
    body: {
      en: "A four-second idle loop on black. Drop-in b-roll for a thumbnail, a stream overlay or a title card.",
      zh: "黑底四秒待机循环。可以直接拿去当封面、直播挂件或者片头。",
    },
    status: "planned",
  },
];

/**
 * The compact between the house and whoever picks a kit up.
 *
 * This is the fan-facing half of the win-win position; the commercial half
 * lives on /pact. Keeping them on two pages is deliberate — a creator
 * reading rules of use should not have to scroll past revenue-share terms.
 */
export type KitRule = { id: string; head: L; body: L; allow: boolean };

export const KIT_RULES: KitRule[] = [
  {
    id: "free",
    allow: true,
    head: { en: "MAKE ANYTHING, FOR FREE", zh: "随便做，不收钱" },
    body: {
      en: "Fan films, memes, comics, covers, game mods, fan fiction, your own edits. Non-commercial use of a kit costs nothing and needs no permission.",
      zh: "同人片、表情包、漫画、翻唱、游戏 mod、同人文、你自己的剪辑。非商业使用物料包，不收费，也不用问。",
    },
  },
  {
    id: "credit",
    allow: true,
    head: { en: "KEEP THE NAME AND THE CODE", zh: "保留名字和编号" },
    body: {
      en: "Call them by their name and their roster code. That is the whole attribution requirement — no logo lockup, no link obligation, no watermark.",
      zh: "叫他的名字，带上他的编号。署名要求就这一条——不用摆 logo，不用挂链接，不用打水印。",
    },
  },
  {
    id: "voice",
    allow: false,
    head: { en: "DO NOT PUT WORDS IN THEIR MOUTH", zh: "别让他说他不会说的话" },
    body: {
      en: "No real-person impersonation, no political endorsement, no sexual content, no harassment of an identifiable person, nothing illegal where you are. These characters are ours to protect.",
      zh: "不冒充真人，不代言政治立场，不做成人内容，不用来攻击具体的人，不做你所在地违法的事。这些角色我们得护着。",
    },
  },
  {
    id: "no-real",
    allow: false,
    head: { en: "DO NOT MAKE THEM LOOK REAL", zh: "别把他们做成真人" },
    body: {
      en: "No photoreal pass, no swapping in a living person's face, no 'you can't tell any more' edit. These are animated characters and they stay animated characters. This is the one rule we will actually chase you about.",
      zh: "不做写实化，不换上任何活人的脸，不做那种「已经看不出来了」的版本。他们是动画角色，就一直是动画角色。这一条是我们真的会来找你的那条。",
    },
  },
  {
    id: "commercial",
    allow: false,
    head: { en: "TELL US BEFORE YOU CHARGE FOR IT", zh: "要收钱，先说一声" },
    body: {
      en: "The moment money changes hands — a brand pays you, a platform pays you, you sell the print — it stops being a remix and becomes a licence. That conversation is short and it is on the Pact page.",
      zh: "只要钱开始流动——品牌付你、平台付你、你卖印刷品——它就不再是二创，而是授权。这个对话很短，在共赢契约那一页。",
    },
  },
];
