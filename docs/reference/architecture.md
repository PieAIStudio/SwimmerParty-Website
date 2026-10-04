---
id: REF-ARCHITECTURE
title: Architecture
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-04
last_reviewed: 2026-10-04
domain: engineering
tags:
  - architecture
  - topology
pinned: false
related:
  - SPEC-ACTOR-ASSET-LIBRARY
---

# Architecture

页面路由在 `src/app`，API 入口在 `src/pages/api`；它们只组装公开入口，不承载领域规则。功能入口位于 `src/features/{stage,actors,assets,account}`，全站外壳位于 `src/site`，纯内容位于 `src/content`，通用小工具位于 `src/lib`。

本轮选择按功能分区，拒绝继续按 `components/lib/server/content` 分层。资产库的界面、导出、下载和清单在一次改动中经常同时变化，功能入口能让改动从一处开始追踪；入口文件保留稳定的公共导出，内部实现可以继续收敛。

## 常见改动

- 加演员：更新 `src/content/actors.ts` 与对应资产清单，档案和资产页通过 `features/actors`、`features/assets` 自动读取。
- 加资产系列：更新 `src/content/asset-series.ts`、消息源和资产词表，再运行 `pnpm assets:todo`。
- 加页面：在 `src/app/[locale]` 增加薄路由，从 `src/site`、`src/features` 和 `src/content` 组合。

服务端适配器在 `src/server`，每个 API 请求按运行模式创建适配器；本地和 Vercel 的存储、限速、账号边界由现有运行时守卫保持。下一步可以把这些实现逐单元移入对应 feature 的 `server/`，入口契约不变。
