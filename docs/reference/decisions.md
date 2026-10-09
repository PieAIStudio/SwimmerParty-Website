---
id: REF-DECISIONS
title: Current decisions
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-08
last_reviewed: 2026-10-09
domain: product
tags:
  - decisions
pinned: false
---

# Current decisions

这里记录仍影响维护的取舍；原批准稿和执行证据留在 Git、[已完成计划](../plans/completed/)及[并入家族 ADR](../adr/2026-10-03-join-swimmer-family.md)，不作为日常操作入口。

| 决定                                             | 理由、权威源与重评条件                                                                                                                                                 |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 演员始终是原创动画形象，不能冒充真人或未交付成果 | 生产批准与 media-pack/checks.md；对应项目内容诚实规则                                                                                                                  |
| 永久 slug 是公开身份；生产编号不是网站演员副本   | 外链、下载和 MediaFactory 共用稳定身份。入库仍从生产记录解析既有 SP 编号；不保留旧编号网站路线或假演员                                                                 |
| 生产资料 → 网站投影，禁止双份编辑                | media-pack 的身份、造型、版本与网站生成档案共用一源；生成物和可检查边界见 tools/README.md                                                                              |
| 控件服从共享 UIKit，本站只拥有编辑式布局         | 不复制组件轮廓；具体风格见 DESIGN.md。未挂载的 3D 舞台和依赖已退役，不因历史方案重新引入                                                                               |
| 当前网页与懒人包使用免费 License v1.0            | 条款唯一源 src/content/license.ts。旧会员 ZIP 曾附另一版限制文字，现以 LEGACY_MEMBER_LICENSE_RULES 原样保留；是否改成 v1.0 需 Owner 单独决定，重构不擅改用户拿到的条款 |
| ZIP 在浏览器由签名原图现场打包                   | 避免多人包越过函数响应限制和重复维护 ZIP 版本；懒人包与选角包共用构建入口                                                                                              |
| Pages API 维持薄转发                             | 当前 AuthKit 需要 Node 请求/响应；不为统一目录加适配层。原生支持到位后才重评                                                                                           |
| Blob 已发布原件不删除，不在同键替换字节          | 外部签名下载依赖现有对象；包括 126 个旧 SP 命名对象。历史错误目录的派生副本可在有哈希/重生成证据后删除，不能据此清理云存储                                             |
| 本地原件两个目录暂不合并                         | .assets-local 是运行/入库缓存，media-pack/library 是制作库；只解除日常检查依赖，不擅自删除 Owner 的未发布素材                                                          |
| 社区保持关闭，所有非 mock API 返回 503           | SwimmerBackend v2 的读取、作品、投票、删除和审核边界未交付；见后端需求。禁止静默回退内存成功                                                                           |
| 分析只走 PostHog，白名单与去个人信息过滤保留     | 实现唯一源 features/analytics/events.ts；本地/测试不联网。事件别名是内部调用合同，不等于新外部事件                                                                     |
| 普通提交和 PR 不发布、不运行付费验证             | 发布必须再次授权，操作唯一入口 release.md；只 promote 验收过的同一候选产物                                                                                             |

改事实先改权威源；改取舍同时补本页理由与相应合同证据。不复制另一份版本、词表或测试计数。
