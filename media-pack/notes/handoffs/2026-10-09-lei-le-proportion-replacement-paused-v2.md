# Lei Le proportion replacement v2 paused

- 日期：2026-10-09
- 演员：雷乐 Lei Le (`lei-le`)
- 原运行单：`run-mv0etpqv-0a450cc1`（已 paused，quality_rejected）
- replacement 运行单：`run-mv0hggz4-8726d9e7`（已 paused，quality_rejected）
- 路线：ChatGPT Web / Pics-A / subscription
- 独立会话：`6ac872e5-bfe8-83ea-87d5-f548f5f7ddcf`；使用独立干净 Pics-A composer，没有触碰其他演员草稿。

## 结果

- replacement 共实际发送 3 条消息：第 1 条因网页换行输入故障只提交了不完整风格开头，未生成图片；随后两条各返回 3 张独立 PNG，共 6 张已下载。
- 6 张均通过文件层检查：941×1672、8-bit RGBA PNG、透明底、单人、全身和双鞋底可见。
- 6 张均未通过比例门：按最高连续黑色短发点 crownY、最低下颌 chinY、较低鞋底 soleY 测量，约 5.7–5.8 头身；目标约 7.0–7.2，头高应约 230–245 px。
- 证据和测量：`factory-workspace/runs/run-mv0hggz4-8726d9e7/lei-le/evidence/measurements.md`；候选保存在同一 run 的 `evidence/replacement-1/` 和 `evidence/replacement-2/`。
- 所有候选仅作拒收证据，没有进入 `/Users/yuanfei/PieAI/SwimmerParty-Website/media-pack/library/actors/lei-le/staging/`；该 staging 仍为空。
- 没有设置 `actors/lei-le.json` 的 body anchor，没有做 55 张全套、6 段声音或 Grok 样片；没有改演员状态、入库或发布。

## 费用与消息事实

- ChatGPT subscription：3 条消息，6 张独立图片；网页订阅路线不读取或虚构余额。
- replacement run ledger：`/Users/yuanfei/PieAI/MediaFactory/factory-workspace/runs/run-mv0hggz4-8726d9e7/run.json`。

## 下一步

当前 replacement trial 已耗尽，需 Owner 决定是否在新的 replacement session 中继续修正提示词/路线。继续前仍只能继承 CC-012.png 的脸部和发型身份参考，不能把本 run 或原 run 的拒收身体图当参考；Owner 选择合格身体锚点前保持演员状态、staging、全套图片、声音和视频不变。

## 模型边界补充

- MediaFactory Codex 监督、验收、记账和交接：`gpt-6.1-sol`，medium thinking。
- ChatGPT Web / Pics-A 图片生成：严格沿制作单使用 `gpt-5.6-sol`；不把 Codex 模型或 thinking 设置传给网页端，也不修改网页端模型配置。
