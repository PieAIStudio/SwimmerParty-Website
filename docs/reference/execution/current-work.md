---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-08-20
last_reviewed: 2026-08-20
domain: meta
tags:
  - current-work
  - navigation
pinned: true
related: []
---

# Current Work

This file is the current project work index. It is not the agents-routing algorithm.

## Current Focus

- Current phase: **视觉极端化与立场落地已交付，进入素材扩产阶段**
- Current active plan: 无正式 plan
- Current active spec: 无
- Current proof target: `pnpm verify` 全绿 + 线上 Vercel 可访问

## 已经完成（2026-08-20）

- 注册进 PGS portfolio（`swimmerparty-website`，`public-seo-site`，
  `engineering-runtime` profile）；`portfolio check` / `assets-check` / `doctor` 三绿。
- Next.js 16 + R3F 骨架，6 个页面全静态预渲染。
- ACID VOID 设计系统与 `[data-game-ui-theme='acid']` kit 主题。
- 白膜 3D 展台（单渲染器、ACES、一次 sRGB 编码、DPR 钳制、离屏停渲染）。
- 暗底蓝图规格书组件，站位刻度做成 per-actor 数据。
- SP-01 胡谦、SP-02 齐满 定妆板（可灵 `image_to_image` 多参考图锁人脸）。
- Playwright 冒烟 5 条，含 WebGL canvas 存活断言与「不许拿占位图冒充定妆板」断言。

## 已经完成（2026-08-20 第二轮）

- **立场落地。** `src/content/doctrine.ts` 成为唯一出处：只做动画角色、绝不做真人
  形象。首页整块酸色板、`/pact` 第一部分、名册卡徽标、规格书、页脚全部引用同一份
  文案，Playwright 有测试守着它不被删掉。名册在写下这条之前就已经是风格化 CG，
  没有任何素材需要返工。
- **多语言。** `next-intl` v4 + `src/app/[locale]/**` + `src/proxy.ts`。zh / en 两个
  人工语言，其余八种是 `translate.goog` 外链并在界面上明写「机器翻译」。中英混排
  全部拆干净，两条测试分别断言 `/en` 无 CJK、`/zh` 标题无英文。
  文案改 `tools/gen-messages.py`，不要手改 `messages/*.json`。
- **视觉极端化。** GSAP + ScrollTrigger；四个滚动装置（hero 装配 scrub、名册横滚
  pin、工序叠卡、跟滚轮变速的跑马灯）；中文海报字用描边补重量；整块荧光色板；
  自定义光标、扫描线、RGB 分离、磁吸式 hover。
- **3D 加料。** 白膜装配动画（部件飞入）、指针驱动转向、`/actors` 顶部 12 人名册墙
  （合并几何，一个人形一个 draw call）、`<Mannequin />` 把同一套比例画成 2D SVG
  填进名册卡和未交付的规格书。
- **名册扩到 12 人**（SP-05 罗大江 … SP-12 关海，全部 `in-development`，诚实显示
  白膜与 `NO PLATE DELIVERED`）。
- **两个新板块。** `/kit` 开放物料包（SP-01 / SP-02 的角色种子提示词现在就能复制，
  未做的明写「筹备中」）；`/pact` 共赢契约（第一部分是拒绝，第二部分是分账，
  未定的百分比明写「以正式合同为准」）。
- **SP-01 参考图组交付。** 可灵 `image_to_image` 多参考图出了四分之三侧与正侧两个
  角度，脸、发型、服装、比例都稳住了。加上原有正面，SP-01 现在是三视图，
  `/kit` 与档案页都能取。K-04 因此转 `live`；其余演员在页面上明写「目前只有正面」。
  踩到的坑：**可灵不接受 `.webp` 上传**，参考图要先转 PNG（`dwebp`）再传。
- Playwright 从 5 条扩到 12 条，含 locale 纯净度、立场留存与「参考图按人交付」断言。

## 下一步（按优先级）

| 优先级 | 事项                                                                   |
| ------ | ---------------------------------------------------------------------- |
| P0     | SP-01 / SP-02 三视图、表情组、造型组（可灵），填掉 `/kit` 里 K-04–K-06 |
| P0     | SP-03 戴尔 / SP-04 丁一 形象定稿与定妆板                               |
| P1     | 新增 SP-05–SP-12 的形象定稿；每交付一个就把 `promptSeed` 补上          |
| P1     | 角色转台（可灵多角度序列 + 拖拽/滚动驱动），对应 K-07                  |
| P2     | `/pact` 的分成百分比走完一次真实合同后再落数字                         |
| P2     | 把 `acid` 主题上游回 SwimmerUIKit，发 1.4.0，本站升级引用              |
| P2     | 真 `.glb` 角色模型，替换白膜占位                                       |
| P3     | OG 图、结构化数据                                                      |

## Completed Proof History

Completed plans and specs live in:

- `docs/plans/completed/`
- `docs/specs/completed/`

Do not move completed work back into active. Create a new plan and link the completed record as provenance.
