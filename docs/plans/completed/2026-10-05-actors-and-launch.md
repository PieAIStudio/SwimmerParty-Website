---
id: PLAN-ACTORS-AND-LAUNCH
title: 两位演员上线与正式发布
type: plan
status: completed
canonical: true
owner: ai-assisted
created: 2026-10-05
last_reviewed: 2026-10-09
domain: product
tags:
  - assets
  - actors
  - release
  - vercel
pinned: false
related:
  - PLAN-HEALTHY-SITE-REFACTOR
  - SPEC-ACTOR-ASSET-LIBRARY
  - REF-RELEASE
  - REF-CURRENT-WORK
---

# 两位演员上线与正式发布

**最终结果**（全部做到才算完成）：

1. `https://swimmerparty.swiminai.com` 运行的是重构后的新站，`main` 干净、已推送，没有残留分支和 worktree。
2. 名册里只有唐韵秋（SP-13）和罗米沙（SP-03）两位，以**演员艺名**出现，各有 63 张素材可浏览、可下载；
   她/他在《东游记》里演的角色（何姐、戴尔）和角色造型清楚地显示出来。早期的占位内容（另外 11 位、旧片单 4 部、
   口号式文案）全部下线。
3. 游客限速、Swimmer 登录、会员打包/拼图/模型包在线上真实可用。
4. 以后加素材只要：把文件放进 `assets-inbox/<code>/`，跑一条命令，提交，发布。

本计划由 Codex 一次执行到底，阶段 P0 → P8。Owner 已在 2026-10-05 明确要求合并、推送和上线，
本计划就是这次发布授权的书面范围（见 0.5）。

## 0. 执行规则

### 0.1 怎么开始

- 从 `rebuild/swimmer-family` 开始。第一个提交只放本计划：`docs(plan): add actors and launch plan`。
- 开始前运行 `pnpm pro-gov learn recall --query "SwimmerParty assets ingest Vercel release Blob WAF"`，读命中的经验。
- 每个阶段由若干"单元"组成；一个单元是一件可以单独回滚的改动，至少一个提交。
- P1–P3 涉及结构调整的单元，使用 `$ai-human-friendly-refactor` 技能（`~/.agents/skills/`）的方法：
  先确认验证价格（R0 已记录在 `.devspace-reports/healthy-refactor/REPORT.md` 第 3 节），再改一个单元、验一个单元。
- 遵守提交钩子；改置顶文档时按钩子要求附加 `Pinned-Override:` 说明行，不跳过钩子。
- 证据和日志写到 `.devspace-reports/actors-launch/<阶段>/`（已被忽略），最终报告见第 5 节。

### 0.2 阅读顺序

1. `AGENTS.md`、本计划
2. `.devspace-reports/healthy-refactor/REPORT.md`（上一轮的结论和遗留）
3. [资产库 spec](../../specs/active/actor-asset-library.md)、[release.md](../../reference/release.md)、[architecture.md](../../reference/architecture.md)、`DESIGN.md`
4. 素材与造型说明（Owner 素材，**只读**）：`AI演员-尝试/04-演员与角色设定.md`、`07-东游记角色造型方案.md`、`08-全套素材计划与进度.md`；
   《东游记》第一集剧本 `../AnvilLocal/screenplays/go-east/东游记-EP01.fountain`（角色事实以它为准）。
5. 云端前读：`<portfolio-root>/.secrets/README.md`、`docs/policy/shared-rules/cloud-platform-access.md`
6. 登录客户端登记前读：`../SwimmerBackend/AGENTS.md` 和 `../SwimmerBackend/docs/plans/active/account-center-activation.md`
   中"Directing 第一方客户端"的登记记录（本次照这个先例做）。
7. 发布前读：`../University/docs/reference/execution/publish-lane.md` 的"本地发布实测"（本地 prebuilt 发布的先例）。

### 0.3 不变的契约（本计划明确声明的修改除外）

- 页面路由 `/[locale]/…`、`/sitemap.xml`、`/robots.txt`；API 路径 `/api/assets/[slug]/[slot]/download`、`/api/assets/[slug]/bundle`、`/api/auth/*`；公开静态路径 `/media/**`。
- 命令名 `pnpm assets:ingest`、`pnpm assets:todo`、`pnpm verify`、`pnpm docs:check`（可以加参数，不能改名）。
- 内容诚实规则：不编造作品、成绩、合作方，不冒充真人。
- **本计划声明的修改**：
  1. SP-13、SP-03 的 slug 改为 `tang-yunqiu`、`misha-luo`，旧网址永久重定向（P2）。
  2. 资产清单新增字段 `bbox`、`sourceSha256`，`object` 改为按内容寻址，`looks` 移出清单（P1）。
  3. 资产词表新增格位和画幅（P1，附录 B）。
  4. 另外 11 位名册条目、旧片单 4 部及其素材下线，旧网址跳转到名册或片单页（P2）。
  5. 全站文字按 D9 改写；`doctrine.ts`（立场）和 `pact.ts`（契约）**意思不变**，只把措辞改成平常话（P2）。

### 0.4 PGS 管理的东西不手改

`AGENTS.md` 中 PGS 标记之间的内容、`.pro-gov/**`、`.agents/**`、`docs/governance/**`、`docs/policy/shared-rules/**`。
过时就写进报告的"建议"。

### 0.5 本次授权范围

**可以做**（Owner 2026-10-05 授权）：

- 合并到 `main` 并推送；推送工作分支做备份；删除已合并的本地/远程分支和本项目的临时 worktree。
- 在 Vercel 团队 `pie-0f420159` 的 `swimmerparty` 项目里：创建并连接**私有** Blob、上传母版、添加 WAF 规则、
  设置生产环境变量、给 `swimmerparty.vercel.app` 设置跳转到正式域名、创建生产候选部署并 promote。
- 手动触发一次 `docs-check` Actions 验收（每个候选提交最多一次）。
- 按 SwimmerBackend 自己的流程，为 SWIMMER PARTY 登记一个 public PKCE 客户端（0.2 第 6 条）。
- 在 `<portfolio-root>/.secrets/` 下按 README 规则新建 `swimmerparty/` 本地配置。

**不可以做**：

- 修改或发布 UIKit、AuthKit 等品牌包仓库（见决定 D1）；改其他产品的 Vercel 项目或配置。
- 删除任何云端资源；开通新订阅、升级套餐、调高花费上限。
- 打印、提交、截图任何密钥；在项目 `.npmrc` 写令牌；关闭整个项目的 Deployment Protection。
- 生成或修改图片内容（缺图、错图只报告，不自己画、不改名掩盖）。

**预算**：生产候选部署最多 3 次；第 3 次仍不能通过验收就停下写报告。
Blob 存储约 0.2 GB，在 Vercel Pro 额度内。

### 0.6 变通规则（照此处理，不停下来）

1. **单元出问题**：同一单元两次修复仍不通过，回滚该单元，记为"延后"，写清卡点，继续下一个单元。
   但 P6、P7 里阻塞上线的单元不能跳过，见 0.7。
2. **计划与现实冲突**：以代码、已安装包文档和服务商当前文档为准，选保持现有行为的做法，报告里写明差异。
3. **命令不存在或语法变了**：先看 `--help` 和官方文档；CLI 做不到的，用已登录的浏览器在控制台完成，
   完成后用 CLI 或 API 独立回读确认。
4. **品牌包缺能力**：用语义正确的原生元素加 UIKit token 实现，记为上游请求；不在网站里仿造组件。
5. **截图出现意外差异**：先查原因；能解释就记为预期，否则当回归修复。单个视觉细节最多试 3 次。
6. **机器很忙**：负载明显偏高时等一等再跑整套检查；不同时跑两套；不靠加超时或删测试"跑通"。
7. **拿不准时选"更少"**：更少文件、层级、依赖、文字。

### 0.7 只有这些情况才停下来找 Owner

1. 登录客户端登记需要的权限 Codex 没有（例如需要 Supabase 控制台登录或管理令牌，而本机和浏览器里都没有）。
   这时把要登记的精确值写好交给 Owner，其他阶段照常推进到"候选部署验收通过"，然后等待。
2. 线上真实登录测试需要一个 Swimmer 账号，而 Codex 的浏览器里没有已登录的账号、`.secrets` 里也没有测试账号。
   这时请 Owner 在正式站登录一次，Codex 在旁边核对结果。
3. 发现安全问题（例如仓库里有泄漏的密钥）。
4. 生产候选连续 3 次验收失败，或 promote 后必须回滚且原因不明。

## 1. 现状（2026-10-05，执行前）

**代码与分支**

- `rebuild/swimmer-family` 在 `430071b`，比本地 `main` 多 46 个提交、落后 0 个，可以快进合并。工作区干净。
- 本地 `main`（`5bacfca`）比 `origin/main`（`2f945fb`）多 1 个未推送的提交，这个提交已包含在重构分支里。
- 远程只有 `main`。残留 worktree：`.worktrees/healthy-visual-baseline`（R1 历史对比用，证据已在 `.devspace-reports`）。
- 推送不会触发部署：`vercel.json` 关闭了 Git 部署，唯一的 workflow `docs-check` 只能手动触发。

**上一轮重构的遗留**（来自 REPORT.md 第 5、8、12 节）

- ESLint 范围内 4 个 React Hooks 问题未修（账号加载/选择恢复 effect、拼图预览 effect、render 期间更新 ref）；当前 verify 只跑 oxlint。
- 与 R2 截图相比，77/708 张有差异，其中 12 张超过 0.1%，待审阅。
- React 19 与 drei 间接依赖的 `use-sync-external-store` peer 警告：上游问题，保留。
- 上一份计划 `2026-10-04-healthy-site-refactor.md` 仍是 active。

**网站内容与 Owner 决定不一致**

- 网站里 SP-13 叫"何姐"（家常菜小店员工），SP-03 叫"戴尔"。Owner 2026-10-04 决定：**演员和角色分开**，
  SP-13 是演员**唐韵秋 / Tang Yunqiu**，SP-03 是演员**罗米沙 / Misha Luo**；"何姐""戴尔"是她/他在《东游记》里的角色名。
- 网站还没有"角色"这一层：`works.ts` 的 `cast` 只是演员编号。
- **Owner 2026-10-05 确认：网站上早期的内容都是占位，全部下线。**包括：
  - 名册里另外 11 位（SP-01 胡谦、SP-02 齐满、SP-04 至 SP-12），含胡谦、齐满的旧图和旧规格素材；
  - 旧片单 4 部（《我是他英语老师》《夜班》《暂名：两只手》《门岗》）；
  - 演员的一句话介绍、长介绍、"适合演什么"、语言栏、版本号等占位字段；
  - 首页、工作室、合作等页面的口号式文案（例如"合成演员工厂""像一件工业制品，不像一次侥幸"）。

**素材**（Owner 素材，在 Git 外的 `AI演员-尝试/assets-staging/`，**只复制，不移动、不修改**）

- SP-13、SP-03 各 63 张，文件名已符合 spec 命名：

  | 系列                                          | 每人张数 | 说明                                        |
  | --------------------------------------------- | -------: | ------------------------------------------- |
  | turnaround                                    |        6 | 规范 4 + 背后 3/4 左右各 1                  |
  | face                                          |        7 | 规范 3 + 另一侧 3/4、另一侧正侧、仰头、低头 |
  | expression                                    |       26 | 基础 12 + 技术 2 + 扩展 12                  |
  | pose                                          |        6 | 规范 6                                      |
  | detail                                        |        2 | hair-back、hands                            |
  | wardrobe-personal                             |        8 | 演员本人的个人风格                          |
  | wardrobe-maid（SP-13）/ wardrobe-ceo（SP-03） |        8 | 《东游记》角色造型                          |

- 全部是 ChatGPT 网页版输出：**941×1672（9:16）PNG，带透明通道**。我（Claude）实测的三个事实：
  1. **人物"不透明"区域的 alpha 大多是 250–254，不是 255**：人物有 1–2% 透明，叠在深色底上会发灰。
  2. 68/110 张的下角不透明：近景的衣服本来就延伸到画面底边；另有 3 张左上角 alpha=1（噪声）。
  3. 方向已逐张核对：`face.three-quarter` 朝画面左（角色的右）、`face.three-quarter-left` 朝画面右；
     `face.side` 朝画面左、`face.side-right` 朝画面右；`turnaround.three-quarter` 朝画面左；
     **`turnaround.side` 两人都朝画面右**（词表写的是"朝左"）；`back-three-quarter-left` 脸露在画面右、`-right` 露在画面左。
- 现在的入库工具会**全部拒收**：它要求精确尺寸 1536×2304 / 1920×1920、四角全透明；服装造型要先手写进生成文件 `assets.json`；
  同一锚点版本下改任何一张都要整套升版本。

**品牌包**：UIKit `3.0.0-rc.1`（npm `next`）、AuthKit `0.8.0-rc.1`（GitHub Packages 私有，`next`），精确锁定。

**云端**

- 正式域名和 `swimmerparty.vercel.app` 都在线，跑的是**旧版**站点（`/` 307 到 `/zh`）。项目已绑定（`.vercel/project.json`）。
- 没有 Blob、WAF 规则、登录客户端、生产环境变量。生产环境禁止 mock：`ACCOUNT_MODE` 只有 `mock` / `swimmer`，
  所以**登录客户端是上线的硬前提**。
- AuthKit 在 GitHub Packages 私有源上：Vercel 云端构建要读它就得在 Vercel 放令牌。

## 2. 关键决定（Claude 已定，Codex 照做）

**D1 品牌包：直接用精确锁定的 rc 版本上线，不发正式版。**
npm 和 GitHub Packages 的版本号发布后内容不可改，锁文件里还有完整性校验，所以 rc.1 和"内容相同的 3.0.0"在网站上没有任何区别。
发正式版要动另外两个仓库、走它们自己的发布流程，还要等其他产品验收，不该挡这次上线。
做法：`release.md` 去掉"正式版发布后才能上线"的门槛，改成"正式版出来后，作为普通依赖升级处理"。

**D2 素材上传：不引入 CMS，保留"一个文件夹 + 一条命令"，把它修好。**
评估过 Payload、Keystatic、Decap、TinaCMS 这类开源内容管理框架：它们解决的是"多人在网页后台编辑内容"，
而这里只有一个制作流程，母版要进私有存储，预览图要生成并随代码提交。加 CMS 会多一个后台、一套登录和一个数据库，
反而更复杂。图片处理继续用已有的 `sharp`（成熟的开源库）。真正的问题是入库工具太死板，P1 修它。

**D3 母版规范 v2：以 ChatGPT 网页版的实际输出为准。**
单人素材一律 941×1672（9:16）透明 PNG；仍接受 v1 的精确尺寸（以后用 API 出图时）。不放大、不裁切、不翻转
（翻转会把发缝和不对称的五官弄反）。

**D4 入库时修正透明度、测量人物范围。**
alpha ≤ 3 归 0、≥ 250 归 255，颜色不动，无损 PNG；存下修正后的文件，同时记录原文件的 `sourceSha256`。
用 alpha 测出人物上下左右边界，记为 `bbox`（百分比）。身高刻度和拼图对齐用实测值，不再假设"头顶 5%、脚底 96%"。

**D5 母版对象键按内容寻址：`<slug>/<sha256 前 16 位>/<文件名>`。**
同一个键永远对应同一份字节；重画某一格只是换一个新键，不用整套升版本。旧对象不删，报告里列出孤儿键。
"锚点版本"（文件名里的 `v1`）的含义不变：只有换脸（改 `face.front`/`turnaround.front`）才整套升 `v2`。

**D6 演员 / 角色 / 作品三层。** 演员有艺名和档案；作品在 `works.ts`，作品的演员表写"某某 饰 某某"；
角色造型是演员名下的一个 look，标明属于哪部作品的哪个角色。名册只留 SP-13、SP-03，其余条目按 Owner 要求下线（P2）。

**D7 发布走"本地 prebuilt + 生产候选 + promote"，不做单独的预览部署。**
本地已经能读私有包，`vercel build` 后 `vercel deploy --prebuilt`，Vercel 不需要包令牌，发布的正是本地验过的产物
（University 已这样发布）。登录回调只登记正式域名一个地址，所以候选网址上只验证到"跳转到账号中心、参数正确"，
完整登录在 promote 后马上在正式域名验证，不通过就立即 promote 回上一个部署。
旧站本来没有登录，所以这个窗口的风险可控。`release.md` 第 3 步"先做真实模式的预览部署"改成这个流程，并写明理由。

**D8 不另开重构阶段。** R0–R8 刚做完且有证据。这次只在新功能碰到的地方顺手调整结构
（词表画幅、造型注册、清单字段、作品角色、下线占位内容后留下的无用代码），按 refactor 技能"让下一次真实改动检验结构"的原则。

**D9 文字规则：平常话，只写有来源的事实。**（Owner 2026-10-05 要求）

- 用日常说话的词和短句。不用口号、比喻、文学化的句子。
- 只写有来源的事实：本计划附录 A、`AI演员-尝试/04-演员与角色设定.md`、《东游记》EP01 剧本。
  没有来源的数字和字段不显示（版本号"VERSION n / 10"、"推翻过的版本"、"适合演什么"、旧语言栏等）。
- 中英文意思一致，英文同样平实。
- `doctrine.ts`（立场：演员全是一眼可辨的 CG 角色，不做写实）和 `pact.ts`（契约）：意思一条不改，只改措辞。
- 所有改动过的文字在报告里列"旧 → 新"对照表，Owner 上线后可以再改。

**D10 多语言维持现有做法，补两处。** 原图上永远没有字；网站中英文人工撰写，其他 8 种语言走标明"机器翻译"的谷歌翻译；
拼图上的标签由浏览器在导出时按用户所选语言画上，给 AI 的模型包强制不带字。补：
打开标签时语言默认跟当前界面一致；拼图可选加一行标题（演员名 · 造型名），同样按所选语言。

## 3. 阶段

### P0 收口与合并

1. **截图差异审阅**：把与 R2 相比超过 0.1% 的 12 张做成前后对比页
   `.devspace-reports/actors-launch/P0/visual-review.html`，逐张写原因。能解释的记为预期；是回归就修。
2. **修 ESLint 的 4 个问题**：按 React 官方建议改写（派生状态、事件处理、`useEffectEvent` 等），不关规则、不加忽略注释。
   让 `pnpm lint:next` 只检查 `src`、`e2e` 和配置文件（排除 `.worktrees`、`.devspace-reports`、构建产物），零错误后加入 `check` 和 `verify`。
3. **关闭上一份计划**：在 `2026-10-04-healthy-site-refactor.md` 末尾写简短结论（审阅结果、ESLint 已修），用 doc-gov 的方式移到 `completed`，更新引用。
4. `pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src` 全过。
5. **合并推送**：确认 `vercel.json` 仍关闭 Git 部署、workflow 仍只有手动触发；
   `git switch main && git merge --ff-only rebuild/swimmer-family && git push origin main`。
6. **清理**：`git worktree remove .worktrees/healthy-visual-baseline`（先确认里面没有未提交改动）；删除已合并的 `rebuild/swimmer-family`；
   列出其他本地分支和 worktree，已合并的删掉，归属不明的只报告。
7. 从 `main` 开新分支 `upgrade/actors-launch`，P1–P5 在这里做；每个阶段验收后推送这个分支做备份。

**验收**：`main` 已推送并等于重构分支；12 张差异有结论；`lint:next` 在 verify 里且通过；没有残留 worktree。

### P1 母版规范 v2 与入库工具

1. **词表**（`src/content/asset-series.json` 与 `features/assets/asset-series.ts`）：
   - 画幅改为"每个系列接受的画幅列表"：新增 `portrait` 941×1672，保留旧的 `full` 1536×2304、`head` 1920×1920；
     其他尺寸拒收。删掉词表里的头顶/脚底/眼线百分比，改由 `bbox` 提供。
   - 加附录 B 的新格位；`turnaround.side` 的方向文字改成"脸朝画面右边的正侧"（与已交付的图一致）。
   - 双语标签进 `src/i18n/messages.source.ts`，运行 `pnpm messages:generate`。
2. **透明度规则**：上方两个 8×8 角 alpha ≤ 8；完全透明像素至少占一定比例（Codex 用这 126 张实测，留足余量后定阈值，写进 spec）；
   近景允许人物碰到底边。
3. **修正与测量**（D4）：alpha 修正、`sourceSha256`、`bbox`。修正前后各取一张，在中性灰和深色底上对比，确认肉眼看不出变化（深色底上发灰消失）。
4. **对象键按内容寻址**（D5）。同一格换新图：清单换成新条目，旧条目不留。
5. **造型注册移出生成文件**：每个演员一个手写的 `src/content/actors/<slug>/looks.ts`，字段：
   `id`、`kind`（`personal` | `role`）、`label`（双语）、`prompt`（英文造型描述）、`role`（可选：作品编号 + 角色 id）、
   `extras`（这个造型额外的格位：`key`、双语 `label`、英文 `direction`）。`assets.json` 只由工具生成，不再有 `looks`。
   内容见附录 C。
6. **服装格位**：每个造型固定 `front`、`three-quarter`、`side`、`back`，再加该造型 `extras` 里声明的格位，按声明顺序排列。
   格位 id 仍是 `wardrobe.<look>.<key>`。
7. **命令**：`pnpm assets:ingest SP-13 SP-03`、`pnpm assets:ingest --all`、`--dry-run`。
   dry-run 用 `sharp` 拼一张联系表（每张图下写格位名）和一份 JSON 报告，放到 `.devspace-reports/assets/<时间>/`；
   所有错误一次列全。不新增依赖。`pnpm assets:todo` 跟随新词表。
8. **测试**：每条规则有工具测试（用 941×1672 的合成夹具：半透明人物、底边碰边、角落噪声、尺寸不符、未注册造型、
   同格换图换键、重复入库无改动）。
9. **spec 改写**：资产库 spec 第 3、5 节改成"母版规范 v2"：出图方式是 ChatGPT 网页版
   （用 `~/.agents/skills/chatgpt-web-image-series` 技能），画幅、透明度规则、修正、`bbox`、造型注册、对象键；
   记录 D2 的取舍理由。去掉"何姐、戴尔现有角色表不符合规范，资产先空着"这类过时句子。

**验收**：`pnpm test:tools` 覆盖上述规则；对 `AI演员-尝试/assets-staging` 的副本跑 dry-run，126 张全部通过，联系表经 Codex 逐张看过。

### P2 演员、角色、作品

1. **下线占位内容**：
   - 删除另外 11 位的档案目录、清单、`public/media/actors/*` 和 `public/media/assets/*` 里属于他们的文件；删除旧片单 4 部。
   - 他们的旧网址（`/[locale]/actors/<slug>`、`/[locale]/kit/<slug>`）308 跳转到名册页 `/[locale]/actors` 和 `/[locale]/kit`；sitemap 不再列出。
   - 下线后已经没有旧规格素材：确认没有其他用处后，删掉旧规格（legacy）的代码路径、`--legacy` 参数、"旧规格"文案和对应测试，spec 同步。
   - 删掉因此不再使用的消息键、类型字段和组件。
2. **改名与 slug**：`git mv` 目录 `he-jie` → `tang-yunqiu`、`dai-er` → `misha-luo`，更新所有按 slug 引用的地方；`code` 不变。
   旧网址 `/[locale]/actors/he-jie`、`/[locale]/kit/he-jie`（以及 `dai-er`）308 永久跳转到新网址；sitemap 只列新网址。
3. **档案字段**：按附录 A 写入。从演员类型里去掉没有来源的字段：`version`、`castFor`，以及 `spec` 里的占位行（附录 A 列出的行除外）；
   合作页里依赖"适合演什么"的部分一并去掉或改成按附录 A 的事实显示。
4. **作品与角色**：`works.ts` 的 `cast` 改为 `{ actor: code, role?: { id, name: L, note?: L } }`。片单只有附录 A 的两部作品。
5. **全站文字改写**（D9）：清点所有用户能看到的文字——`src/i18n/messages.source.ts`、`src/content/*.ts`（含 `doctrine.ts`、
   `pact.ts`、`kit.ts`、`site.ts`）、页面元数据和 OG 文案——逐条按 D9 改写；首页的统计数字只留真实可数的（在册人数、可出演人数、
   已开放素材张数）。改完运行 `pnpm messages:generate`。"旧 → 新"对照表写进报告。
6. **展示**：
   - 演员档案页加"出演 / Appears in"：作品名 + "饰 何姐" + 跳到该角色造型的链接；
   - 作品页演员表写"唐韵秋 饰 何姐"，没有角色名的只写演员名；
   - 资产库的角色造型标题写"《东游记》何姐（演女佣）"。
     不单独做角色页（选"更少"）。
7. 演员卡片的图：有 `wardrobe.personal.portrait` 用它，否则 `face.front`。

**验收**：中英文页面都正确；旧网址跳转有测试；全站搜不到下线演员和旧片单的名字（`git grep` 记录进报告，历史文档除外）；
诚实规则没破（没写不存在的上映、成绩）。

### P3 资产库和导出适配新画幅

1. 卡片按每张图自己的宽高比显示（现在是"全身 2:3、头像 1:1"写死）。26 张表情在 9:16 下不能把页面拉得过长：
   调整列数（参考现有断点），手机 390 宽不溢出。用 UIKit 组件，遵守 `DESIGN.md`。
2. 身高刻度用 `bbox`。
3. 拼图（16:9）、Veo 包（正脸 + 转面拼图 + 表情拼图，恰好 3 张）、GPT Image（≤16）、Seedance（≤9）在 9:16 输入下排版正确；
   导出每种做一份样例存到报告目录，Codex 亲自看过。
4. **拼图标签**（D10）：选"显示标签"时语言默认等于当前界面语言，可以改；加一个可选的标题行（演员名 · 造型名，按所选语言）；
   模型包仍然强制不带字。新造型的额外格位用 `looks.ts` 里的双语名。
5. ZIP 里的 `character.json` 加上造型和角色信息；`README-for-AI.txt` 说明造型。
6. `/kit` 和资产页的"已开放 / 待交付"：新增的可选格位不算"待交付"。
7. 两位演员的 `promptSeed` 填附录 A 的英文种子；`status` 按附录 A。
8. 更新 `tools/shots.ts` 的页面清单（去掉下线的页面）；加浏览器测试：9:16 卡片、造型分组、角色标签、拼图标签默认语言、旧网址跳转。
9. **媒介占位**（附录 D）：新增 `src/content/media-kinds.ts`，在演员档案页加入五行“资料 / Materials”，在资产库页加入 `series-more` 的四个规划中资料块和系列跳转入口。状态由清单自动计算；没有真实文件时只显示“规划中”，不加入选择、下载、打包或拼图。使用 `GameEmptyState`、`GameFactList`、`GameBadge` 和 `hourglass` 图标；同步文案、`DESIGN.md`、资产 spec 与中英明暗/390px 测试。

### P4 两位演员素材入库（本地）

1. `cp` 复制 `AI演员-尝试/assets-staging/SP-13/*.png`、`SP-03/*.png` 到 `assets-inbox/SP-13/`、`assets-inbox/SP-03/`。
2. dry-run → 看联系表：同一个人、格位与图一致、方向与词表一致。不一致的那张不入库，写进报告（不改名、不重画）。
3. 本地入库（本地存储）→ 提交预览图和清单。确认预览总大小合理（预计约 10 MB），母版不进 Git。
4. 同一命令再跑一次应无任何改动（幂等）。

### P5 本地全量验收

`pnpm verify`、`pnpm docs:check`、`pnpm exec swimmer-ui-check src`、全部截图（原 272 组合 + 新页面）并与 P0 基线比较，
差异逐张有结论。通过后推送 `upgrade/actors-launch`。

### P6 云端准备

每一步都先确认目标（团队 `pie-0f420159`、项目 `swimmerparty`、环境 production），做完用 CLI/API 独立回读。
值只看名字和元数据，不打印。

1. **记录回滚点**：`vercel ls`/`vercel inspect` 找到当前生产部署，记下 URL 和部署 ID（旧站）。
2. **私有 Blob**：创建 **private** store（建议名 `swimmerparty-masters`），连接到 `swimmerparty` 的 Production 和 Development。
   能用 CLI 就用 CLI（先看 `vercel blob --help`），否则用浏览器控制台。回读确认访问级别是 private、环境变量名已出现。
3. **上传母版**：按 `.secrets/README.md` 的规则把开发用的 Blob 令牌放到 `<portfolio-root>/.secrets/swimmerparty/`，
   用 `ASSET_STORE=blob` 跑一遍入库：清单和预览应**无改动**，126 个母版进 Blob。用列表接口核对数量、大小、哈希。
4. **WAF**：在项目 Firewall 加 `@vercel/firewall` 用的限速规则 `guest-asset-download`：按 IP，每 30 秒 1 次。按 Vercel 当前文档配置。
5. **登录客户端**：照 SwimmerBackend 里 Directing 的先例，登记 public PKCE 客户端：无 client secret；
   唯一回调 `https://swimmerparty.swiminai.com/api/auth/sso-callback`；scope `openid email profile`；不用通配、不加权限。
   走 SwimmerBackend 自己的流程并在那边留记录；没有权限就按 0.7 第 1 条处理。
6. **生产环境变量**（名字见 `release.md`）：`ASSET_STORE=blob`、`ACCOUNT_MODE=swimmer`、`GUEST_LIMITER=vercel`、
   `SWIMMER_ORIGIN=https://swimmerparty.swiminai.com`、`SWIMMER_ACCOUNT_URL`、`SWIMMER_BACKEND_URL`、`SWIMMER_PUBLISHABLE_KEY`
   （复用 Directing 用的同一套公开值，来源以 SwimmerBackend 的记录为准）、`SWIMMER_OAUTH_CLIENT_ID`、
   `SWIMMER_COOKIE_PASSWORD`（本地随机生成 ≥32 字符，直接写进 Vercel，不落盘、不回显）。`vercel env ls` 回读名字。
7. **域名**：确认正式域名绑定在 production；把 `swimmerparty.vercel.app` 设为跳转到正式域名（在域名设置里做，不改代码，
   不影响部署专属网址）。

### P7 发布

1. **候选**：`upgrade/actors-launch` 快进合并到 `main`，推送，记下提交号。
2. **Actions 验收**：`gh workflow run docs-check.yml --ref main`，等结果；失败不发布。
3. **构建**：`vercel pull --yes --environment=production --scope pie-0f420159` →
   `vercel build --prod --scope pie-0f420159` → 检查 `.vercel/output`（提交号对、生产模式、没有 mock）→
   `vercel deploy --prebuilt --prod --skip-domain --yes --scope pie-0f420159`，记下候选网址。
   参考 University 发布经验里环境变量的坑（本地 pull 下来的系统变量可能为空）。
   发布完成后删除 pull 下来的 `.vercel/.env.*.local`，本地不留生产密钥。
4. **候选冒烟**（写成可重复的脚本，例如 `tools/smoke.ts <url>`，以后每次发布都用）：
   - 中英首页、名册、两位演员档案、`/kit` 和资产页，图片都加载；canonical/OG/sitemap/robots 指向正式域名；旧网址 308 跳转；
   - 游客下载一张：文件名保留，下载到的 PNG 哈希等于清单；30 秒内第二次得到 429 和倒计时；签名链接过期后被拒；
   - 登录按钮跳到 `accounts.swiminai.com` 的授权地址，`client_id`、`redirect_uri`、PKCE 参数正确；
   - 手机 390 宽无横向滚动。
     候选网址如果受 Deployment Protection 保护，用已登录 Vercel 的浏览器或 `vercel curl` 访问；不要关闭项目的保护。
5. **promote**：`vercel promote <候选网址> --scope pie-0f420159`；回读正式域名对应的部署 ID 等于候选。
6. **线上验收**：在正式域名重复第 4 步，再加：真实 Swimmer 登录后回到原页面和查询参数；会员不限速、多选打包 ZIP、
   3840×2160 拼图、三种模型包、退出登录。需要账号时按 0.7 第 2 条。
7. **回滚规则**：任何一项关键失败（站点打不开、图片缺失、下载坏、登录循环），立即 `vercel promote <第 1 步记下的旧部署>`，
   记录原因，修好后从第 1 步重来（计入 3 次预算）。

### P8 收尾

1. 文档对齐：`release.md`（D1、D7、prebuilt 步骤、冒烟脚本、回滚点记录方式）、资产 spec v2、`architecture.md`
   （造型注册、作品角色、常见改动"加素材"一节写成三步）、`current-work.md`、`README.md`（如有命令变化）、`DESIGN.md`（如有界面规则变化）。
   `pnpm docs:check` 通过。
2. 本计划末尾写结论，移到 `completed`。
3. 清理：删除已合并的 `upgrade/actors-launch`（本地和远程）；`git status` 干净；没有 worktree。
4. 经验：用 `pnpm pro-gov learn` 记下这次值得复用的经验（例如 prebuilt 发布、ChatGPT 透明度修正、候选网址验证登录的限制）。
5. 品牌包的上游请求（UIKit GameBadge 长文本、AuthKit README 的"未发布候选"描述）只写进报告，不改那两个仓库。

## 4. 附录

### 附录 A：内容事实与文案

**Owner 已确认的事实**（2026-10-04/05）：

- SP-13 艺名 **唐韵秋 / TANG YUNQIU**：重庆人，43 岁，163 cm，嘴唇偏厚，深棕色及肩微卷披发带几缕白发；"韵秋"取"秋日风韵"之意。
- SP-03 艺名 **罗米沙 / MISHA LUO**：俄罗斯血统，在重庆长大，二十八九岁；"米沙"是俄语名"米哈伊尔"的昵称，"罗"是重庆常见姓。
- 两人都出演《东游记》（AI 喜剧短片）和《摩登怪咖》（带超能力的 AI 情景喜剧系列）。
- 《东游记》（据 EP01 剧本《戏里戏外》）：一个剧组在江景别墅里拍霸总短剧《霸道总裁爱上我的中年女佣》，戏里一本正经，戏外状况百出。
  - **何姐**（唐韵秋饰）：剧组里的中年女演员，重庆人。在短剧里演怯生生的女佣；一喊"卡"就变回张罗大小事的重庆大姐。
  - **戴尔**（罗米沙饰）：剧组里的男演员。长着一张"外国霸总脸"，其实是老重庆，说重庆话。在短剧里演霸道总裁。
- 两人在《摩登怪咖》里演什么角色：**未定**，只写演员，不写角色。

**文案**（Claude 按 D9 起草，Owner 已认可这种写法；上线后可再改）：

| 字段                 | 唐韵秋 SP-13                                                 | 罗米沙 SP-03                                                                                   |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `slug`               | `tang-yunqiu`                                                | `misha-luo`                                                                                    |
| `nameCn` / `nameEn`  | 唐韵秋 / TANG YUNQIU                                         | 罗米沙 / MISHA LUO                                                                             |
| `status`             | `active`                                                     | `active`                                                                                       |
| `tagline`            | zh「重庆女演员，43 岁。」/ en「Actress from Chongqing, 43.」 | zh「俄罗斯血统、在重庆长大的男演员。」/ en「Actor of Russian descent, raised in Chongqing.」   |
| `spec`（只留这几行） | 年龄 43 岁 / AGE 43；身高 163 CM；籍贯 重庆 / CHONGQING      | 年龄 二十八九岁 / LATE 20s；籍贯 俄罗斯血统，在重庆长大 / RUSSIAN DESCENT, RAISED IN CHONGQING |
| `heightCm`           | 163                                                          | 不填（没有确认的身高）                                                                         |

`note`（长介绍）：

- 唐韵秋 zh：「唐韵秋是 SWIMMER PARTY 的 AI 演员，重庆人，43 岁，身高 163 厘米。她在《东游记》里演何姐，也出演《摩登怪咖》。」
- 唐韵秋 en：「Tang Yunqiu is an AI actress at SWIMMER PARTY. She is from Chongqing, 43 years old and 163 cm tall. She plays He Jie in _Journey to the East_ and also appears in _Modern Freaks_.」
- 罗米沙 zh：「罗米沙是 SWIMMER PARTY 的 AI 演员，俄罗斯血统，在重庆长大，二十八九岁。他在《东游记》里演戴尔，也出演《摩登怪咖》。」
- 罗米沙 en：「Misha Luo is an AI actor at SWIMMER PARTY. He is of Russian descent, grew up in Chongqing and is in his late twenties. He plays Dai Er in _Journey to the East_ and also appears in _Modern Freaks_.」

`promptSeed`（英文，与出图时的身份描述一致）：

- SP-13：`3D feature-animation woman, 43, Chinese, from Chongqing, 163 cm, slim-average build; gentle smile lines, faint crow's feet, noticeably full lips; dark brown shoulder-length waves worn down with a few fine grey strands; noticeably enlarged expressive eyes, smooth stylized skin, hair in clean grouped clumps; realistic adult proportions, about 7 heads tall. Unmistakably CG, never photoreal.`
- SP-03：`3D feature-animation man of Russian descent, late twenties, grew up in Chongqing, slim-average build; long narrow face, prominent slightly crooked nose, ears that stick out a little, heavy brows, deep-set grey-blue eyes, uneven light stubble, thin lips, tousled light-brown hair overdue for a cut; realistic adult proportions, about 7.5 heads tall. Unmistakably CG, never photoreal.`

**片单**（只有这两部，编号从 W-01 重新开始）：

| 字段      | 《东游记》                                                                                                                                                                                           | 《摩登怪咖》                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `title`   | zh《东游记》/ en JOURNEY TO THE EAST                                                                                                                                                                 | zh《摩登怪咖》/ en MODERN FREAKS                                         |
| `status`  | `development`                                                                                                                                                                                        | `development`                                                            |
| `format`  | zh AI 喜剧短片 / en AI comedy shorts                                                                                                                                                                 | zh AI 情景喜剧系列，带超能力 / en AI sitcom series with superpowers      |
| `cast`    | SP-13 饰 何姐（He Jie）；SP-03 饰 戴尔（Dai Er）                                                                                                                                                     | SP-13、SP-03（角色待定，不写）                                           |
| `logline` | zh「一个剧组在别墅里拍霸总短剧。戏里一本正经，戏外状况百出。」/ en「A film crew shoots a domineering-CEO short drama in a villa. On camera it is deadly serious; off camera everything goes wrong.」 | zh「一部带超能力的 AI 情景喜剧。」/ en「An AI sitcom with superpowers.」 |

角色说明（显示在档案页"出演"和片单的演员表里）：

- 何姐 He Jie：zh「剧组里的中年女演员，重庆人。剧组在拍短剧《霸道总裁爱上我的中年女佣》，她在戏里演女佣；戏外是张罗大小事的重庆大姐。」/
  en「A middle-aged actress on the crew, from Chongqing. In the short drama they are shooting, _The Domineering CEO Falls for His Middle-Aged Maid_, she plays the maid. Off camera she is the one who sorts everything out.」
- 戴尔 Dai Er：zh「剧组里的男演员。长着一张外国人的脸，其实是土生土长的重庆人，说一口重庆话。在短剧里演霸道总裁。」/
  en「An actor on the crew. He looks foreign but is a born-and-bred Chongqing local who speaks the Chongqing dialect. In the short drama he plays the domineering CEO.」

### 附录 B：新增格位

方向文字是"画面左/右"，不是角色的左右。

| 格位                                  | 必交 | 方向（英文写进词表）                                                                                                                                                      |
| ------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `face.three-quarter-left`             | 否   | head and shoulders, head turned 45 degrees toward the character's left (face toward the RIGHT side of the frame)                                                          |
| `face.side-right`                     | 否   | head and shoulders, exact profile, face pointing to the RIGHT edge of the frame                                                                                           |
| `face.up`                             | 否   | head and shoulders, facing the camera, head tilted up about 30 degrees, eyes looking up                                                                                   |
| `face.down`                           | 否   | head and shoulders, facing the camera, head tilted down about 30 degrees, eyes looking down                                                                               |
| `turnaround.back-three-quarter-left`  | 否   | full body seen from behind at a three-quarter angle; we see the character's left shoulder and a little of the left cheek, face peeking toward the RIGHT side of the frame |
| `turnaround.back-three-quarter-right` | 否   | same, mirrored: right shoulder and right cheek, face peeking toward the LEFT side of the frame                                                                            |
| `turnaround.side`（改文字）           | 是   | full body, exact profile, face pointing to the RIGHT edge of the frame                                                                                                    |

中文标签：另一侧 3/4、另一侧正侧、仰头、低头、背后 3/4（左）、背后 3/4（右）。
`detail.hair-back`、`detail.hands` 已在词表里。

### 附录 C：造型注册（`looks.ts`）

四个造型的固定格位都是 `front`、`three-quarter`、`side`、`back`，下表是 `extras`。

| 演员  | 造型 id    | kind                   | 双语名                                                             | extras（key：中 / 英）                                                                                                                                            |
| ----- | ---------- | ---------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SP-13 | `personal` | personal               | 个人风格 / Personal style                                          | `portrait` 近景 / Close-up；`earring` 拨发近景 / Hair-tuck close-up；`walk-coffee` 拿咖啡走路 / Walking with coffee；`sit-laugh` 坐着大笑 / Seated laugh          |
| SP-13 | `maid`     | role（《东游记》何姐） | 《东游记》何姐（演女佣）/ Journey to the East · He Jie as the maid | `portrait` 捂嘴害羞近景 / Shy close-up；`tray` 端托盘 / Serving tray；`duster` 鸡毛掸子偷听 / Eavesdropping with a duster；`on-set-break` 片场休息 / On-set break |
| SP-03 | `personal` | personal               | 个人风格 / Personal style                                          | `portrait` 近景 / Close-up；`side-glance` 侧目近景 / Side-glance close-up；`walk-pockets` 插兜走路 / Walking, hands in pockets；`noodles` 吃面 / Eating noodles   |
| SP-03 | `ceo`      | role（《东游记》戴尔） | 《东游记》戴尔（演霸总）/ Journey to the East · Dai Er as the CEO  | `portrait` 歪嘴笑近景 / Smirk close-up；`sky-gaze` 仰望天空 / Gazing skyward；`tie-watch` 扯领带看表 / Tie and watch；`on-set-break` 片场休息 / On-set break      |

`prompt`（英文造型描述，写进 `looks.ts`）：

- SP-13 `personal`：`Personal style: soft camel fine-knit long cardigan worn open; ivory silk blouse with a soft collar, tucked in; high-waisted soft charcoal-grey wide-leg trousers; tan leather loafers; small plain gold stud earrings. Her own dark brown shoulder-length waves worn down.`
- SP-13 `maid`：`Role look (He Jie playing the maid): perfectly neat, glossy, heavily hair-sprayed bun with a large white lace maid headpiece; short-drama glam makeup with slightly too-long false lashes, slightly too-red lipstick and two round rosy blush spots; deep navy knee-length maid dress with puffed short sleeves, oversized white lace collar, layered white ruffled apron with an extra-large bow at the back, white cuffs, dark grey flat shoes.`
- SP-03 `personal`：`Personal style: faded olive-green cotton bomber jacket worn open; plain white crew-neck T-shirt; mid-blue straight jeans; clean white low-top sneakers. His own tousled light-brown hair.`
- SP-03 `ceo`：`Role look (Dai Er playing the CEO): his own tousled light-brown hair combed back with too much gel, ends still sticking up; slim glossy deep royal-blue suit with shiny black satin lapels, white shirt, wide shiny silver tie, white pocket square stuffed in carelessly, pointed glossy black-brown shoes. Too flashy and trying too hard — funny, not cool. Unbranded.`

### 附录 D：声音、视频、三维和动作占位

本附录来自 Owner 文件 `AI演员-尝试/10-website-media-placeholders.md`，在 P3 第 9 个单元执行。

- 目的：为未来媒介预留位置；当前没有声音、视频、三维模型或动作文件。
- 诚实规则：只写“规划中”，不放假的播放器、波形或三维预览，不写上线日期和数量。
- 数据源：新增 `src/content/media-kinds.ts`，登记 `image`、`voice`、`video`、`model3d`、`motion` 五种媒介。图片由现有清单自动显示“已开放 · N 张”；其余没有文件时显示“规划中”。
- 图标：图片使用 `card`；其余暂用 `hourglass`。使用 UIKit 的 `GameEmptyState`、`GameFactList` 和 `GameBadge`，并在报告中提出 `mic`、`video`、`cube`、`motion` 图标上游请求。
- 演员档案页：图片预览下方增加五行“资料 / Materials”，图片链接到资产库，其余四项为规划中。
- 资产库页：图片系列之后增加 `id="series-more"` 的“更多资料（规划中）”区块，四个资料块桌面两列、手机一列，并在系列跳转中加入入口。四块不参与选择、下载、打包和拼图。
- 其他页面保持只统计图片；资产页进度明确写“图片”。
- 后续真实媒介的入库方向写入资产 spec：声音 WAV→AAC/MP3，视频 MP4 预览，三维 GLB，动作 GLB/FBX；仍遵守公开预览、私有母版、游客限速和会员不限速。
- 验收：两位演员中英、明暗、390px 档案页五行正确；资产库四块存在且没有 `<audio>`、`<video>`、`<canvas>`，不可选；截图纳入 P5。

## 5. 报告

写到 `.devspace-reports/actors-launch/REPORT.md`，中文，简短：

1. 每个阶段一行结论和证据位置；
2. 线上地址、生产部署 ID、回滚用的上一个部署 ID；
3. 云端改了什么（Blob、WAF、环境变量名、登录客户端、域名跳转），每项怎么回读确认的；
4. 截图：正式站中英首页、两位演员档案、资产库、手机宽度各一张；
5. 没做、延后、需要 Owner 的事项；
6. 给 PGS 和品牌包的建议。
