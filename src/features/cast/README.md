# Cast

负责浏览器选角单、分享链接和多人懒人包。

- 入口：`index.ts` 的 CastView 供路由；`client.ts` 供选角按钮和上下文。
- 事实：演员查询来自 actors，打包调用 assets/client，不复制素材加载器。
- 合同：本地选角保存、分享查询参数、演员永久 slug、`swimmer-party-cast.zip` 与角色目录结构。
- 验证：`e2e/exports.spec.ts` 实际解包两位演员；source 快照逐条核对公开文件名和目录。
