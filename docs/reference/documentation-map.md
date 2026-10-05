---
id: REF-DOCUMENTATION-MAP
title: Documentation Map
type: reference
status: active
canonical: true
owner: human
created: 2026-08-20
last_reviewed: 2026-10-04
domain: meta
tags:
  - navigation
pinned: false
related: []
---

# Documentation Map

AI 入口是根目录 `AGENTS.md`；此页列出当前项目文档，不复制治理规则。

| 文档                                                                    | 角色                         |
| ----------------------------------------------------------------------- | ---------------------------- |
| [架构](architecture.md)                                                 | 目录、依赖方向与常见改动入口 |
| [上线手册](release.md)                                                  | 发布前置条件、步骤与回滚     |
| [当前工作](execution/current-work.md)                                   | 当前状态和下一步             |
| [项目规则](../policy/best-practice-for-this-project.md)                 | 内容诚实、产品边界与验证     |
| [并入家族 ADR](../adr/2026-10-03-join-swimmer-family.md)                | 已采纳决定与取舍理由         |
| [资产库 spec](../specs/active/actor-asset-library.md)                   | 现行资产契约                 |
| [健康重构计划](../plans/completed/2026-10-04-healthy-site-refactor.md)  | 本轮执行与审阅入口           |
| [家族重建记录](../plans/completed/2026-10-03-swimmer-family-rebuild.md) | 历史批准与实现出处           |

根目录 `README.md` 面向使用者，`DESIGN.md` 是现行设计来源。`docs/governance/` 与 `docs/policy/shared-rules/` 由 PGS 管理，按 AGENTS 路由按需阅读。`src/content/` 是产品内容，`brainstorms/` 是原始创作材料；它们不属于受治理文档。自动生成的完整索引为 `docs/governance/MANIFEST.yml`。
