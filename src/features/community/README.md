# Community

负责本地作品、点赞、举报、审核和演员投票原型。

- 入口：`index.ts` 为页面组合；`client.ts` 为浏览器控件；`server/index.ts` 为 API handlers。
- server/adapter.ts 定义存储边界，memory.ts 实现本地状态；页面不直接访问存储。
- 合同：既有 `/api/community/*` 请求/响应。server/route.ts 在非 mock/部署环境统一拒绝为 503，不能回退内存或把本地成功当线上成功。
- 正式依赖：[后端需求](../../../docs/reference/swimmer-party-community-backend.md)。开关值不代表后端已经交付。
- 验证：`tools/test/community.test.ts`、`community-moderation.test.ts` 与部署守卫证据。
