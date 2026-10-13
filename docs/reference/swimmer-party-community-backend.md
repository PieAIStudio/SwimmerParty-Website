---
id: REQ-SWIMMER-PARTY-COMMUNITY
title: SWIMMER PARTY community v3 consumer requirements
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-08
last_reviewed: 2026-10-13
domain: engineering
tags:
  - swimmer-backend
  - community
  - uploads
pinned: false
related:
  - PLAN-CREATOR-COMMUNITY-NEXT-STAGE
  - REF-ARCHITECTURE
---

# SWIMMER PARTY 社区 v3：网站消费入口

## 状态与唯一合同

**B1 v3 已按 Owner 拍板定稿；本页完成文档同步，不代表后端实现、staging、网站适配或生产已验收。**
后端合同唯一来源是 `SwimmerBackend` 的 `sp-community` 分支提交 `d49cff1`，
`docs/specs/active/swimmer-party-community.md`（`SPEC-SWIMMER-PARTY-COMMUNITY`）。
本页保留原入口 ID，只维护网站侧消费摘要、对应章节和接入门槛，不独立定义另一套合同。
原始文件 SHA-256：`115dd0446be128fbea7a7b185c0de611df7a6f8b7d961e40beae758b679246a7`。

产品方向、Owner 决定和网站进度见[创作社区实施方案](../plans/active/2026-10-13-creator-community.md)。
本次只更新文档；`src/contracts/community.ts`、社区 API、远程适配器和功能开关均不修改。
B2 登记实际端点和 DTO 后，C1 再实现并验证映射；逻辑操作名不能当成已存在的 RPC。

## 已确认范围与默认额度（后端 §2–3）

社区**只收使用本站演员的作品**，提交至少关联一位有效本站演员及所用素材版本。
不开放或预留原创角色分支，保留 `Not made with our actors` 举报理由。
首发仅 `image | video | audio`：图片和声音直传，视频只收受支持外链；一帖一种类型。
`game | other` 在前后端都拒绝，不把旧枚举当成已开放能力，不提供站内 AI 生成。

数据属于品牌后端的 `swimmer_party` schema；隔离原件、成品和派生物均用
SwimmerBackend 的私有 Supabase Storage，账号用品牌统一账号。网站不另开数据库、
作品存储或存储账号；现有演员资产交付存储不因此迁移或改归属。

| 配置项         | Owner 已批准默认值                                           | 网站消费约束                                                     |
| -------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| 每帖图片       | 1–4 张，每张最多 8,388,608 bytes（8 MiB）                    | 按输入实际字节，不按压缩后大小                                   |
| 每帖声音       | 1 段，最多 300,000 ms（5 分钟）及 26,214,400 bytes（25 MiB） | 同时满足真实解码时长和字节数                                     |
| 新账号每日作品 | 3 帖，UTC 自然日                                             | 新账号指未受信或已撤信；草稿不扣，首次成功提交扣，删除不退回     |
| 新账号每日上传 | 104,857,600 bytes（100 MiB）                                 | 真实传输、防刷预算和存储占用分别计量；失败不返还已产生的传输成本 |
| 账号注销撤销期 | 14 天                                                        | 申请时不提前 purge；到期完整清理后才能删除 Auth 身份             |

上表是同步确认值，不是网站应复制的运行时常量。控件读取 `get_limits` 的有效格式、
额度、开关及 `limitsVersion`；API 用整数 bytes/milliseconds，界面统一 MiB。
受信作者也有有限额度；无独立配置时沿用保守默认值，不宣传无限上传。
签名期限、上传会话期限、回收 TTL、解码资源上限和处理超时等由 B2 固定并验收；
未配置就不能签发凭证。定制演员价位与品牌邮箱仍待以后处理，D4 暂缓。

## 字段、状态和投影（后端 §4–5）

SQL 为 snake_case、网站 JSON 为 camelCase，由适配器逐字段映射；输入与输出分别
严格建模，不能继续以 `Omit<CommunityPost,...>` 当作可信创建输入。下表为消费核对索引，
字段完整定义及可见性仍以确切后端合同为准。

| 投影       | v3 字段与规则                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 身份与并发 | 服务端生成 `id`（UUID）、`revision`（非负递增整数）；写入使用 `operationId`，更新/审核/删除提交 `expectedRevision`         |
| 创作内容   | `kind`；`title` trim 后 1–200 字符；`description`、`recipe` 各最多 50,000 字符；`tool` 最多 200 字符；均为纯文本           |
| 演员       | 提交时 `actors: {slug, assetVersion}[]` 非空，由服务端核验；旧 `actorSlugs` 只作迁移映射，不保留双写事实                   |
| 公开作者   | `author: {id, displayName, avatarUrl}` 来自账号公开资料；无公开名用 `Swimmer` 加短 ID，不回显邮箱或邮箱本地名              |
| 媒体与状态 | `status`、`media: Media[]`；媒体有稳定 ID、顺序、服务器实测 MIME/bytes/尺寸/时长、说明、封面/派生物关联及独立处理/审核状态 |
| 权利确认   | 提交时 `creditConfirmed`、`rightsConfirmed` 必须为字面值 `true`，保存确认条款版本与时间；不能接受 truthy 字符串            |
| 官方和互动 | `official`、`featuredAt` 仅 Owner/官方受控操作写入；`likeCount`、`viewerHasLiked` 由服务端决定，匿名个人状态为 false       |
| 时间       | `createdAt`、`updatedAt`、`publishedAt` 是服务端 UTC RFC 3339；发布前 `publishedAt` 为 null                                |

公开投影不含作者/Owner 专用审核原因、处理失败码、删除任务状态，更不含举报人、
隔离对象键、上传凭证或内部审计。创建输入不能写作者身份、官方标记、计数或信任状态。
视频描述为服务端规范化的 `{platform, externalId, canonicalUrl}`，不接收任意 iframe/HTML。

作品状态：`draft | processing | pending | published | returned | hidden | deleted`。
首帖路径为 `draft → processing → pending → published`；退回须有理由，删除是逻辑终态。
媒体处理状态：`reserved | uploaded | validating | processing | ready | failed | deleting | deleted`；
媒体审核状态：`unreviewed | approved | rejected`。`ready` 不等于已公开，202/accepted 不等于完成。

首帖人工审核，授信是独立明确操作且可撤销；通过一帖不能发布全部待审稿。
三个不同有效账号在同一未结案举报轮次举报后先隐藏待复审，不直接删除；重复举报不加人数。
换媒体、视频链接、演员关联或发布文本默认撤公开性再处理/复审，迟到回调不得复活已删除作品。

## 逻辑操作、幂等、错误与分页（后端 §7）

### 操作映射核对

| 逻辑操作                                        | 网站必须保留的合同                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `get_limits`                                    | 匿名只读有效配置与 `limitsVersion`，不返回内部管理配置或凭据                                                        |
| `list_posts`、`get_post`                        | 仅已发布公开投影；列表 `{posts,nextCursor,hasMore}`，详情 `{post}`                                                  |
| `list_my_posts`、`get_my_post`                  | 登录本人专用读取，含各状态和删除任务回执，不能靠公开查询任意 authorId 获得私有内容                                  |
| `create_draft`、`update_draft`                  | 严格输入、`operationId`；更新另带 `expectedRevision`；返回 `{post,operationId}`                                     |
| `get_operation`                                 | 本人查询原 `operation`、`operationId`；返回 accepted/processing/succeeded/failed 与仍有权读取的资源身份，不重发凭证 |
| `create_upload`                                 | 本人作品、修订、类型/大小、操作 ID；返回 uploadId/mediaId、短时凭证、expiresAt 和限额快照，不可缓存                 |
| `finalize_upload`、`get_upload_status`          | 本人 uploadId；finalize 带操作 ID；返回媒体状态/失败码，不以 accepted 冒充 ready                                    |
| `submit_post`                                   | postId、修订、两项 true 确认、条款版本和操作 ID；处理可以返回 202                                                   |
| `set_like`、`set_actor_vote`、`get_actor_votes` | 写入显式 liked/voted 布尔值与操作 ID，不用 toggle；回包 `{count,liked}` 或 `{count,voted}`，恢复初始个人状态        |
| `report_post`                                   | postId、稳定 reasonCode、可选说明、操作 ID；只返回本人举报回执                                                      |
| `delete_post`、`get_deletion_status`            | 本人 postId；删除带修订/操作 ID；回包 `{operationId,status}`，清理回执齐全才 complete                               |
| `list_review_queue`、`get_review_detail`        | 仅 Owner，含实际媒体、确认、举报和处理历史                                                                          |
| `review_post`                                   | 仅 Owner；postId、修订、approve/return/hide/restore、reason、操作 ID；退回/隐藏/恢复必须记理由                      |
| `set_author_trust`、`set_submission_paused`     | 仅 Owner；目标、明确布尔值、理由和操作 ID；身份来自受控登记，不来自请求正文                                         |

所有写入带稳定 UUID `operationId`；服务端去重域至少为
`app + verifiedActor + operation + operationId`。同键同输入复用结果，同键异输入报冲突。
请求丢回复先查原操作，查不到也不等于原写入未发生，不静默换键重建；重试沿用原键。
修订冲突先重读，不能自动覆盖。仅明确标为 retryable 的临时错误采用受限退避。

### 统一错误

失败回包为 `{error:{code,retryable,requestId,field?,retryAfterSeconds?}}`。
网站按 code 本地化，不透传 SQL、供应商正文、内部路径或签名 URL；不可见目标不泄露存在性。

| HTTP | v3 code                                                                                    |
| ---- | ------------------------------------------------------------------------------------------ |
| 400  | `INVALID_INPUT`、`INVALID_CURSOR`                                                          |
| 401  | `AUTH_REQUIRED`                                                                            |
| 403  | `OWNER_REQUIRED`、`SCOPE_NOT_ALLOWED`                                                      |
| 404  | `POST_UNAVAILABLE`、`MEDIA_UNAVAILABLE`、`OPERATION_UNAVAILABLE`                           |
| 409  | `REVISION_CONFLICT`、`IDEMPOTENCY_CONFLICT`、`INVALID_STATE`                               |
| 410  | `UPLOAD_EXPIRED`                                                                           |
| 413  | `FILE_TOO_LARGE`、`POST_MEDIA_LIMIT`                                                       |
| 415  | `UNSUPPORTED_MEDIA`                                                                        |
| 422  | `MEDIA_INVALID`、`AUDIO_TOO_LONG`、`VIDEO_URL_UNSUPPORTED`、`RIGHTS_CONFIRMATION_REQUIRED` |
| 429  | `POST_QUOTA_EXCEEDED`、`UPLOAD_QUOTA_EXCEEDED`、`RATE_LIMITED`                             |
| 503  | `SUBMISSIONS_PAUSED`、`COMMUNITY_UNAVAILABLE`、`PROCESSING_UNAVAILABLE`                    |

### 列表与缓存

公开列表筛选为 kind、actorSlug、tool、platform、q，sort 为 latest/likes/featured。
q 只搜索标题和公开显示名，不查询邮箱。默认 pageSize=20、最大 50，非法或过限明确报错。
时间排序采用 `publishedAt + id` 和固定时间上界，可变排序使用有效期有限的稳定快照/游标。
游标不透明且绑定排序、筛选、快照和适用身份；失效报 `INVALID_CURSOR`，不静默回第一页。
每页重查当前可见性，旧快照不泄露已隐藏/删除内容；`nextCursor=null` 且 hasMore=false 才结束。
本人及 Owner 回包 `private, no-store`，与匿名公开缓存分开。

## 上传、删除和权限门槛（后端 §6、8–10）

直传流程：验证账号/本人草稿 → 原子预留额度 → 短时限定对象凭证 → 私有隔离区 →
幂等 finalize → 服务端核验真实对象及版本 → 有限资源解码/重编码、去 EXIF 等元数据 →
审核 → 受控公开。最终 MIME/容器允许表由 B2 处理器验收，不能把建议格式说成全部已支持。
隔离原件永不匿名公开；预览只给本人和 Owner。隐藏/删除须撤销旧链接及缓存访问，不能只删 URL。

视频仅 HTTPS 精确平台白名单、路径/ID 解析；YouTube、B 站、Vimeo 是首批建议，
B2 验收登记后才能启用，不沿用旧版长平台名单。拒绝假后缀、凭据 URL、私网、异常端口、
任意 iframe 和未支持短链；不抓取任意用户 URL。访客点击后才加载播放器，YouTube 用无 cookie 嵌入。
失效、禁止嵌入、私密或地区限制降级到真实标题、作者、平台与原站链接，不代理下载视频。

所有新增表强制 RLS，浏览器没有直接表读写权；网站服务端传递验证后的 JWT，
Owner 权限来自当前身份与受控登记，不是 service_role 本身或用户提交的 GUC。
紧急暂停阻止新投稿/新上传凭证及尚未提交的发布，仍允许阅读、状态查询、删除、举报、审核和清理。
非 mock/部署环境不回退 memory，也不把服务故障显示成空列表或成功。

删帖先置 deleted 并撤公开性，再持久排队清理原件、成品、封面、全部实际派生物、
未完成上传、旧修订与关联数据；保留最小恢复索引/墓碑，失败可恢复，不能迟到复活。
注销沿用账号中心 14 天取消期，期满才清理本人全部产品数据/文件；不误删共享头像或其他用户作品。
数据库、对象、缓存的真实完成回执齐全后 handler 才能成功，共享运行器随后才能删除 Auth 身份。
不能承诺收回第三方已经下载或自行保存的副本。

## C 组接入与验收

本次仅文档。C 组在 AuthKit 正式版合入、B2 固定 staging 验收通过后进行：
严格输入/输出模型、版本化 DTO/RPC 映射、三步投稿器、上传进度与恢复、我的作品、
媒体预览、初始 liked/voted 状态、举报理由与 Owner 审核/撤信/暂停，再做真实全链路验收。
先验收再开放 Community（中文“泳者”），官方示例与用户作品分开标，不以样片填充假社区。

B2 交接必须给出确切提交、前向迁移与哈希、实际 API/RPC 映射和后端 T01–T15 证据，
覆盖匿名/本人/他人/Owner 权限、三个媒体类型、配额、幂等/并发、修改复审、旧 URL/缓存撤权、
删帖和到期注销。静态、mock 或 PGlite 不代替 staging 真实身份/对象/缓存证据。
每次生产迁移、网站正式发布仍需 Owner 单独授权；普通 Git 推送不部署。

## 历史与同步记录

2026-10-09 的 v1 后端提交 `93ade1a`、`deeb433`、`7329a82` 只留本地回放证据。
当时网站 v2 选择全类型外链、取消 `post_media`、注销无需文件清理；这些前提已被
2026-10-13 Owner 的 v3 决定取代。原文保留在 Git 历史，不再作为现行实施入口。

2026-10-13 网站线程逐节核对后端 `d49cff1` 的 §2–9：范围/额度、字段、两套状态、
逻辑操作、错误码、幂等和分页已同步为本页消费摘要；原始快照留在
`.devspace-reports/next-stage/backend-v3-source.md`。这只证明文档对齐，不证明合同代码已接入。
后端继续拥有可执行合同；B2 如变更字段或映射，先更新该权威合同，再更新本消费入口并做 C 组测试。
