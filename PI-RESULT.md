# 本批10人：代码与云端原件已就绪，官网未发布
做法：按CC合并旧新身份，走现有入库/生成/上传/发布工具；预计核心业务50–150行，实际产品+80/-6、测试+158/-13，未新增仓库检查命令或门禁。
故意不做：不重新生媒体、不动AuthKit/付款/其他演员、不删staging、不重构；不以关闭社区或越权写库换进度。
演员：刘丹、许丽、沈秀英、马红、孙浩、杨帆、王勇、Kate Murray、Peter Hale、Grace Boateng；本地逐人55图/6占位WAV/4独立样片，云端610份PNG/WAV原件已齐。
运行源码：`91fd2eed2607f3487cd34984457b125fa9d8ac19`已推送并回读main，收据/状态文档随后独立提交；正式部署：本轮没有新部署、没有promote。
线上读回：2026-10-23 06:23中英逐人GET，已有4人仍各55/6/1，其余6个新slug仍404；正式站仍为`dpl_Hdgyh411W5GxSMEPk9GZzjg8jtuw`，不是本轮成果。
验证：311工具、221主站浏览器、72社区on浏览器、文档/UI全部通过；精确源码GitHub Actions `39864252151`成功；这些不代替真实线上验收。
遗留：社区目录只读检查仍drift，需另准本批20个slug的目录同步计划；未写库，未建正式候选，未完成本批真实线上播放/下载/移动端验收。

## 必须补齐的授权

网站发布已获授权，但`docs/reference/release.md`明确：它不同时授予数据库写入权限。2026-10-23 06:53对干净候选重新只读核对，计划与04:42相同，`databaseWriteAttempted=false`。

- 项目：`lgoknzuxefecikfyvpzk`。
- 计划SHA：`c5a7f23338299cdf7c32c3eda598c64d7d9089a33220cbaea6c5171b6dfc22ad`。
- 范围：新增6演员、给4位已有演员补当前版本；新增10版本；停用10旧slug及其10旧版本；合计20个本批slug受影响、原生审计20条、删除0行。其他演员和用户作品不变。
- 写入只经既有`service_sync_site_actor`维护`site_actors`/`site_actor_versions`并产生原生审计；不改数据库结构、AuthKit、权限、付款或社区档位。
- 新只读回执：`.devspace-reports/next-version-20261022/next10-catalog-preflight-20261023-0653.json`。现有CLI限定该旧回执根，未为换路径改工具。

**需要明确批准上述精确目录计划，才能继续应用、独立回读、正式构建/候选验收、promote及逐人真实线上核对。** 若继续前目录发生变化，须重新核对，不套用旧SHA。此前四人目录计划的批准不冒充本次20个slug的批准。

## 逐人结果

下列是目标正式链接；“本地”是生产档案、真实原件和页面投影，不是线上完成。网页读回为06:23的真实公开响应，未mock。每条4样片均为3 Grok＋1 Google Vids，各自独立来源，双人出镜不跨所有者重复计交付。

| 演员/新slug（中文 · English） | 来源/旧slug | 外貌 | 演员版本 | 本地 图/占位声/样片 | 当前线上 |
| --- | --- | --- | --- | --- | --- |
| 刘丹 / Liu Dan：[中文](https://swimmerparty.swiminai.com/zh/actors/liu-dan) · [EN](https://swimmerparty.swiminai.com/en/actors/liu-dan) | CC-001 / lin-xiaoman | v1 | 1.1.0 | 55/6/4 | 200，旧版55/6/1 |
| 许丽 / Xu Li：[中文](https://swimmerparty.swiminai.com/zh/actors/xu-li) · [EN](https://swimmerparty.swiminai.com/en/actors/xu-li) | CC-026 / liu-manqing | v2 | 1.0.0 | 55/6/4 | 404，未发布 |
| 沈秀英 / Shen Xiuying：[中文](https://swimmerparty.swiminai.com/zh/actors/shen-xiuying) · [EN](https://swimmerparty.swiminai.com/en/actors/shen-xiuying) | CC-036 / qian-sumei | v1 | 1.0.0 | 55/6/4 | 404，未发布 |
| 马红 / Ma Hong：[中文](https://swimmerparty.swiminai.com/zh/actors/ma-hong) · [EN](https://swimmerparty.swiminai.com/en/actors/ma-hong) | CC-066 / niu-fengying | v1 | 1.1.0 | 55/6/4 | 200，旧版55/6/1 |
| 孙浩 / Sun Hao：[中文](https://swimmerparty.swiminai.com/zh/actors/sun-hao) · [EN](https://swimmerparty.swiminai.com/en/actors/sun-hao) | CC-042 / lu-xingye | v2 | 1.0.0 | 55/6/4 | 404，未发布 |
| 杨帆 / Yang Fan：[中文](https://swimmerparty.swiminai.com/zh/actors/yang-fan) · [EN](https://swimmerparty.swiminai.com/en/actors/yang-fan) | CC-062 / bai-yunchuan | v1 | 1.1.0 | 55/6/4 | 200，旧版55/6/1 |
| 王勇 / Wang Yong：[中文](https://swimmerparty.swiminai.com/zh/actors/wang-yong) · [EN](https://swimmerparty.swiminai.com/en/actors/wang-yong) | CC-027 / zhu-youfu | v2 | 1.0.0 | 55/6/4 | 404，未发布 |
| 凯特·默里 / Kate Murray：[中文](https://swimmerparty.swiminai.com/zh/actors/kate-murray) · [EN](https://swimmerparty.swiminai.com/en/actors/kate-murray) | CC-043 / sasha-kerr | v1 | 1.1.0 | 55/6/4 | 200，旧版55/6/1 |
| 彼得·黑尔 / Peter Hale：[中文](https://swimmerparty.swiminai.com/zh/actors/peter-hale) · [EN](https://swimmerparty.swiminai.com/en/actors/peter-hale) | CC-019 / ambrose-lacey | v1 | 1.0.0 | 55/6/4 | 404，未发布 |
| 格蕾丝·博阿滕 / Grace Boateng：[中文](https://swimmerparty.swiminai.com/zh/actors/grace-boateng) · [EN](https://swimmerparty.swiminai.com/en/actors/grace-boateng) | CC-005 / ama-mensah | v2 | 1.0.0 | 55/6/4 | 404，未发布 |

代码投影为97人＝31正式＋66新面孔，原线上为101＝25＋76；按CC抑制10张旧卡，不直接改casting历史。30条永久跳转覆盖无语言、zh、en及子路径/query，本地两语言逐人已测，正式站尚未生效。已有4人55格逐一SHA相同而复用原字节，但资料、版本、声音占位属性和4样片均升级，未因已有素材跳过。

## 来源、云端与回滚

- 只取指定slot-plan及接受的task outputs：550份独立PNG、60份独立WAV、40条独立静音样片及各自平台原片，均保存来源、字节数、SHA。staging未移动/删除；未生图、合成或重新请求视频。网页样片仅用既有有界静音转码/海报链路，不裁原平台标识。
- 550 PNG＋60 WAV共610份私有原件，943,999,542字节。四人已有244份；本次分6人串行新增366份/576,178,723字节，逐文件Head及独立分页清单通过。每次旧对象保留检查为true；全库1781→2147对象，最终本批610份均存在、待传0。**Head/大小核对不是全部远端字节流SHA核对，也不是新站下载验收。**
- 原始来源与本地SHA：`.reports/2026-10-23-next10-release/source-receipt.json`、`local-delivery-audit.json`。云端分批与最终复查：同目录`upload-steps.json`及`blob-final-check-1.log`。
- 当前/回滚基线：`dpl_Hdgyh411W5GxSMEPk9GZzjg8jtuw` / `https://swimmerparty-ykoa6vn3x-pie-0f420159.vercel.app`，原main `2e57df5408df8b716a2a876bb39fb350e429c827`。没有本轮新部署，不需要执行回滚；旧Blob及原素材均保留，不用删除新原件来“回滚”。
- 06:22正式绑定独立读回仍为旧部署，Git推送没有自动部署。生产社区on、私有Blob、真实泳者账号及游客每IP 30秒1次规则均未修改。

## 检查、原失败与覆盖边界

- 提交链：`c7cb0ec`素材/资料/最小接线，`bc085b0`语言前缀跳转，`91fd2ee`本批发布说明压缩。核心产品11文件+80/-6；8个测试文件+158/-13；其余主要为交付媒体、生成数据与必要说明。
- 自动相关选择基于完整出站范围`2e57df5..91fd2ee`，167浏览器用例/15文件；源路径到浏览器依赖存在盲区，因此本次在明确发布授权下执行完整适用主站221及社区on 72，不把未选中当零覆盖。无独立timing命令；浏览器中已有时序用例随套件执行，未另建计时门禁。
- 精确候选`91fd2ee`：311工具、221主站、72社区on全部通过；生成物/类型/lint/格式、docs:check（38当前文件/72链接、0警告）、UIKit（0原始颜色）通过；源码前后干净。收据：`local-gates.json`、`short-notes-release-verify-1.log`、`short-notes-release-community-on-2.log`。
- 手工Actions [39864252151](https://github.com/PieAIStudio/SwimmerParty-Website/actions/runs/39864252151)：success，headSha精确为`91fd2eed2607f3487cd34984457b125fa9d8ac19`，读回保存在`actions-readback-2.log`。未修改推送触发或自动部署设置。
- 首次图片dry-run因本批档案漏登记已交付`personal.extras.portrait`失败；只补原计划构图及标签，未改断言或媒体，再按原流程成功入库。日志在`import-steps.json`及其引用文件。
- 首轮`bc085b0`完整验证311工具通过，浏览器213通过/8失败：首页长发布说明使EN 236词、ZH 503字超原225/450上限。只压缩本批release.note，未删身世/记忆点/工具例外，未改测试或其他演员文案。8例小复现后EN 209词、ZH 422字全过，再验证新候选全过；原失败保留于`release-verify-1.log`及`verify-first-failures/`。
- `.reports/2026-10-23-next10-release/formal-one.mjs`是准备的真实逐人浏览器验收脚本，**没有执行**。06:23真实中英20页GET记录在`live-before-publication.json`，它明确标记publication=false，不是上线成功证据。
- 本地十人封面已逐张读取核对姓名/版本；Kate为短发年轻女性、Peter为长白发老年男性。生产源、图片及AuthKit/付款的范围核对未发现本批以外演员被改写。真实新站卡片/详情/灯箱、6声音实播下载、4片实播/来源、手机与原图下载/限流仍待发布后逐人核对；真实账号完整链路未冒充完成。

## 保留的例外与限制

1. 许丽、马红Vids为已批准的Drive平台保存版，不是整份文档导出；原feed字节未拿到，平台保存原件及SHA已归档。许丽用获准简化prompt，不能说四片完全同prompt比较；网页两人Vids均有双语说明，四角星未裁。
2. `measurement_review`及留白/比例例外按授权代理相对视觉接受，原测量与修订保留，不改成自动数值全过。马红原Grok01脚边轻微地面标记仍保留。
3. 声音均为可替换占位WAV；部分只有ASR核对，不宣称完整声学审听。数据携带placeholder，页面逐段标“占位声音/Placeholder voice”及未完成完整声学审听；不是正式配音。
4. 沈秀英外貌v1，3张指定纠正侧面原文件修订v2；逐格采用计划明确文件，网站按v1外貌套装规范化命名，nativeSource/nativeRevision/SHA留真实修订。未回退旧侧面。
5. 四样片审看HTML将Kate/Peter显示标题互换；按名单、演员档案、slug和接受的task输出归属，不按错误标题换脸或改生产者原HTML。
6. 历史Grok未知请求、模型CLI美元用量不是实际账户扣款或视频单价。未购买新服务、未改计费配置、未付费重新生成；Vercel用量/计价查询不作实付款凭据。

重活、推送及检查均经HQ run-locked；124等位超时后退避重排，未抢University、改负载阈值、删别人锁或绕hooks。04:50–05:12无本任务远程请求。约06:02用时复盘：主要耗时为共享锁/负载等待和一次真实首页文案回归；现有CLI仍是最短路线，未另建同步/检查系统。

收尾仅更新本收据、实施方案、current-work及生成MANIFEST；相关文档检查通过（38当前文件/73链接、0警告）、格式/差异检查通过，不重跑运行源码未变的整套工程检查、不新建CI或部署。

Learning skipped -> 正式发布与逐人线上验收尚未完成；当前状态已归执行收据和实施方案。
