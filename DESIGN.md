# SWIMMER PARTY — Design System

## 一条规则

**舞台是黑的，数据是酸的。** 没有暖色，没有圆角，不道歉。

## Tokens

原始色值只允许出现在 `src/app/globals.css` 的 `@theme` 与 `:root` 块里。组件一律
引用 token，这样将来换主题能整站级联。

| 用途              | Token             | 值           |
| ----------------- | ----------------- | ------------ |
| 真黑（页面底）    | `--color-void`    | `#000000`    |
| OLED 黑（正文底） | `--color-black`   | `#050505`    |
| 面板              | `--color-carbon`  | `#0b0b0d`    |
| 发丝线            | `--sp-hairline`   | `bone / 12%` |
| **主强调色**      | `--color-acid`    | `#ccff00`    |
| 次强调色          | `--color-cyan`    | `#00e5ff`    |
| 警示 / 热点       | `--color-magenta` | `#ff1e7a`    |
| 第四色            | `--color-flare`   | `#ff4d00`    |

四个强调色不是装饰，是**身份**：名册上每个演员绑定一个，全站跟着他走。

## 字体

- **Display**：Archivo Variable（带 `wdth` 轴）。海报级标题用 `wght 900 / wdth 125%`。
- **Mono**：JetBrains Mono。所有标签、编号、规格值。
- **中文**：系统栈（PingFang SC / 微软雅黑）。**故意不上中文 webfont**——中文字库
  动辄 2–5 MB，PingFang 在 Mac/iOS 上本来就好看，这个取舍是专业选择不是偷懒。

被禁的字体：Inter、Roboto、Open Sans、Helvetica。

## 招牌视觉：暗底蓝图规格书

`src/components/SpecSheet.tsx`。定妆板放进一个**测量框**里：发丝级标注线、站位刻度、
角点十字线。

**所有标注都是 SVG 和真实文本画在图片上层，绝不烤进图里。** 这带来四个好处：
任意缩放都锐利、对屏幕阅读器和搜索引擎可读、写错了改文案不用重新生成像素、
可以做动效。

每个演员的身体站位（顶/肩/腰/膝/基线）是 `Actor.landmarks` 数据字段，因为定妆板是
手工构图的，写死一套常量在下一张板上就会漂。

## CSS 分层（一个踩过的坑）

自定义类必须写在 `@layer components` 里。Tailwind v4 输出
`@layer theme, base, components, utilities`，而**无层级的 CSS 优先级高于任何分层的
CSS**——一个无层级的 `.sp-mega { font-size }` 会静默压掉同一元素上的每一个
`text-[...]` 工具类。分层之后工具类才能正常覆盖。

## 3D

`src/three/`。R3F 独占这块 canvas 的渲染器，ACES 色调映射，**恰好一次** sRGB 编码。
刻意不用 `EffectComposer`——插进去会移动编码位置并静默洗白画面。

DPR 钳制 `[1, 1.75]`，粗指针设备降到 `[1, 1.35]`。滚出视口或标签页切走时停止渲染。

相机不要用 `onCreated` + `lookAt`：R3F 每次 resize 都会为默认相机重新执行配置并
重置朝向。要改构图就移动场景，不要动相机。

## SwimmerUIKit

本站通过 `[data-game-ui-theme='acid']` 消费 `@pieai/swimmer-ui-kit`。这套主题满足
kit 的 `GAME_UI_THEME_CONTRACT`，并额外覆盖了圆角、字体和投影——**光换颜色不够，
把游戏 HUD 变成工业界面的是形状那四行。**

这套主题是上游候选：等第二个产品需要同一种语言时，把它抽回 SwimmerUIKit 作为
一等主题，而不是让每个产品各自分叉。参见 `docs/policy/shared-rules/brand-kit-first.md`。

## 立场（这条决定内容，不只是视觉）

**只做动画角色，绝不做真人形象。** 名册上的人一眼就能看出是 CG，这是故意的。

这条不是文案，是约束，落在四个地方：

1. `src/content/doctrine.ts` 是唯一出处。首页酸色板块、`/pact` 第一部分、每张
   名册卡、每份规格书、页脚，全部引用同一份 `REFUSALS` / `STANCE_LINE` /
   `CG_BADGE`。一个立场被四种略有出入的说法讲出来就变成了营销，只讲一次才是规矩。
2. 所有 `promptSeed` 必须写 `Stylised 3D animated character … NOT photorealistic`
   并以 `do not render as a real human` 收尾。种子是给外人用的，它得自己带着这条。
3. `KIT_RULES` 里有一条明确禁止把角色做成真人。
4. Playwright 有一条测试守着首页和 `/pact` 上这段话还在。

写这条之前名册就已经是风格化 CG 了——顺序是这样，所以这话敢大声说。

## 多语言

`next-intl` v4 + `src/app/[locale]/**`，中间件是 Next 16 的 `src/proxy.ts`。

**只有 zh / en 两个人工语言。** 其余语言在切换器里是一排指向
`*.translate.goog` 的外链，并且在界面上明写「机器翻译」。理由：我们校得动两种，
校不动十种，把代理渲染当本地化摆出来和摆假 logo 是同一类问题。

- 人写的句子一律成对：JSON 在 `messages/{zh,en}.json`（由 `tools/gen-messages.py`
  从一份配对源生成，改文案改那个文件，不要手改 JSON），结构化内容在 `src/content/*.ts` 里写成 `{ en, zh }`。
- **不许中英混排。** 「VIEW ROSTER 看名册」这种按钮是被明令删掉的。
  例外只有两类：品牌名 `SWIMMER PARTY`，以及编号型术语（`SP-01`、
  `VERSION 6 / 10`、`UNITS: CM`）——那是图纸上的记号，不是句子。
  有两条 Playwright 测试分别断言 `/en` 正文不含 CJK、`/zh` 标题不含英文。
- 机器语言链接一律 `rel="nofollow"`，也不进 sitemap。
- 根路径按 `Accept-Language` 协商，`zh` 只是兜底。

## 中文海报字（第二个坑）

DESIGN.md 早就定了不上中文 webfont（字库 2–5 MB）。代价是 PingFang 最重只到
Semibold，`font-weight: 900` 会被合成，摆在 Archivo Black 旁边一眼就虚。

解法在 `.sp-zh-mega` / `.sp-zh-display`：用 `-webkit-text-stroke: 0.014em currentColor`
把重量补回来。描边用 `em`，所以跟着字号缩放，比换字体便宜得多。

拉丁文和中文因此走两套类，`<Mega>` 按 locale 自己选——调用方不需要知道。

## 动效

GSAP + ScrollTrigger（2025 年起全部免费，含 ScrollTrigger）。统一在
`src/motion/gsap.ts` 注册一次。

四个滚动装置：`ScrubStage`（首页 hero）、`HorizontalRail`（名册横滚）、
`StackDeck`（工序叠卡）、`VelocityMarquee`（跟滚轮变速的跑马灯）。

**两条纪律：**

1. **静止态写在 CSS 里，JS 只决定「什么时候」。** `.sp-word` / `.sp-reveal` /
   `.sp-clip` 的初始样式在样式表中，`Reveal` 只负责加 `.is-in`。这样慢网络不会闪
   一下已经就位的内容。
2. **失效要往「显示」的方向倒。** `<noscript>` 里有一段把所有动效元素还原成完成态；
   `ScrubStage` 也绝不预先把 `stageSignal.assembly` 设成 0——只有在 intro 补间真的
   开始跑的那一帧才拆开白膜。rAF 不跑（后台标签页、被拦的 bundle、受限 webview）
   时，人形是站着的，不是散成一地零件。

`ScrubStage` 用 CSS `position: sticky` 而不是 GSAP pin，并把进度写成一个自定义属性
`--p`，子元素用 `calc()` 跟着动——再加第五个动画元素，运行时成本是零。

横滚轨道必须自己带 `overflow` 裁剪：轨道有好几屏宽，没有裁剪祖先就会把整站撑出
横向滚动条。根节点用的是 `overflow-x: clip` 而不是 `hidden`——`hidden` 会让根变成
滚动容器，把页面上每个 `position: sticky` 都重新挂载到它身上，pin 全废。

## 3D（补充）

`stageSignal`（`src/three/signal.ts`）是 DOM 与 R3F 帧循环之间的可变桥。
刻意不用 React state：滚动和指针的频率远高于 React 有意义的重渲染频率。

白膜有两种形态，用途不同：

- **`WhiteModel`**（分件）——hero 的装配动画需要每个部件单独飞入。
- **`whiteModelGeometry()`**（合并）——名册墙一次画 12 个人形。24 组 × 2 mesh × 12
  是 576 个 draw call；合并之后一个人形一个 call，这才是这面墙在手机上跑得动的原因。
- **`<Mannequin />`**（SVG）——名册卡和未交付的规格书里那个 2D 白膜。12 张卡不可能
  各起一个 canvas；同一套比例画成内联 SVG，填的是「他现在真的就是个白膜」这件事，
  而不是一片什么都不说的斜纹。
