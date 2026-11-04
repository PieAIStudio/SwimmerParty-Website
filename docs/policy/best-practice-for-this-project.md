---
id: POLICY-PROJECT-BEST-PRACTICE
title: Best Practice for This Project
type: policy
status: stable
canonical: true
owner: project
created: 2026-05-08
last_reviewed: 2026-11-05
domain: project-policy
tags:
  - project-policy
  - ai-development
pinned: true
related:
  - POLICY-DOC-AGENT-RULES
  - POLICY-DOC-TYPES
supersedes: []
superseded_by: null
---

# Best Practice for This Project

This file is project-local.

## 这个项目是什么

SWIMMER PARTY 官网。它的真相只有一条：**名册上的人是产品，这个站是货架。**
所有设计和文案决策先过这一条。

## 内容诚实（硬规则）

这是一个要拿去谈商务的站，对方会核实。

1. 不摆假客户 logo、假播放量、假获奖、假出演记录、假合作方。
2. 演员公开状态必须对应已批准的生产资料和交付清单；未交付显示白膜或明确缺格，不能伪造可下载成果。**测试夹具绝不是交付素材。**
3. 片单只写真实进度：`SHOOTING` / `WRITING` / `DEVELOPMENT`。
4. 违反以上任一条，即使视觉更好看，也不合并。

理由不是道德洁癖：一个假 logo 被戳穿，整站可信度归零，比没有 logo 差一百倍。

## 治理边界

- 受治理的 Markdown 只在 `docs/**`。
- `src/content/**` 是**产品内容**（演员、片单），不是受治理文档，不要给它加 doc-gov
  frontmatter，也不要搬进 `docs/**`。
- `brainstorms/` 是创作素材与外部对话存档，刻意放在 `docs/**` 之外。
- 角色生产资料由制作侧维护在 media-pack；网站从中生成展示，不在 src/content 另编一份身份或造型。

## 品牌 UI 库

2D UI 走 `@pieai/swimmer-ui-kit`。kit 不够用时改 kit、发版本、再升级引用，
不要在本仓库复制一份「差不多的」按钮。见
`docs/policy/shared-rules/brand-kit-first.md`。

例外：Hero、规格书排版、名册网格、跑马灯这类**本站独有的产品排版**留在本仓库，
不要往 kit 里塞。

## 展示边界

首页、名册、演员浏览与下载不加载 3D。Owner 2026-11-05 批准从选角单进入独立 `/[locale]/scene` 排位工具：通用占位人偶、静态姿势、本地草稿和 PNG，不恢复退役首页舞台，不在线生成图片。现行视觉只读 DESIGN.md；渲染及后续 CC0 模型的接口在 `src/features/scene/README.md`。

## 验证

Use [Three-Stage Delivery](../governance/agents-routing/engineering-runtime-v1.1.md#three-stage-delivery) for automatic related-check selection and
pre-release full gates. Commands below are a reference, not an every-push checklist.

```bash
pnpm verify
```

改了文档还要跑 `pnpm docs:check`。
