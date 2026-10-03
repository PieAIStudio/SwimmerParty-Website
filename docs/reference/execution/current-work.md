---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-08-20
last_reviewed: 2026-10-03
domain: meta
tags:
  - current-work
  - navigation
pinned: true
related: []
---

# Current Work

This file is the current project work index. It is not the agents-routing algorithm.

## Current Focus

- Current phase: **重构已完成本地开发，等待 UIKit 3.0 / AuthKit 0.8 联合发布与资产出图**。
- Decision: [ADR：并入 Swimmer 家族](../../adr/2026-10-03-join-swimmer-family.md)。
- Current active plan: [整站重构与演员资产库](../../plans/active/2026-10-03-swimmer-family-rebuild.md)。
- Current active spec: [AI 演员资产库](../../specs/active/actor-asset-library.md)。
- Current design: [DESIGN.md](../../../DESIGN.md)，是唯一现行设计说明；本页不复制视觉规范。
- Current proof: 本地 `pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src`；
  最终结果和截图索引写入 `.devspace-reports/swimmer-family-rebuild/REPORT.md`。不以线上可访问为本轮证据。

## 本地已实现

`rebuild/swimmer-family` 从 `5bacfca` 开始；每步本地提交。此次未推送、未部署、未连接云服务。
计划暂留 active，供 Owner 按本地报告审阅；本地实现完成不等于正式发布。

- UIKit 3.0 灰阶、浅色 / 深色、全站与 404、白黏土舞台，I18nKit 0.2.0。
- 13 位演员和统一资产词表；基础包 21 格、可选系列按真实交付显示、何姐与已知身高。
- 四张旧图原字节迁移，SP-01 为 3/21、SP-02 为 1/21，其余为 0/21。
- 双语资产页、游客单张限速、模拟会员、原图 ZIP、无字拼图、按模型包和免费双语资料。
- Blob / Swimmer SSO / WAF 的独立适配器与防误部署开关；本地、合成夹具和 SDK 注入测试。

本分支仍引用邻接 UIKit / AuthKit 候选包。真实透明母版、云存储、账号中心登记、WAF
规则、跨域签名下载和真实设备体验都没有因此自动完成。Veo 三图包缺表情时明确说明，
不制造假素材；Seedance 九图上限仍待官方核实。

## 下一步（按优先级）

| 优先级 | 事项与责任                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| P0     | Owner / 审阅者按计划第 2、3、9 节复核本地分支、报告和截图；批准后再结束本计划                                                        |
| P0     | Owner 协调 UIKit 3.0 / AuthKit 0.8 联合发布，网站再切正式依赖并回归                                                                  |
| P0     | 经另行授权，登记公开 PKCE 客户端、私有 Blob 与 `guest-asset-download` WAF 规则，验收真实 SSO / 签名下载 / 限速；不是本轮自动发布任务 |
| P0     | 制作方按母版 spec 为第一位演员锁锚点并交付 21 张基础包，再执行本地入库与视觉核对                                                     |
| P1     | 其余演员逐位出图；只有真正锁定形象后才补 `promptSeed`，不猜身高                                                                      |
| P1     | 角色转台 K-07；真实 iOS / Android 下载、键盘与长会话回归                                                                             |
| P2     | 分账数字必须有真实合同依据；另行评估 OG 图与结构化数据                                                                               |

## Completed Proof History

重构前的过程记录保存在 Git 历史（基线 `5bacfca`），不混入现行设计。
已完成并通过审阅的计划 / spec 分别归档到 `docs/plans/completed/`、`docs/specs/completed/`。
不要把已归档历史重新搬回 active；新任务建立新计划并引用既有证据。
