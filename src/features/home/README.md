# Home

负责首页视图，不拥有演员数据或通用控件。

- 入口：`index.ts` 的 HomeView；路由负责 locale 与 metadata。
- 内容来自演员查询和成对消息源。首页改字走 how-to 的文案配方，不编辑生成目录。
- 合同：中英文首页、既有 CTA 链接、顺序和文字意思。
- 验证：`e2e/smoke.spec.ts`、`site.spec.ts`、消息检查与 HTML 文本快照。
