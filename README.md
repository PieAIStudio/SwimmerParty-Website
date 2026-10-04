# SWIMMER PARTY — Website

SWIMMER PARTY 是 PieAI Studio 的原创合成演员厂牌。这个网站展示演员名册、真实片单、档案与可下载资产；只做动画角色，绝不做真人形象。没有交付的素材明确标为待交付。

## 本地运行

使用 Node 24、仓库指定的 pnpm 11。AuthKit 是 GitHub Packages 私有包，读取权限由用户级配置提供，凭据不进入仓库。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm verify
pnpm docs:check
```

开发端口 3000；浏览器测试使用 3399 的生产构建和合成素材。本地默认使用模拟账号、本地存储与内存限速，不请求账号中心或付费服务。Vercel 环境拒绝这三种本地模式。

## 内容与维护

- [架构与改动入口](docs/reference/architecture.md)：加演员、资产系列或页面。
- [设计规则](DESIGN.md)：品牌组件、明暗、排版与动效。
- [资产契约](docs/specs/active/actor-asset-library.md)：母版格式、入库和导出。
- [上线手册](docs/reference/release.md)：环境、登记、预览、发布及回滚；发布需要明确授权。
- [当前工作](docs/reference/execution/current-work.md)：本地完成情况与未验证事项。

双语界面文案编辑 `src/i18n/messages.source.ts`，运行 `pnpm messages:generate`。
`pnpm assets:todo SP-03` 生成缺图清单；入库前先运行 `pnpm assets:ingest SP-XX --dry-run`。
`brainstorms/` 保留原始创作材料，不代表现行事实。
