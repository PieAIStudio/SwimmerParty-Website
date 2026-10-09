---
id: REF-RELEASE
title: Release
type: reference
status: active
canonical: true
owner: human
created: 2026-10-04
last_reviewed: 2026-10-09
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

| 名字                            | 用途                                                     |
| ------------------------------- | -------------------------------------------------------- |
| `ASSET_STORE`                   | 发布设为 `blob`，私有母版存储                            |
| `ACCOUNT_MODE`                  | 发布设为 `swimmer`，禁止模拟身份                         |
| `GUEST_LIMITER`                 | 发布设为 `vercel`，禁止内存限速                          |
| `BLOB_READ_WRITE_TOKEN`         | 平台注入的私有 Blob 权限；也可由 SDK 使用平台支持的 OIDC |
| `SWIMMER_ORIGIN`                | 当前部署的已登记 HTTPS origin                            |
| `SWIMMER_BACKEND_URL`           | 账号后端的 HTTPS origin                                  |
| `SWIMMER_PUBLISHABLE_KEY`       | 后端 publishable key                                     |
| `SWIMMER_ACCOUNT_URL`           | 账号中心入口                                             |
| `SWIMMER_OAUTH_CLIENT_ID`       | 已登记的 public PKCE 客户端标识                          |
| `SWIMMER_COOKIE_PASSWORD`       | 会话加密密码，至少 32 字符                               |
| `NEXT_PUBLIC_POSTHOG_KEY`       | PostHog 项目 key（浏览器可见）；取自共享的 PostHog 文件  |
| `NEXT_PUBLIC_POSTHOG_HOST`      | PostHog 地址；与 key 同一来源                            |
| `NEXT_PUBLIC_COMMUNITY_ENABLED` | 社区开关；后端 v2 上线前生产不设置（即关闭）             |

变量值只由授权人员放入环境或平台配置，不写进 Git、日志或截图。项目 `.npmrc` 只保存 registry 映射。
安装使用已有用户级 registry 配置。全新环境先以只读 packages 权限运行 pnpm install --frozen-lockfile；值不写入项目、日志或截图。本站采用本地 prebuilt 发布，不再要求 Vercel 云构建临时配置私有 npm。

## 存储、限速与账号登记

1. 在已绑定的 Vercel `swimmerparty` 项目 Storage 中创建 **private** Blob，连接目标环境并注入权限。不要创建 public 母版桶。
2. 制作方按[资产 spec](../specs/active/actor-asset-library.md)把母版放到 `media-pack/library/staging/SP-XX/`，并在 `media-pack/notes/handoffs/` 留交接单。先跑 `pnpm assets:ingest <slug-or-production-code> --dry-run`，再在授权环境执行 `ASSET_STORE=blob ACCOUNT_MODE=swimmer GUEST_LIMITER=vercel pnpm assets:ingest <slug-or-production-code>`。模式由环境变量选择，没有 `--blob` 参数。已退役 --legacy；新入库只接受当前规格。保留公开预览和清单的同次提交，母版不得在同一对象键下换字节。
   上线前把清单引用的全部原件传到私有 Blob：先 `vercel env pull --environment=production .vercel/.env.production.local`，再 `node --env-file=.vercel/.env.production.local tools/assets-upload.ts --dry-run`，确认后去掉 `--dry-run` 执行。工具按 sha256 在 `.assets-local` 和 `media-pack/library` 找原件，已存在的跳过，大小不符立即停止，不覆盖也不删除。懒人包和选角包不在存储里放 ZIP，由浏览器取签名原图现场打包。
3. 在项目 Firewall 中登记供 `checkRateLimit` 调用的规则 `guest-asset-download`，按 IP 每 30 秒 1 次。只有游客请求调用它；规则缺失时 API 应返回私有 503，不能自动降级。
   该规则必须是 `@vercel/firewall` 的 Rate limit ID 条件；发布前运行 `vercel firewall rules inspect guest-asset-download` 核对。
4. 将以下请求交给 SwimmerBackend 的负责会话：产品 SWIMMER PARTY、public OAuth PKCE 客户端、origin `https://swimmerparty.swiminai.com`、精确回调 `https://swimmerparty.swiminai.com/api/auth/sso-callback`、scope `openid email profile`。不得登记通配回调或附加权限。账号中心的授权页与 `/account` 管理页必须实际挂载。取得客户端标识后配置环境；本手册不代替该团队的登记流程。
5. Cookie 为 `__Host-swimmerparty-session`，由 AuthKit 管理。已安装 AuthKit 要求 HTTPS origin；HTTP localhost 仅供 mock 模式。本地真实 SSO 验证需显式配置已登记 HTTPS origin，不能关闭 Secure 或弱化回调校验。

## 发布顺序

1. 选择干净、已提交候选，运行 `pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src`。按项目要求完成该精确提交的人工 Actions 验收；失败不得发布。
2. 确认 Vercel 绑定 `swimmerparty` / `pie-0f420159`。未绑定时由获授权的发布会话执行 `vercel link --project swimmerparty --scope pie-0f420159`。
3. 在授权的本地发布环境同步生产配置：`vercel pull --yes --environment=production --scope pie-0f420159`，然后 `vercel build --prod`。该步骤产生 .vercel/output；检查产物与源提交对应。
4. 上传同一个本地预构建候选：`vercel deploy --prebuilt --prod --skip-domain --yes --scope pie-0f420159`。不省略 --prebuilt，不让平台另行构建。
5. 在返回的生产候选 URL 上完成冒烟；通过后执行 `vercel promote <verified-deployment-url> --scope pie-0f420159`。必须 promote 已验证的同一产物，不重建、不猜 URL。

## 冒烟与回滚

检查中英首页、名册和演员页；canonical/OG/sitemap/robots 指向正式域名；游客下载保留文件名，第二次得到 429 与倒计时；SSO 登录后回到原路径及查询参数；会员 ZIP、3840×2160 拼图、模型包与退出均正常；懒人包、选角包能下载，声音能播放和下载，新面孔试镜照能下载。检查私有签名链接有效期、跨域取图、过期拒绝和移动端下载。每个候选仍需执行真实验收；本地模拟结果不替代真实账号与云存储证据。

失败时停止 promote；已上线的回归由授权发布会话 promote 上一个已验收部署。保留其 URL、提交、配置和检查记录，不用重新构建未知源码代替回滚。
