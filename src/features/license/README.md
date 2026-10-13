# License

负责授权、隐私和条款页面的视图，不保存第二份法律文案。

- 入口：`index.ts` 的 LicenseView、LegalDocument。
- 唯一源：完整规则及下载包许可原文在 `content/license.ts`，隐私/条款在 `content/legal.ts`。Owner 批准的授权页首行标题、元数据简介和首屏说明属于展示文案，只在 `messages.source.ts` 的 `license.heroLines.0`、`license.metaDescription`、`license.intro`；不回写不可变的 License v1.0/下载文字。
- 合同：License v1.0 表意、署名和黑白署名标文件名。旧会员 ZIP 文字差异是 decisions.md 记录的待 Owner 决定项，不能借重构擅改。
- 验证：`e2e/site.spec.ts` 实际下载署名标；`e2e/license-copy.spec.ts` 覆盖中英 390/1440 的批准文案、完整规则/FAQ/五项承诺及可访问性；`tools/test/license-copy.test.ts` 锁定许可源与下载原文字节。
