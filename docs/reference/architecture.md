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

按业务找实现，按事实找唯一源。现行视觉见 [DESIGN.md](../../DESIGN.md)，取舍理由见 [decisions.md](decisions.md)。

| 目录                                      | 职责与入口                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| src/app                                   | 页面、metadata、sitemap、重定向的薄组合层；不存业务副本                                                |
| src/pages/api                             | URL 保持不变的 Node API 薄转发入口                                                                     |
| src/features/actors                       | 名册、筛选、档案；index 是页面组合入口，queries 是纯查询入口                                           |
| src/features/assets                       | 资产浏览、选图、语音、签名下载、ZIP/拼图；index、client、queries、contracts、server/index 分别限定能力 |
| src/features/account                      | 浏览器账号状态；server/index 调用逐请求的 AuthKit                                                      |
| src/features/community                    | UI 与 mock 领域存储分离；server/index 为 API。非 mock 环境在访问账号/存储前统一返回 503                |
| src/features/home、studio、license、works | 各自页面视图，路由只交给它们所需数据                                                                   |
| src/features/cast、samples、analytics     | 选角单与选角包、官方样片、允许的产品事件                                                               |
| src/site                                  | 全站布局和视觉原语；通过 props 组合业务，不反向导入 feature                                            |
| src/content                               | 纯产品数据；演员和样片来自生产资料投影，不含查询函数                                                   |
| src/contracts                             | Zod 边界及其推导类型；不依赖产品实现                                                                   |
| src/i18n                                  | 成对文案源、生成契约、ICU 与语言路由                                                                   |
| src/lib、src/config                       | 无业务知识的浏览器/服务器工具；运行模式唯一入口 config/server.ts                                       |
| tools                                     | 按 assets / site / release / test 分组；完整归属见 [工具清单](../../tools/README.md)                   |

依赖是路由 → feature/site → content、contracts、i18n、lib。跨 feature 只用实际需要的公开入口；同 feature 内直接导入实现。纯查询和合同入口是有意保留的例外：避免浏览器和无 Next 的 Node 测试误载 server-only barrel，不为凑统一形式添加空入口。

边界检查随 lint 运行：覆盖相对/别名/动态导入、内容含行为、反向依赖、跨 feature 私有引用、循环、浏览器传递导入服务器代码及厚 API 入口。文件存储只从 server 进入；服务器能力没有顶层网络副作用。

## 为什么暂不迁移 API 到 App Router

安装的 AuthKit createNodeAuth 消费 IncomingMessage / ServerResponse；其 http 子入口不是 Web Request 路由适配器。保留 Pages API 的薄转发比增加桥接层更简单。未来只有上游提供原生适配器且合同验证通过才重评。页面仍使用 App Router。

## 真相与生成方向

生产身份、造型、版本、样片 → media-pack；网站展示覆盖 → 同一记录的 website；生成器 → profile、名单、样片及清单 looks。清单 items 仍由素材交付工具拥有。详情见 [演员数据](../../src/content/actors/README.md)。公开网址、对象键和下载名称不随目录变化。

社区现在只有本地原型；后端 v2 的必要接口见 [后端需求](swimmer-party-community-backend.md)。静态检查与 mock 通过不能当作生产可用证据。
