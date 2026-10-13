import type { L } from "../../content/actors/index.ts";

/** These are site actions; third-party generation is a separate, evidence-gated step. */
export const WORKFLOW_STEPS = {
  starter: [
    { en: "Choose a ready-to-cast actor and open their page.", zh: "选一位可用演员，打开档案页。" },
    {
      en: "Choose the starter pack and sign in with a free Swimmer account.",
      zh: "选择懒人包，并用免费泳者账号登录。",
    },
    {
      en: "Unzip the file. Keep the front views, prompt and credit information together.",
      zh: "解压文件，把正面参考图、提示词和署名说明保存在一起。",
    },
  ],
  sheet: [
    {
      en: "Open a character sheet for an actor with enough images.",
      zh: "为图片齐备的演员打开设定图页。",
    },
    {
      en: "Choose a preset or your own images. Check the preview and label language.",
      zh: "选预设或自选图片，检查预览及标签语言。",
    },
    {
      en: "Sign in and download the 4K PNG. Adding media creates a ZIP with the attachments.",
      zh: "登录后下载4K PNG；勾选声音或视频等附件时会得到ZIP。",
    },
  ],
  cast: [
    {
      en: "Add actors to Your cast. The list is saved in this browser.",
      zh: "把演员加入选角单，名单会保存在当前浏览器。",
    },
    {
      en: "Open Your cast and check which actors are included.",
      zh: "打开我的选角单，核对要使用的演员。",
    },
    {
      en: "Sign in and download the cast pack. Each actor has a separate folder.",
      zh: "登录并下载选角包，每位演员放在独立文件夹。",
    },
  ],
} satisfies Record<string, readonly L[]>;
