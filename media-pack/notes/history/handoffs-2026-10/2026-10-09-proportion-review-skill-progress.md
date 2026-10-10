# Actor proportion review skill progress — 2026-10-09

## 已完成

- MediaFactory `mf-actor-pack` 精简为按阶段读取的交付链：比例试镜 → 全套图 → 声音 → Grok 样片 → 审看交接；目标比例、数量、规格与预算仍来自项目包/制作单。
- 仅比例阶段读取 `mf-actor-pack/references/proportion-review.md`。新增无外部依赖的 `scripts/proportion-review.mjs`：AI 标头骨顶/下巴/鞋底与误差，程序计算、哈希、生成带线旧新对比页；支持刻度开关和等人物高度显示，不改原 PNG、不代替身份/身体结构验收或 Owner 批准。
- 发型顶与头骨顶分开；下巴不含胡须末端；鞋底增高与标点误差单独记录。目标范围附来源，不内置固定比例或演员名单。
- `mf-image` 只加入调用引用，未改既有批量路线。5 项工具测试、两份 skill 校验、MediaFactory 文档检查通过。用雷乐既有原图和测量记录跑通 CLI；自动视觉预览被浏览器本地 URL 策略拦截，未绕过，不能把程序验证称作视觉验收。

## 四个生产 session

全部沿用现有 MediaFactory session，通过工具参数设置 `gpt-6.1-sol / medium`，不要求生产 session 自己改模型。网页模型继续由 provider 配置决定。

| 演员 | Session | 恢复后的任务 |
|---|---|---|
| 包满 | `01a11f27-503f-7ea0-971d-adbb6bbc1ac4` | 承接 `run-mv0jarjk-8bffa633`，核对累计账本，用通用工具继续比例试镜 |
| 雷乐 | `01a11f27-56a1-7860-840f-a1dad8ee2861` | Owner 已选 fresh-3 候选 2，承接已有锚点继续 55 图、6 声音、Grok，不重新选角 |
| 范一鸣 | `01a11f27-5d6e-7912-8bf1-34845bdfddd8` | 承接 `run-mv0jbucw-666e4832`，纠正发型/胡须测量口径，继续试镜；IAB 可达不再误报能力缺失 |
| 马乐 | `01a11f27-6358-74f3-9f9c-70805bc36ec1` | 承接 `run-mv0j9vsj-05cd8a54`；之前三张均拒收，不冒充可选候选，继续生成真正合格的试镜 |

恢复前最近执行均出现 Codex 模型容量错误；本次指令已发送成功，发送后四个 session 均实测为 active/inProgress。这不等于媒体生产已完成。

## 费用与 Owner 关口

本次修改技能、工具和本地验证：外部生产费用 0，新增 MiniMax 声贝 0、Grok USD 0。各演员历史生产消耗保留在原 run/父账本，不重置、不计入本次修改费用。

雷乐已有选择，不再等待重复选择。其余演员产出合格候选后再请 Owner 选身体锚点；完整交付后再等正式验收。MiniMax 每位最多 3,000 声贝、槽满暂停；入库、演员状态与发布仍需 Owner 授权。本监督 session 没改演员 JSON、pack 或网站代码。

## 本轮复核与优化 — 2026-10-09

四个现有 session 的运行状态：

- 包满：最近连续遇到 Codex `Selected model is at capacity`，随后一次明确为 workspace out of credits；父账本至少 22 条消息/39 张试镜图，仍无 Owner 身体锚点，未进入全套。
- 雷乐：沿用 Owner 选择的候选 2，当前 48/55 张全套图已验收，最后一批在 429/生成恢复中；未进入声音或 Grok。
- 范一鸣：55/55 张图已验收，MiniMax 音色已保存，866 声贝；合成页选择器暂时不能切换到该音色，未误用别的音色；Grok 登录检查通过但样片未生成。
- 马乐：全套图和 Grok 样片已有，当前继续生成 Owner 选择的音色 1 的 6 段声音；之前被相似性拦截的格位已补回，临时下载不计入交付。

本轮把比例工具从单一数字门扩为“数字门 + 可选画面门”：当制作单提供 `target.frame` 时，工具检查人物占画幅和上下留白；没有提供时只展示数据，不擅自拒收。技能入口仍保持短小，把细节放在比例参考文件和脚本。新增工具测试全部通过，未改演员 JSON、`pack.json` 或发布状态。

新增名单提案见 `2026-10-09-ten-actor-selection-proposal.md`，配比为 7 亚洲、2 白人、1 黑人；等待 Owner 确认后才创建演员制作单和 session。

复核后最新状态：包满刚才再次因 MediaFactory Codex `Selected model is at capacity` 失败；未发送新的网页图像请求。按 Owner 的模型要求不切换到别的 Codex 模型，等待容量恢复后沿同一父账本继续。
