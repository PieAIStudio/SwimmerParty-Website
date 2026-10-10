---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-08-20
last_reviewed: 2026-10-10
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
- UIKit 液体按压加强和 `pending` 状态：3.0.0 已发布到 npm `latest`，3.1.0 已接入本站（见下一段，本次未部署）；
- 社区和“泳者”页签等待 [SwimmerBackend v2](../swimmer-party-community-backend.md)。

2026-10-10 角色设定图独立成页（`/actors/<slug>/sheet`）与“怎么用”页、演员页“?”入口：同日第三次上线 `dpl_722szQPi2jK4UC8yDWhvVzJQ5jgn`（提交 39e05e2）。发布前 `pnpm verify`（93 项工具测试、35 项浏览器测试）、docs:check、swimmer-ui-check 通过；候选冒烟中英首页、名册、演员页、设定图页、怎么用、选角单、sitemap、robots 均 200，canonical 指向正式域名；上线后 SSO 发起仍返回跳转。登录后的 4K 设定图与附件 ZIP 需 Owner 真实账号验收。回滚目标：`dpl_4HbMbjvt5t6C7AWX3F1xcUfWbHcU`。

2026-10-10 统一账号面板：同日第四次上线 `dpl_7oFnTJAxsE9LygGXLRnXUnBo95Gg`（提交 b80e289；回滚目标 `dpl_722szQPi2jK4UC8yDWhvVzJQ5jgn`）。页签为“本站 / 全部产品 / 账号”（英文 Site / Products / Account），一行放下。登录后的头像与名字由 UIKit 3.1.0 `GameAccountMenu` 显示；“全部产品”来自账号中心 `products.json`（5 分钟缓存，失败即无产品页签）；“怎么用”的“?”提示改为换行并靠右，手机不显示；处理中的按钮改用 UIKit `pending`。名字目前取邮箱本地名、头像为首字母：邮箱验证码登录本来没有名字和头像，等账号中心提供“设置昵称和头像”时，再让会话接口改用 AuthKit 0.9 的资料字段。决定与边界见 [decisions.md](../decisions.md) 的同日条目；真实账号中心登录与产品列表由 Owner 验收。验证记录：`pnpm check`（101 项工具测试、442 个文案键）、全量 Playwright 44 项（含新增 9 项账号面板测试，全部通过）、`pnpm docs:check` 与 `swimmer-ui-check` 通过；截图在本机 `.devspace-reports/account-menu/`，不入库。

2026-10-10 演员页“?”帮助说明卡：同日第五次上线 `dpl_2c196WCgd566ysc9x2YzuBdqdphP`（提交 e8e0dfb；回滚目标 `dpl_7oFnTJAxsE9LygGXLRnXUnBo95Gg`）。“?”改用 UIKit 3.2.1 `GameHelpCard`：懒人包 / 设定图 / 选角单三个页签，各配一段循环演示（`public/help/<locale>/`，由 `tools/help-clips` 复录），底部链接到“怎么用”。同批：领取懒人包成功后显示“已开始下载”，英文选角单数量改为不随单复数变化的写法，英文设定图页预设按钮在 1024 宽不再重叠。UIKit 3.2.1 修了服务端传入触发器时个别演员页渲染失败的问题，并让页签保持一行。验证记录：`pnpm verify`（108 项工具测试、52 项浏览器测试）、docs:check、swimmer-ui-check 通过；候选冒烟中英演员页（含曾失败的 zhang-qiang、chen-wei、misha-luo）、设定图页、怎么用、选角单与演示文件均 200。截图在本机 `.devspace-reports/help-card/`，不入库。

并行：`media-pack/` 里包满、雷乐、范一鸣及新面孔比例修正仍在制作，属于其他会话，不在这里接管。
