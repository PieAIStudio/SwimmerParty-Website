---
id: REF-VERIFICATION
title: Verification commands
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-08
last_reviewed: 2026-10-08
domain: engineering
tags:
  - verification
pinned: false
---

# Verification commands

| 命令              | 作用                           | 本轮结果                     |
| ----------------- | ------------------------------ | ---------------------------- |
| `pnpm check`      | 快速类型、lint、格式和工具检查 | 通过                         |
| `pnpm verify`     | 构建与关键浏览器路径           | 构建、工具测试、e2e 通过     |
| `pnpm docs:check` | 项目治理和文档链接             | router/check/scan/links 通过 |

本地预览使用 `pnpm dev`。生产部署、云端 Blob 和付费验收只在 Owner 明确说“发布”后执行。
