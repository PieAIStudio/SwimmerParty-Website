- 做法：无`--scope`验收现成候选；本次又因我额外加的过严断言停下，未上线。
- 故意不做：不写库、不重建、不上传，不修B类遗留，不改账号/权限/配置。
- 预计仅3份收尾文档约30行；本轮产品／测试／仓库门禁各0行。
- 冒烟：脚本退出1；`/zh`、`/zh/actors`均HTTP 200、curl退出0，原stdout/stderr/退出码/HTML已保留。
- 判断：我误要求OG URL等于当前页面；实际OG与canonical都在正式域名，不能据此判候选坏。
- 上线：未promote `dpl_BisdYjf4tVkydoTH9a6yEjHsAeKk`；正式站仍未切本批。
- 读回截图路径：无；未抽3人下载，未拿旧截图充数。
- 收尾：相关文档检查已通过；按路径保存的提交号与远端读回见本轮`closeout.json`，不启动部署。
- B类遗留仅列清单，见下文；需要总指挥决定是否再次续接，非要求修产品或重建候选。

## 15:3x 接续①：原始结果与判断

- 根目录`BRIEF.md`不存在（也未在本检出发现），按总指挥本条任务书和上一轮收据执行。原收据保存在`.reports/2026-10-23-next10-launch/continuation-154x/PI-RESULT.before-continuation.md`。
- 冒烟前只读核实：隔离检出仍干净`318def0`；候选READY/production、项目`prj_sRNUQz0h4WOO9YS1rX6gj59AxfDp`、原生`gitCommitSha`及`sourceCommit`均为该提交；项目accountId与绑定的`team_C63r8BVtFCpiOK1k2h7xytT9`一致。正式域名读回仍为旧部署`dpl_Hdgyh411W5GxSMEPk9GZzjg8jtuw`。
- CLI54的`inspect --format=json`只给摘要、没有projectId/meta；第一次本机预检因此KeyError退出1，未发候选HTTP请求。随后按已留存部署响应的官方API地址做只读GET，核实完整元数据；没有猜目标、改绑定或扩大权限。诊断和两份原结果均保留。
- 使用隔离检出的已核实项目绑定推导scope，实际调用为`vercel curl <path> --deployment https://swimmerparty-arbrwwgcz-pie-0f420159.vercel.app -- --silent --show-error --output <临时文件> --write-out '\n%{http_code}'`，**没有`--scope`**。curl原stdout是换行加`200`；两条原stderr均只有CLI版本、beta提示和Retrieving project，无传输错误；原生退出码均0。
- 15:31:52开始；`/zh`返回200/72340字节，`/zh/actors`返回200/607999字节。首页31正式＋66新面孔、名册97张唯一卡及本批10张卡、旧别名未重复出现的断言已通过；尚未进入个人页及英文部分。
- 15:32:08脚本在我新增的`og:url == 当前页面URL`断言退出1：名册canonical为`https://swimmerparty.swiminai.com/zh/actors`，OG为`https://swimmerparty.swiminai.com/zh`。现行手册只要求OG指向正式域名，原冒烟脚本也没有这条逐页相等断言；这是我擅自加严造成的执行停点，不是已证候选回归。原始失败保留，不改结果求绿、不继续请求、不promote。
- 本轮没有执行目录写入或promote前check、构建、上传、promote、正式10人逐页读回、3人下载或两档截图；目录与旧站的中间态仍未解除。此前精确源码的工程门禁保留，但不能冒充本次完整候选/正式验收。
- 原始证据根：`.reports/2026-10-23-next10-launch/continuation-154x/`。`candidate-raw/{01,02}.{stdout,stderr,exit,body,command.json}`为两次原调用；`candidate-smoke.{stdout,stderr,exit}`为包装器；`candidate-http-smoke.json`、`stopped-metadata-readback.json`、`STOP.json`记录原停点与离线诊断，未覆盖上一轮失败证据。没有请求或留存签名下载URL。

## 上一轮13:xx事实与停止原因（历史，原证据保留）

- 起点确认：干净`main=origin/main=318def02e423b837b184d778d6b410c577316aa8`，包含网站改动`91fd2ee`；之后该范围只有前轮收据/状态文档。没有其他执行者修改本检出。
- Owner本任务的独立写库授权已执行一次，仅本批10个CC身份的新旧slug映射。没有新增管理员、改权限/认证/付款或生产环境档位；社区仍为`on`。
- 候选实际地址：<https://swimmerparty-arbrwwgcz-pie-0f420159.vercel.app>。Vercel独立读回：project=`prj_sRNUQz0h4WOO9YS1rX6gj59AxfDp`，READY/production，原生`gitCommitSha`及标记`sourceCommit`均为`318def02e423b837b184d778d6b410c577316aa8`。
- 13:56:54开始候选冒烟，首个`/zh`请求在CLI传输步骤非零退出；13:56:57停止。未取得网页HTTP状态，没有后续候选请求、下载或promote；**不能据此判网页404/500或产品已坏**。
- 根因在我的执行命令：误加`--scope pie-0f420159`。已安装CLI54的`commands-bulk.js:11330–11425`只识别有限curl专用选项，其余参数透传系统curl；`12041–12110`直接spawn curl。无URL、无网络的最小复现`curl --scope pie-0f420159`退出2：unknown option。本仓库10-22旧记录`launch-main/continuation-classification.json`也记录过同一陷阱；当时正确调用从已核实的项目绑定推导scope。我没有预先发现这条旧证据，造成了本次停点。
- 证据缺口：首次包装器没有保存原stdout/stderr及具体子进程退出码，只留下“传输非零、无HTTP结果”；离线复现/源码说明不能冒充本次原始curl报文。原失败收据保留，没有覆盖或为变绿重跑。
- 13:58只读正式别名仍指向旧部署；`--skip-domain`确实未自动切域名。未发生新站上线回归，无需执行网站回滚；也没有擅自逆向回写已经成功的目录。
- **中间态影响：目录已经先行更新，旧正式站仍可能展示/选择那10个已停用的旧别名，关联这些别名的投稿会被后台目录校验拒绝。** 既有作品引用保留，其余87演员不变。应尽快在确认续接后完成现成候选验收，而不是把“目录零差异”当成旧站全功能正常。

## 目录同步与本批范围

新check→dry-run计划与06:53预检完全一致，SHA：
`c5a7f23338299cdf7c32c3eda598c64d7d9089a33220cbaea6c5171b6dfc22ad`。

| 项目      | 实际结果                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------- |
| 新身份    | 刘丹、许丽、沈秀英、马红、孙浩、杨帆、王勇、Kate Murray、Peter Hale、Grace Boateng              |
| 写入范围  | 新增6演员；升级4位已有演员，新增10版本；停用同10人的旧别名及10旧版本                            |
| 排除范围  | 其余87演员前后逐行不变；删除0行，既有作品引用保留                                               |
| 应用      | `--apply --expect-plan <上面SHA>`仅执行1次，原生service_sync_site_actor事务，提交后独立回读通过 |
| 再次check | 退出0、changes=[]；目录共107演员行/113版本行，其中97/103启用                                    |
| 原生审计  | actor_catalog计数101→121，新增20，符合预审计划                                                  |

对应关系：liu-dan←lin-xiaoman；xu-li←liu-manqing；shen-xiuying←qian-sumei；ma-hong←niu-fengying；sun-hao←lu-xingye；yang-fan←bai-yunchuan；wang-yong←zhu-youfu；kate-murray←sasha-kerr；peter-hale←ambrose-lacey；grace-boateng←ama-mensah。这些是同一批人的旧CC别名，不是另外10位演员。

网站生产源逐人仍为55图/6占位WAV/4独立样片（3 Grok＋1 Google Vids），31正式＋66新面孔共97张卡；本轮未重做媒体、移动/删除staging或上传母版。上一轮610份私有PNG/WAV原件回读证据沿用，不冒充本次网页下载验收。声音占位/声学未全审、四位v2、许丽/马红Vids平台保存版及比例measurement_review例外都保留；详情见原收据`git show 318def0:PI-RESULT.md`和`.reports/2026-10-23-next10-release/`。

## 检查、构建与证据

全部本机工程门禁针对干净`318def0`，不是把旧`91fd2ee`日志当新候选验收：

| 选择依据/检查                            | 结果                                                                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| release.md明写发布前完整`pnpm verify`    | 311工具、221主站浏览器通过；生成物/ICU/类型/两套lint/格式通过                                                                                      |
| AGENTS发布全套＋社区三档合同的适用浏览器 | on 72/72、Owner隔离7/7通过；未新增独立timing门禁，已有时序用例随套件运行                                                                           |
| release.md文档/UIKit                     | 干净318def0的docs:check与swimmer-ui-check通过；本轮新写的收据/状态文档尚未验：light紧急负载门槛持续阻塞，未启动检查，不能复用318的结果替新文字背书 |
| 精确提交手工Actions                      | [39905623428](https://github.com/PieAIStudio/SwimmerParty-Website/actions/runs/39905623428)，headSha精确318def0，success                           |
| 生产预检                                 | pie-0f420159/swimmerparty绑定、正式on档、后端项目对应、Blob/真实账号/游客限速模式及团队用量已读回；1次/30秒/IP规则有效                             |
| 干净同源码隔离检出                       | 冻结安装、vercel pull、vercel build --prod均通过；不复制私有库/收据/素材收件箱，避开既有主检出CLI遍历OOM问题                                       |
| 同产物上传                               | deploy --prebuilt --prod --skip-domain成功；没有平台重构建，没有自动Actions/Git部署                                                                |
| 候选真实冒烟                             | 首个curl传输失败，0页取得HTTP结果、0份下载；停止，未promote                                                                                        |

产物位于`.worktrees/release-318def0-20261023/.vercel/output`：8841文件、457147715字节，摘要`1ff50c36bb3044e74035233a57dccf1e48ebc043667e37d49ce52e8ac3bdcab5`。独立部署元数据及正式旧别名回读均保留。

重活由HQ run-locked调度，没有放宽15负载门槛或抢University；主要耗时是共享负载等位。文档/UI小检查改走规则允许的light通道，原未启动的重活等待取消记录保留，不是重跑失败测试。额外env导出存在性诊断曾exit1：三个变量属于Vercel sensitive，平台不导出明文；元数据及旧正式匿名session 200说明不是已证缺配置。没有为此改凭据，也没有重复那条错误诊断命令。实际所有工程门禁均一次通过。

本轮证据根：`.reports/2026-10-23-next10-launch/`：

- `STOP.json`、`candidate-http-smoke.json`、`curl-offline-argument-reproducer.json`：停点、首次失败及无网络诊断。
- `closeout-docs-summary.json`、`closeout-docs.log`：收尾只选三份Markdown的相关文档检查；load1持续超过light紧急45门槛，65秒宿主等待超时取消，commandStarted=false，未重排、未绕规则。
- `catalog-scope-review.json`、`catalog-complete.json`、`catalog-{before,after}-summary.json`：授权范围、整库回读与原生审计差额。
- `gates-final.json`、`verify.log`、`community-{on,owner}.log`、`actions-final.json`：实际门禁及精确源码。
- `candidate-build.json`、`candidate-metadata.json`、`deploy-response.json`、`production-at-stop.json`：原产物、实际候选与正式未切换。
- `admin-readonly.sql/json`、`review-status.md`：A只读查询及B逐项源码出处。
- catalog CLI硬性限定的原生收据仍在既有`.devspace-reports/next-version-20261022/next10-launch-20261023-{check-before,plan,apply,check-after}.json`；没有改工具来换目录，也没有覆盖旧回执。

## A｜管理员怎么定、现在是谁

**本站社区审核管理员就是后台受控Owner，不是网站邮箱白名单、浏览器角色或环境变量。**

- SwimmerBackend迁移`20261013010000_swimmer_party_community_v3.sql:30–34`建立`private.swimmer_party_owners(user_id)`，外键关联`auth.users.id`；旧v1的Owner GUC写入口被关闭。
- `private.swimmer_party_require_owner()`（同迁移362–370）先要求真实authenticated身份，再检查auth.uid()是否在该表。service_role操作员可经受控登记函数维护名单，但service_role本身不是网页Owner身份。
- 本站`src/features/community/server/access.ts`每次让后台`list_review_queue`确认权限；`NEXT_PUBLIC_COMMUNITY_MODE=owner|on`只是发布受众档位，不授予审核权限。
- 13:22对正式项目`lgoknzuxefecikfyvpzk`执行BEGIN READ ONLY、15秒超时、ROLLBACK；在数据库内就遮盖邮箱，仅返回1行：**`pie***@gmail.com`**，对应Auth用户存在。未读出完整邮箱，未改登记、账号或权限。

## B｜多家AI走查问题：尚未修与已修

只读对照10-13合并方案、10-20四份独立原文（Claude Opus、pi Sol、两份GPT-6 Pro）、10-21修复收据及当前代码。原文在总部`conductor/projects/SwimmerParty/site-review-20261020/`；本仓库`.devspace-reports`修复盘点指向该来源。详细定位和边界在本轮`review-status.md`，不是重新做一次全站视觉审计。

P1=安全/核心功能验收风险，P2=关键体验，P3=优化/路线图；这是本轮归类。未验收≠已证故障，取舍≠必须修，已有Owner后置决定不被重新改成门禁。

| 问题                                                                                                                   | 状态（已修提交或未修）                                                                                                                                | 严重度                     |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 分享选角单无成功/失败/可见链接回执；本地保存范围不就地明确                                                             | **未修**，CastBoard.copy只写剪贴板；不是名单丢失                                                                                                      | P2                         |
| 名册卡缺交付数量/新面孔状态徽章，需进详情才知道有什么                                                                  | **部分修**：胸像/样片入口8c8a9f3；ActorCardClient仍缺上述摘要                                                                                         | P2                         |
| 戏路筛选Villain仍给零结果选项                                                                                          | **未修**；当前只读计数comedy=4、boss=1、villain=0、crew=2，不能编造标签凑数                                                                           | P2                         |
| Samples页先展示两部开发中项目，再展示能播放的样片                                                                      | **未修**，WorksView顺序仍如此；首页撤下不等于此页修过                                                                                                 | P2                         |
| 使用方法/角色提示词在全部素材之后                                                                                      | **部分修**：8c8a9f3补跳转/就地帮助；正文三步仍未前移                                                                                                  | P2                         |
| 新面孔沿用完整包主按钮、交付成熟度不够一眼清楚                                                                         | **部分修**：实际数量/未齐说明已在；主按钮仍共用                                                                                                       | P2                         |
| 首页非首屏精选横片仍在9:16框里显小                                                                                     | **部分修**：30381d9只关闭首屏同脸对照问题，非hero仍是竖框                                                                                             | P3                         |
| 最近更新纯文字、缺头像/本次新增内容视觉预览                                                                            | **未修**；本批更新事实有4片，但没有新视觉更新条                                                                                                       | P3                         |
| Learn帮助配图旧/重复、主题录制未同步                                                                                   | **未修/未重新视觉关闭**；仍使用旧public/help，未拿文件存在冒充像素验收                                                                                | P3                         |
| 账号中心缺领取演员/任务上下文、自动续下载；原慢登录观察                                                                | **部分修/外部待证**：本站语言083f7b4；后端记录中心b64e8ba和AuthKit0.9.2已10-22发布；上下文、真实回跳/速度未获本轮真人关闭证据，不能断言仍是旧中文表单 | P2                         |
| Google/Apple快捷登录                                                                                                   | **未开放，Owner前置待办**；Google等后台/CAPTCHA/真人往返，Apple等应用资格，不在本站加假按钮                                                           | P2/待拍板                  |
| 只有一条实测教程，其他工具缺真实结果                                                                                   | **部分修**：fe18a4c完成刘丹真实Grok案例；其余Veo/Runway/Gemini/Midjourney仍未复现、noindex，按Owner决定不另付费生成                                   | P2/内容                    |
| 个人Hotmail联系入口；定制/合拍价位、流程、案例/表单                                                                    | **未修，Owner暂缓D4**；不杜撰案例或擅自换邮箱                                                                                                         | P2                         |
| Owner真实退回/隐藏、撤信、暂停恢复；三类投稿→删除全链路                                                                | **代码已有、真人待验**：ff99b8f/0440d4f/a5712de/3af2a36；10-22明确后置亲点，夹具不能冒充本人运营验收                                                  | P1验收风险（已有后置决定） |
| 创作者主页/收藏关注/通知、定期挑战、更多原生语言、留存复盘                                                             | **未做，D组路线图**；本地cast不等于跨设备社交保存                                                                                                     | P3                         |
| sitemap真实更新时间、分享卡/低端机/200%缩放/字幕/多地性能                                                              | **未修/未验**：sitemap仍new Date()；加载反馈8c8a9f3不等于性能优化已完成                                                                               | P2/P3                      |
| 多品牌层级、登录按钮强弱、液态造型、版本号/留白等                                                                      | **未实施取舍**，不是已证功能故障，需Owner决定                                                                                                         | P3                         |
| 手机语言菜单越界；先一屏筛选/大图；吸顶盖标签/空药丸；0选图主按钮；等待反馈、已选状态、问号跳走、下载组成/账号条件不清 | **已修8c8a9f3**，当前main包含；不继续算未修                                                                                                           | 原P2                       |
| 首屏同脸跨工具证明、首条真实教程、首屏横片/标题、Vids读屏工具名                                                        | **已修fe18a4c、7a2195c、30381d9**；2e57df5已有正式读回关闭记录                                                                                        | 原P2                       |
| 英文面包屑/语言回落、翻译前缀404、审核noindex/错误空列表；导航/筛选/首次帮助/多片合同                                  | **已修b9276c4、418d751、b2279d8/110cdcb、f45a561、a172062**                                                                                           | 原P2                       |
| 社区仅mock、投稿缺媒体/选择器/状态、审核看不到媒体、作者头像使后端成功而网站503                                        | **已修ff99b8f、0440d4f、a5712de、3af2a36、8d7c98e**；真实运营验收另列，非全部完成                                                                     | 原P1/P2                    |

原报告“没登录、没下ZIP、没听音质、没测真机”仅是盲区，不冒充故障。原建议开放原创角色、取消整包登录、改Actors名称或把免费基础素材改收费，已被Owner取舍，不列作遗留bug。

## 原13:xx续接边界（历史；15:3x执行停点见本文开头）

1. 总指挥确认允许从工具错误停点续接；**写库授权已消费，不再apply**。先只读核对目录/配置及候选仍对应同源码、同产物。
2. 在已核实绑定的干净候选检出，用release.md的`vercel curl /zh --deployment https://swimmerparty-arbrwwgcz-pie-0f420159.vercel.app`，不要加--scope；不要改项目保护、伪造正式Origin或把凭据放URL/日志。
3. 只验现成候选；本轮http-smoke.py原样保留了错误命令和失败报告，不能原封不动整套重跑。修正调用、用新的唯一报告继续；不得覆盖失败收据，也不重建/再上传另一个候选求绿。
4. 候选中英首页/名册/演员、匿名公开社区/私有拒绝、真实原图与限流、metadata/sitemap/robots通过后，对同候选再做catalog --check；只有通过才能promote同一URL。
5. 正式域名回读部署ID、10人资料及抽3人真实下载，390/1440各存首页图；真实Owner/会员ZIP/全量媒体声学验收仍须如实标界。

13:xx轮应用源码、依赖、测试和仓库门禁未改；当时只在工作区更新本收据、实施方案及current-work，未新增提交/推送。该轮新文字因紧急负载门槛未完成相关验证；14:14核对没有遗留本任务重活/浏览器/等待进程，隔离检出与现成产物保持干净318def0。15:3x轮继续只改同三份文档；不把候选旧文档绿灯挪用过来。Learning skipped：发布和正式验收仍未完成，不另建学习文档。

## 接续①收尾检查与保存

完整待推送范围以`origin/main=318def0`为基准，只有`PI-RESULT.md`、本方案和`current-work.md`三份Markdown；由路径和既有lefthook文档glob选择检查，没有应用、依赖或测试改动，不运行工程/浏览器/timing整套，也不重新发Actions或部署。

- 本次相关检查通过：定向oxfmt（active方案按既有ignore不格式化）、`pnpm docs:check`；36份治理文档、38个当前文件、73本地链接、零警告，MANIFEST无需变化。HQ允许的light通道执行，未放宽负载门槛。
- 提交时仍运行原生pre-commit与commit-msg，不绕钩子；提交、push及最终diff检查走HQ重活调度，显式只操作上述三条路径。实际提交号、退出码、远端main和清洁状态保存在`.reports/2026-10-23-next10-launch/continuation-154x/closeout.json`，日志为`save-docs.log`。
- Actions只有`workflow_dispatch`、`vercel.json`的Git部署为false；普通推送不创建云端验收或新候选。B类表格逐项保留，产品/测试/仓库检查各0行；本轮可删的只有我额外加的临时OG逐页相等判据，不应据此要求改候选。该失败脚本作为原始证据保留，本轮不再运行。
