# 交接说明：严琳试镜照试点（暂停）

- 日期：2026-10-09
- 演员：严琳 Yan Lin（`yan-lin`）
- 范围：只尝试 2–3 张新的正面全身试镜照候选；不做 55 张全套，不做声音。
- 制作单：`/Users/yuanfei/PieAI/SwimmerParty-Website/media-pack/notes/handoffs/2026-10-09-five-full-packs.md`
- 正确运行单：`run-muzwhby8-56e2e78d`
- 运行单状态：`paused`（`waiting-capability`）
- 旧错误运行单：`run-muzwfh8x-1272b99c`，已暂停；其 15,000 credits 是五位合计口径，未产生费用、未提交生成。

## 实际路线与输入

- 实际路线：ChatGPT Web，Codex In-app Browser（`iab`）。
- 远程项目：`Pics-A` 在页面侧可见。
- 制作单目标模型：`5.6 Pro (GPT-5.6 Sol, thinking effort at max)`；页面显示模型选择器，但本次没有在未通过预算关口前声称已选定或提交生成。
- 旧照参考：`library/claude-casting-2026-10-07/final/CC-061.png`，只作脸部和发型参考。
- 规格：941×1672 PNG、透明底、单人、正面全身、约 165 cm、约 7.25 头身、头顶到下巴约 22–23 cm、试镜基础装。
- 目标交付目录：`media-pack/library/actors/yan-lin/staging/`；当前目录不存在，未创建空交付物。

## 结果与哈希

本次没有提交生成请求，因此没有外部请求 ID、模型生成回执、下载文件或候选图。

| 候选 | 输出文件 | SHA-256 |
| --- | --- | --- |
| candidate-1 | 未生成 | — |
| candidate-2 | 未生成 | — |
| candidate-3 | 未生成 | — |

输入快照哈希记录在运行单证据中：

- `pack.json`: `8cb5a42abc1f79f7c14f251b8db8898d29b562c0d6ff993f8f68449809507e86`
- `style/aesthetic.md`: `80e8710d5a1252c568fe36e05d19fe5ec041326c5fa579e78d507bfbdeacf1ee`
- `style/character-rules.md`: `5167926069051965a61c9bd35b95328c5815faecba29434ce488c1b8f1138b05`
- `checks.md`: `eb1e741b2d253cd8b026d8e72bf1033262fe4f8829551718654908e8f757b953`
- `actors/yan-lin.json`: `b9e03bda3be765f2d2f06513908683acf9aaf0d1309b5be85e309ca8a2ff0dd7`
- `CC-061.png`: `886a0ee0d92f0dc4a3d0f7f9213e88e0721aa1dc7e045ece061a54b887ff2135`
- 制作单：`8141fbf09985757652e1337b04338c2972c9d305d64c5da06b335943fd8f9bdb`

运行单证据：

- `factory-workspace/runs/run-muzwhby8-56e2e78d/intake-evidence.json` — SHA-256 `22187ccdcfddcfc3b69e353923a9bde63f41674f7b413dd967c0d7834c715aa6`
- `factory-workspace/runs/run-muzwhby8-56e2e78d/budget-gate-evidence.json` — SHA-256 `e1feabe9a5b2ea8b207780c6bfe0b90ca3f570d44053c3268daaf3c20deba230`

## 预算与关口

- 正确预算：单人上限 `3,000 credits`；运行单登记 `spent: 0`。
- ChatGPT Web 生成前没有显示可比较的次数、额度或余额读数；费用只能标记为未知，不能记成 0。
- 按 `docs/reference/routes/chatgpt-web.md` 与用户指令停在 `waiting-capability`，没有进入生成、下载或验收。
- 声音未尝试；没有读取或消耗声贝。

## 待收货项

1. Owner 提供/启用可比较的 ChatGPT Web 生成前与生成后用量读数，或批准另一条可真实记账的图片路线。
2. 关口解除后，用 `run-muzwhby8-56e2e78d` 原 ID 恢复；不要重提未知请求。
3. 生成并逐张验收 2–3 张候选后，再写入 `library/actors/yan-lin/staging/`；Owner 选择前不更新 actor anchors，不做全套图片或声音。

未修改网站源代码、`pack.json`、演员 JSON，也未发布或入库。
