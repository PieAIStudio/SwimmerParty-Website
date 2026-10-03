---
id: PLAN-SWIMMER-FAMILY-REBUILD
title: 并入 Swimmer 家族的整站重构与演员资产库
type: plan
status: active
canonical: true
owner: ai-assisted
created: 2026-10-03
last_reviewed: 2026-10-03
domain: product
tags:
  - rebuild
  - uikit
  - assets
  - design
pinned: false
related:
  - ADR-2026-10-03-JOIN-SWIMMER-FAMILY
  - SPEC-ACTOR-ASSET-LIBRARY
  - REF-CURRENT-WORK
---

# 并入 Swimmer 家族的整站重构与演员资产库

本计划由 Codex 一次执行到底。决定见
[ADR](../../adr/2026-10-03-join-swimmer-family.md)，资产库合同见
[资产库 spec](../../specs/active/actor-asset-library.md)。本文写"怎么做"和"做成什么样"，
设计部分是验收标准，不是参考意见。

## 0. 执行规则（先读完再动手）

**阅读顺序**：`AGENTS.md` → ADR → spec → 本计划全文 → UIKit 3.0 的
`../SwimmerUIKit/docs/reference/` 下 `component-selection-guide.md`、`theme-and-liquid.md`、
`design-tokens.md`、`migration-3.0.md` → I18nKit 的
`../SwimmerI18nKit/docs/reference/integrations/upgrade-02.md` → AuthKit README 的
"Cross-product SSO (0.7)" 一节，以及示例 `../Directing/src/workspace/cloud-auth.ts`。

**工作方式**

- 从 `main` 新建分支 `rebuild/swimmer-family`，全部工作在这个分支。不提交到 `main`，**不推送**。
- 每完成一步至少提交一次。提交信息沿用现有格式（`feat(ui): …`、`refactor(three): …`、
  `docs(plan): …`），会经过 lefthook 检查。
- 每步结束运行该步的验收命令。失败就修；不跳过检查、不删除或放宽断言。
- 不部署，不运行 `vercel`，不调用任何云服务或付费模型，不需要也不寻找任何凭据。
  云端相关的代码通过本计划第 5 节的"模拟模式"在本地运行和测试。

**只有这些情况停下来写报告**

1. 候选包的 SHA-256 与第 6 节不符。
2. UIKit 3.0 缺少本计划依赖的组件，而且原生 HTML 无法合理替代。
3. 同一个失败连修三次仍不通过。
4. 需要凭据、云端操作或付费调用。

**禁止**

- 修改 `src/content/doctrine.ts` 的立场文案。
- 编造任何资产、客户、数据或作品进度。
- 拿生成图或占位图冒充演员资产。
- 手改 `messages/*/messages.json`。
- 复制或改写 UIKit 组件源码。
- 在组件里写裸颜色值；使用 `!important`。
- 引入第 6 节以外的依赖。

**设计拿不准时，选"更少"**：更少颜色、更少动效、更少装饰、更少字号。

## 1. 目标

1. 全站换成 Swimmer 家族外观：UIKit 3.0，灰阶风格，浅色/深色两套都完整。
2. 演员资产按"系列"框架齐备，可浏览、可点选、可单张或打包下载。
3. 游客每 30 秒下载一张高清图；Swimmer 账号登录后可多选、打包、拼图、按模型打包。
4. 胡谦、齐满的旧图作为"旧规格"入库；戴尔、何姐等资产为空，等 Owner 按规范出图。

## 2. 设计系统

### 2.1 一句话气质

**明亮的选角棚。** 干净的纸色背景，彩色的角色是全场唯一的颜色；控件是一按就轻轻
变形的平面水滴；每屏最多一颗潮汐液体按钮。安静、亲切、专业，像一家好好经营的
演员经纪公司的作品册，而不是科幻控制台。

### 2.2 明暗与风格

- `<html>` 上设置 `data-game-ui-theme="light|dark"` 与 `data-game-ui-style="grey"`。
  风格常量 `SITE_UI_STYLE = "grey"` 只写在 `src/lib/theme.ts` 一处。
- 首次访问跟随系统 `prefers-color-scheme`。用户切换后存在 `localStorage` 的 `sp-theme`。
  在 `<head>` 里放一段内联脚本，首帧前设置属性，避免闪烁：

  ```html
  <script>
    (function () {
      try {
        var s = localStorage.getItem("sp-theme");
        var t =
          s === "light" || s === "dark"
            ? s
            : matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";
        document.documentElement.setAttribute("data-game-ui-theme", t);
      } catch (e) {
        document.documentElement.setAttribute("data-game-ui-theme", "light");
      }
      document.documentElement.classList.add("js");
    })();
  </script>
  ```

  服务端默认输出 `light`，`<html suppressHydrationWarning>`。

- `viewport.themeColor` 改为两条：light `#fffdf8`，dark `#1f2326`（与 UIKit 页面底一致）；
  `colorScheme: "light dark"`。
- **只用灰阶风格。**
  - 不用 candy、pastel、mist、outline、ink。其中 outline、ink、mist、candy 有包边，Owner 明确不要。
  - 不用黏土图标（`GameAssetIcon`、`getClayIconPath`、`setClayAssetMode`、`swimmer-ui-assets`）。
  - 不用 `./liquid-effects`、`./preview`、`./liquid-presence`（涟）。
  - 液体只出现在 `GameButton variant="primary"`。

### 2.3 颜色

UIKit 3.0 的 light 下 `--game-ui-bg`、`--game-ui-panel`、`--game-ui-surface` 都是
`#fffdf8`，dark 下都是 `#1f2326`。所以层次由本站从文字色与底色调配，**只在
`src/app/globals.css` 的 token 块里定义**：

```css
:root,
[data-game-ui-theme="light"] {
  --sp-card: color-mix(in srgb, var(--game-ui-text) 4%, var(--game-ui-bg));
  --sp-muted: color-mix(in srgb, var(--game-ui-text) 8%, var(--game-ui-bg));
  --sp-sweep-top: color-mix(in srgb, var(--game-ui-text) 3%, var(--game-ui-bg));
  --sp-sweep-floor: color-mix(in srgb, var(--game-ui-text) 9%, var(--game-ui-bg));
  --sp-contact: rgb(0 0 0 / 0.2);
  --sp-header: color-mix(in srgb, var(--game-ui-bg) 86%, transparent);
}
[data-game-ui-theme="dark"] {
  --sp-card: color-mix(in srgb, var(--game-ui-text) 6%, var(--game-ui-bg));
  --sp-muted: color-mix(in srgb, var(--game-ui-text) 11%, var(--game-ui-bg));
  --sp-sweep-top: color-mix(in srgb, var(--game-ui-text) 9%, var(--game-ui-bg));
  --sp-sweep-floor: color-mix(in srgb, var(--game-ui-text) 4%, var(--game-ui-bg));
  --sp-contact: rgb(0 0 0 / 0.5);
  --sp-header: color-mix(in srgb, var(--game-ui-bg) 86%, transparent);
}

@theme inline {
  --color-background: var(--game-ui-bg);
  --color-foreground: var(--game-ui-text);
  --color-muted-foreground: var(--game-ui-text-muted);
  --color-card: var(--sp-card);
  --color-muted: var(--sp-muted);
  --color-border: var(--game-ui-border-subtle);
  --color-danger-ink: var(--game-ui-danger-ink);
  --font-sans: var(--game-ui-font-body);
  --font-display: var(--game-ui-font-display);
  --font-mono: var(--game-ui-font-mono);
}
```

- 站内代码只用这些颜色类：`bg-background`、`text-foreground`、`text-muted-foreground`、
  `bg-card`、`bg-muted`、`border-border`、`text-danger-ink`，以及 `.sp-sweep`。
- 不引入 UIKit 的 `tailwind.css` 桥：它把 card/muted 映射到与页面相同的颜色。
- 唯一允许的渐变：`.sp-sweep`（见 2.7）和 UIKit 自带的液体按钮。
- `text-danger-ink` 只用于"禁止"标记（`/kit` 规则、`/pact` 拒绝条款）。
- 演员不再有专属颜色：删除 `accent` 字段、`ACCENT_VAR` 和所有 `--sp-accent`。

### 2.4 字体与字号

- 在 `globals.css` 引入 `@pieai/swimmer-ui-kit/fonts.css`（Baloo 2 + Geist 拉丁子集）。
  删除 `next/font/google` 的 Archivo 与 JetBrains Mono。
- 标题用 `font-display`（Baloo 2），正文用 `font-sans`（Geist）。中文没有网络字体，
  自动落到系统字体（PingFang / 微软雅黑），沿用"不加载中文字库"的决定。
- `font-mono` 只用于编号（SP-01）、版本号、身高刻度数字。
- 删除 `.sp-zh-mega` / `.sp-zh-display` 的描边补重。中文标题用 700。

| 类名             | 用途         | 字号                              | 字重            | 行高              | 字距     |
| ---------------- | ------------ | --------------------------------- | --------------- | ----------------- | -------- |
| `.sp-display-xl` | 首页主标题   | `clamp(2.75rem, 6.5vw, 5.25rem)`  | 800（中文 700） | 1.02（中文 1.15） | -0.01em  |
| `.sp-display-lg` | 各页 h1      | `clamp(2.25rem, 4.8vw, 3.75rem)`  | 800（中文 700） | 1.05（中文 1.2）  | -0.005em |
| `.sp-title`      | 区块 h2      | `clamp(1.625rem, 2.6vw, 2.25rem)` | 700             | 1.15              | 0        |
| `.sp-subtitle`   | 卡片 h3      | `1.25rem`                         | 700             | 1.3               | 0        |
| `.sp-lead`       | 引言         | `1.125rem`                        | 400             | 1.7（中文 1.85）  | 0        |
| 正文（默认）     | 段落         | `1rem`                            | 400             | 1.65（中文 1.8）  | 0        |
| `.sp-small`      | 说明、注释   | `0.875rem`                        | 400             | 1.55              | 0        |
| `.sp-label`      | 眉标、字段名 | `0.8125rem`                       | 600             | 1.3               | 0.02em   |
| `.sp-code`       | 编号、数字   | `0.8125rem`，mono                 | 500             | 1.3               | 0        |

- 中文的行高规则用 `:lang(zh)` 选择器实现。
- 所有类写在 `@layer components`。**不在 CSS 里强制全大写。**
- **英文文案大小写**：`tools/gen-messages.py` 里英文侧的按钮、导航、眉标、标题，从
  全大写改为句首大写（`VIEW ROSTER` → `View roster`）。**只改大小写，不改用词。**
  编号和图纸记号保持原样：`SP-01`、`VERSION 6 / 10`、`UNITS: CM`、品牌名 `SWIMMER PARTY`。
- 依赖原大写文案的测试改为不区分大小写的匹配，断言含义不变。

### 2.5 布局与间距

- 内容最大宽度 `75rem`。左右留白：<640px 为 20px，640–1023px 为 32px，≥1024px 为 48px。
- 区块上下间距：手机 64px，桌面 96px。区块标题到内容 32px（桌面 40px）。
- 网格间距统一 `gap-6`（24px）；资产格子用 `gap-4`（16px），手机 `gap-3`。
- 断点用 Tailwind 默认：`sm` 640、`md` 768、`lg` 1024、`xl` 1280。
- 页头高 64px；资产页吸顶工具条紧贴页头下方。
- 区块标题组件 `SectionHead`：
  - 结构：眉标 `.sp-label text-muted-foreground` → h2 `.sp-title` → 说明 `.sp-lead text-muted-foreground max-w-[36rem]`。
  - 去掉原来的编号和发丝线装饰。

### 2.6 形状与表面

- **控件**：完全交给 UIKit（平面水滴，按下轻微变形）。不改控件的圆角、描边、阴影。
- **卡片**：`bg-card`，圆角 `var(--game-ui-radius-card)`（18px），内边距 24px（手机 20px）；
  无描边、无阴影。
- **大展示面板**（舞台、资产预览区）：圆角 `var(--game-ui-radius-panel)`（26px）。
- **状态标签** `.sp-pill`：
  - 尺寸：高 26px，左右 10px，全圆角，`bg-muted`，12px / 600。
  - 可出演：前面加一个 6px 实心圆点（`currentColor`）。研发中：`text-muted-foreground`。
  - 不用彩色标签。
- **发丝线**：1px `border-border`，只用于表格、定义列表的行分隔，不用来给卡片描边。

### 2.7 角色图呈现

- **摄影棚背景纸 `.sp-sweep`**：
  - `background: linear-gradient(180deg, var(--sp-sweep-top) 0%, var(--sp-sweep-top) 58%, var(--sp-sweep-floor) 100%)`，圆角同所在容器。
- **v1 透明图**：
  - 放在 `.sp-sweep` 里，`object-contain`。
  - 全身图贴底（`object-bottom`，上方留 4%），脚下加接地影 `.sp-contact`：
    `left:50%; bottom:3.5%; width:44%; height:3%; transform:translateX(-50%); background:radial-gradient(closest-side, var(--sp-contact), transparent); filter:blur(3px)`。
  - 头像图居中，不加接地影。
- **旧规格（legacy，黑底）**：
  - 当作照片，`object-cover` 填满容器，保留黑底。
  - 左上角放 `.sp-pill`"旧规格"，pill 底色用 `--sp-card`，保证在黑图上看得清。
- **研发中、没有图**：
  - 显示重绘的 `<Mannequin />` SVG 白膜剪影：填充 `var(--game-ui-text)`，不透明度 0.12，放在 `.sp-sweep` 上。
  - 配 `.sp-pill`"研发中"。
  - 不放任何生成图。
- 一律用 `next/image`，写准确的 `sizes`；不拉伸、不裁掉脚。
- **悬停**：图片 `scale(1.02)`，300ms；减少动态时不缩放。

### 2.8 组件对照

UIKit 组件只能在带 `"use client"` 的文件里使用。新建 `src/ui/kit.tsx`：首行
`"use client";`，**逐个具名**再导出本站用到的组件；服务端组件从这里引入。以 build 通过为准。

| 需要           | 用                             | 规则                                                                      |
| -------------- | ------------------------------ | ------------------------------------------------------------------------- |
| 普通动作       | `GameButton`（默认 secondary） | 复制、全选本组、清空、先不用                                              |
| 每屏唯一主操作 | `GameButton variant="primary"` | **只用于**：下载所选、开始下载、用 Swimmer 账号登录。导航永远不是 primary |
| 只有图标的动作 | `GameIconButton`               | `label` 必填：单张下载、切换明暗、菜单、关闭                              |
| 勾选           | `GameCheckbox`                 | 资产格子的选择                                                            |
| 二到四选一     | `GameSegmentedControl`         | 下载格式、标签语言、底色                                                  |
| 下拉           | `GameSelect`                   | 按模型打包的模型选择                                                      |
| 弹窗           | `GameModal`                    | 下载选项、登录邀请                                                        |
| 轻提示         | `GameToast`                    | 游客冷却、下载完成                                                        |
| 说明块         | `GameCallout`                  | "这位演员的资产还在制作中"                                                |
| 真实进度       | `GameProgress`                 | 只表示"已交付 / 必交 21"                                                  |
| 跳转           | `Link` + 文字 + 箭头图标       | 导航永远是链接，不用按钮。样式 `font-semibold`，悬停下划线                |
| 状态           | `.sp-pill`                     | 见 2.6                                                                    |

找不到对应组件时：先查 UIKit 的组件选择指南；仍没有，就用语义正确的原生元素加本站
token 样式，并写进报告。

### 2.9 图标

`src/ui/icons.tsx` 自带一组内联 SVG：

- 图标：`arrow-right`、`arrow-left`、`download`、`check`、`close`、`sun`、`moon`、
  `menu`、`copy`、`lock`、`external`。
- 规格：`viewBox 0 0 24 24`，`stroke="currentColor"`，`stroke-width 1.75`，圆头圆角，默认 20px，`aria-hidden`。
- 不引入图标库，不用 emoji，不用黏土图标。

### 2.10 动效

**保留**

- UIKit 控件自带的按压形变。
- `Reveal`：
  - 进入视口一次：透明度 0→1，`translateY(12px)`→0，480ms，`cubic-bezier(.2,.7,.2,1)`。
  - 同组子项依次延迟 60ms，最多 6 个。
  - 初始隐藏态只在 `html.js` 下生效，所以没有脚本时内容直接可见。
  - 删除原来的 `<noscript>` 样式。
- 图片悬停放大 1.02。
- 首页 3D 白黏土人形：加载时装配一次（≤1.4s），之后随指针轻微转动，偏航角 ±12°。

**删除**

- `gsap` 依赖，以及 `ScrubStage`、`HorizontalRail`、`StackDeck`、`VelocityMarquee`、
  `SlamText`、`CursorLayer`、`TiltPlate`。
- `.sp-grain`、扫描线、RGB 分离、`.sp-blink`、`.sp-hazard`、`.sp-crosshair`、
  `.sp-blueprint`、`.sp-slab` 等全部 ACID 效果类。

**`prefers-reduced-motion: reduce`**：没有位移和缩放；3D 直接呈现装配完成的静止姿态。

### 2.11 3D 白黏土

改 `src/three/`：

- **删除**：`wall` 模式、`ScanRing`、`Grid`、粒子、加色发光、雾、`mergedModel` 的墙用途。
  名册墙不再存在。
- **画布**：Canvas 用 `alpha: true` 透明清屏，放在 `.sp-sweep` 面板里。
  保留 ACES 色调映射和"只做一次 sRGB 编码"。
- **材质**：`MeshStandardMaterial`，`roughness 0.9`，`metalness 0`。
  - 颜色：light `#f3f1ec`，dark `#d9d5cd`。
  - 色值写在 `src/three/palette.ts` 的具名常量里。
- **灯光**：

  | 灯                                              | light                           | dark                            |
  | ----------------------------------------------- | ------------------------------- | ------------------------------- |
  | `hemisphereLight`（天 `#ffffff`，地 `#d9d4cb`） | 强度 1.0                        | 强度 0.6                        |
  | 主光 `directionalLight [-2.5, 4, 3]`            | 1.6，投影，mapSize 1024，软阴影 | 1.1，投影，mapSize 1024，软阴影 |
  | 补光 `directionalLight [3, 2, 2]`               | 0.35                            | 0.35                            |

- **接地影**：drei `ContactShadows`，`y=0`，`scale 3`，`blur 2.4`，`far 1.2`，
  不透明度 light 0.35 / dark 0.55。
- **装配动画**：用 `useFrame` 按时间插值替代 GSAP，部件 1.4s 缓出就位；减少动态时直接就位。
- **跟随明暗**：`useSiteTheme()` 钩子用 MutationObserver 监听 `data-game-ui-theme`。
- **用在哪**：首页主视觉；还没有图的演员的档案页主视觉。
  WebGL 不可用时退回 `<Mannequin />` SVG。
- **质量自查**（两套明暗各截一张图）：
  - 看起来是哑光白黏土人形：有柔和的明暗体积，不发光。
  - 身体高光不过曝（RGB 各通道 < 250）。
  - 接地影可见，没有闪烁或穿插。
  - 试三次仍达不到，就保留上述材质和灯光，在报告里写明。

### 2.12 不要做的事

1. 黑色舞台背景；荧光绿、青、洋红、橙这四种旧强调色。
2. 零圆角、方块卡片、卡片同时加描边和阴影。
3. 扫描线、颗粒噪点、RGB 分离、闪烁光标、警示斜纹、十字准星、蓝图网格。
4. 跑马灯、自定义鼠标、滚动劫持、钉住的横滚。
5. 全大写的英文界面文字；等宽字体正文；渐变文字；emoji 当图标。
6. 彩色状态标签；大面积毛玻璃（只有页头背景允许 12px 模糊）。
7. 包边风格、黏土图标、一屏两颗液体按钮、用液体按钮包导航链接。
8. 演员专属颜色。

### 2.13 明暗双检

每个页面在 light 和 dark 下都截图检查：

- 文字与背景对比 ≥ 4.5:1（`pnpm exec swimmer-ui-check src` 通过）。
- `.sp-sweep` 能和页面底区分开，接地影可见但不脏。
- 旧规格黑底图在浅色页面里边界清楚。
- 深色下没有刺眼的纯白大块；焦点环清晰可见。

## 3. 逐页设计

现有页面文案（`gen-messages.py` 与 `src/content/*`）**保持用词不变**，只按 2.4 改英文大小写。
只服务于已删除装饰的文案键（跑马灯等）连同组件一起删掉。新功能的文案用附录 C，
不要自己另写。

### 3.1 页头与页脚

**页头**：`position: sticky; top: 0`，高 64px，背景 `var(--sp-header)` 加 `backdrop-filter: blur(12px)`，
底部 1px `border-border`。

- 左：文字标志 `SWIMMER PARTY`，`font-display` 700，20px，链接到首页。
- 中左（≥1024px）：名册、作品、物料、工作室、合作。15px / 500，`text-muted-foreground`。
  当前页用 `text-foreground`，下方加一个居中的 4px 圆点。
- 右：
  - 明暗切换 `GameIconButton`（浅色时显示月亮，深色时显示太阳）。
  - 语言切换：保留现有逻辑。两个链接"中文 / EN"做成小药丸；机器翻译语言放进 `<details>` 下拉，继续标明"机器翻译"。
  - 登录后显示账号小药丸"已登录"，点开有"退出"。
- 手机（<1024px）：
  - 标志 + 明暗切换 + 菜单 `GameIconButton`。
  - 菜单是全屏面板（`bg-background`）：导航链接 `font-display` 32px，纵向间距 20px；
    底部放语言切换。
  - 面板打开时锁定页面滚动，`Esc` 关闭，焦点回到菜单按钮。

**页脚**：`bg-card`，上边距 96px。≥1024px 三列，手机单列：

1. 标志 + `SITE.claim` + 立场句（`STANCE_LINE`，保留）。
2. 导航，含每个演员的链接（保留"页脚链接每个演员"的行为）。
3. 联系邮箱、`/pact` 与 `/kit` 链接、版权年份。

### 3.2 首页 `/`

1. **主视觉**（桌面最小高度 82vh）：
   - ≥1024px 两栏（左文字 5/12，右舞台 7/12）；手机先文字后舞台，舞台高 56vh。
   - 文字：眉标 → h1 `.sp-display-xl`（`heroLines` 每行一个块）→ `heroBody`（`.sp-lead`，最大宽 32rem）
     → 两个链接："看名册 →"（`text-foreground`）与"找我们合作 →"（`text-muted-foreground`），间距 24px。
     **这里没有液体按钮**（两者都是导航）。
   - 舞台：圆角 26px 的 `.sp-sweep` 面板，里面是 3D 白黏土人形。
2. **数字条**：
   - 五个统计（在册、可出演、推翻过的版本、已交付定妆板、已开放物料），数字取自真实数据。
   - 数字 `font-display` 700 2.5rem，标签 `.sp-small text-muted-foreground`。
   - 桌面一行五个，手机两列；无分隔线。
3. **名册预览**：`SectionHead` + 演员卡片网格（桌面 4 列、平板 3 列、手机 2 列）。
   显示前 8 位，下方链接"全部 N 位 →"。
4. **立场块**：
   - 整宽 `bg-card` 圆角 26px，内边距 48px（手机 28px）。
   - 立场标题（h2，`.sp-display-lg`）+ CG 徽章 `.sp-pill` + 一句说明 + 链接到 `/pact`。
   - 必须保留现有立场文案（测试守着）。
5. **工序**：
   - 原来的叠卡改成 4 步：桌面 4 列，手机纵向。
   - 每步：`.sp-code` 编号 01–04 → `.sp-subtitle` → `.sp-small text-muted-foreground`。
6. **物料预告**：
   - 两栏。左边标题、说明和链接"打开物料包 →"。
   - 右边 3×2 小图网格：取已入库资产的预览图（目前是 SP-01 的旧规格三视图 + SP-02 正面）。
     不足 6 张就只显示已有的，不补占位。
7. **契约与片单**：两张并排的 `bg-card` 卡片，各含标题、两行说明、链接。
8. **收尾**：原结尾大字改成 `.sp-display-lg` 居中 + 链接到 `/casting`。

### 3.3 名册 `/actors`

- 页首：眉标 + h1 `.sp-display-lg` + 引言。不放 3D 墙。
- 两个区块：可出演、研发中（保持现有分组）。
- **演员卡片 `ActorCard`**（整张是一个链接）：
  - **图区**：比例 4:5，`.sp-sweep`，圆角 18px。按以下顺序取第一个存在的：
    1. v1 的 `face.front`；
    2. v1 的 `turnaround.front`（贴底加接地影）；
    3. 旧的 `portrait`（照片式填满）；
    4. 白膜剪影 + "研发中"。
  - **文字区**（上边距 14px）：
    - 第一行：`.sp-code` 编号 + 状态 `.sp-pill`，两端对齐。
    - 名字：中文页显示中文名（700，1.375rem）；英文页显示英文名（`font-display` 700，1.375rem）。
    - 简介：两行截断，`.sp-small text-muted-foreground`。
  - **悬停**：图片放大 1.02，卡片背景从透明变 `bg-card`，内边距不跳动（预留 8px 内边距）。
  - **焦点**：可见焦点环。

### 3.4 演员档案 `/actors/[slug]`

1. **主视觉**：
   - ≥1024px 两栏（舞台 7/12，信息 5/12）；手机先舞台（4:5）后信息。
   - **舞台**（`.sp-sweep`，圆角 26px）：
     - 有 v1 `turnaround.front`：透明全身图 + 接地影 + **身高刻度**。
       - 刻度：贴舞台左内边缘的 SVG。每 10cm 一条短刻度，每 50cm 一条长刻度加 `.sp-code` 数字。
       - 范围 0 到"身高 + 20cm"。0 对齐脚底（`solePct`），身高值对齐头顶（`crownPct`）。
       - 刻度线 `currentColor`，不透明度 0.35，`text-muted-foreground`。
       - 只有 `heightCm` 已知时才画。
     - 只有旧规格图：照片式填满，左上"旧规格"。
     - 都没有：3D 白黏土人形 + "研发中"。
   - **信息栏**：
     - 编号 + 状态药丸。
     - h1：中文页为"中文名（大）+ 英文名（`.sp-small` 灰）"，英文页反之。
     - 简介（`.sp-lead`）、CG 徽章药丸。
     - **规格表**：两列定义列表，字段名 `.sp-label text-muted-foreground`，值是正文，
       行间 1px 发丝线，行高 44px。
     - 角色说明段落。
     - "可出演类型"：一排 `.sp-pill`（不可点）。
     - 两个链接："打开资产库 →"（`font-semibold`）与"洽谈这位演员 →"。
2. **资产预览**：
   - `SectionHead`"资产"。
   - 一行最多 8 张已交付缩略图（`.sp-sweep` 小格，按系列顺序）。
   - 一条 `GameProgress`："基础包 {done}/21"。
   - 链接到资产库。
   - 没有任何资产时：`GameCallout`"这位演员的资产还在制作中。"
3. **角色种子**（有 `promptSeed` 时）：
   - `CopyBlock` 重做：`bg-muted` 圆角 18px 的卡片，mono 13px 正文，右上 `GameButton`"复制"。
   - 复制后按钮文字变为"已复制"，2 秒后恢复。
4. **下一位**：底部一行"下一位：{名字} →"。

研发中的演员：继续用文字明确"尚未交付"（测试守着），页面上不出现任何代替定妆板的图。
删除 `SpecSheet`、`ReferenceStrip`、`TiltPlate`。

### 3.5 物料包 `/kit`

1. 页首：眉标 + h1 + 引言。
2. **演员列表**：
   - 卡片网格（同 `ActorCard`），每张卡下方多一行"基础包 {done}/21"。
   - 链接到 `/kit/[slug]`。
3. **角色种子**：保留现有"已有种子的演员可复制"区块（测试守着 `SP-01 / CHARACTER SEED`），
   换成 3.4 的 `CopyBlock` 样式；没有种子的演员继续明写原文案。
4. **物料清单**（`KIT_MANIFEST`）：
   - 桌面 4×2 卡片，手机单列。
   - 每张：`.sp-code` 编号、标题、格式（`.sp-small` 灰）、说明、状态药丸。
   - 状态：
     - K-04 参考图组、K-05 表情组、K-06 造型组按资产清单计算：任一演员在对应系列
       （turnaround / expression / wardrobe）有已入库条目，才是"已开放"，否则保留原状态。
     - K-01–K-03 与 K-07、K-08 保持现状。
5. **使用规则**（`KIT_RULES`）：
   - 允许与禁止两组，各一张 `bg-card` 大卡片，内部是条目列表。
   - 允许条目前用 `check` 图标；禁止条目前用 `close` 图标，配 `text-danger-ink`。
   - 不用整块彩色底。

### 3.6 资产库 `/kit/[slug]`（核心页面）

静态生成每个演员 × 两种语言。服务端组件渲染全部格子；选择、下载、弹窗是客户端小岛。

**页首**

- 返回链接"← 物料包"。
- 演员小头像（64px 圆形 `.sp-sweep`，取 `face.front` 或 `portrait`）+ 名字 h1 `.sp-display-lg`
  - 编号 + "基础包 {done}/21"（`GameProgress`，宽 240px）+ CG 徽章。
- 引言（附录 C `assets.intro`）。

**吸顶工具条**（紧贴页头下方，背景 `var(--sp-header)`，加模糊，底部发丝线）：

- 左：系列锚点药丸（转面、面部、表情、服装、动作、细节、文字资料），点击滚到对应区块；
  没有内容的可选系列不显示。手机上可横向滑动。
- 右（≥768px）："已选 {count} 张" + `GameButton`"清空" + `GameButton variant="primary"`"下载所选"。
  未选时主按钮禁用（禁用时 UIKit 不画液体）。
- 手机：右侧这组改成底部固定条，只在选中 ≥1 张时出现，适配安全区。

**系列区块**：顺序为转面 → 面部 → 表情 → 服装（每套造型一个子区块）→ 动作 → 细节 → 文字资料。

- **区块标题行**：h2 `.sp-title` + `.sp-code` 计数"{done}/{total}" + 说明（附录 C）+
  右侧 `GameButton`"全选本组"（没有可选的格子时隐藏）。
- **网格**：
  - 全身系列（转面、服装、动作）：比例 2:3；桌面 4 列、平板 3 列、手机 2 列。
  - 头像系列（面部、表情、细节）：比例 1:1；桌面 6 列、平板 4 列、手机 3 列。
    表情区里基础 12 与技术态 2 排在前面；扩展表情有内容时，接在后面另起一行，前面加小标题"扩展"。
- **已交付格子**：
  - 外层 `.sp-sweep`，圆角 18px，图按 2.7 呈现。
  - 格子下方：格位名（13px / 600）；旧规格加"旧规格"药丸。
  - 左上 `GameCheckbox`，`aria-label`"选择 {格位名}"。
  - 右上 `GameIconButton`（download），`label`"下载这张"。
  - 点格子任何非按钮区域都切换选择。
  - 选中态：外圈 3px `var(--game-ui-text)` 实线描边，偏移 2px，复选框打勾。
    不放大，不改尺寸。
- **待交付格子**（只出现在必交系列）：
  - 同尺寸 `bg-muted` 圆角 18px，不可选、无按钮。
  - 中间是格位名 + `.sp-small text-muted-foreground`"待交付"。
  - 全身格放极淡的白膜剪影（不透明度 0.08），头像格不放剪影。
- **文字资料区**：
  - 角色种子 `CopyBlock`（有则显示；没有就写"形象尚未锁定，暂无种子"）。
  - `GameButton`"下载角色资料（JSON）"：浏览器端生成 `character.json`，游客也可以下载，不限速。

**游客**

- 单张下载走 API。成功后开始 30 秒冷却：
  - 冷却截止时间存 `localStorage` 的 `sp-guest-cooldown-until`。
  - 所有单张下载按钮禁用，按钮旁的小药丸显示剩余秒数。
  - 弹出 `GameToast`：附录 C 的 `assets.guestCooldown`，带"登录"动作。
- 服务端返回 429 时，按 `Retry-After` 同步冷却并显示同一提示。
- 游客可以勾选。点"下载所选"弹出**登录邀请** `GameModal`：
  - 标题 + 说明 + 同账号产品列表（来自 `swimmer-products.ts`）。
  - `GameButton variant="primary"`"用 Swimmer 账号登录" + `GameButton`"先不用"。
  - 关闭后保留选择。

**会员**：不显示冷却。点"下载所选"弹出**下载选项** `GameModal`，标题"下载 {count} 张"：

1. `GameSegmentedControl`：原图打包 / 拼成一张 / 按模型打包（每项下方一行说明，附录 C）。
2. 选"拼成一张"时：标签语言（不加 / 中文 / English）和底色（浅灰 / 白 / 深灰）两个
   `GameSegmentedControl`，以及一张缩小的实时预览（canvas 缩略，最大宽 100%）。
3. 选"按模型打包"时：`GameSelect` 选模型（GPT Image 2.5 / Veo 3.1 / Seedance 2.0）。
   超出上限时显示附录 C 的 `assets.overLimit`。
4. 底部：`GameButton`"取消" + `GameButton variant="primary"`"开始下载"。
   进行中按钮显示"准备中…"并禁用；完成后关闭弹窗，弹 `GameToast`"已开始下载"。

### 3.7 片单 `/works`、工作室 `/studio`、合作 `/casting`、契约 `/pact`、404

- **`/works`**：
  - 页首 + 两列 `bg-card` 卡片（手机单列）。
  - 每张：作品名 `.sp-subtitle`、状态 `.sp-pill`（SHOOTING / WRITING / DEVELOPMENT 的现有双语标签）、
    主演链接、一句梗概。
- **`/studio`**：
  - 页首（去掉 3D）。
  - 信念列表：两列编号条目（`.sp-code` + `.sp-subtitle` + 说明）。
  - 工序/技术栈：简单纵向列表。
  - 结尾一句 `.sp-display-lg`。
- **`/casting`**：
  - 页首 + 三张路线卡片（授权出演、定制演员、联合出品），桌面三列。
  - 联系区：邮箱链接 + `GameButton`"复制邮箱"。
  - 若 URL 带 `?actor=slug`，在联系区显示"关于：{演员名}"。
- **`/pact`**：
  - **第一部分（拒绝）**：`bg-card` 大卡片里的条目列表，每条前 `close` 图标 + `text-danger-ink`。
  - **论述**：长文排版，用 UIKit 阅读 token：
    `font-size: var(--game-ui-font-reading); line-height: var(--game-ui-line-reading); max-width: var(--game-ui-measure-reading)`。
  - **第二部分（条款表）**：原生 `<table>`，行间发丝线；"以正式合同为准"的格子用 `text-muted-foreground`。
- **404**：居中 `.sp-display-lg`（保留现有标题，测试守着"不在"）+ 一句说明 + 回名册链接。

## 4. 资产框架实现

### 4.1 演员数据 `src/content/actors.ts`

- **删除字段**：`accent`、`plate`、`views` 及相关常量和组件。
- **保留字段**：`portrait`，作为旧卡片头像，直到有 v1 `face.front`。
- **新增**：可选 `heightCm: number`。胡谦 178，齐满 165，何姐 163；其余不填。
- **新增演员 SP-13 何姐**：内容见附录 B，状态 `in-development`，`promptSeed: null`，不放任何图片。
- **戴尔（SP-03）保持现有文案不变。**
- 测试中"研发中的演员不能有图冒充"的断言继续覆盖戴尔。

### 4.2 词表

- 新建 `src/content/asset-series.json`，内容照抄附录 A。
- 新建 `src/content/asset-series.ts`：类型定义 + 读取函数：
  `listSeries()`、`slotsOf(seriesId)`、`requiredSlots()`（21 个）、`slotLabelKey(series, key)`。
- 标签键规则：`assets.series.<id>`、`assets.slot.<series>.<camelKey>`。
  `camelKey` 把连字符转驼峰（`three-quarter` → `threeQuarter`）。

### 4.3 资产清单

`src/content/assets/<slug>.json`，类型：

```ts
type AssetConformance = "v1" | "legacy";
type AssetItem = {
  slot: string; // "expression.tired" 或 "wardrobe.casual.front"
  series: string;
  key: string;
  look: string | null;
  conformance: AssetConformance;
  version: number; // 锚点版本，legacy 为 0
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  format: "png" | "webp";
  object: string; // 母版对象键，如 "hu-qian/v0/SP-01__turnaround__front__v0.webp"
  preview: string; // "/media/assets/hu-qian/turnaround.front.webp"
  thumb: string; // "/media/assets/hu-qian/turnaround.front.thumb.webp"
};
type ActorAssets = {
  code: string;
  slug: string;
  looks: { id: string; label: { en: string; zh: string }; prompt: string }[];
  items: AssetItem[];
};
```

读取模块 `src/content/assets.ts`：

- `getActorAssets(slug)`：没有文件时返回空清单。
- `coreProgress(slug)`：返回 `{ done, total: 21 }`。
- `itemsBySeries(slug)`。
- `firstImage(slug, order)`：按给定格位顺序返回第一个存在的条目，供卡片和档案页使用。

### 4.4 脚本（Node 24 直接运行 `.ts`，只用可擦除的类型语法）

**`pnpm assets:ingest <code> [--legacy] [--dry-run]`**（`tools/assets-ingest.ts`）

- **读取**：`assets-inbox/<code>/` 下的文件。
- **文件名**：
  - 普通：`{code}__{series}__{key}__v{n}.{png|webp}`。
  - 服装：`{code}__wardrobe-{look}__{key}__v{n}.png`。
  - 服装的 look 必须先登记在该演员清单的 `looks` 里，否则报错并说明怎么加。
- **v1 校验**：
  - PNG 格式。
  - 尺寸严格等于词表规定。
  - 有透明通道，四个角 8×8 像素区域的 alpha 全为 0。
  - series/key 在词表里。
  - 版本号与清单里已有的 v1 条目一致；或全部升一版，这时旧版本条目会被移除。
- **`--legacy`**：允许 WebP、任意尺寸、不透明，标记 `conformance: "legacy"`、`version: 0`。
- **输出**：
  - 预览 `public/media/assets/<slug>/<slot>.webp`：长边 1024，保留透明，质量 86。
  - 缩略 `<slot>.thumb.webp`：长边 384。
  - 母版复制到存储适配器（本地模式：`.assets-local/<object>`）。
  - 写入并排序 `src/content/assets/<slug>.json`。
- **`--dry-run`**：只校验，打印结果。
- **退出码**：任何校验失败都非零，并逐条说明原因。

**`pnpm assets:todo <code> [--all]`**（`tools/assets-todo.ts`）

- 列出缺少的必交格位（`--all` 时包括可选系列）。
- 每格给一段可直接粘贴给 GPT Image 2.5 的英文提示词，由附录 D 模板 + 词表指导拼成，
  并注明尺寸、透明背景、PNG。
- 同时写到 `assets-inbox/<code>/TODO.md`。

**测试**：`tools/*.test.ts` 用 Node 内置测试运行器（`node --test tools/`），新增脚本
`test:tools` 并加进 `verify`。夹具在 `tools/fixtures/` 里用 sharp 现场生成合成图，**不提交真实角色图**。

`.gitignore` 增加：`assets-inbox/`、`.assets-local/`、`.devspace-reports/`。

### 4.5 旧图入库（执行一次，结果提交）

1. 把 `public/media/actors/hu-qian/plate.webp`、`view-three-quarter.webp`、`view-side.webp`
   复制到 `assets-inbox/SP-01/`，分别命名为
   `SP-01__turnaround__front__v0.webp`、`SP-01__turnaround__three-quarter__v0.webp`、
   `SP-01__turnaround__side__v0.webp`；运行 `pnpm assets:ingest SP-01 --legacy`。
2. 齐满：`public/media/actors/qi-man/plate.webp` → `SP-02__turnaround__front__v0.webp`，同样入库。
3. 入库成功后删除原来的 `plate.webp` 与 `view-*.webp`，保留 `portrait.webp`；
   所有引用改用资产清单。
4. OG 图改用 `turnaround.front` 的预览图。

## 5. 下载、账号与限速

### 5.1 为什么用 Pages API

AuthKit 的服务端只接受 Node 的 `IncomingMessage` / `ServerResponse`，所以所有服务端
接口写在 `src/pages/api/**`（Next 的 Pages API，Node 运行时）。页面仍是 App Router，
保持静态生成。

### 5.2 适配器与环境变量

| 变量                                                                                                                      | 取值                | 本地默认           | 说明                    |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------ | ----------------------- |
| `ASSET_STORE`                                                                                                             | `local` / `blob`    | `local`            | 母版存储                |
| `ASSET_LOCAL_ROOT`                                                                                                        | 路径                | `.assets-local`    | 本地存储根目录          |
| `BLOB_READ_WRITE_TOKEN`（或 Vercel OIDC + `BLOB_STORE_ID`）                                                               | —                   | 无                 | 只在 `blob` 模式读取    |
| `ACCOUNT_MODE`                                                                                                            | `mock` / `swimmer`  | `mock`             | 登录                    |
| `SWIMMER_BACKEND_URL` `SWIMMER_PUBLISHABLE_KEY` `SWIMMER_OAUTH_CLIENT_ID` `SWIMMER_COOKIE_PASSWORD` `SWIMMER_ACCOUNT_URL` | —                   | 无                 | 只在 `swimmer` 模式读取 |
| `GUEST_LIMITER`                                                                                                           | `memory` / `vercel` | `memory`           | 游客限速                |
| `DEV_ASSET_SIGNING_SECRET`                                                                                                | 字符串              | 进程启动时随机生成 | 本地预签名              |

- 游客窗口 `GUEST_DOWNLOAD_WINDOW_SECONDS = 30` 是代码常量，写在 `src/lib/downloads.ts`。
- **防误用**：检测到运行在 Vercel（`process.env.VERCEL_ENV` 存在）时，`local`、`mock`、
  `memory` 一律拒绝：接口返回 503 并记录日志。生产环境绝不悄悄退回模拟模式。
- **`blob` 适配器**：Vercel Blob **私有**存储（`access: "private"`）。
  - 签出下载链接：服务端 `issueSignedToken({ pathname, operations: ["get"] })`，
    再 `presignUrl(token, { operation: "get", pathname, access: "private", validUntil: 现在 + 120 秒 })`。
    token 可缓存到快过期再换，避免每次请求都调控制 API。
  - 上传母版（入库脚本）：`put(pathname, bytes, { access: "private", contentType: "image/png", addRandomSuffix: false, allowOverwrite: true })`。
  - 先按 `@vercel/blob` 当前文档核实以上函数签名，以文档为准。
  - 只写代码和单元测试（模拟 SDK），**不实际连接**。
- **`swimmer` 账号适配器**：按 AuthKit README 与 Directing 示例配置 `createNodeAuth({ sso })`。
  只写代码并通过类型检查，**不实际连接**。
- **`vercel` 限速适配器**：用 `@vercel/firewall` 的 `checkRateLimit("guest-asset-download", …)`，
  以 IP 为键。先核实 SDK 的参数签名；需要 Web `Request` 时用 Node 请求头构造。

### 5.3 接口

- **`GET /api/assets/[slug]/[slot]/download`**
  - 会员：200 `{ url, filename }`，`url` 是 120 秒有效的签名链接。
  - 游客：先过限速。通过：200 `{ url, filename, cooldown: 30 }`。
    超限：429，返回 `{ retryAfter }` 并带 `Retry-After` 头。
  - 浏览器拿到后 `fetch(url)` → Blob → 用 `<a download={filename}>` 存盘，文件名可控。
  - 未知演员或格位：404。
  - 响应头一律 `Cache-Control: private, no-store`。
- **`POST /api/assets/[slug]/bundle`**，请求体 `{ slots: string[] }`，最多 64 个
  - 游客：401 `{ signIn: true }`。
  - 会员：200 `{ items: [{ slot, url, filename, width, height, series, key }] }`。
- **`/api/auth/*`**
  - `swimmer` 模式：交给 AuthKit 的 `handle()`。
  - `mock` 模式：`POST /api/auth/mock/sign-in`、`POST /api/auth/mock/sign-out`，
    用 HttpOnly cookie `sp_mock_member=1`。
  - 两种模式都提供 `GET /api/auth/session` → `{ user: null | { id } }`。
- **`GET /api/dev-assets/[...key]?exp=&sig=`**：只在 `local` 模式且不在 Vercel 时存在。
  校验 HMAC 和过期时间后返回文件，模拟 Vercel 签名链接。

### 5.4 客户端

- **`useAccount()`**：每次页面加载请求一次 `/api/auth/session`。
  - 登录：`swimmer` 模式跳到 AuthKit 的 `sso-start`，`redirectPath` 为当前页；
    `mock` 模式先 POST 再刷新。
- **原图打包**：浏览器用 `fflate` 生成 ZIP，文件名 `{code}_assets_{yyyyMMdd}.zip`，包含：
  - 各张原图，命名 `{code}_{series}-{key}.{ext}`；服装为 `{code}_wardrobe-{look}-{key}.{ext}`。
  - `character.json`：编号、中英文名、两种语言的简介/规格/说明、`heightCm`、格位清单。
  - `README-for-AI.txt`：英文，逐行写"Image N (filename): 说明"。
  - `LICENSE.txt`：当前语言的 `KIT_RULES` 全文 + 站点链接。
- **拼成一张**（canvas）：
  - 画布 3840×2160，边距 80px，格间距 40px。
  - 底色：浅灰 `#EDEDED`、白 `#FFFFFF`、深灰 `#2B2B2B`。
  - 排版：全身图（2:3）排在上方一行，占 60% 高度；头像图（1:1）在下方 40% 内排成网格。
    只有一类时用整张画布，选择使格子最大的列数。
  - 全身图贴格子底，头像居中，都按 contain 缩放。
  - 标签（选中文或 English 时）画在每格下方：36px，深色底用浅字，浅色底用深字；
    中文用系统字体，英文用 Geist。
  - 选"不加"时图上没有任何字。
  - 输出 PNG：`{code}_sheet.png`。
- **按模型打包**：上限写在 `src/content/export-targets.ts`，每项带 `verifiedAt`：
  - **GPT Image 2.5**（上限 16，2026-10 OpenAI 文档）：
    - 按优先级取原图：`face.front` → `turnaround.front` → `face.three-quarter` →
      `turnaround.three-quarter` → `turnaround.side` → `face.side` → `turnaround.back`
      → 选中的表情（按词表顺序）→ 其余。
    - 超出上限就截断。
  - **Veo 3.1**（恰好 3，2026-10 Google 文档）：
    1. `face.front` 原图（没有就用 `turnaround.front`）。
    2. 转面拼图（选中的转面；一张都没选就用全部已交付转面）。
    3. 表情拼图（选中的表情；一张都没选就用已交付的基础表情，最多 12 张，4×3）。
    - 拼图都不加字。
  - **Seedance 2.0**（上限 9，第三方资料，待官方核实）：优先级同 GPT Image。
  - 每种都附 `README-for-AI.txt`，整体打成 ZIP。
- **统计**：`@vercel/analytics` 的 `<Analytics />` 放进 layout。
  - 事件：`guest_download`、`member_download`、`bundle_download`（带 format）、
    `sign_in_prompt`、`sign_in_start`。
  - 本地不上报（SDK 默认行为）。
- **同账号产品**：`src/content/swimmer-products.ts`
  - 内容：`[{ id: "university", name: "University" }, { id: "directing", name: "Directing" }]`。
  - 注释写明核实日期 2026-10-03，以及"只有真正接入 Swimmer 账号的产品才能加入"。

## 6. 依赖

**删除**

- `gsap`。
- `@pieai/swimmer-ui-kit@1.3.2`。
- `next/font/google` 的 Archivo 与 JetBrains Mono 用法。

**升级**

- `@pieai/swimmer-i18n-kit` 升到 `0.2.0`（已发布）。
- 若 pnpm 的发布时长策略阻止安装，仿照 `pnpm-workspace.yaml` 现有写法加精确排除项。

**候选包**（本机兄弟目录，只用于本分支开发；正式发布后换成 npm 版本号）

```sh
shasum -a 256 ../SwimmerUIKit/.scratch/s6/final/swimmer-ui-kit-3.0.0.tgz
# 必须是 267c29288681e8d1b98955631afe00c6db24c852c817be73d28885e3970103b3
shasum -a 256 ../SwimmerAuthKit/.devspace-reports/uikit3-compat-20261002/release/swimmer-auth-kit-0.8.0-rc.0.tgz
# 必须是 186aa52a845d6735ce984e61552a7bdc0901def77e6692e9f361e61f4898a76b
```

- 用相对路径的 `file:` 引用这两个 tarball。**不要把 tarball 复制进仓库**：本仓库是公开仓库，
  AuthKit 是私有包。
- AuthKit 服务端需要的对等依赖（如 `@supabase/ssr`）按其 `package.json` 声明安装，精确版本。

**新增**（精确版本）

- `fflate`、`@vercel/blob`、`@vercel/firewall`、`@vercel/analytics`。
- 开发依赖 `sharp`。

## 7. 执行步骤

每步末尾的命令都要通过才能进入下一步。

本地执行清单（计划暂留 active，等待 Owner 审阅，不代表获准发布）：

- [x] 第 0 步：依据首提交、候选校验和基线验证。
- [x] 第 1 步：UIKit、主题与语言地基。
- [x] 第 2 步：全站与 3D 换装及截图。
- [x] 第 3 步：资产框架、旧图迁入、何姐与进度。
- [x] 第 4 步：双语演员资产页与 sitemap。
- [x] 第 5 步：本地下载、模拟账号与会员导出；完整 verify 通过。
- [x] 第 6 步：DESIGN / README / current-work 收口与文档门禁。
- [x] 第 7 步：最终门禁、完整截图与中文报告。

### 第 0 步：准备

- 新建分支，读完第 0 节列出的文档。
- 运行 `pnpm verify`，把基线结果记进报告草稿。

### 第 1 步：地基

1. 按第 6 节核对并安装依赖，删掉旧依赖。
2. 新建 `src/ui/kit.tsx`、`src/ui/icons.tsx`、`src/lib/theme.ts`；实现明暗系统（内联脚本、
   切换按钮、`useSiteTheme`）。
3. 重写 `globals.css`：
   - 删除 ACID 的 token 块、`acid` 主题和全部效果类。
   - 引入 UIKit 的 `styles.css` 与 `fonts.css`。
   - 加入 2.3 的 token、2.4 的字号类、2.6 / 2.7 的表面类。
4. layout 去掉 `next/font`、`CursorLayer`、`noscript`；设置 `data-game-ui-style`。
5. I18nKit 0.2 迁移：按 upgrade-02 检查实例创建与 Provider 用法，重新生成消息合同。

验收：`pnpm check:i18n && pnpm typecheck && pnpm build`，`pnpm exec swimmer-ui-check src`
通过。提交 `feat(ui): adopt UIKit 3.0 foundation and light/dark theme`。

### 第 2 步：全站换装

1. 按第 3 节重做页头、页脚和全部页面。
2. 删除第 2.10 节列出的动效组件和 GSAP。
3. 按 2.11 重做 3D。
4. 按 2.4 改英文文案大小写（只改 `gen-messages.py`，重新生成）。
5. 删除不再使用的组件和文案键。
6. 更新受影响的测试匹配方式，不削弱含义。

验收：`pnpm verify` 全绿。运行截图脚本：17 个目标 × 2 明暗 × 2 宽度（390、1440），
存到 `.devspace-reports/swimmer-family-rebuild/step2/`，按 2.13 逐张自查并改完。
提交 `feat(ui): rebuild every page in the Swimmer family style`。

### 第 3 步：资产框架

1. 按 4.1–4.4 完成数据、词表、清单读取、两个脚本和脚本测试。
2. 按 4.5 迁入旧图。
3. 加入何姐。
4. `/kit` 清单状态改为按资产计算。

验收：`pnpm test:tools && pnpm verify`；`pnpm assets:todo SP-03` 能输出 21 条带提示词的待办。
提交 `feat(assets): series framework, ingest pipeline and legacy import`。

### 第 4 步：资产库页面

1. 实现 3.6 的 `/kit/[slug]`，以及档案页与 `/kit` 上的资产入口。
2. sitemap 加入 `/kit/[slug]`。

验收：`pnpm verify`；资产页截图（SP-01 有图、SP-03 全空）两套明暗 × 两种宽度。
提交 `feat(kit): per-actor asset library`。

### 第 5 步：下载、账号、导出

1. 实现第 5 节全部内容和第 8 节的端到端测试。
2. Playwright 的 `webServer.env` 设置 `ASSET_STORE=local`、`ACCOUNT_MODE=mock`、
   `GUEST_LIMITER=memory`、`ASSET_LOCAL_ROOT=e2e/fixtures/assets-store`。
3. 资产字节在测试里用 `page.route` 返回合成夹具图。

验收：`pnpm verify`。提交 `feat(downloads): guest cooldown, Swimmer sign-in and member packs`。

### 第 6 步：文档收口

1. **重写 `DESIGN.md`**：把第 2 节压缩成现行设计系统说明（这是设计的唯一现行来源），
   删除 ACID 内容；ADR 保留历史原因。
2. **`README.md`**：更新技术栈、多语言版本、资产与下载说明。
3. **`docs/reference/execution/current-work.md`**：
   - 当前焦点改为"重构已完成本地开发，等待 UIKit 3.0 / AuthKit 0.8 联合发布与资产出图"。
   - 下一步表格更新。
   - 删除已取消的"acid 主题上游"一项。
4. **本计划**：勾掉完成项。
5. 运行 `pnpm doc-gov scan` 与 `pnpm docs:check`。

提交 `docs: converge design, readme and current work after the rebuild`。

### 第 7 步：最终验证与报告

- 运行 `pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src`、`pnpm test:tools`。
- 做最终截图全集，写报告（第 9 节）。不推送。

## 8. 测试清单

**保留并按需改匹配方式**：现有 `e2e/smoke.spec.ts` 与 `e2e/native-i18n.spec.ts` 的全部断言含义。

**新增**

1. 明暗：无存储时跟随系统；切换后刷新保持；`<html>` 属性正确；两种明暗下首页无控制台错误。
2. 资产页（zh / en）：
   - SP-01 显示 3 张旧规格转面、"基础包 3/21"、"旧规格"标记。
   - SP-03 显示 21 个"待交付"格子，没有任何 `img`。
3. 游客单张下载：
   - 第一次 200，返回 `url` 与 `filename`。
   - 立即第二次 429，带 `Retry-After`。
   - 界面出现冷却提示和登录动作。
4. 游客点"下载所选"弹出登录邀请，邀请里只列 University 与 Directing。
5. 模拟登录后：
   - 打包接口返回签名链接列表。
   - 原图打包触发下载，ZIP 里包含 `character.json`、`README-for-AI.txt`、`LICENSE.txt`。
6. 拼成一张：PNG 尺寸 3840×2160。选"不加"时不调用任何文字绘制（对 canvas 的 `fillText` 计数为 0）。
7. 按模型打包：Veo 恰好 3 个图片文件；选 20 张时 GPT Image 为 16 张、Seedance 为 9 张。
8. 防误用：设置 `VERCEL_ENV=preview` 且 `ACCOUNT_MODE=mock` 时，下载接口返回 503（可用接口层单元测试）。
9. sitemap 含每个演员的 `/kit/[slug]`（两种语言）。
10. `/kit` 清单的"已开放"与资产清单一致（K-04 已开放，因为 SP-01 有转面）。

## 9. 报告

写到 `.devspace-reports/swimmer-family-rebuild/REPORT.md`（不提交），截图放同目录。

报告用中文，结构固定：

1. 结论：每一步是完成、部分完成还是受阻，各一句话。
2. 提交列表（hash + 信息）。
3. 命令与结果：每条验收命令的最终输出摘要；失败过的写原因和修法。
4. 截图索引：页面 × 明暗 × 宽度，标出自查发现并修掉的问题。
5. 与计划不同的地方：做了什么、为什么。
6. 3D 白黏土的最终效果说明（是否达到 2.11 的标准）。
7. 未做或未验证的事项（必须如实列出）。
8. 需要 Owner 或下一位审阅者处理的事。

## 附录 A：`src/content/asset-series.json`

```json
{
  "version": 1,
  "frames": {
    "full": { "width": 1536, "height": 2304, "crownPct": 5, "solePct": 96 },
    "head": { "width": 1920, "height": 1920, "eyeLinePct": 42 }
  },
  "series": [
    {
      "id": "turnaround",
      "frame": "full",
      "required": true,
      "perLook": false,
      "prompt": "Framing: {direction}. Crown of the head at 5% and soles of the feet at 96% of the image height, horizontally centered.",
      "slots": [
        {
          "key": "front",
          "required": true,
          "direction": "full body, facing the camera directly, relaxed natural standing pose, arms hanging slightly away from the body"
        },
        {
          "key": "three-quarter",
          "required": true,
          "direction": "full body, body and face turned 45 degrees toward the character's right, relaxed standing pose"
        },
        {
          "key": "side",
          "required": true,
          "direction": "full body, exact profile facing left, relaxed standing pose"
        },
        {
          "key": "back",
          "required": true,
          "direction": "full body, facing directly away from the camera, relaxed standing pose"
        }
      ]
    },
    {
      "id": "face",
      "frame": "head",
      "required": true,
      "perLook": false,
      "prompt": "Framing: {direction}. Eyes at 42% of the image height, horizontally centered.",
      "slots": [
        {
          "key": "front",
          "required": true,
          "direction": "head and shoulders, facing the camera directly, neutral relaxed expression"
        },
        {
          "key": "three-quarter",
          "required": true,
          "direction": "head and shoulders, head turned 45 degrees toward the character's right, neutral relaxed expression"
        },
        {
          "key": "side",
          "required": true,
          "direction": "head and shoulders, exact profile facing left, neutral relaxed expression"
        }
      ]
    },
    {
      "id": "expression",
      "frame": "head",
      "required": true,
      "perLook": false,
      "prompt": "Framing: head and shoulders, facing the camera directly, eyes at 42% of the image height, horizontally centered. Expression: {direction}.",
      "slots": [
        {
          "key": "neutral",
          "required": true,
          "tier": "core",
          "direction": "relaxed resting face, mouth closed, calm open eyes"
        },
        {
          "key": "smile",
          "required": true,
          "tier": "core",
          "direction": "gentle closed-mouth smile with a slight lift of the cheeks"
        },
        {
          "key": "laugh",
          "required": true,
          "tier": "core",
          "direction": "big open-mouth laugh, eyes squeezed into crescents, head tipped slightly back"
        },
        {
          "key": "sad",
          "required": true,
          "tier": "core",
          "direction": "downturned mouth, inner eyebrows raised, glossy eyes, no tears"
        },
        {
          "key": "cry",
          "required": true,
          "tier": "core",
          "direction": "crying with visible tears, mouth open and trembling, eyebrows pulled up and together"
        },
        {
          "key": "annoyed",
          "required": true,
          "tier": "core",
          "direction": "irritated frown, lips pressed together, eyes narrowed"
        },
        {
          "key": "angry",
          "required": true,
          "tier": "core",
          "direction": "furious, eyebrows pulled down hard, shouting with teeth visible, nostrils flared"
        },
        {
          "key": "surprised",
          "required": true,
          "tier": "core",
          "direction": "eyebrows raised high, eyes wide open, mouth open in a round O"
        },
        {
          "key": "scared",
          "required": true,
          "tier": "core",
          "direction": "frightened, eyes wide with whites showing, eyebrows up and together, mouth stretched sideways"
        },
        {
          "key": "disgusted",
          "required": true,
          "tier": "core",
          "direction": "nose wrinkled, upper lip raised, head pulling back slightly"
        },
        {
          "key": "embarrassed",
          "required": true,
          "tier": "core",
          "direction": "awkward embarrassed grin, eyes glancing to the side, shoulders slightly raised"
        },
        {
          "key": "tired",
          "required": true,
          "tier": "core",
          "direction": "exhausted, heavy half-closed eyelids, slack mouth, slight slump"
        },
        {
          "key": "speaking",
          "required": true,
          "tier": "technical",
          "direction": "mid-sentence on an open 'ah' sound, teeth and tongue naturally visible"
        },
        {
          "key": "eyes-closed",
          "required": true,
          "tier": "technical",
          "direction": "eyes gently closed, relaxed neutral face"
        },
        {
          "key": "worried",
          "required": false,
          "tier": "extended",
          "direction": "eyebrows pinched upward, lips tight, uneasy eyes"
        },
        {
          "key": "skeptical",
          "required": false,
          "tier": "extended",
          "direction": "one eyebrow raised, sideways glance, slight frown"
        },
        {
          "key": "smug",
          "required": false,
          "tier": "extended",
          "direction": "half-lidded eyes, one-sided satisfied smirk"
        },
        {
          "key": "contempt",
          "required": false,
          "tier": "extended",
          "direction": "one corner of the mouth pulled up and back, chin slightly raised"
        },
        {
          "key": "confused",
          "required": false,
          "tier": "extended",
          "direction": "head tilted, uneven eyebrows, mouth slightly open"
        },
        {
          "key": "thinking",
          "required": false,
          "tier": "extended",
          "direction": "eyes looking up and to the side, lips pursed"
        },
        {
          "key": "determined",
          "required": false,
          "tier": "extended",
          "direction": "eyebrows lowered and steady, jaw set, direct gaze into the camera"
        },
        {
          "key": "shy",
          "required": false,
          "tier": "extended",
          "direction": "eyes lowered, small closed-mouth smile, head tucked slightly"
        },
        {
          "key": "pain",
          "required": false,
          "tier": "extended",
          "direction": "wincing, eyes squeezed shut, teeth clenched"
        },
        {
          "key": "sleepy",
          "required": false,
          "tier": "extended",
          "direction": "drooping eyelids, the start of a yawn"
        },
        {
          "key": "awkward-smile",
          "required": false,
          "tier": "extended",
          "direction": "forced polite smile that does not reach the eyes"
        },
        {
          "key": "deadpan",
          "required": false,
          "tier": "extended",
          "direction": "completely flat expression, direct stare, no emotion"
        }
      ]
    },
    {
      "id": "wardrobe",
      "frame": "full",
      "required": false,
      "perLook": true,
      "prompt": "Wardrobe: {look}. Framing: {direction}. Crown of the head at 5% and soles of the feet at 96% of the image height, horizontally centered.",
      "slots": [
        {
          "key": "front",
          "required": false,
          "direction": "full body, facing the camera directly, relaxed natural standing pose"
        },
        {
          "key": "three-quarter",
          "required": false,
          "direction": "full body, turned 45 degrees toward the character's right, relaxed standing pose"
        },
        {
          "key": "side",
          "required": false,
          "direction": "full body, exact profile facing left, relaxed standing pose"
        },
        {
          "key": "back",
          "required": false,
          "direction": "full body, facing directly away from the camera, relaxed standing pose"
        }
      ]
    },
    {
      "id": "pose",
      "frame": "full",
      "required": false,
      "perLook": false,
      "prompt": "Framing: {direction}. The whole figure inside the frame with a small margin, horizontally centered.",
      "slots": [
        {
          "key": "walk",
          "required": false,
          "direction": "full body at a three-quarter angle, mid-stride walking, natural arm swing"
        },
        {
          "key": "run",
          "required": false,
          "direction": "full body at a three-quarter angle, running mid-stride, arms pumping"
        },
        {
          "key": "sit",
          "required": false,
          "direction": "full body at a three-quarter angle, sitting on a simple plain stool, hands resting on the knees"
        },
        {
          "key": "point",
          "required": false,
          "direction": "full body at a three-quarter angle, pointing forward with the right hand"
        },
        {
          "key": "arms-crossed",
          "required": false,
          "direction": "full body at a three-quarter angle, standing with arms crossed"
        },
        {
          "key": "phone",
          "required": false,
          "direction": "full body at a three-quarter angle, holding a smartphone to the ear and talking"
        }
      ]
    },
    {
      "id": "detail",
      "frame": "head",
      "required": false,
      "perLook": false,
      "prompt": "Framing: close-up, {direction}, centered.",
      "slots": [
        {
          "key": "hands",
          "required": false,
          "direction": "both hands, palms and backs visible, skin and nails matching the character"
        },
        {
          "key": "hair-back",
          "required": false,
          "direction": "the back of the head showing the full hairstyle"
        },
        {
          "key": "prop",
          "required": false,
          "direction": "the character's signature prop on its own"
        }
      ]
    }
  ]
}
```

## 附录 B：SP-13 何姐（加入 `ACTORS`，排在 SP-12 之后）

| 字段        | 中文                                                                                                                                                   | English                                                                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| slug / code | `he-jie` / `SP-13`                                                                                                                                     | —                                                                                                                                                                                                                                                                                                                   |
| 名字        | 何姐                                                                                                                                                   | HE JIE                                                                                                                                                                                                                                                                                                              |
| tagline     | 嘴上说没事，手上一直没停。                                                                                                                             | Says it's nothing. Never stops working.                                                                                                                                                                                                                                                                             |
| status      | `in-development`，`version: { current: 0, total: 10 }`                                                                                                 | —                                                                                                                                                                                                                                                                                                                   |
| heightCm    | 163                                                                                                                                                    | —                                                                                                                                                                                                                                                                                                                   |
| 规格：年龄  | 43 岁                                                                                                                                                  | 43                                                                                                                                                                                                                                                                                                                  |
| 规格：身高  | 163 CM                                                                                                                                                 | 163 CM                                                                                                                                                                                                                                                                                                              |
| 规格：职业  | 家常菜小店员工                                                                                                                                         | STAFF AT A SMALL HOME-COOKING RESTAURANT                                                                                                                                                                                                                                                                            |
| 其余规格行  | 用 `devTail`：出身"重庆老城区 — 在上海工作"，语域"重庆话 / 普通话"                                                                                     | devTail: origin "OLD-TOWN CHONGQING — WORKS IN SHANGHAI", register "CHONGQING DIALECT / MANDARIN"                                                                                                                                                                                                                   |
| note        | 在重庆老城区长大，后来到上海做家政和餐饮。她的热心不是客气，是手比嘴快——话还没说完，菜已经端上来了。演她不用演苦，只要演一个把平凡日子过得有滋味的人。 | She grew up in old-town Chongqing and moved to Shanghai for housekeeping and restaurant work. Her warmth is not politeness; her hands are simply faster than her mouth, and the dish arrives before the sentence ends. Playing her is not about hardship. It is about someone who makes an ordinary day taste good. |
| castFor     | 生活流短片；家庭喜剧；广告：餐饮 / 家政 / 生活服务 / 调味品；温情配角                                                                                  | Slice-of-life shorts; Family comedy; Ads: food / home services / local services / condiments; Warm supporting role                                                                                                                                                                                                  |
| promptSeed  | `null`                                                                                                                                                 | —                                                                                                                                                                                                                                                                                                                   |

规格行的英文值沿用站内现有的大写记号风格（与其他演员的规格行一致，这是数据记号，不属于 2.4 要改大小写的界面文案）。

## 附录 C：新增界面文案（加入 `tools/gen-messages.py` 的 `assets` 组）

| 键                         | 中文                                                                                       | English                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets.metaTitle`         | {name} · 资产库                                                                            | {name} · Asset library                                                                                                                                      |
| `assets.back`              | 物料包                                                                                     | Open kit                                                                                                                                                    |
| `assets.intro`             | {name}的每一张图都是单独的高清原图，图上没有字。挑你需要的，单张下载，或者登录后整包带走。 | Every image of {name} is a separate full-size original with no text on it. Pick what you need and download one at a time, or sign in to take the whole set. |
| `assets.progress`          | 基础包 {done}/{total}                                                                      | Core set {done}/{total}                                                                                                                                     |
| `assets.series.turnaround` | 转面                                                                                       | Turnaround                                                                                                                                                  |
| `assets.series.face`       | 面部                                                                                       | Face                                                                                                                                                        |
| `assets.series.expression` | 表情                                                                                       | Expressions                                                                                                                                                 |
| `assets.series.wardrobe`   | 服装                                                                                       | Wardrobe                                                                                                                                                    |
| `assets.series.pose`       | 动作                                                                                       | Poses                                                                                                                                                       |
| `assets.series.detail`     | 细节                                                                                       | Details                                                                                                                                                     |
| `assets.series.text`       | 文字资料                                                                                   | Text                                                                                                                                                        |
| `assets.note.turnaround`   | 正面、四分之三侧、正侧、背面，全身，透明背景。                                             | Front, three-quarter, side and back. Full body, transparent background.                                                                                     |
| `assets.note.face`         | 锁脸用的特写，给模型的参考里最重要的一组。                                                 | Close-ups that lock the face. The most important references you can give a model.                                                                           |
| `assets.note.expression`   | 12 种基础情绪，加说话和闭眼。                                                              | Twelve core emotions, plus speaking and eyes closed.                                                                                                        |
| `assets.note.wardrobe`     | 同一个人，换一套衣服，四个角度。                                                           | Same person, another outfit, four angles.                                                                                                                   |
| `assets.note.pose`         | 常用动作，全身。                                                                           | Common actions, full body.                                                                                                                                  |
| `assets.note.detail`       | 手、后脑、招牌道具。                                                                       | Hands, the back of the head, signature props.                                                                                                               |
| `assets.extended`          | 扩展                                                                                       | Extended                                                                                                                                                    |
| `assets.pending`           | 待交付                                                                                     | Not delivered yet                                                                                                                                           |
| `assets.legacy`            | 旧规格                                                                                     | Legacy                                                                                                                                                      |
| `assets.legacyNote`        | 黑底旧图，新规格交付后替换。                                                               | An older black-background image, to be replaced by the new set.                                                                                             |
| `assets.none`              | 这位演员的资产还在制作中。                                                                 | This actor's assets are still being made.                                                                                                                   |
| `assets.selectSeries`      | 全选本组                                                                                   | Select all                                                                                                                                                  |
| `assets.clear`             | 清空                                                                                       | Clear                                                                                                                                                       |
| `assets.selected`          | 已选 {count} 张                                                                            | {count} selected                                                                                                                                            |
| `assets.select`            | 选择 {label}                                                                               | Select {label}                                                                                                                                              |
| `assets.downloadSelected`  | 下载所选                                                                                   | Download selected                                                                                                                                           |
| `assets.downloadOne`       | 下载这张                                                                                   | Download this image                                                                                                                                         |
| `assets.downloadJson`      | 下载角色资料（JSON）                                                                       | Download profile (JSON)                                                                                                                                     |
| `assets.noSeed`            | 形象尚未锁定，暂无种子。                                                                   | The look is not locked yet, so there is no seed.                                                                                                            |
| `assets.guestCooldown`     | 游客每 {seconds} 秒可以下载一张高清图，还要等 {remaining} 秒。                             | Guests can download one full-size image every {seconds} seconds. {remaining} seconds to go.                                                                 |
| `assets.guestHint`         | 登录 Swimmer 账号，就能多选、打包和拼图。                                                  | Sign in with Swimmer to select several, download a pack or build a sheet.                                                                                   |
| `assets.signIn`            | 用 Swimmer 账号登录                                                                        | Sign in with Swimmer                                                                                                                                        |
| `assets.signInTitle`       | 整包带走，需要一个 Swimmer 账号                                                            | Take the whole set with a Swimmer account                                                                                                                   |
| `assets.signInBody`        | 免费注册。同一个账号还能直接用：                                                           | It's free. The same account also works in:                                                                                                                  |
| `assets.notNow`            | 先不用                                                                                     | Not now                                                                                                                                                     |
| `assets.signedIn`          | 已登录                                                                                     | Signed in                                                                                                                                                   |
| `assets.signOut`           | 退出                                                                                       | Sign out                                                                                                                                                    |
| `assets.dialogTitle`       | 下载 {count} 张                                                                            | Download {count} images                                                                                                                                     |
| `assets.format.zip`        | 原图打包                                                                                   | Originals                                                                                                                                                   |
| `assets.format.zipNote`    | 每张一个透明背景 PNG，附角色资料和使用说明。                                               | One transparent PNG per image, with the profile and terms of use.                                                                                           |
| `assets.format.sheet`      | 拼成一张                                                                                   | One sheet                                                                                                                                                   |
| `assets.format.sheetNote`  | 给只收一张参考图的工具。                                                                   | For tools that take a single reference image.                                                                                                               |
| `assets.format.model`      | 按模型打包                                                                                 | For a model                                                                                                                                                 |
| `assets.format.modelNote`  | 按模型的参考图上限自动挑选和拼合，附一段英文说明。                                         | Picks and combines images to fit the model's reference limit, with an English note.                                                                         |
| `assets.labels`            | 图上标签                                                                                   | Labels on the sheet                                                                                                                                         |
| `assets.labels.none`       | 不加                                                                                       | None                                                                                                                                                        |
| `assets.background`        | 底色                                                                                       | Background                                                                                                                                                  |
| `assets.background.light`  | 浅灰                                                                                       | Light grey                                                                                                                                                  |
| `assets.background.white`  | 白                                                                                         | White                                                                                                                                                       |
| `assets.background.dark`   | 深灰                                                                                       | Dark grey                                                                                                                                                   |
| `assets.model`             | 模型                                                                                       | Model                                                                                                                                                       |
| `assets.overLimit`         | 已选 {count} 张，这个模型最多收 {limit} 张，将保留最重要的 {limit} 张。                    | {count} selected. This model takes {limit}, so the {limit} most important will be kept.                                                                     |
| `assets.start`             | 开始下载                                                                                   | Start download                                                                                                                                              |
| `assets.preparing`         | 准备中…                                                                                    | Preparing…                                                                                                                                                  |
| `assets.started`           | 已开始下载                                                                                 | Download started                                                                                                                                            |
| `assets.cancel`            | 取消                                                                                       | Cancel                                                                                                                                                      |
| `assets.openLibrary`       | 打开资产库                                                                                 | Open asset library                                                                                                                                          |
| `common.themeLight`        | 浅色                                                                                       | Light                                                                                                                                                       |
| `common.themeDark`         | 深色                                                                                       | Dark                                                                                                                                                        |
| `common.themeToggle`       | 切换明暗                                                                                   | Switch light and dark                                                                                                                                       |

格位名称（`assets.slot.<series>.<camelKey>`）：

- **转面**：front 正面 / Front；threeQuarter 四分之三侧 / Three-quarter；side 正侧 / Side；back 背面 / Back。
- **面部**：front 正脸 / Face, front；threeQuarter 四分之三侧脸 / Face, three-quarter；side 侧脸 / Face, side。
- **表情**：
  - 基础：neutral 平静 / Neutral；smile 浅笑 / Smile；laugh 大笑 / Laugh；sad 难过 / Sad；
    cry 哭 / Crying；annoyed 烦躁 / Annoyed；angry 发怒 / Angry；surprised 惊讶 / Surprised；
    scared 害怕 / Scared；disgusted 嫌弃 / Disgusted；embarrassed 窘迫 / Embarrassed；tired 疲惫 / Tired。
  - 技术态：speaking 说话中 / Speaking；eyesClosed 闭眼 / Eyes closed。
  - 扩展：worried 发愁 / Worried；skeptical 怀疑 / Skeptical；smug 得意 / Smug；contempt 不屑 / Contempt；
    confused 困惑 / Confused；thinking 思考 / Thinking；determined 坚定 / Determined；shy 害羞 / Shy；
    pain 吃痛 / In pain；sleepy 犯困 / Sleepy；awkwardSmile 尴尬笑 / Awkward smile；deadpan 面无表情 / Deadpan。
- **服装**：同转面四个角度。
- **动作**：walk 走路 / Walking；run 跑步 / Running；sit 坐着 / Sitting；point 指向 / Pointing；
  armsCrossed 抱臂 / Arms crossed；phone 打电话 / On the phone。
- **细节**：hands 手部 / Hands；hairBack 后脑 / Back of head；prop 招牌道具 / Signature prop。

## 附录 D：出图提示词模板（`assets:todo` 使用，英文）

```text
Use the attached reference images as the only source of this character's identity: {name} ({code}).
Keep the face structure, eye shape, hairstyle, skin tone, body proportions and wardrobe identical to the references.
Stylised 3D animated character, feature-animation look, NOT photorealistic. Do not render as a real human. Do not add photographic skin detail.
{seriesPromptWithDirection}
Lighting: soft, even, neutral-white studio light from the front. No colored rim light, no visible lamps or light fixtures, no cast floor shadow.
Background: fully transparent. No text, no watermark, no border, no other people.
```

每条待办另附一行参数：`GPT Image 2.5 · {width}x{height} · background transparent · PNG · quality high`；
以及参考图建议：锚点 `face.front` 与 `turnaround.front`；锚点本身缺失时，提示先出锚点。

## 完成

全部步骤完成并经审阅后，本计划移到 `docs/plans/completed/`，`status: completed`。
