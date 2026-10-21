import type { L } from "./actors/index.ts";

/** Verification stays internal; untested tool pages remain noindex until a real reviewed run. */
export type ToolTutorial = {
  id: string;
  tool: string;
  goal: L;
  entry: string;
  access: L;
  steps: readonly L[];
  prompt: L;
  troubleshoot: L;
  sources: readonly { label: string; url: string }[];
  sourceCheckedAt: string;
  reproducedAt: string | null;
  reproductionEvidence: string | null;
};
const prepare: L = {
  en: "Choose one actor and download a front-view image. Single images need no Swimmer account; a starter pack needs a free account. Keep the supplied credit information.",
  zh: "选一位演员并下载正面参考图。单张不用登录，懒人包需要免费泳者账号；保留附带的署名说明。",
};
const inspect: L = {
  en: "Compare the result with the reference: face, hair, clothing and hands. Save the original output only when it fits your scene, and add the required Swim In AI credit. A prompt cannot guarantee identity consistency.",
  zh: "对照参考图检查脸、发型、服装和手部。符合场景需要再保存原始结果，并按规则署名 Swim In AI；提示词不保证每次保持同一形象。",
};
const motion: L = {
  en: "The animated character gives one small friendly wave, then lowers the hand. Gentle breathing. The camera is locked off. Keep the original framing, face, hairstyle, clothing and animation style. One continuous shot.",
  zh: "动画演员轻轻挥一次手，然后放下手臂，自然呼吸。固定镜头，保持原图的构图、脸、发型、服装和动画风格。一个连续镜头。",
};
const still: L = {
  en: "Use the uploaded animated actor as the character reference. Place the same character beside a window in a quiet cafe, holding a plain cup. Preserve the face, hairstyle, clothing and animated style. Soft daylight, medium shot, uncluttered background.",
  zh: "以上传的动画演员为角色参考，让同一角色站在安静咖啡馆的窗边，拿着一个素色杯子。保留脸、发型、服装和动画风格。柔和日光，中景，简洁背景。",
};
const check = { sourceCheckedAt: "2026-10-13", reproducedAt: null, reproductionEvidence: null };
export const TOOL_TUTORIALS: readonly ToolTutorial[] = [
  {
    id: "veo",
    tool: "Veo · Google Flow",
    entry: "https://labs.google/fx/tools/flow",
    ...check,
    goal: { en: "A short greeting from one still", zh: "把一张参考图变成打招呼短片" },
    access: {
      en: "Requires an eligible Google account in a supported region, age 18+, and access to Flow. Check your plan, selected Veo model and credit charge before generating; a paid plan or credits may be required.",
      zh: "需要受支持地区的合资格 Google 账号、年满18岁并可使用 Flow。生成前核对套餐、所选 Veo 模型和点数费用；可能需要付费套餐或点数。",
    },
    steps: [
      prepare,
      {
        en: "In Flow, start a video from your actor picture. Upload the front view as the first frame. Check that your account can use the chosen Veo model.",
        zh: "在 Flow 里选用图片做视频，上传演员正面图当第一帧。确认你的账号能用所选 Veo 模型。",
      },
      {
        en: "Paste the motion prompt below. Choose one output and a short duration supported by the selected model. Check the displayed cost, then generate.",
        zh: "粘贴下方动作提示词，先选一个结果和当前模型支持的短时长。核对显示的费用后再生成。",
      },
      inspect,
    ],
    prompt: motion,
    troubleshoot: {
      en: "Start with a single movement and a fixed camera. If the interface switches models, recheck the model name and price rather than treating it as the same test.",
      zh: "先只做一个动作、固定镜头。界面若自动切换模型，重新核对模型名和费用，不把它当成同一模型的测试。",
    },
    sources: [
      {
        label: "Google Flow: create videos",
        url: "https://support.google.com/flow/answer/16353334?hl=en",
      },
      {
        label: "Google Flow: access and credits",
        url: "https://support.google.com/flow/answer/16353333?hl=en",
      },
    ],
  },
  {
    id: "runway",
    tool: "Runway · Gen-4.5",
    entry: "https://app.runwayml.com",
    ...check,
    goal: { en: "A small gesture, directed with motion", zh: "用动作描述拍一个小手势" },
    access: {
      en: "Requires a Runway account on Standard or higher. Gen-4.5 consumes credits; confirm the duration and charge before generating.",
      zh: "需要 Runway 账号及 Standard 或更高套餐。Gen-4.5 消耗点数；生成前确认时长和费用。",
    },
    steps: [
      prepare,
      {
        en: "In Runway, choose the video tool and add the actor picture. Choose an image-to-video model your account can use.",
        zh: "在 Runway 打开做视频的工具，上传演员图。选你的账号能用的图生视频模型。",
      },
      {
        en: "Paste the motion prompt below. Keep the input framing and choose a short duration. Review the credit cost and generate one clip.",
        zh: "粘贴下方动作提示词，保留输入构图并选较短时长。核对点数费用，先生成一段。",
      },
      inspect,
    ],
    prompt: motion,
    troubleshoot: {
      en: "Describe what moves rather than rewriting the picture. Reduce the number of actions if hands or faces drift; compare the entire clip, not just its first frame.",
      zh: "重点写动作，不必重复描述整张图。手和脸发生变化时先减少动作；检查整段视频，不只看第一帧。",
    },
    sources: [
      {
        label: "Runway: creating with Gen-4.5",
        url: "https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5",
      },
      {
        label: "Runway: image-to-video prompting",
        url: "https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide",
      },
    ],
  },
  {
    id: "gemini",
    tool: "Gemini · image editing",
    entry: "https://gemini.google.com",
    ...check,
    goal: { en: "The same actor in a new scene", zh: "让同一演员走进新场景" },
    access: {
      en: "Requires a signed-in Google account and supported image-editing access. Editing is limited to adults. Available models, quotas and paid features vary by account; check them before submitting.",
      zh: "需要已登录的 Google 账号并有图像编辑权限；编辑功能限成年人。可用模型、额度及付费功能随账号不同，提交前核对。",
    },
    steps: [
      prepare,
      {
        en: "Upload the actor reference in Gemini and ask to edit it. Use an image-capable model; this is an image-editing task, not a text description of the picture.",
        zh: "在 Gemini 上传演员参考图并要求编辑，选支持图像的模型；目标是编辑图片，不是只让它用文字描述图片。",
      },
      {
        en: "Paste the scene prompt below and submit. Change one part of the scene at a time when refining the result.",
        zh: "粘贴下方场景提示词并提交。继续修改时一次只改场景的一部分。",
      },
      inspect,
    ],
    prompt: still,
    troubleshoot: {
      en: "Restate which features should stay unchanged and request one specific edit. When the face changes, return to the original reference instead of building on the drifted result.",
      zh: "明确哪些特征保持不变，一次请求一项修改。脸发生变化时回到原参考图，不继续沿用已经偏离的结果。",
    },
    sources: [
      {
        label: "Google: generate and edit images in Gemini",
        url: "https://support.google.com/gemini/answer/14286560?hl=en",
      },
    ],
  },
  {
    id: "midjourney",
    tool: "Midjourney · Edit model",
    entry: "https://www.midjourney.com",
    ...check,
    goal: { en: "A character reference in a cafe scene", zh: "用角色参考图做咖啡馆场景" },
    access: {
      en: "Requires a Midjourney account and subscription. Check GPU time and image visibility settings; do not assume uploaded-image creations are private.",
      zh: "需要 Midjourney 账号和订阅。先核对 GPU 时长和作品可见性设置；不要默认上传图片做出的结果是私密的。",
    },
    steps: [
      prepare,
      {
        en: "Open Midjourney's image-editing tool. Add one actor picture as the character reference, not just as an example of its art style.",
        zh: "打开 Midjourney 的图片编辑工具，上传一张演员图作为角色参考，不要只把它当画风参考。",
      },
      {
        en: "Paste the scene prompt below and submit after checking your settings. Keep a single reference for this first attempt, then inspect the generated options.",
        zh: "粘贴下方场景提示词，核对设置后提交。第一次只用一张参考图，再逐张检查生成结果。",
      },
      inspect,
    ],
    prompt: still,
    troubleshoot: {
      en: "Use an Edit model reference for the character, not just a Style Reference. The latter carries visual style rather than the same character.",
      zh: "角色使用 Edit 模型参考，不要只放进 Style Reference；后者主要传达风格，不等于保留同一角色。",
    },
    sources: [
      {
        label: "Midjourney: Edit model",
        url: "https://docs.midjourney.com/hc/en-us/articles/48495453462797-Edit-Model",
      },
      {
        label: "Midjourney: plans",
        url: "https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans",
      },
      {
        label: "Midjourney: Editor visibility",
        url: "https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor",
      },
    ],
  },
  {
    id: "grok",
    tool: "Grok Imagine",
    entry: "https://grok.com/imagine",
    ...check,
    goal: { en: "Animate a still with a simple wave", zh: "从静态图做一个挥手动作" },
    access: {
      en: "Requires access to Grok Imagine. Sign in and check the video controls and your current allowance first; subscriptions or extra credits may be required. Web and API access are not interchangeable.",
      zh: "需要能使用 Grok Imagine。先登录并核对视频控件和当前额度；可能需要订阅或额外点数。网页权限与 API 权限不是一回事。",
    },
    steps: [
      prepare,
      {
        en: "Open Grok Imagine. Add the actor picture and choose to make a short video from it. The buttons may look different on your account.",
        zh: "打开 Grok Imagine，上传演员图，选择用它做一段短视频。你的账号里按钮可能不一样。",
      },
      {
        en: "Where a motion prompt is available, use the prompt below. Choose one short clip, confirm any charge and generate. Do not treat API options as options guaranteed in the web app.",
        zh: "界面可填写动作提示时用下方提示词。选一个短片、确认费用再生成；不要把 API 参数当成网页必有的选项。",
      },
      inspect,
    ],
    prompt: motion,
    troubleshoot: {
      en: "Keep one action and a fixed camera. Check the face, hands and any generated audio; a successful request alone does not mean the result is usable.",
      zh: "只保留一个动作和固定镜头。检查脸、手及生成的声音；请求成功不等于结果可用。",
    },
    sources: [
      {
        label: "xAI: Imagine video on Grok and API",
        url: "https://x.ai/news/grok-imagine-video-1-5",
      },
      { label: "Grok: access and usage limits", url: "https://docs.x.ai/grok/faq" },
    ],
  },
];
