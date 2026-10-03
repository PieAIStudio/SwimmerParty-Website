---
id: ADR-2026-10-03-JOIN-SWIMMER-FAMILY
title: SWIMMER PARTY 并入 Swimmer 家族
type: decision
status: accepted
canonical: true
owner: human
created: 2026-10-03
last_reviewed: 2026-10-03
domain: architecture
tags:
  - brand
  - uikit
  - accounts
  - assets
pinned: false
related:
  - SPEC-ACTOR-ASSET-LIBRARY
  - REF-CURRENT-WORK
supersedes: []
superseded_by: null
---

# SWIMMER PARTY 并入 Swimmer 家族

## 背景

- 站点 2026-08 以独立的 ACID VOID 视觉上线（`DESIGN.md`）：黑舞台、酸绿、零圆角。
  依赖 `@pieai/swimmer-ui-kit@1.3.2`，但只引入样式表和 `acid` 主题变量，页面上没有
  渲染任何 UIKit 组件；该样式表约占全站 CSS 的一半。
- UIKit 3.0.0 已是干净断代的发布候选（源 `1173a45`，未发布 npm）：普通控件是平面
  水滴，唯一主操作是潮汐液体，明暗与六套风格是两条独立的轴。
- 演员资产要成为引流入口：游客浏览，Swimmer 账号带走完整资产。
- Owner 2026-10-03 会话中的决定（摘要）：要并入 Swimmer 家族、改用 UIKit 3.0；
  纯浏览的人可以单张下载但要限速，注册后可以打包下载；传统角色表"压缩了画质"
  "把中文贴在上面"，必须解决。

## 决定

1. **视觉**：本站改用 UIKit 3.0 的明暗与风格体系，退役 ACID VOID 设计与 `acid`
   主题；不再把 `acid` 上游成 UIKit 主题。全站换装另立计划，与资产库同批发布。
2. **账号**：使用 Swimmer 账号（SwimmerBackend 的同一个 Supabase 用户），经账号中心
   SSO 登录；本站不建自己的账号体系或用户表。
3. **资产**：单张、透明底、无文字的母版是演员形象的唯一来源；角色表、模型参考包、
   网页图都由站点从母版与结构化档案派生，图上不烤文字。
4. **下载分级**：游客可浏览全部预览、限速下载单张高清；Swimmer 账号可打包、组合
   与导出。

## 不变

- `src/content/doctrine.ts` 的立场（只做动画角色，绝不做真人形象）与内容诚实规则。
- zh / en 两种人工语言、其余语言明示机器翻译；多语言继续用 SwimmerI18nKit。

## 后果

- 发布依赖 UIKit 3.0.0 与 AuthKit 0.8.0 正式版。二者与 NerveKit 0.8 计划联合发布，
  前置是 University 任务 16 的消费者验收（2026-10-03 排在 University 任务 12–14
  之后）与 Owner 批准。本站开发期可在本机安装核对过 SHA-256 的候选包，不把候选包
  发布到生产。
- 3D 白膜展台、GSAP 滚动装置、Archivo 海报字、扫描线等 ACID 元素在换装计划中逐项
  重新评估，不默认保留。
- SSO 需要为本站在账号中心登记独立 OAuth 客户端与精确回调，属于发布阶段的外部配置，
  届时由 Owner 批准。
- 资产库的实现与验收见 [AI 演员资产库](../specs/active/actor-asset-library.md)。

## 重新考虑的条件

若换装样机证明 Swimmer 家族视觉无法承载演员展示，另立新决定并关联本记录；
不在产品里复制或分叉 UIKit 组件。
