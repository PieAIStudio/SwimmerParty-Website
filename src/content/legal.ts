export const PRIVACY = {
  title: { en: "Privacy", zh: "隐私政策" },
  description: {
    en: "What SWIMMER PARTY collects, why, and how to get it deleted.",
    zh: "SWIMMER PARTY 收集什么、为什么收集、怎么删除。",
  },
  intro: {
    en: "Short version: we collect as little as we can, we never sell it, and we don’t show ads.",
    zh: "简单说：能不收集就不收集，从不出售，也没有广告。",
  },
  rows: [
    [
      "Who runs this",
      "SWIMMER PARTY is run by Pie AI Studio. Questions about your data: pieai@hotmail.com.",
      "谁在运营",
      "SWIMMER PARTY 由 Pie AI Studio 运营。关于你的数据，写信到 pieai@hotmail.com。",
    ],
    [
      "Browsing",
      "You can look around, play voices and download single files without an account.",
      "浏览",
      "不用账号就能浏览、听声音、下载单个文件。",
    ],
    [
      "Counting visits",
      "We use PostHog, without cookies, to see how the site is used. We don’t collect sensitive information such as your email, your posts or what you type.",
      "访问统计",
      "我们用 PostHog 了解网站的使用情况，不用 cookie。不采集敏感信息，比如你的邮箱、作品或输入的文字。",
    ],
    [
      "Download limit",
      "To stop abuse, our hosting provider counts download requests per network address for a short time.",
      "下载限速",
      "为了防止滥用，托管服务商会在短时间内按网络地址统计下载次数。",
    ],
    [
      "Your account",
      "When you sign in with your Swimmer account, we receive your account ID and your public display name.",
      "你的账号",
      "用泳者账号登录后，我们会收到你的账号 ID 和公开显示名。",
    ],
    [
      "What you post",
      "Links, titles, descriptions and recipes you post are public, with your display name. You can delete any post at any time.",
      "你发布的内容",
      "你发布的链接、标题、简介和做法，会带着你的显示名公开展示。你随时可以删除。",
    ],
    [
      "Cookies",
      "Only what the site needs: one to keep you signed in and one to remember your language.",
      "Cookie",
      "只用网站必需的 cookie：一个保持登录，一个记住语言。",
    ],
    [
      "Where it’s stored",
      "The site runs on Vercel. Accounts, posts, likes and votes are stored in our Supabase database. Actor files are stored with Vercel Blob. Servers are in the United States.",
      "存在哪里",
      "网站运行在 Vercel 上。账号、作品、点赞和投票存在我们的 Supabase 数据库里，演员素材存在 Vercel Blob。服务器在美国。",
    ],
  ],
} as const;
export const TERMS = {
  title: { en: "Terms of Use", zh: "使用条款" },
  description: {
    en: "The rules for using SWIMMER PARTY and its actors.",
    zh: "使用 SWIMMER PARTY 和演员的规则。",
  },
  intro: {
    en: "If something here conflicts with the law where you live, the law wins.",
    zh: "如果这里和你当地的法律冲突，以法律为准。",
  },
  rows: [
    [
      "These terms",
      "By using SWIMMER PARTY, you agree to these terms. The Free License is part of them.",
      "关于本条款",
      "使用 SWIMMER PARTY，就表示你同意本条款。《免费商用》授权是本条款的一部分。",
    ],
    [
      "The actors",
      "Our actors and their files are made by Pie AI Studio with AI tools and human review. You can use them under the Free License: free for any use, as long as you credit Swim In AI and follow its rules.",
      "演员",
      "我们的演员和相关文件由 Pie AI Studio 借助 AI 工具制作、经人工审看。你可以按《免费商用》授权使用：用在哪都免费，只要署上 Swim In AI 并遵守其中的规则。",
    ],
    [
      "Your account",
      "Keep your Swimmer account secure. You’re responsible for what happens under it.",
      "你的账号",
      "保管好你的泳者账号，账号下发生的事由你负责。",
    ],
    [
      "What you post",
      "You keep all rights to what you post. You confirm you made it, or have the right to post it, and that it follows the Free License.",
      "你发布的内容",
      "你发布的内容，权利全部归你。你确认它是你做的（或你有权发布），并且遵守《免费商用》授权。",
    ],
    [
      "What we remove",
      "We can remove posts that break these terms or the Free License, and we can hide reported posts while we look.",
      "我们会删什么",
      "违反本条款或《免费商用》授权的作品，我们可以删除；被举报的作品，我们查看期间可以先隐藏。",
    ],
    [
      "Copyright complaints",
      "If you think something here infringes your rights, write to pieai@hotmail.com with the link and the details.",
      "侵权投诉",
      "如果你认为这里的内容侵犯了你的权利，请写信到 pieai@hotmail.com，附上链接和说明。",
    ],
  ],
} as const;
