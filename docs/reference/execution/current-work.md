---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-08-20
last_reviewed: 2026-10-23
domain: meta
tags:
  - current-work
  - navigation
pinned: true
related: []
---

# Current Work

当前网站改进按[创作社区实施方案](../../plans/active/2026-10-13-creator-community.md)推进；阶段状态、Owner 决定与检查证据只记在方案内。2026-10-23 十人已正式上线，社区保持on，目录与网站一致；此前20个详情页、三人原图SHA及390/1440首页截图证据保留。接续③又完成一处OG URL修复并发布，原列24页中英URL正式读回全部一致；未写库、上传素材或改演员数据。源码、部署、检查与原始失败见方案十人段和根目录`PI-RESULT.md`，其余B类未扩修。下列记录保留当时的版本与验收数字，不代表当前部署、依赖或测试总数。

2026-10-13 knip 基线核对：干净 `origin/main`（`d84d3dd`，隔离检出前后均 clean）用 `pnpm dlx knip` 6.41.0 检出 7 项；A1 后只剩 `src/features/account/arrival.ts` 的 `SSO_ARRIVAL_PARAM`、`products.ts` 的 `CURRENT_PRODUCT_ID` 两项。当时记为**既有、归 Avatar 的 AuthKit 升级一起清**；A1 未新增问题，不碰账号目录、不加忽略规则。Owner 已澄清 knip 不在推送门禁中，此基线不阻塞 A1；实际门禁仍须通过。原始对比收据：`.devspace-reports/next-stage/knip-baseline/receipt.json`。

## SPEC-0002 一张脸：账号资料接入（整合门禁通过，待 Owner 批准发布）

2026-10-13 Owner 将 SWIMMER PARTY 的共享头像接入交给头像线；SSO 线继续负责 Directing。
从 `origin/main` 的 `d84d3dd` 新建 `.worktrees/authkit-avatar`，原检出的制作资料与生成物不纳入本次改动。
账号中心已发布的正式 AuthKit 版本为 **0.9.1**；本地候选将本站的 **0.8.0-rc.1** 升到同一版本。

真正缺口不只是版本：`verifiedUser()` 在 0.9.1 仍有意只返回身份，不能从它恢复头像和昵称。
真实模式的 session 路由改由 AuthKit 直接处理，菜单读取其同一次已验证响应里的 `profile`；
保留原生 PKCE、安全 cookie、MFA、每请求身份检查和下载授权，展示 helper 使用品牌包而非本站副本。
浏览器投影检查资料与身份的 UUID 一致，兼容原本的 mock 与旧部署响应；刷新后重读新头像地址。

先运行旧包/旧代码的安装适配器回归，已实际看到共享 `profile` 缺失及本地 helper 接受带凭据 URL 的失败。
撤销夹具缺少原生 `x-supabase-api-version` 响应头，已按 SDK 合同补全，不放松撤销断言；恢复执行后该项通过。另补齐测试请求的 Next API 字段以通过类型检查，不改变产品代码。
2026-10-13 15:56 恢复：冻结安装及供应链校验通过（609 项锁文件记录）；账号窄回归 **17/17**，完整 `pnpm check` 的工具测试 **114/114**，类型、lint、格式、455 个文案键与生成物检查通过；文档 **35** 份、**61** 个本地链接、零警告，UI 检查零原始颜色值。
此前重型检查曾因共享锁及负载等待：15:56 为 Visual，16:03 为 Regression，当时 1 分钟负载 **47.56**；16:45–17:45 的 60 分钟等待也未取得第一把锁。这些等待不计为通过，未抢占他人锁。
2026-10-13 19:36 按更新的 SLOTS 规则原子取得非 University 专用 `long-job-2.lock`，开跑 1 分钟负载 **20.81**；首次完整 `pnpm verify --workers=2` **通过：114 项工具测试、54/54 项浏览器测试，零失败/跳过/重试**，源码前后哈希一致，19:39 结束即释放第二把锁。手机英文及桌面中文的合成头像截图已查看；仅移除 `arrival.ts` 的 `SSO_ARRIVAL_PARAM` 和 `products.ts` 的 `CURRENT_PRODUCT_ID` 两个未用 export，常量与行为保留。证据：`.devspace-reports/authkit-avatar/verify-before-rebase-20261013-193645/{receipt.json,verify.log}`。随后先提交 `624440d`，再 rebase 到含 A1 `b9276c4`、v3 文档同步和 A2 `31d3f30` 的最新 main，得到 **d141cf7**。仅有三份文档冲突：保留两线 current-work、v3 社区决定与账号说明，MANIFEST 由 doc-gov 重生成；网站功能及制作素材未由头像线改写。

**整合后的独立完整验收通过：**19:47:25 以 1 分钟负载 **13.51** 取得第二把锁，对干净提交 **d141cf75aede31427c499a161c0a280c487239fb** 重新冻结安装，运行完整 `pnpm verify --workers=2`，**133/133 工具测试、96/96 浏览器测试，零失败/跳过/重试**；包含 A1/A2 原用例与共享头像手机/桌面刷新、清除回归。文案 446 键、类型/lint/格式/生成物、文档 **36** 份/**67** 个本地链接/零警告、UI 及 `git diff --check` 通过。**`pnpm dlx knip@6.41.0` 零问题、exit 0**，上述两个 export 已在本批清除，没有增加忽略规则。运行期间全部跟踪文件哈希一致，结束时工作树干净，截图已查看；19:50:53 释放第二把锁，本机测试监听已退出。证据：`.devspace-reports/authkit-avatar/verify-rebased-20261013-194725/` 的 `receipt.json`、`source-hashes.json`、`verify.log`、`docs.log`、`ui.log`、`knip.log` 与两张菜单截图。本段收尾只改文档，运行源码、依赖与测试保持该已验证提交一致；推送须回读 main。
只读发布预检确认目标为 `pie-0f420159/swimmerparty`、当前正式部署 **dpl_2c196WCgd566ysc9x2YzuBdqdphP**（未来本次发布的回滚目标），`guest-asset-download` 防火墙规则仍启用，1 次/30 秒/IP。本次尚无新部署，候选及真实发布验收均待完成。
证据保留在 `.devspace-reports/authkit-avatar/`：`resume-install-frozen.log`、`resume-adapter-green.log`、`resume-check-fixed.log`、`resume-source-pre-browser.json`、`resume-release-readonly.json`；原失败日志不覆盖。本段不宣称已上线。
本地两账号仅是内存传输与合成 grant，不是托管双账号验收，不创建真实用户、不发送邮件。
原阶段 4 的托管双账号安全门禁继续有效，不能换工具绕过。

### 本轮交付边界与发布前清单

2026-10-13 Owner 最新指令为使用第二把锁完成本地门禁、提交、rebase 最新 main 和推送；**正式发布必须再次获得 Owner 点头**。本轮不创建 Vercel 候选、不推广、不改 Auth 或存储配置。两次只读诊断和一条协作消息被 OpenAI“无法确定安全状态”拦下，均原样重试一次成功；文件编辑、提交和 rebase 未遇到该拦截，未换工具或改写被拦操作规避检查。

- 发布批准前：完整 `pnpm verify --workers=2`、文档、UI、差异检查均须通过，保留精确源码与日志；推送后核对远端 main 和工作树。
- Owner 批准后：重新核对 `pie-0f420159/swimmerparty`、当前正式部署与回滚目标、无其他部署、生产环境元数据及原防火墙规则；完成 [release.md](../release.md) 要求的精确提交 Actions 验收。旧回执不代替这些新检查。
- 不新增演员或上传素材，不改 OAuth 登记、Cookie 或权限配置；若候选的真实 SSO/私有下载验收需要 Owner 登录，停下来交接，不用本地夹具、转发真实 Cookie 或放宽 Host/回调限制代替。
- 仅对已验证的同一个 prebuilt 产物做推广；失败不推广，已上线回归按手册恢复获验收的上一部署。发布后再回填实际版本、部署和回滚号，SPEC-0002 不在本次未发布状态下标记全部完成。

给 Owner 的一张脸核对清单（**待新候选获准访问/发布后执行，不是已完成的结果**）：

1. 在账号中心 `/account` 确认当前昵称和头像；已保存的粉色机器人不必重复修改，不提供密码、验证码或 cookie。
2. 在 SWIMMER PARTY 用同一个泳者账号登录，回到原来的页面；电脑看右上角账号按钮，手机先打开站点菜单，再打开账号面板。应显示共享头像和昵称，不应只剩字母 P；刷新一次仍一致。
3. Directing 的 SSO 线确认正式上线统一登录后，再从其泳者账号入口进入，同账号打开账号菜单核对同一张脸与昵称；仍只有邮箱验证码入口时记为“尚未接入/未核对”，不要改走旧账号流程冒充验收。
4. 逐站记录通过或不一致、时间、页面位置；截图遮住无关身份信息。人工观察与本地夹具、托管双账号自动验收分开记录。

本站发布仍遵循 [release.md](../release.md) 的完整门禁；任何需要 Owner 登录或决策的步骤先停止。
University 接入不属于本任务。

## 既有发布与制作记录

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
- 社区和“泳者”页签等待 B2/C 组实现与验收；[v3 消费入口](../swimmer-party-community-backend.md) 已同步后端定稿，合同代码与功能开关未改。

2026-10-10 角色设定图独立成页（`/actors/<slug>/sheet`）与“怎么用”页、演员页“?”入口：同日第三次上线 `dpl_722szQPi2jK4UC8yDWhvVzJQ5jgn`（提交 39e05e2）。发布前 `pnpm verify`（93 项工具测试、35 项浏览器测试）、docs:check、swimmer-ui-check 通过；候选冒烟中英首页、名册、演员页、设定图页、怎么用、选角单、sitemap、robots 均 200，canonical 指向正式域名；上线后 SSO 发起仍返回跳转。登录后的 4K 设定图与附件 ZIP 需 Owner 真实账号验收。回滚目标：`dpl_4HbMbjvt5t6C7AWX3F1xcUfWbHcU`。

2026-10-10 统一账号面板：同日第四次上线 `dpl_7oFnTJAxsE9LygGXLRnXUnBo95Gg`（提交 b80e289；回滚目标 `dpl_722szQPi2jK4UC8yDWhvVzJQ5jgn`）。页签为“本站 / 全部产品 / 账号”（英文 Site / Products / Account），一行放下。登录后的头像与名字由 UIKit 3.1.0 `GameAccountMenu` 显示；“全部产品”来自账号中心 `products.json`（5 分钟缓存，失败即无产品页签）；“怎么用”的“?”提示改为换行并靠右，手机不显示；处理中的按钮改用 UIKit `pending`。当时名字取邮箱本地名、头像为首字母；后续共享资料接入见本页 SPEC-0002 段，原发布记录不等于新候选已经上线。决定与边界见 [decisions.md](../decisions.md) 的同日条目；真实账号中心登录与产品列表由 Owner 验收。验证记录：`pnpm check`（101 项工具测试、442 个文案键）、全量 Playwright 44 项（含新增 9 项账号面板测试，全部通过）、`pnpm docs:check` 与 `swimmer-ui-check` 通过；截图在本机 `.devspace-reports/account-menu/`，不入库。

2026-10-10 演员页“?”帮助说明卡：同日第五次上线 `dpl_2c196WCgd566ysc9x2YzuBdqdphP`（提交 e8e0dfb；回滚目标 `dpl_7oFnTJAxsE9LygGXLRnXUnBo95Gg`）。“?”改用 UIKit 3.2.1 `GameHelpCard`：懒人包 / 设定图 / 选角单三个页签，各配一段循环演示（`public/help/<locale>/`，由 `tools/help-clips` 复录），底部链接到“怎么用”。同批：领取懒人包成功后显示“已开始下载”，英文选角单数量改为不随单复数变化的写法，英文设定图页预设按钮在 1024 宽不再重叠。UIKit 3.2.1 修了服务端传入触发器时个别演员页渲染失败的问题，并让页签保持一行。验证记录：`pnpm verify`（108 项工具测试、52 项浏览器测试）、docs:check、swimmer-ui-check 通过；候选冒烟中英演员页（含曾失败的 zhang-qiang、chen-wei、misha-luo）、设定图页、怎么用、选角单与演示文件均 200。截图在本机 `.devspace-reports/help-card/`，不入库。Owner 当晚在正式站验收，很满意；演示动画的排版小问题（录制分辨率不一致）以后再调，用 `tools/help-clips` 重录即可。

并行：`media-pack/` 里包满、雷乐、范一鸣及新面孔比例修正仍在制作，属于其他会话，不在这里接管。
