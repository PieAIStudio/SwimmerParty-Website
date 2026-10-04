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

本项目当前只完成本地验证，不在重构计划中部署。正式发布前使用干净提交，完成本地 `pnpm verify` 与人工验收，再按 `AGENTS.md` 的 Website Release Entry 执行预览、冒烟和 promote。

## 环境变量

配置名字和用途如下，值只放部署平台：`ASSET_STORE=blob`（私有 Blob）、`ACCOUNT_MODE=swimmer`（生产账号）、`GUEST_LIMITER=vercel`（访客限速）、`BLOB_READ_WRITE_TOKEN`（Blob 凭据）、`SWIMMER_BACKEND_URL`、`SWIMMER_PUBLISHABLE_KEY`、`SWIMMER_OAUTH_CLIENT_ID`、`SWIMMER_ACCOUNT_URL`、`SWIMMER_COOKIE_PASSWORD`（账号配置）、`SWIMMER_ORIGIN`（正式来源）、GitHub Packages 读取令牌（安装 AuthKit rc.1）。

## 上线前登记

在 Vercel 绑定 `swimmerparty` 项目和 `swimmerparty.swiminai.com` 域名；创建私有 Blob，并以 blob 模式运行 `pnpm assets:ingest` 上传母版。向 SwimmerBackend 负责会话的团队提交 public PKCE 客户端申请，回调地址为 `https://swimmerparty.swiminai.com/api/auth/sso-callback`，权限范围按 AuthKit 0.8 的 SSO 合同登记。访客下载 WAF 规则编号为 `guest-asset-download`，每个 IP 每 30 秒 1 次。

在 Vercel 配置 GitHub Packages 读取令牌后，先验证 `pnpm install --frozen-lockfile` 不打印密钥，再换用正式版 UIKit/AuthKit 并重跑验证。预览通过后按项目发布入口 promote，同一部署做冒烟：首页、名册、资产页、游客下载与 429、登录往返和会员打包。

回滚时 promote 上一个已验收部署；不要重新构建未知源码。正式版发布前保留当前 rc.1，正式版可用后换精确正式版本并重新运行 `pnpm verify`。
