# 流程更新：比例工具 v3 与执行规则收敛 — 2026-10-10

Claude 写，Owner 授权。所有在制演员 session 重新开工前先读本页，再读 MediaFactory 的 `mf-actor-pack`。

## 改了什么

1. **比例测量**：头骨顶不再由 AI 目测，由眼线和下巴推算，并修正张嘴、俯仰和年龄；发髻、卷发、帽子不算头高。旧口径把带发型的演员量小约 0.6–1 个头身（例：米丽娅姆 5.5 → 约 6.3）。用法：MediaFactory `.agents/skills/mf-actor-pack/references/proportion-review.md`。`target.age` 取演员 JSON 的 `demographics.age`。旧的 `*.vision.json` 缺眼线数据，要用当前脚本重新取证（每张几秒，不花钱）。
2. **出图**：同一演员一个对话，每条消息最多 10 张，少出或重复只补缺的编号。网页暂时异常先刷新、重开、等待，最多 3 轮，之后才标 `waiting-capability`。操作说明只在 MediaFactory `docs/reference/routes/chatgpt-web.md`。
3. **额度**：默认每位 ChatGPT 试镜 3 条、全套 25 条；MiniMax 3,000 声贝；Grok 3 美元。Owner 批准追加后由 session 执行 `pnpm mf run limit --id <run> --route-limit chatgpt-web:full=<n> --note "<批准记录>"`，不必再改代码。
4. **台词**：制作单或选角源给了的台词照用；缺的格位由执行端按演员事实起草，`lines.json` 标 `"draft": true`，交接时给 Owner 审（见 `style/voice-rules.md`）。
5. **项目包**：
   - 全套格位表只在 `pack.json` 的 `fullPack`；
   - 15 位新演员 JSON 已规范化：`identity` 不再带衣服颜色和重复句；新增 `demographics`；流程备注已删除；
   - 交接每位演员每张单一个文件 `notes/handoffs/<日期>-<slug>.md`，原地更新；
   - 已完成或被取代的交接已移到 `notes/history/handoffs-2026-10/`。
6. **ChatGPT 项目说明**：`style/chatgpt-project-instructions.md` 已更新（删掉多演员加速批和“降到 1–2 张”；比例写明是头骨顶）。需要一个 session 把分隔线之间的英文重新粘贴到 Pics-A 的项目设置里，只做一次。

## 先重测，再决定重拍

下表是 Claude 用新模型对已有候选做的快速重测，只看了数字和头部角度。正式结论以各 session 用工具生成的审看页为准，还要看身份、CG 风格和身体是否自然。

- 已经有 Owner 选定身体锚点、正在做全套的演员：照常继续，不因为重测重新选角。
- 还在比例阶段的演员：先把“先看这些”列出的图做成审看页交 Owner；都不合格才出 2–3 张新候选。

| 演员 | 年龄 | 目标 | 已有候选 | 数字合格 | 新口径范围 | 先看这些（MediaFactory 根目录相对路径 · 中值） |
|---|---:|---|---:|---:|---|---|
| annika-brandt | 26 | 6.8–7.2 | 34 | 2 | 7.15–8.67 | `factory-workspace/runs/run-annika-replacement-4-20261009/proportion-review/candidates/annika__replacement-4__candidate-3__v1.png` 7.15<br>`factory-workspace/runs/run-annika-replacement-2-20261009/proportion-review/candidates/annika__replacement-2__candidate-1__v1.png` 7.20 |
| bao-man | 33 | 7.2–7.6 | 8 | 0 | 6.23–7.04 | — |
| du-shouren | 72 | 6.8–7.2 | 4 | 0 | 5.74–7.44 | — |
| fan-yiming | 36 | 6.8–7.2 | 9 | 3 | 6.31–7.63 | `factory-workspace/runs/run-mv0jbucw-666e4832/candidates/fan-yiming__fresh-1__candidate-4.png` 6.93<br>`factory-workspace/runs/run-mv0r7ci3-197779fc/candidates/fan-yiming__fresh-2__candidate-2.png` 7.07<br>`factory-workspace/runs/run-mv0jbucw-666e4832/candidates/fan-yiming__fresh-1__candidate-5.png` 6.86 |
| hu-guifen | 45 | 6.8–7.2 | 7 | 1 | 5.31–6.87 | `factory-workspace/runs/run-mv0z5pxz-328106cb/hu-guifen/proportion-trial/candidate-1-rejected.png` 6.87 |
| ibrahima-ndiaye | 45 | 7.3–7.8 | 12 | 10 | 7.27–7.97 | `factory-workspace/runs/run-mv0z898h-12923cd7/proportion-trial/raw/ibrahima-round2-1.png` 7.53<br>`factory-workspace/runs/run-mv0z898h-12923cd7/proportion-trial/raw/ibrahima-round3-2.png` 7.57<br>`factory-workspace/runs/run-mv0z898h-12923cd7/proportion-trial/raw/ibrahima-round1-2.png` 7.58 |
| jiang-yifan | 20 | 7.1–7.4 | 9 | 1 | 7.14–7.46 | `factory-workspace/runs/actor-jiang-yifan-20261009/proportion-trial/final-attempt/candidates/candidate-2.png` 7.21 |
| lei-le | 46 | 6.8–7.2 | 5 | 0 | 5.95–9.00 | — |
| miriam-adler | 50 | 7.2–7.6 | 3 | 0 | 6.36–6.49 | — |
| pang-tiezhu | 57 | 7.1–7.4 | 6 | 0 | 5.87–6.36 | — |
| qi-changfeng | 42 | 7.2–7.6 | 31 | 1 | 6.23–8.21 | `factory-workspace/runs/qi-changfeng-20261010/replacement-downloads/replacement-1.png` 7.31 |
| qin-lie | 28 | 7.1–7.4 | 3 | 0 | 6.96–7.06 | — |
| wei-qinghe | 31 | 7.2–7.5 | 24 | 9 | 6.72–7.99 | `factory-workspace/runs/run-mv0z6cjv-fb70dd8e/proportion-candidates/replacement-bands-v2-round4/candidate-1.png` 7.35<br>`factory-workspace/runs/run-mv0z6cjv-fb70dd8e/proportion-candidates/replacement-bands-v2-round2/candidate-2.png` 7.35<br>`factory-workspace/runs/run-mv0z6cjv-fb70dd8e/proportion-candidates/candidate-2.png` 7.37 |
| zawadi-mwangi | 29 | 7.2–7.6 | 8 | 7 | 7.17–7.54 | `staging/actors/zawadi-mwangi-20261010/candidates/replacement-3.png` 7.40<br>`staging/actors/zawadi-mwangi-20261010/candidates/candidate-2.png` 7.43<br>`staging/actors/zawadi-mwangi-20261010/candidates/candidate-1.png` 7.35 |
