# 五位演员比例重试规则进度

- 日期：2026-10-09
- 已完成：补充 `2026-10-09-five-full-packs.md` 第 8–10 节，明确发型取点、身高对应目标头身比、像素测量字段、质量失败后的 replacement session 规则，以及 MediaFactory Codex session 固定使用 `gpt-6.1-sol` / `medium`。
- 已通知：严琳、包满、雷乐现有 MediaFactory session 重新读取交接单；严琳和包满已开始按新版规则准备 replacement；马乐、范一鸣、雷乐已各开独立 replacement session。雷乐旧标签因 composer 被马乐占用而未抢占，符合隔离规则。
- 网页端生成模型：继续由 MediaFactory 生产路线自行选择，与 Codex 监督模型分开。
- 费用：本次只改交接文档、发送监督指令和开 replacement session，未新增声音或视频制作费用；各演员既有 run 的图片/订阅费用仍以其运行日志为准。
- 当前等待：各 replacement 先交付通过比例门的身体锚点；Owner 点头前不入库、不改演员状态、不发布。比例通过后再进入全套图、声音和 Grok 样片链。

## 流程重整（2026-10-09）

- 网站制作单已压缩为三段：精简执行规则、单一演员交付链、比例验收口径。
- MediaFactory `mf-actor-pack` 已把质量失败改为自动恢复，把预算、声贝、音色槽、未知结果和发布保留为硬关口，并明确 Codex 监督模型与网页生成模型分离。
- 严琳保留现有 20 张图和原 run；包满、雷乐、范一鸣、马乐的旧 run 只保留证据，重新开 fresh session。
- 新 session 必须使用 Codex `gpt-6.1-sol / medium`，网页端继续使用制作单要求的 `gpt-5.6-sol / 5.6 Pro`。
- Fresh session：包满 `01a11f27-503f-7ea0-971d-adbb6bbc1ac4`；雷乐 `01a11f27-56a1-7860-840f-a1dad8ee2861`；范一鸣 `01a11f27-5d6e-7912-8bf1-34845bdfddd8`；马乐 `01a11f27-6358-74f3-9f9c-70805bc36ec1`。四个 session 均已进入运行，先做旧照测量和比例试镜。
