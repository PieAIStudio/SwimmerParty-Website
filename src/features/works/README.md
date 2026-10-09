# Works

负责片单、单片视图及与样片/社区的组合。

- 入口：`index.ts` 的 WorksView、WorkView；动态帖子仍属于 community。
- 唯一源：content/works.ts 的批准片单，samples 提供官方样片，不能在页面编造项目进度或出演记录。
- 合同：既有作品 slug、演员链接、双语文案和社区关闭状态。
- 验证：`tools/test/roster.test.ts`、`metadata.test.ts`、页面文本快照及 smoke 测试。
