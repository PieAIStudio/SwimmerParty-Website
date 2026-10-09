---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-08-20
last_reviewed: 2026-10-09
domain: meta
tags:
  - current-work
  - navigation
pinned: true
related: []
---

# Current Work

首次完整发布已上线（2026-10-09，部署 `dpl_HkmX7Wp6RkfEW8M8CUWU5xcComvE`，正式站 `https://swimmerparty.swiminai.com`）：第五到第 7.5 轮全部完成；99 位演员的原图和声音从私有 Blob 签名下载；懒人包和选角包在浏览器里打包；署名标纯白、纯黑两种，和图片共用游客下载额度；PostHog 埋点已开。社区功能在生产关闭，等 SwimmerBackend v2，见[社区后端需求](../swimmer-party-community-backend.md)。

现行设计见 [DESIGN.md](../../../DESIGN.md)，目录入口见 [architecture.md](../architecture.md)，发布步骤见 [release.md](../release.md)，资产契约见[活动 spec](../../specs/active/actor-asset-library.md)。

下一步：

1. [第八轮深度重构](../../plans/active/2026-10-08-site-round-8-deep-refactor.md)：在 `.worktrees/site-round-8` 里做，对外行为不变，做完再发布一次。第五到 7.5 轮的计划和文案稿由第八轮归档。
2. 社区 v1.1：“泳者”页签，作品只收外部平台链接；先由 SwimmerBackend 交付 v2 接口。
3. Owner 在正式站用真实账号登录一次，验收懒人包下载。

并行：编排器在 `media-pack/` 交付五位全套演员（严琳、包满、雷乐、范一鸣、马乐）和新面孔比例修正，交付后按 [release.md](../release.md) 上传素材。
