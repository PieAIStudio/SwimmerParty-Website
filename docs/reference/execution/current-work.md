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

2026-10-10 已上线 `dpl_BBUv7BMaX6riixQkPMQ5fxdYXHCj`（提交 213d165）：

- 第八轮重构（[记录](../../plans/completed/2026-10-08-site-round-8-deep-refactor.md)，PR #1 已合并）；
- 严琳、马乐成为第五、第六位正式演员，新面孔 93 位；
- 首页加入两组官方样片；
- 会员 ZIP 改附 License v1.0；
- 安全响应头。

上线前在本机用真实素材跑过 `pnpm verify`，候选版冒烟全部通过后才切到正式域名。

同日第二次上线 `dpl_4HbMbjvt5t6C7AWX3F1xcUfWbHcU`（提交 b8c0fad），修好了泳者账号登录：

- **登录失败的原因**：账号中心的名单里，SWIMMER PARTY 记的是一个从未生效的客户端编号。已在 SwimmerBackend 更正，详见其 `account-center-activation.md`。
- **登录按钮**：鼠标移上、获得焦点或按下时就提前发起登录，点击后立刻显示“正在前往…”。
- **处理中的 CTA**：改用 `aria-busy` 并拦截重复点击，不再禁用。禁用会让 UIKit 的液体按钮变平，按压动画被截断。

仍待处理：

- Owner 在正式站用真实账号登录，验收懒人包下载；
- UIKit 液体按压加强和 `pending` 状态：已在 SwimmerUIKit 本地做候选，npm 发布要等 Owner 恢复 `@pieai/swimmer-ui-kit` 的发布权限；
- 社区和“泳者”页签等待 [SwimmerBackend v2](../swimmer-party-community-backend.md)。

并行：`media-pack/` 里包满、雷乐、范一鸣及新面孔比例修正仍在制作，属于其他会话，不在这里接管。
