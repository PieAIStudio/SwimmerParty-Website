---
id: PLAN-SITE-ROUND-8-DEEP-REFACTOR
title: 网站第八轮：最深度的重构（代码、数据、文档、对 AI 友好）
type: plan
status: completed
canonical: true
owner: ai-assisted
created: 2026-10-08
last_reviewed: 2026-10-09
domain: product
tags:
  - refactor
  - hygiene
  - documentation
  - ai-friendly
pinned: false
related:
  - PLAN-SITE-ROUND-7
  - REF-ARCHITECTURE
  - REF-RELEASE
  - REQ-SWIMMER-PARTY-COMMUNITY
---

# 网站第八轮：最深度的重构

## 背景和目标

Owner 2026-10-08 的要求，原话要点：

- 每次升级都会留下冗余，这一轮做**最深度**的重构，代码、数据、文档一起来。
- 该退役的文档退役，过去的决策浓缩下来。
- 做完以后仓库干干净净、井然有序、对 AI 特别友好。
- 该删的删，不被过去拖累；老接口该退役就退役，换成最干净、解耦的做法。
- 重构几轮都可以。

**时间**（2026-10-09 改定）：第五到第 7.5 轮已经完成并上线（首次完整发布，见 `docs/reference/execution/current-work.md`）。第八轮在**上线版本**的基础上做，做完再按 `docs/reference/release.md` 发布一次。

**对外行为不变**：以当前线上版本为准。只有本计划写明要改的，才可以改。

**方法**：按 `ai-human-friendly-refactor` 技能的循环做（`~/.claude/skills/ai-human-friendly-refactor/`，Codex 侧有同名技能）：

> 先给验证定价 → 定目标 → 画地图 → 选形状 → 加保护 → 一小块一小块改并验证 → 对齐和浓缩 → 收尾

本计划不重复技能的内容，只写这个仓库的具体目标和技能没覆盖的部分。

## 1. 执行方式

### 1.1 在哪里做

Owner 用网页版 Codex 执行：它在 GitHub 上的全新克隆里工作，开自己的分支，最后提一个 PR，不直接推 `main`，不部署。

- **安装**：
  - Node 24、pnpm 11.22.0；
  - `@pieaistudio/swimmer-auth-kit` 来自 GitHub Packages，环境的安装脚本需要一个只读 packages 的令牌；
  - e2e 需要 `pnpm exec playwright install --with-deps chromium`。
- **全新克隆里没有被忽略的本地文件**：`media-pack/library/`、`.assets-local/`、`.vercel/`、`e2e/fixtures/assets-store/`。
  - e2e 的图片夹具由 `e2e/global-setup.ts` 自动生成。
  - 有检查读 `media-pack/library/` 里的真实声音：`tools/site-rounds.test.ts` 的 lin-xiaoman 声音、e2e 的 `/api/voice/tang-yunqiu/intro`。所以全新克隆上的基线会失败。**第一块**就是让全新克隆跑通全部检查（声音也用合成夹具），先把失败的清单和原因写进报告。
  - 需要真实素材的工具（`tools/assets-upload.ts`、`tools/generate-official-samples.ts`、真实入库）第八轮不运行。
- **跟上主线**：编排器一直在往 `main` 提交 `media-pack/`。每完成一块就 rebase 到最新的 `origin/main`。冲突只可能出现在第 5.1 节动到的 `media-pack/actors/*.json`：以主线内容为准，再重做本分支的结构调整。
- 不动 Vercel、Blob、PostHog、SwimmerBackend，不跑 GitHub Actions。
- 在本机执行时，改用 `.worktrees/site-round-8` 和分支 `refactor/site-round-8`，其余相同。

### 1.2 汇报格式

报告写在 PR 描述里（第 9 节），每一块一行。不写"完成"而没有证据。

| 块  | 状态 | 证据（命令输出摘要、提交号、前后对比） | 回退方法 |
| --- | ---- | -------------------------------------- | -------- |

Claude 会逐条核对证据；过去出现过"写了完成但没做"的情况。

### 1.3 规矩

- 一块一提交，提交说明写清这块改了什么、怎么回退。用 Conventional Commits（提交钩子会检查）。
- 按路径暂存，不用 `git add -A`、`git add .`、`git stash`、`git reset --hard`、`git clean`。
- 删除是结论，不是因为"旧"。每个删除候选回答五个问题：谁拥有、有没有人在用、能不能重新生成、要不要留存、是否敏感。答不上来就保留，写进报告。
- 发布过的 Blob 原件**永不删除**，包括 126 个旧 `SP-xx` 命名的对象。
- 不改文案的意思，不改视觉。第 3.1 节把文字搬家时，逐字搬。

## 2. 对外契约（这些不能变）

| 契约           | 现在的样子                                                                                                                                       | 谁在用                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| 网址           | `/en`、`/zh` 下全部页面；`/casting`、`/pact` 和 `he-jie`、`dai-er` 的永久跳转                                                                    | 用户收藏、搜索引擎、外部链接 |
| API            | `/api/assets/[slug]/[slot]/download`、`/api/assets/[slug]/bundle`、`/api/voice/[slug]/[slot]`、`/api/auth/*`、`/api/community/*`（生产返回 503） | 网站前端                     |
| 下载文件名     | `<slug>__<series>__<key>.<ext>`；懒人包 `<slug>_starter.zip`、选角包 `swimmer-party-cast.zip` 的文件结构；署名标文件名                           | 用户                         |
| Blob 对象键    | `<slug>/<sha16>/<slug>__…__vN.png`、新面孔 `<slug>/CC-xxx.png`、`voice/<slug>/<file>`                                                            | 线上下载                     |
| 资料格式       | `character.json`、演员 `assets.json` 清单结构                                                                                                    | 会员导出、MediaFactory       |
| 项目包格式     | `media-pack/` 的结构和 `media-pack/actors/<slug>.json` 字段                                                                                      | MediaFactory、编排器         |
| 授权           | License v1.0 的条款和署名写法                                                                                                                    | 用户                         |
| 埋点           | PostHog 事件名白名单、`app=swimmerparty`、不用 cookie                                                                                            | 产品分析                     |
| 登录           | cookie `__Host-swimmerparty-session`、SSO 回调路径                                                                                               | SwimmerBackend 账号中心      |
| 开关和环境变量 | `ASSET_STORE`、`ACCOUNT_MODE`、`GUEST_LIMITER`、`NEXT_PUBLIC_COMMUNITY_ENABLED`、`NEXT_PUBLIC_POSTHOG_*`、`SWIMMER_*`                            | 部署                         |
| 发布工具       | `tools/assets-upload.ts` 的用法（见 `release.md`）                                                                                               | 发布                         |

## 3. 先给验证定价

2026-10-09 在主仓库的参考数字（Apple Silicon，Node 24）：

- `pnpm check`：约 40 秒，51 个工具测试；
- `pnpm verify`：约 3 分钟，其中构建约 1 分钟，25 个 e2e 约 30 秒；
- `pnpm docs:check`：约 10 秒。

在全新克隆里重测一次，写进 `docs/reference/verification.md`（这一页已经存在，更新它），以后的人直接看。连跑两次结果不一样的测试，先单独修好，作为有自己证据的一块。

## 4. 地图（写进报告，重构以它为依据）

| 类       | 列什么                                                |
| -------- | ----------------------------------------------------- |
| 路由     | 全部页面、API、跳转、sitemap、hreflang                |
| 代码     | 模块、依赖方向、没人引用的文件和导出                  |
| 数据     | 每个事实放在哪（第 5.1 节）                           |
| 依赖     | `package.json` 每个包的用途、使用位置，没用的、重复的 |
| 工具     | `tools/` 下 26 个文件各做什么、谁调用、还用不用       |
| 环境变量 | 在哪读、哪个环境有（只列名字）                        |
| 文案     | 没有页面使用的键；页面里绕开文案源的中英文写法        |
| 样式     | 没用的 CSS、绕开设计令牌的写法                        |
| 公开文件 | `public/` 里没被引用的文件                            |
| 测试     | 每个测试保护哪条契约；重复的、过时的                  |
| 文档     | 每份文档的角色（真相、决策、导航、证据）和处置        |

`knip` 这类工具可以用 `pnpm dlx` 临时跑，不加进依赖；它的结论只是线索，要核实。

## 5. 目标

### 5.1 一个事实只放一个地方

已知的重复，逐项处理：

1. **演员资料有三处**：
   - `media-pack/actors/<slug>.json`：项目包，MediaFactory 和编排器读写；现在也存样片 `officialSamples`；
   - `src/content/actors/<slug>/profile.ts`（4 位正式演员）；
   - `src/content/actors/new-faces.ts`（95 位新面孔，标注来源 `media-pack/casting/new-faces-2026-10.json`）。

   决定：`media-pack/actors/<slug>.json` 和 `media-pack/casting/` 是生产侧的唯一来源。网站的演员数据由一个生成脚本从它们生成，生成文件开头标"生成的，不要手改"，另加一条测试：两边不一致就失败。只有网站才有的字段（介绍语、规格表展示文字），按"谁先写、谁维护"定归属，写进 `src/content/actors/README.md`。字段名保持向后兼容，不删项目包里的字段。

2. **文案有两套写法**：21 个页面文件里有约 96 处 `locale === "zh" ? "…" : "…"`，绕开了 `src/i18n/messages.source.ts`。
   - 全部搬进 `messages.source.ts`，逐字搬；
   - 长篇法律正文（`src/content/license.ts`、`src/content/legal.ts`）可以留在原处，在文案源顶部写明这个例外；
   - 加一条 lint 或测试，禁止页面里再出现这种写法。

3. **没人用的文案键**：例如 `casting.routes.*` 里不再渲染的字段。全部删掉，加一条测试：每个键都至少有一个使用处（动态拼接的键用白名单前缀说明）。

4. **生成物**：列出所有生成文件（文案目录、`official-samples.generated.ts`、OG 图、授权页示意图、署名标、新面孔预览图、声音清单），每个写明生成脚本，并有"源和生成物一致"的检查。不能检查的，写明原因。

5. 版本只在演员资料里；授权只在 `src/content/license.ts`；埋点白名单只在 `src/features/analytics/events.ts`；工具列表只在一个文件。逐项确认。

### 5.2 代码结构

目标形状。具体以地图为准，可以调整，理由写进报告：

```text
src/app/        只放路由：拿数据、组装页面，不写业务逻辑
src/pages/api/  薄入口，只调用功能的 server/index.ts
src/features/   按功能分：actors、assets、cast、samples、license、community、account、analytics
                每个功能对外只有 index.ts（服务端）和 client.ts（浏览器）
src/content/    纯数据，没有逻辑
src/lib/        与业务无关的小工具
tools/          按用途分子目录：assets/、site/、release/、test/，加一份 README
```

- 依赖方向：app → features → lib/content，不反向。`tools/check-boundaries.ts` 已经在锁，补上缺的规则。
- **API 路由**：现在 API 在 `pages/api`，页面在 `app`。调研 AuthKit 0.8 是否支持 App Router 的 route handler：
  - 支持，而且迁移后对外网址和响应完全不变，就迁过去，全站只剩一种路由；
  - 不支持，就保留 `pages/api`，在 `architecture.md` 写明原因。
- **要删的**：
  - 死代码和没人用的导出；
  - `SP-xx` 旧编号的代码分支，前提是没有任何清单再引用旧键：`objectPath` 的 legacy 规则、`assetFilename` 的 SP 分支、入库工具的 `--legacy`、只为旧编号存在的测试夹具；
  - `/kit` 残留；
  - 重复的下载和打包逻辑：现在应该只剩一条签名下载链路，加一个浏览器打包函数。
- **社区**：功能代码保留，因为 v1.1 要用（`docs/reference/swimmer-party-community-backend.md`）。把"本地模拟存储"和"真实后端"收进同一个适配接口，以后接 SwimmerBackend v2 只换实现、不改页面。生产环境保持关闭。
- **类型**：外部数据（项目包 JSON、资产清单、后端返回）各有一份 schema，校验和类型来自同一个定义。

### 5.3 退役老东西

逐项列出，决定"保留 / 跳转 / 退役"：

| 项                                                              | 默认处置                                                                                                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/casting`、`/pact`、`he-jie`、`dai-er` 跳转                    | 保留（可能有外部链接）                                                                                                                                   |
| 旧 `SP-xx` Blob 对象                                            | 保留，永不删；只删代码里对它们的支持                                                                                                                     |
| `.assets-local/`（本地母版库，里面的哈希已经和清单对不上）      | 确认入库工具是否还写它。还写，就在文档里写清它和 `media-pack/library/` 的分工；不写了，就从工具和文档里退役（目录本身由 Owner 决定是否删除，不要自己删） |
| `media-pack/library/packs/`（旧的服务端懒人包输出，已不再使用） | 在报告里提出，由 Owner 决定是否删除；这是被忽略的本地文件，不要自己删                                                                                    |
| 没用的依赖                                                      | 删掉；剩下的钉死版本                                                                                                                                     |
| 没用的环境变量名                                                | 从代码和文档里删掉；平台上的值由发布会话处理                                                                                                             |

### 5.4 测试

- 每个测试对应一条契约或一条用户路径。重复的合并，过时的删除。
- e2e 只留关键路径：浏览、单张下载、会员导出、懒人包、选角单、授权页、语言切换。
- 记录重构前后 `pnpm verify` 的时间。

### 5.5 文档

- **计划**：第五、六、七、7.5 轮和两份文案稿，状态改成 `completed`，移到 `docs/plans/completed/`。第八轮做完也一样。
- **决策**：`docs/reference/decisions.md` 是唯一的决策页。从计划和 `DESIGN.md` 里把仍然有效的决定浓缩进去：每条写清决定、原因、什么情况下重新考虑、证据在哪。被推翻的老决定只留一句"曾经这样，因为什么改了"。
- **真相文档按重构后的代码重写成现状**，不保留过程：`architecture.md`、`release.md`、`verification.md`、`DESIGN.md`、`current-work.md`。
  - `release.md` 里"待 Owner 确认的私有包安装选项"那段已经过时：现在用本地 prebuilt 发布。改成现状。
- **报告**：`.devspace-reports/` 现在有 38 项。只留最近一次发布和第八轮的报告；更早的，有决策价值的信息先浓缩进 `decisions.md`，再按留存规则处理。这是本机被忽略的目录，云端看不到，这一项由 Claude 合并后在本机做。
- 项目包格式只在 MediaFactory 写一处，这边只放链接。

### 5.6 对 AI 友好

- `AGENTS.md`：短、准，只说"去哪里找什么"。
- 每个功能目录一份简短 `README.md`：做什么、入口在哪、对外契约、对应测试。
- 一页 `docs/reference/how-to.md`，每条三到五步：
  - 加一位新演员；
  - 新面孔升成正式演员；
  - 给演员升版本；
  - 改一句文案；
  - 加一个样片；
  - 上传新素材到线上；
  - 加一个埋点事件；
  - 发布。
- 多步而且重复的流程（例如"新面孔升成正式演员"）做成项目技能，放在 `.agents/skills/`，菜谱里只放链接。
- 文件名和目录名一看就懂，不用缩写和内部代号。

### 5.7 安全和卫生

- 扫一遍当前文件和提交历史，看有没有误提交的密钥。有，就报告给 Owner，不要自己改历史。
- 安全响应头（CSP 等）、`/api/dev-assets` 只在本地可用、社区接口在生产返回 503：逐项确认。
- `.gitignore` 和各种缓存、临时目录：只留有用的。

## 6. 顺序

每一块按"改 → 验证 → 提交 → rebase 到 origin/main"推进：

1. 全新克隆跑通全部检查，定价和地图（第 1.1、3、4 节）；
2. 文案搬家和没用的键（5.1 第 2、3 项）；
3. 演员资料唯一来源和生成物检查（5.1 第 1、4、5 项）；
4. 代码结构、API 路由决定、删除（5.2）；
5. 退役（5.3）；
6. 测试（5.4）；
7. 文档（5.5）；
8. 对 AI 友好（5.6）；
9. 安全和卫生（5.7）；
10. 验收（第 7 节）。

验收没过，就回到对应的块再做一轮。

## 7. 验收

- **零上下文测试**：在 PR 分支上开一个全新的 AI 会话，只告诉它"读 AGENTS.md"，让它独立完成三件事，不问人、不走错地方：
  1. 改首页一句文案并通过检查；
  2. 用测试夹具把一位新面孔升到 1.0.0；
  3. 加一个埋点事件。

  记录它在哪里犹豫、读错了什么，回头修文档或结构，直到三件事都顺利。三件事的改动不提交。

- **扫描为零**：没用的文件、导出、依赖、文案键、公开文件；页面里的中英文写法。有例外的写明理由。
- **唯一来源**：第 5.1 节每项都有一致性检查兜底。
- **对外契约**：第 2 节每一行都有证据，证明没变。最有效的证据是本地构建前后的对比：
  - 全部页面的 HTML 文字（中英文）；
  - sitemap；
  - 下载文件名；
  - 懒人包内容。
- `pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src` 全过；`pnpm verify` 前后用时写进报告。

## 8. 合并和收尾

1. 最后一次 rebase 到 `origin/main`，重跑全部检查，提 PR，标题 `refactor(site): round 8 deep refactor`，描述就是第 9 节的报告。
2. Claude 在本机拉下 PR 分支，按报告逐条核对，用真实素材再跑一遍 `pnpm verify`，在本地预览上抽查页面。
3. 通过后保留一块一提交合进 `main`，推送，删除远端分支；本机和远端都只留 `main`。
4. 按 `release.md` 发布，冒烟通过后上线。

## 9. 报告

PR 描述：

- 第 1.2 节的逐块表；
- 地图；
- 删了什么、多大；
- 每条对外契约的证据；
- 前后验证用时；
- 零上下文测试记录；
- 留给 Owner 决定的事。
