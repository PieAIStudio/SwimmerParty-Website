---
id: PLAN-SITE-ROUND-7-5-POLISH
title: 网站第 7.5 轮：打磨——统一弹窗、讲清是谁、去掉空格子、补齐文字
type: plan
status: active
canonical: true
owner: ai-assisted
created: 2026-10-09
last_reviewed: 2026-10-09
domain: product
tags:
  - polish
  - design
  - copy
  - trust
pinned: false
related:
  - PLAN-SITE-ROUND-7
  - PLAN-SITE-COPY-ROUND-7
  - PLAN-SITE-ROUND-8-DEEP-REFACTOR
---

# 网站第 7.5 轮：打磨

Claude 写，2026-10-09。第七轮做完以后、第八轮深度重构之前做。

**Owner 的要求**：

- 简洁高效、逻辑清楚；
- 让全世界的 AI 爱好者来了用得舒服、信得过；
- 文字由 Claude 写好，Codex 一字不改照抄。本计划第 3 节就是文字，缺字先停下来问 Claude。

**依据**：Claude 2026-10-09 在本地预览上逐页检查的结果，加上 `.devspace-reports/claude-acceptance-2026-10-08.md` 里还没修的项。

## 1. 设计

### 1.1 所有弹窗统一成一种朴素样式

现在的登录引导面板用的是液体弹层：整块青色大色块，黑色小胶囊排成一列，底部灰字压在青色上几乎看不清。Owner 认为它和网站其他地方不是一个风格。

**统一规则**，适用于所有弹窗：登录引导、下载面板、角色设定图、发布作品、举报、删除确认。

- **面板**：用 UIKit `GameDialog`，表面用 `bg-card`（和卡片同色），26px 圆角，不用液体、渐变或彩色底。
- **文字**：正文用前景色；次要文字用 muted 色，但在面板底色上的对比度至少 4.5:1（WCAG AA）。
- **列表**：好处、说明之类的列表写成带勾的清单（`GameIcon` check 加文字），不用胶囊。
- **按钮**：
  - 面板里**只有一个主按钮**，用液体样式的 primary `GameButton`，和首页"免费领取演员资产"那个按钮一样；
  - 其余按钮用 secondary，或者文字按钮。
  - 这条改掉了 `DESIGN.md` 里"弹层内按钮全部 secondary"的旧规定，`DESIGN.md` 同步改。
- **液体效果只留在三处**：primary 按钮、进度条液面、小的悬停提示。像版本记录这样的小弹出层，用和上面一样的朴素面板。
- **登录引导面板**照下面这个结构做：

  ```
  ┌───────────────────────────────────────┐
  │ Sign in to keep going             ✕   │
  │ Free with a Swimmer account, the one  │
  │ account for every Swim In AI project. │
  │                                       │
  │ ✓ Starter packs, full packs and ...   │
  │ ✓ No waiting between downloads        │
  │ ✓ 4K character sheets                 │
  │ ✓ Post your work, like and vote       │
  │                                       │
  │ [ Sign in with Swimmer ]  (液体主按钮) │
  │   Not now                  (文字按钮)  │
  │ By signing in you agree to ...        │
  └───────────────────────────────────────┘
  ```

### 1.2 名字统一用首字母大写

- **现状**：全站名字都是全大写（TANG YUNQIU），放在句子里像在喊，比如作品页的 "Starring TANG YUNQIU as He Jie"。
- **改法**：数据和显示都改成 "Tang Yunqiu" 这样的首字母大写。设计上确实想要大写效果的地方（比如卡片名字），用 CSS 的 `uppercase` 加字距实现，读屏软件读到的仍是正常写法。
- 中文名不变。

### 1.3 卡片和首页更简洁

- **演员卡片**：去掉版本号（版本只在演员页显示）。卡片上只留照片、名字、一句话；状态标签只给"新面孔"和"制作中"显示，"可出演"不再每张都标。
- **首页首屏**：
  - 去掉最上面那行小字 "SWIMMER PARTY · An open roster of AI actors"，只留"商用免费 · 署名 Swim In AI"徽标；
  - 数字条（99 位演员 · 263 张图 · 111 段声音）保留在首屏下面。
- **首页区块顺序**：
  1. 首屏和数字条；
  2. 认识他们（8 位，可出演的在前）；
  3. 商用也免费（三张示例卡）；
  4. 为什么每次都是同一个人；
  5. 作品（我们的和大家做的）；
  6. 最近更新；
  7. 我们的立场；
  8. 想要一位专属演员。
- **手机和平板**（宽度小于 1024px）：首屏的四张演员大卡片现在占了两屏多。改成一行四张的小卡片，或者可以横向滑动，首屏下面马上能看到正文。

### 1.4 新面孔不再铺空格子

- **资产库**：新面孔现在有 30 多个空格子，比如"转面 1/4、头像 0/3、表情 0/14"，还有 6 个空声音格、4 个空视频格。
  - 新面孔只显示已有的东西：试镜照和自我介绍声音；
  - 下面放一行说明（第 3.7 节文字）；
  - 视频区整块不显示。
- **演员页**：新面孔的一句话现在重复出现两次，改成一句话加简介，简介用第 3.6 节的模板。

### 1.5 对比度和可读性

- 全站检查文字对比度，正文和次要文字都至少 4.5:1；按钮文字也一样。
- 用 `@axe-core/playwright` 在 e2e 里做无障碍检查，作为开发依赖、精确版本，覆盖：首页、演员列表、演员页、资产库、免费商用、作品、选角单，加上登录引导面板打开的状态。

## 2. 要修的问题（上次验收还没修的）

| # | 问题                                                                                                         | 改法                                                                                     |
| - | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 1 | 95 位新面孔的声音接口返回 404（`/api/voice/<slug>/intro`），声音播不了                                         | 新面孔的声音是 `media-pack/library/voice/new-faces/<slug>/candidate-1.mp3`，接口要能返回 mp3 |
| 2 | **所有演员**的声音区都有 "In role: maid"、"In role: CEO"                                                       | 角色格位只按这位演员自己的角色造型生成，`{role}` 用角色名                                 |
| 3 | 工作室页还是最早的旧文案，"找我们合作"不在页面上，而 `/casting` 已经跳到这里                                  | 按第三版文案稿"工作室"一节，加第七轮文案稿第 10 节，整页换掉                              |
| 4 | 首页最后一块还是旧文案 "Use our Actors. License a roster actor… Three doors"，和免费商用矛盾                   | 换成第七轮文案稿第 3 节的"定制区"                                                         |
| 5 | 首页作品区说明还是旧的 "Nothing is listed before it exists."                                                 | 换成第七轮版本                                                                           |
| 6 | 选角单页的文字是 Codex 自己写的（"My cast / Put actors together…"）                                           | 用第七轮文案稿第 9 节                                                                     |
| 7 | 大图工具条缺"选中"和"下载这一张"，无障碍名还是 "Lightbox"                                                    | 照第五轮第 3.4 节，加上第三版补充一节的文字                                               |
| 8 | 游客点"下载"直接弹登录，看不到包里有什么                                                                     | 先打开下载面板，里面写清每个包的内容和大小；点打包选项时才弹登录                          |
| 9 | 新面孔主图名称不是 "Casting photo"                                                                            | 照第三版补充一节                                                                         |
| 10 | 首页标签页标题塞进了整段描述                                                                                 | 用第三版文案稿首页"页面标题"：SWIMMER PARTY — AI actors who stay the same               |
| 11 | 演员资料表用的是 "Origin"，可出演演员没有"语言"一行                                                          | 改成 "From"、"Speaks"                                                                     |

## 3. 文字（一字不改照抄）

### 3.1 登录引导面板

| 位置               | English                                                                       | 中文                                                         |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 说明（替换"正文"） | Free with a Swimmer account, the one account for every Swim In AI project.    | 用 Swimmer 账号登录，免费。这是 Swim In AI 所有项目通用的账号。 |
| 好处顺序           | 1 Starter packs… 2 No waiting… 3 4K character sheets 4 Post your work…        | 同英文顺序                                                   |
| 好处 2（覆盖）     | No waiting between downloads                                                  | 下载不用再等                                                 |

其他行（标题、好处 1、3、4、按钮、同意说明）保持第三版和第七轮文案稿的现有文字。

### 3.2 讲清楚我们是谁（页脚和免费商用页）

| 位置                     | English                                                                                                         | 中文                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 页脚，品牌一句话下面新增 | A Swim In AI project, made by Pie AI Studio.                                                                    | Swim In AI 旗下项目，由 Pie AI Studio 制作。                                                  |
| 版权行（覆盖）           | © {year} Pie AI Studio                                                                                          | © {year} Pie AI Studio                                                                       |
| 常见问题第 11 条：问     | Why credit Swim In AI and not SWIMMER PARTY?                                                                    | 为什么署 Swim In AI，不署 SWIMMER PARTY？                                                    |
| 常见问题第 11 条：答     | Swim In AI is our home. SWIMMER PARTY is one of its projects, and the credit helps people find all of them.     | Swim In AI 是我们的总站，SWIMMER PARTY 是其中一个项目。署 Swim In AI，大家能找到我们所有的项目。 |

- 页脚新增那句里的 "Swim In AI" 链接到 `https://swiminai.com`。
- 全站凡是写 "PieAI Studio" 的地方，统一成 "Pie AI Studio"（和官网一致）。

### 3.3 首页（覆盖）

| 位置         | English                                                                                                              | 中文                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 演员区眉标   | The roster                                                                                                           | 演员名单                                                           |
| 首屏眉标     | （删除）                                                                                                             | （删除）                                                           |

"认识他们"的眉标现在是 "Meet them"，和标题 "Meet the actors" 重复，改回上表。定制区、作品区说明照第七轮文案稿第 3 节。

### 3.4 演员的一句话（覆盖）

| 演员   | English                                                                         | 中文                                                         |
| ------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 唐韵秋 | The timid maid on camera. The one running the set off it.                       | 镜头前是胆小的女佣，镜头后整个片场归她管。                   |
| 罗米沙 | A Russian face with a Chongqing accent. Plays the CEO, eats hot pot like a local. | 长着俄罗斯脸，一开口是重庆话。戏里演总裁，戏外吃火锅比谁都地道。 |

### 3.5 作品页的角色名

| 位置                 | English                                                                                                   | 中文                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 《东游记》主演行     | Starring Tang Yunqiu as He Jie · Misha Luo as Dai Er · Zhang Qiang as the Director · Chen Wei as the Grip | 主演：唐韵秋 饰 何姐 · 罗米沙 饰 戴尔 · 张强 饰 导演 · 陈伟 饰 场务大哥 |

### 3.6 新面孔演员页

| 位置                       | English                                                                                                                   | 中文                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 简介模板                   | {name} is a new face at SWIMMER PARTY: {age}, from {origin}. One photo and one voice so far. The most wanted new faces get their full identity packs first. | {name}是 SWIMMER PARTY 的新面孔，{age} 岁，来自{origin}。现在有一张照片和一段声音；最受欢迎的新面孔会先补齐全套资料。 |

### 3.7 新面孔资产库

| 位置     | English                                                                    | 中文                                                         |
| -------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 一行说明 | So far: one casting photo and one voice. More comes when {name} is cast.   | 目前有一张试镜照和一段声音。{name}被选进项目后，再补齐其他资料。 |

### 3.8 还没有出演作品时（覆盖第三版"没有出演"）

| 位置 | English                                         | 中文                                   |
| ---- | ----------------------------------------------- | -------------------------------------- |
| 正文 | Not in a production yet. Use {name} in yours. It’s free. | 还没有出演作品。把{name}用进你的作品吧，免费。 |
| 链接 | Get the starter pack →                          | 领取懒人包 →                           |

## 4. 顺带

- 网站的 `media-pack/style/voice-rules.md`：保留"声音风格"部分，MiniMax 网页的操作步骤改成一句话，链接到 MediaFactory 的 `docs/reference/routes/minimax-web.md`（MediaFactory 重构报告提的要求）。
- 交付前全站搜一遍旧文案残留，至少搜这些词：`non-commercial`、`License a roster actor`、`Three doors`、`synthetic talent house`、`PieAI Studio`、`Nothing is listed before it exists`。搜索结果写进报告。

## 5. 闸门和报告

- `pnpm verify`、e2e（含 axe 无障碍检查）、`pnpm docs:check` 通过。
- **截图对比**：登录引导面板，以及首页首屏（桌面、手机），改前改后各一张。
- 一块一提交。
- 报告写进 `.devspace-reports/site-round-7-5/REPORT.md`，格式是"项目 → 状态 → 证据"。
- 不发布。

## 6. 追加（Owner 2026-10-09）：删掉多余的解释

Owner 的原则：用户不傻，看得出来的东西不用写；同一件事只在一个地方说。AI 写网站时总想多解释，这一节专门删。

### 6.1 删掉的东西

| 位置                         | 现状                                                     | 改成                                                                                     |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 演员页、卡片                 | "Animated · Not a real person / 动画角色 · 非真人"标签  | **删掉**。立场只在首页"我们的立场"那一块讲                                               |
| 页脚链接行                   | "隐私 → 条款 → 免费商用 →"                               | 只留"Privacy · Terms / 隐私 · 条款"，普通文字链接，**不带箭头**。免费商用已经在顶部导航里 |
| 页脚立场句                   | "Animated on purpose. Never photoreal, never a real person." | **删掉**                                                                             |
| 页脚品牌句                   | "An open roster of animated AI actors. Free for any use. Credit Swim In AI." | 改成第 6.2 节的短句                                              |
| 首页首屏正文                 | 末尾 "Free. Just credit Swim In AI." 和徽标重复          | 改成第 6.2 节的版本                                                                      |
| 首页"商用也免费"区           | 标题、说明加三张示例卡                                   | **删掉三张示例卡**，示例只放在免费商用页                                                  |
| 资产库导语                   | 又讲了一遍授权和登录好处                                 | 改成第 6.2 节的短句                                                                      |
| 资产库各区块说明             | "Reference views from every side." 这类说明              | **删掉**。只留两句有用的："自我介绍同时是参考音"和"视频陆续上线"                          |

**以后的规则**，写进 `DESIGN.md`：

- 不放说明显而易见事实的标签和句子；
- 同一个信息只在一个地方讲，其他地方放链接或者不提；
- 拿不准的时候，先删。

### 6.2 文字（一字不改照抄）

| 位置                 | English                                                                                                                  | 中文                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 页脚品牌句           | An open roster of animated AI actors.                                                                                    | 一份开放的 AI 动画演员名单。                                           |
| 首页首屏正文         | {count} original animated actors, each with images, a voice and a character prompt. Use them in films, ads, games, anything, even when you get paid. | {count} 位原创动画演员，每人都有图片、声音和角色提示词。拍片、做广告、做游戏都行，赚钱也行。 |
| 资产库导语           | Everything you can take: images, voice, video and text.                                                                  | 这里是可以拿走的全部资料：图片、声音、视频和文字。                     |

页脚保留第 3.2 节新增的 "A Swim In AI project, made by Pie AI Studio." 和联系方式。

### 6.3 名单重新导入

Owner 选了五位做全套：严琳、包满、雷乐、范一鸣、马乐。其中四位改了名字、slug 跟着变，马乐的身高改成 175 cm。

- **已经改好的**：
  - 名单源头 `media-pack/casting/new-faces-2026-10.py` 和 `new-faces-2026-10.json`；
  - 声音文件夹 `media-pack/library/voice/new-faces/<新 slug>/`。
- **要做的**：用现有工具重新生成网站的新面孔数据，删掉旧 slug 的目录：`yan-ruolin`、`bao-mancang`、`lei-dahai`、`you-jiale`。
- 正式站从没发布过这些人，所以**不需要跳转**。
- 这四位的占位声音里说的还是旧名字，等全套声音做完就会替换，暂时不用处理。

### 6.4 "同一个人"样片用什么工具

第七轮计划第 7 节的工具，定为：

- **图片**：ChatGPT；
- **视频**：Grok（网页版或命令行）。从懒人包的正面全身图做 5 到 10 秒的图生视频。

可灵、Seedance 这次不用。MediaFactory 本地的 H3 目前只是低分辨率预览，不拿来做展示样片。

每位可出演演员做 2 张图、1 段视频，照第七轮计划第 7 节发到"作品"里。Owner 的 Grok 是否已在 Codex 浏览器登录，开工前先确认。
