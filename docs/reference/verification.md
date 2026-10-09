---
id: REF-VERIFICATION
title: Verification commands
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-08
last_reviewed: 2026-10-09
domain: engineering
tags:
  - verification
pinned: false
---

# Verification commands

| 命令                             | 什么时候跑        | 保护什么                                                           |
| -------------------------------- | ----------------- | ------------------------------------------------------------------ |
| `pnpm check`                     | 日常代码/资料修改 | 生成物、ICU、类型、模块边界、lint、格式、工具合同                  |
| `pnpm verify`                    | 阶段及交付        | check 加浏览器关键路径；构建由 Playwright 执行一次，不复用别的服务 |
| `pnpm docs:check`                | 文档改变          | 规则、状态、MANIFEST、链接                                         |
| `pnpm exec swimmer-ui-check src` | UI 改变及交付     | 品牌组件的颜色令牌                                                 |
| `pnpm dlx knip`                  | 清理及交付        | 无消费者代码/依赖；显式的手工工具和隐式依赖例外见 tools/README.md  |

单个问题先跑相关工具测试或 Playwright 文件，不反复用整套门禁定位同一失败；修好后再做一次整体验证。命令定义只在 package.json，测试职责在 tools/README.md。

## 全新检出

1. 按 package.json 准备 Node 与 pnpm；GitHub Packages 的只读安装权限由用户级配置提供，不写进仓库。
2. `pnpm install --frozen-lockfile`；再运行 `pnpm exec playwright install --with-deps chromium`。
3. 执行上表日常、阶段、文档和 UI 检查。没有 `.assets-local/`、`media-pack/library/`、环境文件或 Vercel 绑定也应通过。

Playwright global setup 自动生成几何图片与静音 WAV/MP3；工具测试使用临时目录。不得回退到真实素材库，不得把夹具当成正式交付。下载测试通过本地 mock 账号、签名接口和浏览器保存实际 PNG/ZIP；它们不证明真实 SSO 或云服务已验收。

## 测量记录（2026-10-09）

环境：macOS arm64、10 逻辑核、Node 24.19.0、pnpm 11.22.0、5 个 Playwright worker。安装复用了本机内容缓存，不是冷网络安装。首块修复 core-js 脚本声明、真实录音依赖及无素材声音 404 后，check 为 12.78 秒，verify 连续两次为 75.69 / 67.94 秒，docs 为 6.52 秒，UI 为 4.02 秒。

第六块的单构建 verify 为 69.75 秒，81 项工具合同、20 项浏览器测试通过；测试范围与基线不同，不能仅按秒数宣称性能改善。后续交付测量和逐块日志见 PR 及 `.devspace-reports/site-round-8/`。成本随机器负载变化，不是验收阈值。

本地预览用 `pnpm dev`。真实原件生成、上传、线上账号和云验收是另行授权的发布工作，见 [release.md](release.md)。

## 安全核对的边界

第八轮对跟踪文件与 235 个可达历史提交做了脱敏密钥扫描，未发现泄漏；这不是无漏洞保证，也不改写历史。本地生产模式的 10 个社区请求全部为私有 no-store 的 503，dev-assets 为私有 no-store 的 404；没有调用真实服务。

本地 Next 响应未设置 CSP、CSP-Report-Only、X-Content-Type-Options、X-Frame-Options、Referrer-Policy、HSTS 或 Permissions-Policy。托管平台可能另加响应头，本轮没有检查线上。新增策略可能影响媒体、登录或嵌入，不在本次保持行为的重构中擅自添加；发布前由 Owner 决定后续加固。

AuthKit phone parser 已进入 API tracing，真实媒体库未进入；trace 路径匹配已安装版本，不在 next.config 复制第二个版本号。
