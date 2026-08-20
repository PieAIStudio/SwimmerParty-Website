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

- Current phase: **初稿骨架已交付，进入视觉极端化与素材扩产阶段**
- Current active plan: 无正式 plan（初稿由 PGS 侧一次性搭建）
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

## 下一步（按优先级）

| 优先级 | 事项                                                      |
| ------ | --------------------------------------------------------- |
| P0     | 视觉极端化：动效、滚动编排、排版张力还远没到位            |
| P0     | SP-01 / SP-02 补齐三视图、表情组、造型组                  |
| P1     | SP-03 戴尔 / SP-04 丁一 的形象定稿与定妆板                |
| P1     | 角色转台（可灵多角度图序列 + 拖拽/滚动驱动）              |
| P2     | 把 `acid` 主题上游回 SwimmerUIKit，发 1.4.0，本站升级引用 |
| P2     | 真 `.glb` 角色模型（Tripo 或外包），替换白膜占位          |
| P3     | OG 图、结构化数据、多语言                                 |

## Completed Proof History

Completed plans and specs live in:

- `docs/plans/completed/`
- `docs/specs/completed/`

Do not move completed work back into active. Create a new plan and link the completed record as provenance.
