---
id: REF-ARCHITECTURE
title: Architecture
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-04
last_reviewed: 2026-10-09
domain: engineering
tags:
  - architecture
  - topology
pinned: false
related:
  - SPEC-ACTOR-ASSET-LIBRARY
---

# Architecture

按功能组织实现，保留全站外壳和纯内容的独立归属。拒绝继续按组件、工具、服务端三层拆散资产功能：一次导出修改现在集中在 `features/assets`，不用跨六个目录追踪。

| 路径                         | 归属与入口                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `src/app`                    | 页面路由，组合内容、site 与 feature 公共入口                                              |
| `src/pages/api`              | Node API 薄入口，调用 feature 的 `server/index.ts`                                        |
| `src/features/actors`        | 名册与档案组件；`index.ts` 是服务端组合入口，`client.ts` 只导出可在浏览器复用的图片和白膜 |
| `src/features/assets`        | 资产库 UI、词表读取、清单读取、ZIP、拼图、模型包；公共入口 `index.ts`                     |
| `src/features/assets/server` | 下载、签名、存储和游客限速；API 入口 `index.ts`                                           |
| `src/features/account`       | 客户端 Provider 和账号小块；`server/index.ts` 管理逐请求的 AuthKit 与模拟适配             |
| `src/features/stage`         | 白黏土舞台；入口只公开 `StageMount`，重型组件动态加载                                     |
| `src/site`                   | 页头、页脚、语言、明暗、文案复制与 Reveal                                                 |
| `src/content`                | 双语演员、片单、立场、条款、站点常量与资产词表数据                                        |
| `src/i18n`                   | 路由、ICU 合同、成对文案源                                                                |
| `src/lib`                    | 文件下载、减少动态及通用服务端响应/运行模式守卫                                           |

依赖方向是路由 → 功能/site → 内容/i18n/lib。跨 feature 使用公开入口；同 feature 内使用直接实现。演员的 `client.ts` 是实际构建需要的边界：若把读取文件的名册组件与浏览器组件混在唯一 barrel，Turbopack 会把 Node 依赖带入客户端。

`tools/check-boundaries.ts` 接入 lint，检查相对及别名导入、跨 feature 深层引用、内容反向依赖及客户端直引 server。`src/i18n/server.ts` 与演员/资产的服务端组件入口使用 `server-only`。普通 Node API/入库模块还要被无框架的工具测试加载，保持无顶层网络副作用并由入口检查和构建验证隔离；未宣称每个 Node 文件都有 `server-only` 标记。

## 常见改动

- **加演员**：新增 `src/content/actors/<slug>/profile.ts`，在 `actors/index.ts` 明确名册顺序；共享类型位于 `shared.ts`。无图时不伪造交付。入库工具生成该目录下的 `assets.json`；未交付演员允许没有清单文件。
- **加资产系列**：改 `src/content/asset-series.json` 的词表，以及 `src/i18n/messages.source.ts` 的双语标签；检查 `features/assets/asset-series.ts` 的解析规则，运行 `pnpm messages:generate`、`pnpm assets:todo SP-03` 和工具测试。
- **接入新媒体包**：生产描述以 `media-pack/cast/<code>.json` 为准；新图从 `media-pack/library/staging/<code>/` 接入，交接单放在 `media-pack/notes/handoffs/`，再同步网站造型副本和资产清单。
- **加页面**：在 `src/app/[locale]` 组合 feature/site；按需要更新 sitemap 和 `tools/shots.ts` 的目标列表。
- **改导出或下载**：从 `features/assets` 或其 `server` 进入。公开 `/api/assets/**`、`/api/voice/**`、`/media/**` 路径不随内部目录改变。懒人包和选角包在浏览器里用签名原图打包（`starter-pack.ts`）；声音在 Blob 模式下跳转到签名链接。
- **上线新素材**：清单更新后运行 `tools/assets-upload.ts`，步骤见 [release.md](release.md)。
- **社区**：发帖、点赞、举报和新面孔投票由 `src/content/features.ts` 的开关控制，生产默认关闭，等 SwimmerBackend 补齐读取和投票接口后再开；本地和 e2e 可设 `NEXT_PUBLIC_COMMUNITY_ENABLED=1`。

快速圈 `pnpm check`；阶段圈 `pnpm verify`；文档 `pnpm docs:check`。工具夹具在 `tools/fixtures`，浏览器夹具在 `e2e/fixtures`。截图用 `node tools/shots.ts <output-directory>`，像素比较用 `node tools/compare-shots.ts <before> <after>`；输出保留在忽略的 `.devspace-reports`。
