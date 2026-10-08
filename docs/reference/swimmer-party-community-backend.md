---
id: REQ-SWIMMER-PARTY-COMMUNITY
title: Swimmer Party community schema request
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-08
last_reviewed: 2026-10-08
domain: engineering
tags:
  - swimmer-backend
  - community
pinned: false
---

# Swimmer Party community schema request

请在 SwimmerBackend 的 Supabase 产品 schema `swimmer_party` 建立并测试以下表：`posts`、`post_media`、`reactions`、`reports`、`trusted_authors`。

## 约束

- 网站服务端携带 Swimmer 身份通过受控 RPC 或 RLS 访问，浏览器不直连表。
- `posts.author_id`、`reactions.user_id`、`reports.reporter_id` 使用 core 用户 UUID；不存 email，显示名从账号公开资料读取，没有显示名时显示 `Swimmer` 加短 ID。
- `reactions` 唯一键为 `(user_id, target_type, target_id, kind)`，`kind` 只有 `like`、`vote`。
- `reports` 唯一键为 `(post_id, reporter_id)`；同一作品被三个不同账号举报后自动进入 hidden/review 状态。
- 第一条作品在 `trusted_authors` 之外时为 `pending`；Owner 通过后加入 `trusted_authors`，后续作品直接 published。
- 注销覆盖：删除该用户的 posts、post_media 索引、reactions、votes、reports；Blob 文件由网站清理任务按索引删除。
- Owner RPC 只接受服务端 `OWNER_ACCOUNT_IDS` 中的账号。

## 交付和迁出

请返回迁移 SQL、RLS policy、受控 RPC、注销覆盖测试和 staging 验证证据。生产迁移必须等待 Owner 明确同意。若产品下线，网站先停止写入并导出索引，再按 Blob 清理任务删除文件，最后删除 schema。
