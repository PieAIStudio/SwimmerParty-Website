# 下一轮 session 提示词（在 SwimmerParty-Website 目录下开）

把下面 `---` 之间的整段粘进去。

---

你现在在 `SwimmerParty-Website`。这是 PieAI 旗下合成演员厂牌 **SWIMMER PARTY** 的
官网，初稿骨架已经搭好并且已经上线（https://swimmerparty.vercel.app）。

**你的任务：把它推到极端。现在这一版是"结构对了、张力不够"。**

## 先读

1. `AGENTS.md`（路由）→ `docs/policy/best-practice-for-this-project.md`（项目硬规则）
2. `DESIGN.md`（设计系统 + 三个已经踩过的坑，别再踩一遍）
3. `docs/reference/execution/current-work.md`（当前进度与优先级）
4. `src/content/actors.ts`（名册数据模型）

## 定位（不要动）

**我们不找演员，我们造演员。** 名册上的人是产品，这个站是货架。演员有编号、
版本号、规格书、档期、可授权。所有设计决策先过这一条。

## 我要你做什么

### 1. 视觉极端化（P0，这是重点）

现在的问题：**排版和配色的方向是对的，但它还很"安静"。** 我要的是别人一进来
就觉得"我操，牛逼，这是新时代的东西"。

方向：更夸张、更商业、更未来、更年轻。颜色可以更狠，字可以更大更挤更歪，
留白可以更极端，动效可以更暴力。**不要往"高级克制"的方向收，往"张扬到嚣张"
的方向推。**

具体至少要做到：

- **滚动编排**。现在页面是"一段一段往下排"，太乖了。要有 pin / scrub / stacking /
  横向滚动 / 视差 / 元素在滚动中被拆解重组。至少 3 处让人"哦？"的滚动事件。
- **进场动效**。字要一个词一个词砸出来，卡片要错位切入，数字要跳。
  用 CSS 动画 + `IntersectionObserver`，或者装 GSAP（`gsap` + `ScrollTrigger`）。
  装 GSAP 的话记得先看 `docs/policy/shared-rules/brand-kit-first.md` 判断该不该装
  ——这是产品级动效库，装在产品仓库是对的。
- **排版张力**。现在标题只是"大"。我要 tracking 挤到负值、字宽轴 (`wdth`) 拉到
  极限、超大数字出血到画布外、文字被 3D canvas 遮挡/穿插、中英文咬合排版。
- **更多酸色**。四个强调色现在只在小面积用。敢不敢来整块荧光色区块、
  荧光色反白段落、色块与黑底硬切？
- **hover / cursor**。自定义光标、卡片磁吸、图片 RGB 分离、扫描线扫过。

### 2. 3D 加料（P0）

`src/three/` 现在是一个白膜站在网格上转圈。**先读 `DESIGN.md` 的「3D」一节，
里面有三条必须遵守的纪律和一个相机的坑。**

可以加：

- 白膜的**装配动画**——部件从四周飞入组装成人形。
- 让白膜**跟着鼠标转**，而不是匀速自转。
- **多个白膜**排成一排（名册墙），或者名册里每个"研发中"的演员对应一个白膜。
- 角色定妆板做成 **2.5D 视差平面**（图片贴在平面上，跟着指针轻微位移/景深）。
- 数据网格、体积光、粒子。

**不要**做的：不要为了"有 3D 感"去生成一个真的 3D 人物模型——现在没有 `.glb`，
硬做出来只会得到一个难看的塑料人，比现在的白膜差。白膜是**故意的**，它讲的是
"演员正在被制造"，和站点定位是一致的。`.glb` 的接口位已经留好了。

### 3. 角色占位（P1）

名册现在 4 个人：SP-01 胡谦、SP-02 齐满（都有定妆板）、SP-03 戴尔、SP-04 丁一
（白膜占位）。

**你可以自己编更多角色占位，随便编，编得越有戏越好。** 加到 `src/content/actors.ts`
就行。一个 8–12 人的名册比 4 个人像样得多。编的时候注意：

- 每个人要有**一句能立住的 tagline**，不要写"神秘的角色"这种废话。
- 职业要具体到可笑（外卖站长、殡仪馆化妆师、驾校教练、直播中控、
  婚庆司仪、开锁匠……），这是喜剧厂牌。
- `status` 决定页面表现，**必须诚实**：没生成定妆板的一律 `in-development`，
  页面会自动显示白膜和 `NO PLATE DELIVERED`。

### 4. 生成素材（P1）

`.agents/manual-skills/kling-cli/` 有可灵的完整用法。CLI 已登录，
**黑金会员，余额跑 `kling account` 看**。

已验证可用的配方（照抄）：

```bash
kling image_to_image \
  --image <参考图路径> --image <第二张参考图> \
  --model kling-image-v3_0_omni \
  --aspect_ratio 2:3 --img_resolution 2k --imageCount 2 \
  --poll 300 \
  "<prompt>"
```

踩过的坑，别重复：

- **绝对不要把 kling 的输出 pipe 给 `tail` / `head`**。JSON 会被截断，
  generationId 丢了就只能重新生成（重新扣费）。要么直接输出，要么重定向到文件。
- **必须给参考图**。纯文生图画十张就是十个不同的人。多参考图（最多 10 张）
  是保住同一张脸的唯一办法。
- prompt 里要写死不变量（脸、发型、服装、比例"strictly identical to the reference"）。
- 黑底出图要明确写 `seamless pure black backdrop` +
  `Do not show any lamp, tube, strip or light fixture in frame`
  ——否则模型会把 rim light 画成一根发光灯管。
- 出图后转 webp 再进 `public/`：
  `cwebp -q 86 in.png -o public/media/actors/<slug>/plate.webp`

还可以生成：三视图、表情组（neutral/awkward smile/worried/serious）、
造型组（推文里那种三角度 lookbook）、剧照、hero 底板（21:9）、
角色转台序列（`imageCount` 出多角度）、`image_to_video` 做 splash 循环。

### 5. 可用的技能

`.agents/manual-skills/` 里已经装好了，**自己选自己用**：

| 技能 | 什么时候用 |
| --- | --- |
| `industrial-brutalist-ui` | 蓝图/规格书/技术感排版，跟本站招牌视觉直接咬合 |
| `high-end-visual-design` | "贵"的质感 + 一整页反 AI 味黑名单 |
| `gpt-taste` | GSAP 动效编排 + 打破 LLM 的排版惯性 |
| `design-taste-frontend` | 反套版，先读需求再定方向 |
| `full-output-enforcement` | 禁止输出 `// ...` 这种省略 |
| `kling-cli` | 生图 / 生视频 |
| `threejs` `3d-web-experience` `webgl-3d-object` `img2threejs` | 3D |
| `brandkit` | 品牌视觉方向板 |

这几个技能里都有明确的 **banned AI clichés** 清单——照着执行，把 AI 味去干净。

## 不能碰的红线

1. **内容诚实。** 不摆假客户 logo、假播放量、假获奖、假出演记录、假合作方。
   没交付定妆板的演员必须显示白膜 + `NO PLATE DELIVERED`。
   有一条 Playwright 测试专门守这个，别把它改绿。
   （理由：这站要拿去谈商务，对方会核实。一个假 logo 被戳穿，整站可信度归零。）
2. **治理边界。** 受治理 Markdown 只在 `docs/**`。`src/content/**` 是产品内容，
   不要加 doc-gov frontmatter，不要搬进 `docs/**`。
3. **品牌 UI 库。** 2D UI 走 `@pieai/swimmer-ui-kit`。kit 不够用就去改
   `/Users/yuanfei/PieAI/SwimmerUIKit` 发新版本，不要在本仓库复制一份
   "差不多的"按钮。但 Hero、规格书、名册网格这类本站独有排版留在本仓库。
4. **3D 纪律。** 单渲染器、恰好一次 sRGB 编码、DPR 钳制、离屏停渲染。
   细节在 `DESIGN.md`。
5. **CSS 分层。** 自定义类必须写在 `@layer components` 里，
   否则会静默压掉 Tailwind 工具类。`DESIGN.md` 有解释。

## 验收

```bash
pnpm verify
```

必须全绿（typecheck + lint + format:check + build + playwright）。
改了 `docs/**` 还要 `pnpm docs:check`。

推到 `main` 会自动部署到 Vercel（已接好 Git），
生产地址 https://swimmerparty.vercel.app 。

**改完自己开浏览器看，别让我替你检查。** 至少看首页、`/actors`、
`/actors/hu-qian`、`/actors/dai-er` 四个页面，桌面和手机两个宽度。

## 最后

ultra think。别客气，往狠里做。这一版失败的方向是"做得太得体"。
