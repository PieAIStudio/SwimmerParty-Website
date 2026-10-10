# 十位演员全套制作单 — 2026-10-09

## 事实与命名

正式演员名和 slug 以 `media-pack/casting/new-faces-2026-10.json` 为准；CC 编号只作 casting source，不作为网站演员名或文件 slug。十位已登记到 `media-pack/actors/` 和 `media-pack/pack.json`，当前均为 `delivered: 0`、`published: false`。

## 统一交付链

每位演员单独一个 MediaFactory actor run，监督 session 使用 `gpt-6.1-sol / medium`；网页端按项目包使用 GPT-5.6 Pro。顺序固定为：

1. 读取该演员 JSON 和 casting face reference；
2. **比例/画面试镜**：先测量，必要时重拍 2–3 张。数字比例使用该演员 `proportions.headsTallRange`；同时检查 `frameGuide` 的画面占比、上/下留白和身体结构。CC-022 和 CC-087 是重点人工复核对象；
3. Owner 从合格候选中选身体锚点；
4. 生成并验收全套 55 张 PNG；
5. 生成 6 段声音，试听、记 MiniMax 声贝并用 Whisper 核对；
6. 用 Grok CLI 做样片视频，记录美元成本；
7. 生成图片总览、声音播放、样片播放和交接回执。

比例数字通过不等于整张通过；发型顶与头骨顶分开，下巴不含胡须末端。拒收候选只留证据，不作身体参考。完成交接前不改演员状态、不发布。

## 演员清单

| slug | 正式名 | source | 身高 | 目标范围 | 重点修正 |
|---|---|---:|---:|---:|---|
| `wei-qinghe` | 卫青禾 / Wei Qinghe | CC-006 | 174 cm | 7.2–7.5 | 高瘦但不做时装模特长腿 |
| `hu-guifen` | 胡桂芬 / Hu Guifen | CC-011 | 155 cm | 6.8–7.2 | 矮而丰润，不儿童化大头 |
| `qin-lie` | 秦烈 / Qin Lie | CC-022 | 178 cm | 7.1–7.4 | 保留宽肩肌肉和英俊；降低英雄模特感，不拉高腿、不夸张肩宽 |
| `jiang-yifan` | 江一帆 / Jiang Yifan | CC-041 | 168 cm | 7.1–7.4 | 运动感保留，不做长腿模特 |
| `pang-tiezhu` | 庞铁柱 / Pang Tiezhu | CC-057 | 176 cm | 7.1–7.4 | 宽肩、花白鬓角和门牙记忆点保留，不做健美巨人 |
| `xia-zhiyao` | 夏知遥 / Xia Zhiyao | CC-071 | 170 cm | 7.1–7.5 | 高挑但腿段自然；左右眉不对称和脸颊小痣必须保留 |
| `du-shouren` | 杜守仁 / Du Shouren | CC-087 | 162 cm | 6.8–7.2 | 直立完整成人；不能驼背压缩，不能让画面观感像 150 cm |
| `callum-reid` | 卡勒姆·里德 / Callum Reid | CC-009 | 188 cm | 7.3–7.7 | 光头大胡子和壮硕保留，不做巨人/九头身 |
| `annika-brandt` | 安妮卡·勃兰特 / Annika Brandt | CC-063 | 164 cm | 6.8–7.2 | 雀斑、翘鼻、毛躁发保留，避免模特化 |
| `ibrahima-ndiaye` | 易卜拉希马·恩迪亚耶 / Ibrahima Ndiaye | CC-070 | 190 cm | 7.3–7.8 | 修长和身高保留，腿段自然，不做时装模特 |

## 预算与暂停

图片网页消息按演员跨 replacement 累计；MiniMax 每位最多 3,000 声贝，Grok 每位最多 3 美元。遇到额度、音色槽满、事实/登录或外部结果未知才暂停；网页短暂加载、429、下载或选择器故障沿原 run 恢复，不换模型、不重提未知请求。

## 已开 MediaFactory session — 2026-10-09

十位均已在 MediaFactory project、local environment 开立，Codex supervision 固定 `gpt-6.1-sol / medium`；截至开立后的首轮检查，十位均处于 `active/inProgress`，都从比例试镜开始，尚未报告完整交付。

| 演员 | Session |
|---|---|
| 卫青禾 | `01a120bf-dd89-7fc1-8844-a288120473ff` |
| 胡桂芬 | `01a120bf-c5c9-7e50-803e-eaead0beab14` |
| 秦烈 | `01a120bf-cd88-73e0-9b64-81fe205c4117` |
| 江一帆 | `01a120bf-e415-7a20-b867-d210b1d1584b` |
| 庞铁柱 | `01a120bf-d4a5-7160-94ef-c2cb5a5b763d` |
| 夏知遥 | `01a120bf-f513-7f43-b1c1-028aa0300077` |
| 杜守仁 | `01a120c0-0887-7933-81b3-14452a7d9132` |
| 卡勒姆·里德 | `01a120bf-ecd6-7601-b29a-deed7a2bcb85` |
| 安妮卡·勃兰特 | `01a120bf-fc10-7ef1-bcaa-c1966eb87096` |
| 易卜拉希马·恩迪亚耶 | `01a120c0-025e-7e80-82a4-52e246c8ddda` |

补充：卡勒姆原开立 ID `01a120bf-ecd6-7601-b29d-deed7a2bcb85` 未在 MediaFactory thread 列表落地，不能继续使用；已补开唯一有效 session `01a120cf-8097-77a1-8641-99d073a67861`，不产生重复演员 run。

更正记录：上一条补充把卡勒姆原 session ID 的末段误写成了 `...deed...`；正确原 session 是 `01a120bf-ecd6-7601-b29d-deed7a2bcb85`，仍在运行并继续使用。重复 retry session `01a120cf-8097-77a1-8641-99d073a67861` 已停止；它只读资料、未建立 actor run、未上传、未出图、未产生声音或费用。

## 定时监督第一轮 — 2026-10-09 21:26（新加坡时间）

已建立当前线程心跳监督，每 15 分钟运行；无变化静默。第一轮按 14 位有效演员逐个检查：

- 马乐：55 图、6 WAV、Grok 样片已完成，未发布。
- 雷乐：55 图完成、音色 2 已选；intro 已正式收货，另外 5 段仍只有临时 blob，已要求沿原页面继续拿正式 WAV，再做 Grok。
- 卫青禾：参考附件遗漏，已按 filechooser 恢复；未把无参考请求算候选。
- 胡桂芬、秦烈、庞铁柱、夏知遥、易卜拉希马：仍在比例试镜/上传恢复阶段，未产生可选身体锚点。
- 杜守仁：fresh-2 画面占比仍过大，正在 fresh-3，未扩散锚点。
- 安妮卡：第二轮约 6.0 头身且画面门失败，正在最后一轮试镜。
- 江一帆：上传句柄仍未恢复，已再试一次同一 IAB；若仍失败保留 waiting-capability，不换浏览器。
- 包满、范一鸣：监督 session 仍受 gpt-6.1-sol capacity 阻塞，不换模型。
- 卡勒姆：原线程曾因连接状态消失；已确认无有效重复生产，重新开立唯一监督 session `01a120da-30ba-7ff3-9e0b-12c259199f00`，当前 active。

## 定时监督第二轮 — 2026-10-09 21:41（新加坡时间）

- 卫青禾已成功按 filechooser 附上 CC-006，原请求生成中；未把之前无附件请求算候选。
- 秦烈两张有效候选因画面占高过大被拒，第二轮修正中；庞铁柱三张因上下留白失败，正在第三条试镜重拍。
- 杜守仁 replacement-2 仍约 5.1 头身且画面门失败，继续 replacement-2；安妮卡三条试镜均失败，已下发 replacement-1；夏知遥三条试镜均失败/身份串线，已下发 replacement-1。
- 雷乐仍卡在后续 5 段临时 blob 音频，已要求继续取得正式 WAV；马乐全链保持完成。
- 范一鸣、包满仍受 6.1 SOL capacity 阻塞，已沿原 run 重试，不换模型。
- 卡勒姆新监督 session `01a120da-30ba-7ff3-9e0b-12c259199f00` active；易卜拉希马已上传 CC-070，准备提交候选；胡桂芬、江一帆仍在附件/IAB 恢复。

## 定时监督第三轮 — 2026-10-09 21:56（新加坡时间）

- 胡桂芬第二批候选尚未完成正式下载/测量，已要求先生成合格审看页，再交 Owner 选择；不让 Owner 选择临时图。
- 秦烈、江一帆、庞铁柱继续处理画面门失败；庞铁柱三条试镜已全部质量拒收，已自动进入 replacement-1。
- 夏知遥 replacement-1 正在修正画面占比和身份；杜守仁五轮仍失败且触发演员试镜消息预算上限，暂停等待 Owner 调整预算/路线。
- 安妮卡 replacement-1 继续修正；易卜拉希马三轮全部失败，已自动进入 replacement-1。
- 卫青禾附件已成功并在生成；卡勒姆新监督 session 正常；雷乐继续追剩余正式 WAV；马乐保持完整交付。
- 包满、范一鸣仍受 6.1 SOL capacity 阻塞，未换模型。
