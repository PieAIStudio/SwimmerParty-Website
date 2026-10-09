# Analytics

负责经批准的、无 cookie 的产品事件。

- 入口：`index.ts` 的 PostHog 组件；事件白名单、推导类型、别名规范化及过滤只在 events.ts。
- 合同：现有事件名、`app=swimmerparty`、隐私过滤和无 cookie 行为；键/地址只从既有环境读取。
- 本地没有配置时不发送事件，测试不连接分析服务。
- 验证：`tools/test/analytics.test.ts`；新增事件步骤见 [操作配方](../../../docs/reference/how-to.md)。
