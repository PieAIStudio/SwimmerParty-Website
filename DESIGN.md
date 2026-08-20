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
