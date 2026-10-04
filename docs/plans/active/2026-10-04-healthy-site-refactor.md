---
id: PLAN-HEALTHY-SITE-REFACTOR
title: 新包接入与彻底重构
type: plan
status: active
canonical: true
owner: ai-assisted
created: 2026-10-04
last_reviewed: 2026-10-04
domain: product
tags:
  - refactor
  - migration
  - hygiene
  - release-readiness
pinned: false
related:
  - ADR-2026-10-03-JOIN-SWIMMER-FAMILY
  - SPEC-ACTOR-ASSET-LIBRARY
  - PLAN-SWIMMER-FAMILY-REBUILD
  - REF-CURRENT-WORK
---

# 新包接入与彻底重构

**目标**：把 `rebuild/swimmer-family` 分支变成一个**极其健康**的网站，具体是：

- 依赖都是已发布的品牌包；
- 网站自己造的轮子换成品牌组件；
- 代码按功能分区，入口清楚；
- 文档只留现行事实；
- 没有垃圾；
- 登录、存储、域名都准备好上线，但**本计划不部署**。

衡量标准是：下一个人（或 AI）改一个功能时，需要读的文件更少、更确定该改哪里、改完怎么验证一目了然。

本计划由 Codex 一次执行到底。前一份计划
[PLAN-SWIMMER-FAMILY-REBUILD](2026-10-03-swimmer-family-rebuild.md) 的第 2、3 节
（设计系统与逐页设计）**仍然是设计规则**，本计划第 3 节列出的覆盖项除外。

## 0. 执行规则

### 0.1 怎么开始

- **继续在 `rebuild/swimmer-family` 分支工作**。第一个提交只放本计划：
  `docs(plan): add healthy site refactor plan`。
- **按阶段编号顺序做（R0 → R8）**。每个阶段由若干"单元"组成；一个单元是一件内容连贯、可以单独回滚的改动，至少对应一个提交。
- **使用 `$ai-human-friendly-refactor` 技能**（位于 `~/.agents/skills/`），按它的方法推进：
  先给验证定价，再界定目标、摸清边界、选择形状、做好保护，然后一个单元一个单元地改和验，
  最后对齐文档并收尾。R3、R6、R7 三个阶段严格按这个技能执行。
- 开始前运行 `pnpm pro-gov learn recall --query "SwimmerParty refactor UIKit AuthKit"`，读命中的经验。
- 提交时遵守仓库的提交钩子。修改置顶文档（如 `current-work.md`）时，钩子会要求附加说明行
  （上一轮用的是 `Pinned-Override: REF-CURRENT-WORK`），照实添加，**不跳过钩子**。

### 0.2 阅读顺序

1. `AGENTS.md`
2. 本计划
3. ADR 与资产库 spec
4. 前一份计划的第 2、3 节
5. 已安装的品牌包文档（以 `node_modules` 中实际版本为准）：
   - UIKit：`docs/reference/component-selection-guide.md`、`theme-and-liquid.md`、
     `design-tokens.md`、`migration-3.0.md`，见 `../SwimmerUIKit/`。
   - AuthKit：`README.md`、`docs/reference/migration-0.8.md`、`examples/`，见 `../SwimmerAuthKit/`。

### 0.3 不能动的契约（任何阶段都保持不变，除非本计划明确声明修改）

- **页面网址**：`/[locale]/…` 全部路由、`/sitemap.xml`、`/robots.txt`。
- **API 路径**：`/api/assets/[slug]/[slot]/download`、`/api/assets/[slug]/bundle`、`/api/auth/*`。
- **公开静态资源路径**：`/media/**`。
- **数据格式**：消息键名、资产清单的 JSON 字段、资产词表的 key。
- **命令名**：`pnpm assets:ingest`、`pnpm assets:todo`、`pnpm verify`、`pnpm docs:check`。
- **文案**：`src/content/doctrine.ts` 的立场文案，以及内容诚实规则（不编造、不冒充）。

### 0.4 PGS 管理的东西不手改

`AGENTS.md` 中 `PGS-ROUTER` / `PGS-DELIVERY` 标记之间的内容、`.pro-gov/**`、`.agents/**`、
`docs/governance/**`、`docs/policy/shared-rules/**` 都由 PGS 管理。
发现它们过时（例如旧设计时代的技能），只写进报告的"建议"，不改文件。

### 0.5 边界

- **不推送、不合并到 `main`、不部署**。
- **不碰云端**：不创建 Vercel Blob、WAF 规则、OAuth 客户端或环境变量。
- **不调用付费接口，不改其他仓库**。
- **不读取、不打印、不提交任何凭据**。

### 0.6 变通规则（遇到麻烦时照此处理，不停下来）

1. **单元出问题**：同一单元两次修复仍不能通过它的检查，就回滚这个单元，在报告里记为"延后"，
   写清卡在哪里、试过什么，然后继续下一个单元。不要因为一个单元拖住整个计划。
2. **计划与现实冲突**：以仓库代码和已安装包的文档为准，选**保持现有行为**的做法，在报告里写明差异。
3. **品牌包缺能力**：用语义正确的原生元素加 UIKit token 实现，在报告里记为"给 UIKit 的上游请求"。
   不在网站里仿造 UIKit 组件，不改品牌包仓库。
4. **预发布包有问题挡路**：做最小的局部绕过，加一行注释写清原因和上游位置，并记入报告。
5. **截图出现意外差异**：先查原因。是已安装包文档里写明的变化，就记为预期；否则当回归处理。
6. **时间盒**：单个视觉细节最多尝试 3 次。3D 白黏土已经验收过，本计划不再调它。
7. **机器很忙时**（其他会话也在跑测试，负载明显偏高）：等负载降下来再跑整套检查。
   不要同时启动两套整套检查，也不要靠调大超时或减少测试来"跑通"。等待过程写进报告。
8. **拿不准时选"更少"**：更少文件、更少层级、更少依赖、更少文字。

### 0.7 只有这些情况才停下来写报告

1. 需要凭据、云端操作或付费调用才能继续。
2. 构建或类型检查持续失败，而且回滚最近的单元也恢复不了。
3. 发现安全问题，例如仓库里有泄漏的凭据。
4. 某个改动会删除 Owner 的创作素材、或归属不明的内容，且不删就无法继续。
   （正常情况下这类东西保留并在报告里列出，不需要停。）

## 1. 现状（2026-10-04，执行前）

- **分支**：`rebuild/swimmer-family`，比 `main` 多 8 个提交，本地重构与资产库已完成。
- **依赖仍指向本机旧候选文件**，换一台机器装不上：
  - `@pieai/swimmer-ui-kit`：`file:../SwimmerUIKit/.scratch/s6/final/swimmer-ui-kit-3.0.0.tgz`。
  - `@pieaistudio/swimmer-auth-kit`：`file:../SwimmerAuthKit/.devspace-reports/uikit3-compat-20261002/release/swimmer-auth-kit-0.8.0-rc.0.tgz`。
- **已发布的版本**：
  - UIKit `3.0.0-rc.1`：npm `next` 标签；`latest` 仍是 2.14.0。
  - AuthKit `0.8.0-rc.1`：GitHub Packages `next` 标签。
  - I18nKit `0.2.0`：npm `latest`。
  - backend-client `0.7.2`：npm `latest`。
- **网站自己做、而 rc.1 已经有现成组件的东西**：
  - 表面色 `--sp-card` / `--sp-muted`；
  - 客户端导出层 `src/ui/kit.tsx`；
  - 图标 `src/ui/icons.tsx`；
  - 状态标签 `.sp-pill`；
  - 语言切换 `LocaleSwitcher`；
  - 用 `GameModal` 做的弹窗；
  - 主按钮的路由跳转。
- **结构**：`src/` 按"层"分（components / lib / server / content / pages），一个资产功能分散在 6 个以上目录里。
  `src/content/actors.ts` 有 659 行。文案生成器是 Python 写的 `tools/gen-messages.py`（466 行），
  项目其余部分都是 TypeScript。
- **域名**：Owner 已在 Vercel 配好 `swimmerparty.swiminai.com`；代码里还是 `swimmerparty.vercel.app`。
- **已知的过时内容**（R6、R7 处理）：
  - `pnpm-workspace.yaml` 的注释还在说 next-intl；
  - `eslint` 与 `oxlint` 两套检查并存，`lint:next` 不在 `verify` 里；
  - `brainstorms/next-session-prompt.md` 是 8 月的旧提示词，要求"把黑色风格推到极端"；
  - `docs/reference/documentation-map.md` 的日期还是占位符；
  - `docs/policy/best-practice-for-this-project.md` 可能还写着旧设计和旧依赖。

## 2. 阶段

每个阶段末尾都要通过该阶段的"验收"。阶段之间不交叉：先迁移，再接管，再重构，
再加功能，最后整理文档和清理。这样每一类改动都有自己的证据，出问题时也知道该回滚哪一段。

### R0 准备与验证定价

**单元 R0.1：给验证定价**

1. 在当前 HEAD 上运行一次完整的 `pnpm verify`。
2. 分别记录各部分耗时：`check:i18n`、`typecheck`、`lint`、`format:check`、`test:tools`、`build`、Playwright。
   同一套 Playwright 连跑两次，确认结果稳定。
3. 把价格（日期、机器、各项耗时、并发数）写成注释，放在 `playwright.config.ts` 顶部。
4. 新增脚本 `pnpm check`，即"快速圈"：`check:i18n`、`typecheck`、`lint`、`format:check`、`test:tools`，
   不含构建和浏览器测试。之后每个单元跑快速圈，每个阶段末尾跑完整的 `pnpm verify`。
5. Playwright 不稳定（每次失败的地方不同）时：先按技能的方法判断是资源争抢、测试共享状态，还是真缺陷。
   把它当作一个单独的单元修好、并附证据，再进入 R1。不放宽断言。

**单元 R0.2：画面基线**

1. 用 `tools/shots.mjs`，在生产构建上拍"之前"的全套截图：所有页面 × 中英 × 明暗 × 390 / 1440，
   减少动态开启。存到 `.devspace-reports/healthy-refactor/R0/`。
2. 写一个像素比对小工具，用已有的 `sharp`，输出每张图的差异百分比。
   不超过 80 行就提交为 `tools/compare-shots.ts`，供以后的重构复用；更长就放在报告目录里，不提交。

**单元 R0.3：基线数字**

记录以下数字，报告里要做前后对比：

- 被 Git 跟踪的文件数，`src` 的文件数与行数；
- 依赖数量；
- `src` 的一级目录数；
- 高频文档（`AGENTS.md`、`README.md`、`DESIGN.md`、`current-work.md`）的总字数；
- `pnpm verify` 的总耗时。

**验收**：价格已记录；快速圈可用；基线截图和数字都已保存。

### R1 依赖迁移到已发布的包

这是**契约迁移**，会有声明过的视觉变化。

**单元 R1.1：换包**

| 包                              | 版本（精确） | 来源                               |
| ------------------------------- | ------------ | ---------------------------------- |
| `@pieai/swimmer-ui-kit`         | `3.0.0-rc.1` | npm                                |
| `@pieaistudio/swimmer-auth-kit` | `0.8.0-rc.1` | GitHub Packages                    |
| `@pieai/swimmer-backend-client` | `0.7.2`      | npm（AuthKit rc.1 要求由应用提供） |
| `@pieai/swimmer-i18n-kit`       | 保持 `0.2.0` | npm                                |

- **项目 `.npmrc`** 只写一行 `@pieaistudio:registry=https://npm.pkg.github.com`。
  读取私有包的密钥在用户级配置里，**不进仓库**。
- **装不上私有包时**（缺读取权限），改用本机的同版本安装包：
  `../SwimmerAuthKit/.devspace-reports/kit-independence-20261003/release/swimmer-auth-kit-0.8.0-rc.1.tgz`，
  装之前核对 SHA-256 等于 `a653d8984120fb1a1bcb969373f2049add37823039cbaf2ce3a8ffac17bf4bce`。
  这样做必须在报告里明确标出：上线前要换回私有仓库来源。
- **`pnpm-workspace.yaml`**：如果发布时长策略挡住了这些包，按现有写法加精确排除项。

**单元 R1.2：按迁移说明改代码**

逐条对照 UIKit 的 `migration-3.0.md`（rc.1 部分）和 AuthKit 的 `migration-0.8.md`，至少处理以下几处：

- `--game-ui-panel*` 已删除，改用四个表面层级；
- `GameProgress` 的 `tone` 已删除；
- AuthKit 的 Node 端必须由应用提供 `createAuthClient`（来自 backend-client），见 `examples/node-app.ts`；
- 任何 AuthKit 的 React 界面都要放进 `AuthUIProvider`，用 `examples/brand-controls.tsx` 的方式注入 UIKit 控件。

**验收**：

- `pnpm verify` 通过。
- 和 R0 截图逐页比对，所有差异都能归到两份迁移说明里写明的变化，比如静止水滴标签、液体进度条、中文资源圆体、表面层次。
- 差异清单写进报告。

### R2 品牌组件全面接管

这是**声明过的界面变化**，Owner 已批准。

逐项替换，每项一个单元。替换完删掉网站里对应的自制代码。

1. **图标**：全部用 `GameIcon`，删除 `src/ui/icons.tsx`。
2. **客户端导出层**：rc.1 已自带 client 边界，直接从包里引入，删除 `src/ui/kit.tsx`。
3. **表面色**：
   - 卡片用 `--game-ui-surface`，凹陷和空格用 `--game-ui-surface-sunken`，浮层用 `--game-ui-surface-raised` 加 `--game-ui-shadow-raised`。
   - 删除 `--sp-card`、`--sp-muted`。
   - `.sp-sweep` 的渐变改为从这两个 UIKit token 推出。
   - 在 `globals.css` 的 `@theme inline` 里把 `card`、`muted` 指向 UIKit token。
4. **首页主按钮**：`GameButton variant="primary"`"免费领取演员资产"（新文案 `home.ctaAssets`），
   用 `href` 加 `linkComponent`（站内的 Link）跳到 `/kit`。
   - 原来的两个文字链接放在它右侧，手机上放在下方。
   - 这一屏只能有这一个 primary。
5. **档案页主按钮**："打开资产库"用同样方式改为链接型 primary；"洽谈这位演员 →"仍是文字链接。
6. **"下载所选"常驻液体**：
   - 不再禁用；选中 0 张时点它，用 `GameToast` 提示 `assets.selectFirst`。
   - 手机底部操作条在资产页始终显示，适配安全区，页面底部留出等高空白。
7. **液体面板**：游客的登录邀请、会员的下载选项，改用 `LiquidPopover`（从 `./liquid-presence` 引入，
   同时引入它的 CSS），由"下载所选"按钮弹出。
   - 面板里的按钮一律 secondary。
   - 删除 `GameModal` 的用法和网站自己写的焦点、`Esc`、点外部关闭等代码。
8. **标签**：全部换成 `GameBadge`，删除 `.sp-pill`。tone 对应：
   - `success`：可出演、拍摄中、已开放。
   - `warning`：旧规格。
   - `neutral`：其余。
9. **语言切换**：换成 `GameLanguageMenu`。
   - 选项：中文、English，以及现有的机器翻译语言。
   - meta 文字：人工撰写的用 `common.authored`，机器翻译的用 `common.machine`。
   - 选人工语言时，用站内路由跳到同一路径、同一查询参数；选机器翻译语言时，在新标签页打开现有的翻译代理地址，`noopener`。
   - 删除 `LocaleSwitcher` 和 `<details>` 写法。`<head>` 的 hreflang 保持不变。
10. **系列跳转按钮**：资产页工具条的系列按钮改为 `GameButton size="sm"`。
    - 点击后平滑滚动到对应区块；减少动态时直接跳。
    - 用 `history.replaceState` 更新地址里的 `#series-…`。
11. **核查勾选问题**：以前在 1280px 宽度下，点格子左上的"选择 正面"按钮一次，选中数仍为 0。
    用 Playwright 分别按名字点按钮、点图片区域、按空格键，三种方式都必须能切换选中。
    是真问题就修好并写成测试；不是就在报告里写明复现结果。

**新增文案**：在消息源里加入以下两条（R3 迁移前在 `tools/gen-messages.py` 里加，迁移后在新的源文件里）：

| 键                   | 中文               | English                           |
| -------------------- | ------------------ | --------------------------------- |
| `home.ctaAssets`     | 免费领取演员资产   | Get free actor assets             |
| `assets.selectFirst` | 先勾选要下载的图。 | Select the images you want first. |

**测试**：

- 首页和档案页各有且只有一个 primary，点击后分别到达 `/kit`、`/kit/hu-qian`。
- 选中 0 张时点"下载所选"会出现提示，并且不发出下载请求。
- 液体面板：
  - 打开后焦点在面板标题；`Esc` 关闭后焦点回到"下载所选"。
  - 打开期间页面上可见的 primary 只有一个。
  - 会员的三种下载格式都能在面板里完成。
- 渲染结果里不再出现 `sp-pill`。
- 语言菜单在 1280 和 390 两种宽度下都能切换语言，并保留路径和查询参数。
  原来的"hydrated locale links"测试改为操作菜单，断言的含义不变。
- 第 11 项的三种选择方式。

**验收**：`pnpm verify` 通过；截图全套重拍，作为 R3 的"之后应当一致"的基准。

### R3 结构重构

这是**内部重构与目录调整**，行为与画面保持不变。

**选择形状**：

- 比较"保持按层分"和"按功能分"两种方案。
- 预期选择按功能分。理由：资产功能目前分散在 `components/assets`、`lib/export-*`、`lib/render-sheet`、
  `server/*`、`content/asset-*`、`pages/api` 等至少 6 处，改一个功能要跨很多目录；按功能分以后，常见改动集中在一处。
- 把选择理由和被拒绝的方案写进新的 `docs/reference/architecture.md`。

**目标形状**（名字可以按实际情况微调，但结构和依赖方向要保持）：

```text
src/
  app/                      只放路由：页面薄，只组装 features 与 site
  pages/api/                只放 Node 接口入口：薄，只调用 features/*/server
  features/
    actors/                 名册、档案页零件（ActorCard、ActorPicture、HeightScale、Mannequin）
    assets/                 资产库界面、选择与导出（拼图、ZIP、模型包）、词表与清单读取
      server/               下载、签名、存储适配器、游客限速
    account/                登录：服务端适配、会话、客户端 Provider、同账号产品列表
    stage/                  3D 白黏土舞台（原 three/）
  site/                     全站外壳：页头、页脚、明暗切换、语言菜单、PageIntro、SectionHead、Reveal、CopyBlock
  content/                  纯数据，不含逻辑
    actors/<slug>/          每位演员一个文件夹：profile.ts 与 assets.json
    actors/index.ts         名册顺序与汇总
    works.ts  pact.ts  kit.ts  doctrine.ts  site.ts
  i18n/                     保持
  lib/                      只放真正通用的小工具；放不进任何功能的才放这里
```

**规则**：

- **入口**：每个 `features/*` 有一个 `index.ts` 作为公开入口，`app/` 和 `pages/api/` 只能从入口引入。
  用 oxlint 的 `no-restricted-imports`（或等价规则）禁止跨入口的深层引用，并接进 `pnpm lint`。
  如果 oxlint 不支持所需写法，就写一个不超过 60 行的检查脚本，接进 `pnpm check`。
- **依赖方向**：`app` → `features` / `site` → `content` / `i18n` / `lib`。
  `content` 不引用任何上层。`features` 之间只能通过对方的入口互相引用，而且尽量不互相引用。
- **不切太碎**：不为拆而拆。不到约 30 行、又只被一处使用的文件，合并到使用它的地方。
  不建 `utils` 这种杂物箱，不加只转发不做事的中间层。
- **服务端与客户端分开**：同一个功能里，服务端代码放 `server/` 子目录，并以 `import "server-only"` 保护。
- **一个单元一次移动**：移动、改名，再更新所有引用，跑快速圈，再提交。

**单元清单**（按顺序做）：

1. `features/stage`
2. `site/`
3. `features/actors`
4. `content/actors/<slug>/`：拆分 `actors.ts`，并把资产清单搬到每位演员的文件夹里。
   入库脚本跟着改写入路径。
5. `features/assets`（界面、导出、模型）
6. `features/assets/server` 与 `pages/api/assets` 变薄
7. `features/account` 与 `pages/api/auth` 变薄
8. `lib/` 收尾：只留通用小工具
9. **深层引用规则接入 lint**
10. **文案源从 Python 改为 TypeScript**：
    - 用 TypeScript 的成对文案源（例如 `src/i18n/messages.source.ts`）加一个 Node 生成脚本，替换 `tools/gen-messages.py`。
    - 证明方法：生成的两份 `messages/*/messages.json` 与改动前**逐字节一致**。
    - `README` 和 `AGENTS.md` 里"改文案改哪个文件"的说明一起更新。
11. **工具统一为 TypeScript**：`tools/shots.mjs` 改为 `.ts`。工具测试的夹具放在 `tools/fixtures/`，保持现状。
12. **测试按功能整理**：
    - e2e 按 smoke、i18n、site、actors、assets、downloads、exports 分文件。
    - `final-acceptance.spec.ts` 里的断言并入对应文件。
    - 整理前后统计断言总数，**不得减少**。

**验收**：

- 每个单元都过快速圈；阶段末尾 `pnpm verify` 通过。
- 截图与 R2 末尾逐张比对，差异为 0。字体抗锯齿这类噪声不超过 0.1%，并说明来源。
- `pnpm build` 的路由清单与 R2 末尾一致。

### R4 登录接入

这是**功能**，只在本地模拟环境验证。

1. **账号适配器**（`features/account/server`）：按 AuthKit 0.8 的写法，使用 `createNodeAuth({ ...配置, createAuthClient })`，并启用 `sso`。
   - `origin`：`https://swimmerparty.swiminai.com`。本地开发时从环境变量读取，默认用本机地址。
   - `basePath`：`/api/auth`。回调地址是 `https://swimmerparty.swiminai.com/api/auth/sso-callback`。
   - Cookie 名按 AuthKit 建议使用 `__Host-` 前缀，例如 `__Host-swimmerparty-session`。
   - 登录成功后回到发起登录的页面：用 AuthKit 的 `redirectPath`，不要写死 `/zh/kit`。
   - 所有受保护的接口每个请求都新建一次适配器，并检查 `verifiedUser()`，不缓存。
2. **界面**：
   - 页头的已登录状态和"退出"，优先使用 AuthKit 的 `SsoAccount`，并通过 `AuthUIProvider` 注入 UIKit 控件。
     不合适的话，用 UIKit 的 `GameButton`、`GameBadge` 和 AuthKit 的 HTTP 接口做一个最小的账号小块，并在报告里写明原因。
   - 登录邀请面板里的"用 Swimmer 账号登录"，按 AuthKit 的 `sso-start` 动作发起。
3. **模拟模式继续保留**，供本地开发和 e2e 使用。运行在 Vercel 上时一律拒绝模拟模式（现有防误用保持）。
4. **测试**：
   - 用注入的假 AuthKit 测适配器的配置、回跳路径、Cookie 名和"不缓存"。
   - e2e 继续走模拟登录。
   - 不发出任何真实的账号请求。

**验收**：`pnpm verify` 通过；报告列出上线时需要登记的全部值（不含密钥）。

### R5 域名与上线准备

这是**配置与文档**，不部署。

1. **全站正式地址**改为 `https://swimmerparty.swiminai.com`：
   `SITE.url`、canonical、OG、sitemap、robots，以及机器翻译代理地址的推导（会变成 `swimmerparty-swiminai-com.translate.goog`）。
   相关测试同步更新。
2. **新建上线手册** `docs/reference/release.md`（reference 类型）。它是上线步骤的唯一来源，包括：
   - **环境变量表**：只写名字和用途，不写值。至少包括 `ASSET_STORE=blob`、`ACCOUNT_MODE=swimmer`、
     `GUEST_LIMITER=vercel`、Blob 凭据、`SWIMMER_*` 账号配置、读取私有包的令牌。
   - **Vercel 私有 Blob 存储**：创建方法，以及母版上传命令（`pnpm assets:ingest` 的 blob 模式）。
   - **WAF 限速规则**：编号 `guest-asset-download`，每个 IP 每 30 秒 1 次。
   - **账号中心登记请求**：客户端类型（public PKCE）、回调地址、权限范围。
     这一步交给 SwimmerBackend 的负责会话执行，手册里写清要递交的内容。
   - **私有包读取**：在 Vercel 里怎么配置读取 GitHub Packages 的令牌。
     **先在本机验证**这个方法在不提交密钥的前提下可行。验证不了，就写清待 Owner 确认的选项。
   - **上线步骤**：先发预览部署并验收，再按 `AGENTS.md` 的"Website Release Entry"流程正式上线。
   - **上线后的冒烟检查**：首页、名册、资产页、游客下载与限速、登录往返、会员打包。
   - **回滚**：回到上一个已验收的部署。
3. **预发布依赖**：UIKit 和 AuthKit 都是 rc 版本。手册写明"正式版发布后，换成精确正式版本，并重跑 `pnpm verify`"。

**验收**：`pnpm verify`、`pnpm docs:check` 通过。

### R6 文档退役与浓缩

按技能的"知识维护"方法进行：先认定每份文档的权威地位和生命周期，再决定动作。

| 文档                                                     | 动作                                                                                                                                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                              | 重写为给人看的简介：这是什么、怎么跑、目录在哪看（指向 `architecture.md`）、怎么上线（指向 `release.md`）。去掉历史和重复。                                                                       |
| `DESIGN.md`                                              | 现行设计系统的唯一来源：气质、明暗与风格、token、字体、组件对照（含本计划 R2 的规则）、液体使用规则、动效、禁止清单。去掉历史叙述，必要的取舍理由留一句话。                                       |
| `AGENTS.md`                                              | 只改 PGS 标记以外、项目自己的部分：项目一句话、目录入口、改文案的位置、验证命令。不写旧设计。                                                                                                     |
| `docs/reference/architecture.md`                         | R3 新建。目录、依赖方向、每个功能的入口、"加一位演员 / 加一个资产系列 / 加一个页面"分别改哪里。                                                                                                   |
| `docs/reference/release.md`                              | R5 新建。                                                                                                                                                                                         |
| `docs/reference/execution/current-work.md`               | 只写当前状态和下一步，不写流水账。                                                                                                                                                                |
| `docs/reference/documentation-map.md`                    | 补上真实日期和真实的文档清单。                                                                                                                                                                    |
| `docs/policy/best-practice-for-this-project.md`          | 对照现实逐条核对，删掉旧设计、旧依赖的规则，保留仍然有效的硬规则。                                                                                                                                |
| `docs/specs/active/actor-asset-library.md`               | 更新到现实：路径、Vercel Blob、rc.1、域名。仍是资产契约，保持 active。                                                                                                                            |
| `docs/plans/active/2026-10-03-swimmer-family-rebuild.md` | 改为 `completed` 并移到 `docs/plans/completed/`。附录 A 的 JSON 和附录 C 的文案表已由代码成为权威来源，删掉重复内容，留一行指针。保留决定理由与设计规则的出处说明（设计规则已迁入 `DESIGN.md`）。 |
| 本计划                                                   | 保持 `active`，在末尾写简短收尾（完成情况与报告位置），等审阅通过后再移到 completed。                                                                                                             |
| ADR                                                      | 不改。                                                                                                                                                                                            |
| `brainstorms/next-session-prompt.md`                     | 删除：过时，而且会误导 AI。                                                                                                                                                                       |
| `brainstorms/` 其余文件                                  | 保留：Owner 的创作素材，约 10 MB。新增 `brainstorms/README.md`，一句话说明"原始创意素材，不是现行事实；现行事实见 `src/content` 与 `docs`"。是否移出公开仓库由 Owner 决定，写进报告。             |
| 代码注释                                                 | 搜索并删除指向已退役事物的注释，例如 ACID、黑舞台、GSAP、next-intl、R2、`vercel.app`、`acid` 主题。                                                                                               |

**验收**：

- `pnpm docs:check` 零告警。
- 对 ACID、GSAP、next-intl、R2、`swimmerparty.vercel.app`、`sp-pill`、`GameModal` 等过时词做全仓检索，
  只允许出现在 ADR、已完成计划和报告中。检索命令与结果写进报告。
- 高频文档总字数和 R0 对比。

### R7 卫生清理

按技能的"卫生"方法：每个候选先回答五个问题，再决定动作——归属、可达性、可复现性、保留义务、敏感性。
**不确定就保留并报告。**

已知候选：

1. **两套 lint**：
   - 如果 oxlint 的 nextjs、react、jsx-a11y 插件能覆盖 eslint-config-next 的有效规则，就删掉
     `eslint`、`eslint-config-next`、`@eslint/eslintrc`、`eslint.config.mjs` 和 `lint:next`。
   - 证明方法：在删除前，用两套各跑一遍，对比两者的发现。
2. **`pnpm-workspace.yaml`**：删掉提到 next-intl 的过时注释。`allowBuilds` 里每一项都用 `pnpm why` 确认还需要，不需要就删。
3. **未使用的依赖、文件和导出**：用一次性的 `npx knip`（不加进依赖）清点，逐项确认后删除。
   如果 knip 跑得干净、误报可以配置排除，就把它作为开发依赖接进 `pnpm check`，防止垃圾回来；否则只做这一次清点。
4. **未使用的文案键**：I18nKit 的命令行没有"未使用键"检查。用一次性检索，按键名在 `src` 中逐个查找。
   注意代码里动态拼出来的键名（例如 `assets.slot.${series}.${key}`），这类键整组保留。
   确认没用的从文案源删除，再重新生成。
5. **`globals.css` 里未使用的类和变量**。
6. **`public/media` 里未被引用的文件**：检查 `portrait.webp` 是否仍被名册卡片使用。
7. **`.oxfmtignore`、`.oxlintrc.json`、`tsconfig.json` 里过时的条目**。

**验收**：

- 从干净状态（删除 `node_modules` 与 `.next`）执行 `pnpm install --frozen-lockfile && pnpm verify`，全部通过。
- 依赖数、文件数和 R0 对比。

### R8 最终验收与报告

1. 运行：`pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src`、`pnpm test:tools`，
   以及 `pnpm assets:todo SP-03`（确认工具仍然可用）。
2. 拍全套截图：所有页面 × 中英 × 明暗 × 390 / 1440，加上两块液体面板打开时的截图。
   与 R2 末尾比对：R3、R6、R7 不应带来画面差异；R4、R5 只允许有声明过的差异。
3. 前后数字对比：文件数、行数、依赖数、目录数、高频文档字数、`pnpm verify` 耗时。
4. 写报告；把上一份计划移到 completed；本计划保持 active 并写收尾；更新 current-work。
5. 最后确认工作区干净。**不推送。**

## 3. 对上一份计划设计规则的覆盖项

上一份计划第 2 节的规则继续有效，以下几条以本计划为准：

1. **液体主按钮**有两个链接型例外：首页"免费领取演员资产"、档案页"打开资产库"，用 `href` 加 `linkComponent` 实现。
   其他导航仍是文字链接。一屏最多一个 primary 不变。
2. **液体只出现在**：primary 按钮、`LiquidPopover` 面板、`GameProgress` 的液面。不用涟（`LiquidPresence`）。
3. **状态标签用 `GameBadge`**（静止的小水滴），**图标用 `GameIcon`**。
4. **表面层次用 UIKit 的四个层级 token**，网站不再自己调表面色。
5. **字体用 UIKit 默认**：Baloo 2、Geist、资源圆体。网站不覆盖字体 token。

## 4. 报告

写到 `.devspace-reports/healthy-refactor/REPORT.md`（不提交），截图和日志放在同一目录。
用中文写，依次包括：

1. 结论：每个阶段完成、部分完成或延后，各一句话。
2. 提交列表。
3. 验证定价：R0 的价格，以及之后的变化。
4. 命令与结果，包括失败过的检查、原因和修法。
5. R1 的视觉差异清单，以及每条差异在迁移说明里对应的条目。
6. 结构选择：选了什么，拒绝了什么，为什么。
7. 前后数字对比表。
8. 文档处置表（每份文档做了什么）和清理处置表（每个候选做了什么、证据是什么）。
9. 上线前需要 Owner 做的事：逐条可执行。
10. 给 UIKit、AuthKit 的上游请求。
11. 给 PGS 资产的建议，例如旧设计时代的技能。
12. 未做、延后或未验证的事项，必须如实写。

报告全文也贴在对话里。
