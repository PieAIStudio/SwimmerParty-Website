# Guide

负责结果导向的 Learn 入口：懒人包、设定图、选角包各有本站操作预览、素材说明、三步与直达入口。预览来自现有 `public/help` 演示，明确不是第三方工具生成结果。

- 公共入口 `index.ts` 导出 GuideView / ToolGuideView；`/guide` 保持既有 URL，工具步骤位于 `/guide/tools/[tool]`。
- UI 标签由 `messages.source.ts` 拥有，本站动作在 `workflows.ts`，第三方流程及官方来源在 `src/content/tutorials.ts`。
- `sourceCheckedAt` 仅代表官方文档核对，`reproducedAt` 和 `reproductionEvidence` 必须有真实生成、检查及保留产物后才填写；五篇当前均待实际生成，内部待验清单在 `tools/test/fixtures/tutorial-reproduction-internal.json`；前台不展示“草稿”标记，未实测的页面仍 noindex、不进 sitemap，输入参考图不冒充生成结果。
- 不调用模型，不自动上传用户文件，不借本地 mock 冒充第三方账号/套餐/效果验收。对外工具收费、配额与可用性先查官方来源并写在按钮前。
- 验证：`tools/test/tutorials.test.ts`、`e2e/learn-next-stage.spec.ts`、`learn-downloads.spec.ts`、原 guide 和 axe 检查。外部五工具实际复现仍是独立未完成验收。
