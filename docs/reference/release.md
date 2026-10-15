---
id: REF-RELEASE
title: Release
type: reference
status: active
canonical: true
owner: human
created: 2026-10-04
last_reviewed: 2026-10-15
domain: release
tags:
  - release
  - vercel
  - swimmer
pinned: false
related:
  - REF-ARCHITECTURE
---

# Release

本手册是上线操作的唯一步骤来源。健康重构只做本地验证；以下云端步骤须另行获得发布授权。
依赖和私有包版本以 package.json 与 lockfile 为准。安装由用户级只读 packages 权限完成，不把安装凭据交给网站运行时。

## 环境变量与安装权限

| 名字                         | 用途                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `ASSET_STORE`                | 发布设为 `blob`，私有母版存储                                                |
| `ACCOUNT_MODE`               | 发布设为 `swimmer`，禁止模拟身份                                             |
| `GUEST_LIMITER`              | 发布设为 `vercel`，禁止内存限速                                              |
| `BLOB_READ_WRITE_TOKEN`      | 平台注入的私有 Blob 权限；也可由 SDK 使用平台支持的 OIDC                     |
| `SWIMMER_ORIGIN`             | 当前部署的已登记 HTTPS origin                                                |
| `SWIMMER_BACKEND_URL`        | 账号后端的 HTTPS origin                                                      |
| `SWIMMER_PUBLISHABLE_KEY`    | 后端 publishable key                                                         |
| `SWIMMER_ACCOUNT_URL`        | 账号中心入口                                                                 |
| `SWIMMER_OAUTH_CLIENT_ID`    | 已登记的 public PKCE 客户端标识                                              |
| `SWIMMER_COOKIE_PASSWORD`    | 会话加密密码，至少 32 字符                                                   |
| `NEXT_PUBLIC_POSTHOG_KEY`    | PostHog 项目 key（浏览器可见）；取自共享的 PostHog 文件                      |
| `NEXT_PUBLIC_POSTHOG_HOST`   | PostHog 地址；与 key 同一来源                                                |
| `NEXT_PUBLIC_COMMUNITY_MODE` | 社区发布档位：`off`（默认）/ `owner` / `on`；仅按 Owner 对本次发布的授权设置 |

变量值只由授权人员放入环境或平台配置，不写进 Git、日志或截图。项目 `.npmrc` 只保存 registry 映射。
安装使用已有用户级 registry 配置。全新环境先以只读 packages 权限运行 pnpm install --frozen-lockfile；值不写入项目、日志或截图。本站采用本地 prebuilt 发布，不再要求 Vercel 云构建临时配置私有 npm。

### 社区分档发布

`NEXT_PUBLIC_COMMUNITY_MODE` 构建与运行环境必须一致；切档要重新构建并发布，不能只改已构建产物的运行变量。未设置或未知值均为 `off`，已退役的布尔开关不能开启社区。

- `off`：所有人没有社区入口，社区页面返回 404，业务 API 不可用，sitemap 不收社区。
- `owner`：登录后还须由后台 `list_review_queue` 确认 Owner 权限；入口、页面/RSC 与业务 API 分别核验。游客和非 Owner 看不到入口，社区路由返回 404，sitemap 不收社区。作品为 published 不等于此档向游客开放。
- `on`：开放公开作品和票数，投稿/互动写仍需登录，审核仍仅限后台 Owner。全开前先完成实施方案里的待办与真实验收。

发布 `owner` 档前，核对正式库的 Owner 登记及权限判定；需要补写权限数据时先报告，网站发布授权不包含数据库授权写入。后台只接受已登记的正式来源，不为本机或预览域名放宽 Origin，也不伪造正式来源。真实 Owner 投稿/审核验收在正式域名进行，候选先验证匿名与非 Owner 的隔离和主站回归；不以夹具冒充真实账号验收。具体消费合同见[社区后端入口](swimmer-party-community-backend.md)，Owner 点验步骤见[实施方案](../plans/active/2026-10-13-creator-community.md)。

## 存储、限速与账号登记

1. 在已绑定的 Vercel `swimmerparty` 项目 Storage 中创建 **private** Blob，连接目标环境并注入权限。不要创建 public 母版桶。
2. 制作方按[资产 spec](../specs/active/actor-asset-library.md)交付只读母版与来源记录；网站复制到 `assets-inbox/<slug-or-production-code>/`，不移动制作原件。先跑 `ASSET_STORE=local pnpm assets:ingest <slug-or-production-code> --dry-run`，再去掉 `--dry-run` 做本地入库。标准 v1 校验不放宽；经 Owner 授权保留交付原始画布的候选另加 `--source-originals`，必须与生产记录 `assetDelivery` 的格位、路径、版本、字节数和 SHA 精确相符，不能冒充 v1 合规。图片、声音、样片的命令和源路径只在[工具入口](../../tools/README.md)维护。公开小图与清单同次提交，原件只在忽略的 `.assets-local`，同对象键不得换字节。
   本地检查全过、rebase 正常推送之后，才上传清单引用的原件到既有私有 Blob。凭据先遵守 portfolio `.secrets/README.md`，复用本项目已有平台缓存；需要刷新时在已确认绑定的本检出执行 `vercel env pull --environment=production .vercel/.env.production.local`，不创建新凭据。运行 `node --env-file=.vercel/.env.production.local tools/assets-upload.ts --dry-run --report .devspace-reports/blob-dry-run.json`，报告实际待传数量与字节，再去掉 `--dry-run` 并使用不同回执路径正式上传。可在命令中指定演员 slug 以分批；`--source-root <只读目录>` 可重复使用，按 SHA 找现有交付，不能换源。已存在且大小相符的对象跳过，大小不符立即停止；新增对象逐个回读，并重新分页列出核对总数量、字节及旧对象保留，不覆盖、不删除。转换和上传还须遵守本次 Owner 的 SLOTS/负载约束。懒人包和选角包不在存储里放 ZIP，由浏览器取签名原图现场打包。
3. 在项目 Firewall 中登记供 `checkRateLimit` 调用的规则 `guest-asset-download`，按 IP 每 30 秒 1 次。只有游客请求调用它；规则缺失时 API 应返回私有 503，不能自动降级。
   该规则必须是 `@vercel/firewall` 的 Rate limit ID 条件；发布前运行 `vercel firewall rules inspect guest-asset-download` 核对。
4. 将以下请求交给 SwimmerBackend 的负责会话：产品 SWIMMER PARTY、public OAuth PKCE 客户端、origin `https://swimmerparty.swiminai.com`、精确回调 `https://swimmerparty.swiminai.com/api/auth/sso-callback`、scope `openid email profile`。不得登记通配回调或附加权限。账号中心的授权页与 `/account` 管理页必须实际挂载。取得客户端标识后配置环境；本手册不代替该团队的登记流程。
5. Cookie 为 `__Host-swimmerparty-session`，由 AuthKit 管理。已安装 AuthKit 要求 HTTPS origin；HTTP localhost 仅供 mock 模式。本地真实 SSO 验证需显式配置已登记 HTTPS origin，不能关闭 Secure 或弱化回调校验。

## 社区演员目录（独立数据库授权）

网站 `ACTORS` 的 `version` 与显式 `versionHistory` 是目录源；工具不默认补版本、不把未上站制作资料混入，也不重新生成媒体。`create_draft` 会检查每个演员及版本是否在正式目录启用，空目录会令合法投稿也返回 `INVALID_INPUT`。发布社区 `owner` / `on` 前必须通过目录核对，不能把“get_limits 正常”当作目录正常。

从同一个干净、已验收候选执行（`<project-ref>` 必须与本次网站 `SWIMMER_BACKEND_URL` 对应；不使用隐含的 linked 默认项目）：

```bash
pnpm community:actors:sync --project-ref <project-ref> --check
# 有差异退出 2，停止发布；先生成只读计划，交 Owner 审核全部行及 planSha256：
pnpm community:actors:sync --project-ref <project-ref> --dry-run --report .devspace-reports/catalog-plan.json
# 仅在另外获准写库后，使用刚审过的计划 SHA；不会随普通 push/build/Actions 自动执行：
pnpm community:actors:sync --project-ref <project-ref> --apply --expect-plan <planSha256>
pnpm community:actors:sync --project-ref <project-ref> --check
```

复用 Supabase CLI 已有操作员登录（按 portfolio `.secrets/README.md`）；不用新增网站环境变量，更不能向浏览器/Vercel 注入 service-role 凭据。只有操作员 CLI 可以执行；CI/Vercel 环境拒绝。查询在只读事务中；获准应用时，通过现有 Management API 连接，在有界表锁与目录快照一致性检查后，将事务角色限定为 `service_role`，只调用后端既有 `swimmer_party.service_sync_site_actor`，不直写业务表、不修改函数/迁移，不假冒任何真实用户。

应用是一笔事务：新增/恢复本站演员及源中明确的版本；目录中已不在本站的演员及不再记录的版本只禁用，不删行，历史作品引用保留。任一调用或事务内核验失败整批回滚，原生 `actor_catalog/sync` 审计只记真实变化；完全一致时不写行、不重复审计，同一批准命令重跑为无操作。若目录在审批后变化且仍需写入，停止并重新出计划；回包丢失不自动重试，先只读核对是否已提交。结束另起只读查询核实整份目录，收据只在 `.devspace-reports/`，不覆盖旧收据。

首次修复的正式目标是 `lgoknzuxefecikfyvpzk`。2026-10-15 只读盘点发现两表均为0行；对应网站97位演员、99个明确版本（含唐韵秋/罗米沙的1.0.0历史）。雷乐/常淑兰不在源名单，本次空库同步不为他们新增任何行。实际写入始终以当次计划为准，不能从本段历史数字推定执行成功。

## 发布顺序

1. 选择干净、已提交候选，运行 `pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src`。按项目要求完成该精确提交的人工 Actions 验收；失败不得发布。
   发布 `owner` / `on` 时，先完成上节 `community:actors:sync --check` 门槛；有差异只读出计划、等待单独写库授权，同步并回读通过后才能继续。
2. 确认 Vercel 绑定 `swimmerparty` / `pie-0f420159`。未绑定时由获授权的发布会话执行 `vercel link --project swimmerparty --scope pie-0f420159`。
3. 独立回读 Vercel production 环境的社区档位与本次授权一致，再同步生产配置：`vercel pull --yes --environment=production --scope pie-0f420159`，然后 `vercel build --prod`。该步骤产生 .vercel/output；检查产物、源提交与构建档位对应，不复用其他档位的旧产物。
4. 上传同一个本地预构建候选：`vercel deploy --prebuilt --prod --skip-domain --yes --scope pie-0f420159`。不省略 --prebuilt，不让平台另行构建。
5. 在返回的生产候选 URL 上完成冒烟；候选受 Deployment Protection 保护时，使用已登录的 Vercel 浏览器或在已绑定项目内通过 `vercel curl --deployment <verified-deployment-url>` 访问，不关闭保护或修改项目保护设置。社区 `owner` / `on` 在 promote 前还须对同候选再跑一次目录 `--check`；候选冒烟与目录均通过后执行 `vercel promote <verified-deployment-url> --scope pie-0f420159`。必须 promote 已验证的同一产物，不重建、不猜 URL；回读正式域名部署号，并在正式域名复验。

## 冒烟与回滚

检查中英首页、名册和演员页；canonical/OG/sitemap/robots 指向正式域名；游客下载保留文件名，第二次得到 429 与倒计时；SSO 登录后回到原路径及查询参数；会员 ZIP、3840×2160 拼图、模型包与退出均正常；懒人包、选角包能下载，声音能播放和下载，新面孔试镜照能下载。检查私有签名链接有效期、跨域取图、过期拒绝和移动端下载。每个候选仍需执行真实验收；本地模拟结果不替代真实账号与云存储证据。

失败时停止 promote；已上线的回归由授权发布会话 promote 上一个已验收部署。保留其 URL、提交、配置和检查记录，不用重新构建未知源码代替回滚。
