---
id: REF-RELEASE
title: Release
type: reference
status: active
canonical: true
owner: human
created: 2026-10-04
last_reviewed: 2026-10-04
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
UIKit `3.0.0-rc.1`、AuthKit `0.8.0-rc.1` 当前按精确版本安装；正式版发布后换成精确正式版本并重跑 `pnpm verify`。

## 环境变量与安装权限

| 名字                      | 用途                                                      |
| ------------------------- | --------------------------------------------------------- |
| `ASSET_STORE`             | 发布设为 `blob`，私有母版存储                             |
| `ACCOUNT_MODE`            | 发布设为 `swimmer`，禁止模拟身份                          |
| `GUEST_LIMITER`           | 发布设为 `vercel`，禁止内存限速                           |
| `BLOB_READ_WRITE_TOKEN`   | 平台注入的私有 Blob 权限；也可由 SDK 使用平台支持的 OIDC  |
| `SWIMMER_ORIGIN`          | 当前部署的已登记 HTTPS origin                             |
| `SWIMMER_BACKEND_URL`     | 账号后端的 HTTPS origin                                   |
| `SWIMMER_PUBLISHABLE_KEY` | 后端 publishable key                                      |
| `SWIMMER_ACCOUNT_URL`     | 账号中心入口                                              |
| `SWIMMER_OAUTH_CLIENT_ID` | 已登记的 public PKCE 客户端标识                           |
| `SWIMMER_COOKIE_PASSWORD` | 会话加密密码，至少 32 字符                                |
| `NODE_AUTH_TOKEN`         | 拟用于构建时读取 GitHub Packages 的令牌；见下面未验证事项 |

变量值只由授权人员放入环境或平台配置，不写进 Git、日志或截图。项目 `.npmrc` 只保存 registry 映射。
现有用户级安装配置已成功读取 AuthKit，隔离 worktree 也已通过离线 frozen install；这不证明 Vercel 已具备读取权限。

**待 Owner 确认的私有包安装选项**：由部署平台在构建前生成临时用户级 npm 配置，使用环境变量引用 `NODE_AUTH_TOKEN`，或采用平台支持的私有包凭据配置。只授权 `read:packages` 所需范围；禁止将实际令牌写入项目 `.npmrc`，禁止回显。先在授权的干净环境跑 `pnpm install --frozen-lockfile` 验证，再用于部署。本轮没有读取凭据，未验证该平台方案。

## 存储、限速与账号登记

1. 在已绑定的 Vercel `swimmerparty` 项目 Storage 中创建 **private** Blob，连接目标环境并注入权限。不要创建 public 母版桶。
2. 制作方按[资产 spec](../specs/active/actor-asset-library.md)把母版放到 `assets-inbox/SP-XX/`。先跑 `pnpm assets:ingest SP-XX --dry-run`，再在授权环境执行 `ASSET_STORE=blob ACCOUNT_MODE=swimmer GUEST_LIMITER=vercel pnpm assets:ingest SP-XX`。模式由环境变量选择，没有 `--blob` 参数。旧规格才加 `--legacy`。保留公开预览和清单的同次提交，母版不得在同一对象键下换字节。
3. 在项目 Firewall 中登记供 `checkRateLimit` 调用的规则 `guest-asset-download`，按 IP 每 30 秒 1 次。只有游客请求调用它；规则缺失时 API 应返回私有 503，不能自动降级。
   该规则必须是 `@vercel/firewall` 的 Rate limit ID 条件；发布前运行 `vercel firewall rules inspect guest-asset-download` 核对。
4. 将以下请求交给 SwimmerBackend 的负责会话：产品 SWIMMER PARTY、public OAuth PKCE 客户端、origin `https://swimmerparty.swiminai.com`、精确回调 `https://swimmerparty.swiminai.com/api/auth/sso-callback`、scope `openid email profile`。不得登记通配回调或附加权限。账号中心的授权页与 `/account` 管理页必须实际挂载。取得客户端标识后配置环境；本手册不代替该团队的登记流程。
5. Cookie 为 `__Host-swimmerparty-session`，由 AuthKit 管理。已安装 AuthKit 要求 HTTPS origin；HTTP localhost 仅供 mock 模式。本地真实 SSO 验证需显式配置已登记 HTTPS origin，不能关闭 Secure 或弱化回调校验。

## 发布顺序

1. 选择干净、已提交候选，运行 `pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src`。按项目要求完成该精确提交的人工 Actions 验收；失败不得发布。
2. 确认 Vercel 绑定 `swimmerparty` / `pie-0f420159`。未绑定时由获授权的发布会话执行 `vercel link --project swimmerparty --scope pie-0f420159`。
3. 使用本地已验证的 prebuilt 产物创建生产配置候选：`vercel deploy --prod --skip-domain --yes --scope pie-0f420159`。
4. 在返回的生产候选 URL 上完成冒烟；通过后执行 `vercel promote <verified-deployment-url> --scope pie-0f420159`。必须 promote 已验证的同一产物，不重建、不猜 URL。

## 冒烟与回滚

检查中英首页、名册、档案和资产页；canonical/OG/sitemap/robots 指向正式域名；游客下载保留文件名，第二次得到 429 与倒计时；SSO 登录后回到原路径及查询参数；会员 ZIP、3840×2160 拼图、模型包与退出均正常。检查私有签名链接有效期、跨域取图、过期拒绝和移动端下载。线上服务尚未验收，不能用本地模拟结果替代。

失败时停止 promote；已上线的回归由授权发布会话 promote 上一个已验收部署。保留其 URL、提交、配置和检查记录，不用重新构建未知源码代替回滚。
