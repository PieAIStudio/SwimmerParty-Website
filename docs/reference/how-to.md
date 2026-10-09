---
id: REF-HOW-TO
title: Common changes
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-09
last_reviewed: 2026-10-09
domain: engineering
tags:
  - maintenance
  - navigation
pinned: false
---

# 常见修改

先定位唯一源，再生成，再检查；不直接改生成物。事实归属见[演员数据](../../src/content/actors/README.md)，工具参数见[工具入口](../../tools/README.md)。公开行为与未发布资料不能因演练而改变。

## 加一位新演员

1. 制作侧批准永久 slug、艺名和身份。在 `media-pack/casting/new-faces-2026-10.json` 增加新面孔，或在 `media-pack/actors/<slug>.json` 增加正式生产记录；沿用源文件既有结构，不改项目包格式。
2. 正式演员只有批准公开后才设置 `website.published`，补齐 `demographics`、`website`、`release`；首次公开必须已经通过素材交付生成 `src/content/actors/<slug>/assets.json`；没有交付清单就先留在制作阶段，不能先假装 active 来通过检查。
3. `pnpm data:generate` 后检查生成差异，运行 `pnpm check`；发布是另一项授权任务。

## 新面孔升成正式演员

使用项目技能：[promote-new-face](../../.agents/skills/promote-new-face/SKILL.md)。步骤只在技能里维护；该技能包含不动真实资料的夹具演练。

## 给演员升版本

1. 修改该演员生产记录的 `status.version`、`release.date`、`release.note` 和既有历史；新面孔初始版本来自 casting 的 release。不在 profile 再写一次。
2. 对应母版由入库流程交付，旧对象键不能换字节；仅发布说明改变时不要重编码图片。
3. `pnpm data:generate`、`pnpm data:check`，审阅版本、导出资料和清单差异，再跑 `pnpm check`。

## 改一句文案

1. 用页面文字或键定位 `src/i18n/messages.source.ts`；同时改英文与中文，不改生成目录。结构化身份/授权文字按[架构](architecture.md)回到其源。
2. `pnpm messages:generate` 同步目录与 ICU 合同；删除键前先确认有限动态消费者。
3. `pnpm check:i18n` 和 `pnpm check`；改格式参数时检查实际渲染值，不添加临时默认文案遮住缺译。

## 加一个样片

1. 在该演员生产记录的 `officialSamples` 填写批准地址、工具和批准日期，保留真实来源；不是往生成 TS 添条目。
2. 有批准原件时按工具说明生成公开文件；普通文案/元数据编辑不运行原件转换工具。
3. `pnpm data:generate` 和 `pnpm check`，在演员页和作品页确认该片及链接；云端发布另行授权。

## 上传新素材到线上

1. 先取得明确发布授权，确认制作方交接、原件和清单一致。
2. 按 [release.md](release.md) 的存储步骤操作唯一 CLI `tools/assets-upload.ts`，先 dry-run 再上传；不覆盖同键字节，不删除旧对象。
3. 保留上传回执和清单提交，按发布手册验证签名下载。重构、普通提交和 PR 不执行本流程。

## 加一个埋点事件

1. 修改 `src/features/analytics/events.ts` 的 `POSTHOG_EVENTS` 白名单，确认不含身份、自由文本、完整 URL 等数据；类型由白名单推导。
2. 在实际交互处使用现有事件通道；需要内部别名时在同一文件的 `normalizeEvent` 映射，不写第二张外部白名单。
3. 更新 `tools/test/analytics.test.ts` 的批准事件合同，运行 `node --test tools/test/analytics.test.ts` 和 `pnpm check`。本地验证不发送 PostHog 请求。

## 发布

1. 先取得明确发布授权，用干净已提交候选跑[交付门禁](verification.md)。
2. 严格按 [release.md](release.md) 本地构建 prebuilt、部署候选并验收；不在本页复制另一份 CLI 参数。
3. 只 promote 已通过验收的同一产物；失败停止并按手册回滚。
