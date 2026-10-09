---
id: REQ-SWIMMER-PARTY-COMMUNITY
title: Swimmer Party community schema request
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-08
last_reviewed: 2026-10-09
domain: engineering
tags:
  - swimmer-backend
  - community
pinned: false
---

# Swimmer Party community schema request

请在 SwimmerBackend 的 Supabase 产品 schema `swimmer_party` 建立并测试以下表：`posts`、`reactions`、`reports`、`trusted_authors`（第一版的 `post_media` 在 v2 改为 `posts` 上的外部链接字段）。

## 约束

- 网站服务端携带 Swimmer 身份通过受控 RPC 或 RLS 访问，浏览器不直连表。
- `posts.author_id`、`reactions.user_id`、`reports.reporter_id` 使用 core 用户 UUID；不存 email，显示名从账号公开资料读取，没有显示名时显示 `Swimmer` 加短 ID。
- `reactions` 唯一键为 `(user_id, target_type, target_id, kind)`，`kind` 只有 `like`、`vote`。
- `reports` 唯一键为 `(post_id, reporter_id)`；同一作品被三个不同账号举报后自动进入 hidden/review 状态。
- 第一条作品在 `trusted_authors` 之外时为 `pending`；Owner 通过后加入 `trusted_authors`，后续作品直接 published。
- 注销覆盖：删除该用户的 posts、reactions、votes、reports。作品只是外部链接，没有文件要清理。
- Owner RPC 只接受服务端 `OWNER_ACCOUNT_IDS` 中的账号。

## 现状与第二版需求（2026-10-09）

第一版已在 SwimmerBackend `main` 提交（`93ade1a`、`deeb433`、`7329a82`），只做了本地重放验收，没有进 staging 和生产。它只有写入 RPC：`create_post(p_title, p_body)`、`add_media`、`react`（post/media）、`report_post` 和 `owner_approve_author`（service_role 加 `app.owner_account_ids` GUC）。网站的作品墙、点赞、举报和新面孔投票因此在生产关闭（`NEXT_PUBLIC_COMMUNITY_ENABLED` 未设置）。

打开开关前，第二版还需要：

1. **读取**：已发布作品列表（按时间或点赞，分页，带点赞数和作者显示名）和单个作品详情；作者能看到自己待审的作品。
2. **作品信息**：`kind`（image/video/audio/game/other）、演员 slug 列表、工具、做法说明、**外部作品链接**和平台名，以及署名和权利两项确认。作品文件不上传到我们这里（Owner 2026-10-09 决定）：只收白名单平台的链接，例如 YouTube、B 站、抖音、TikTok、小红书、X、Instagram、Vimeo、SoundCloud；服务端校验域名。
3. **新面孔投票**：每个账号对每位演员一票，可撤回；按演员读票数。
4. **删除**：作者删除自己的作品，连同点赞、举报和媒体索引。
5. **审核**：Owner 读待审和被举报隐藏的列表，执行通过或隐藏；Owner 名单放表里，不靠 GUC。

网站侧随后补：用用户 JWT 调这些 RPC 的适配器、链接卡片（YouTube、B 站、Vimeo 点击后才加载嵌入播放器，YouTube 用无 cookie 域名；其他平台显示平台名和标题并跳转），然后打开开关。用户作品放在新的导航页签“泳者”（英文 Swimmer），页面只放标题，不加说明；上线时先放入四位演员的官方样片，避免空墙。账号在中文里统一叫“泳者账号”；账号中心的叫法随 v2 一起统一。

## 交付和迁出

请返回迁移 SQL、RLS policy、受控 RPC、注销覆盖测试和 staging 验证证据。生产迁移必须等待 Owner 明确同意。若产品下线，网站先停止写入并导出数据，再删除 schema。
