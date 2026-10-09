# License

负责授权、隐私和条款页面的视图，不保存第二份法律文案。

- 入口：`index.ts` 的 LicenseView、LegalDocument。
- 唯一源：`content/license.ts` 与 `content/legal.ts`；界面标签在消息源。
- 合同：License v1.0 表意、署名和黑白署名标文件名。旧会员 ZIP 文字差异是 decisions.md 记录的待 Owner 决定项，不能借重构擅改。
- 验证：`e2e/site.spec.ts` 实际下载署名标；axe 与完整 HTML 文本对比。
