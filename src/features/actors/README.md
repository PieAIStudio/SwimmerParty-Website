# Actors

负责名册、筛选、演员档案与图片表现。

- 入口：`index.ts` 供服务器页面组合；`queries.ts` 提供不引入 UI 的查询。图片组件供本功能直接使用，不另建空 client barrel。
- 事实：[演员数据归属](../../content/actors/README.md)。不在页面或查询层复制生产记录。
- 合同：永久 slug、双语档案、已交付状态、筛选与分享路径；无图不伪造交付。
- 验证：`tools/test/actor-data.test.ts`、`roster.test.ts`、`e2e/actors.spec.ts`、`assets.spec.ts`。
