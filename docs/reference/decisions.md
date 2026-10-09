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

- 演员保持动画风格，不做写实；证据：`media-pack/checks.md`。
- 演员使用永久 slug；编号只留在历史入库工具与兼容夹具中。
- 所有用途免费，包括商业用途，唯一条件是署名 `Swim In AI`；授权真相在 `src/content/license.ts`。
- 已发布的原件不删除；本地新素材进入 `media-pack/library/`，网站预览由入库工具生成。
- 产品分析只走 PostHog；本地没有分析 key 时保持空操作。
- 文件下载继续由现有本地/Blob 适配器提供，Round 7 不创建新的云端资源。
- 懒人包和选角包由浏览器取签名原图现场打包，存储里只放原件，不放 ZIP（2026-10-09）。原因：服务端函数响应上限放不下多人选角包，ZIP 换内容还要另做版本。
- 社区第一版不上线（2026-10-09）：SwimmerBackend 的 `swimmer_party` v1 只有写入接口，没有读取、作品信息、演员投票、删除和审核列表。代码保留并由开关关闭，后端补齐后再开。

改动这些决定时，先更新计划和对应工具测试，再更新本页。
