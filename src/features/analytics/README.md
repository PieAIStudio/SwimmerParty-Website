# Analytics

负责经批准的、无 cookie 的产品事件。

- 入口：`index.ts` 的 PostHog 组件与 `client.ts` 的 `trackProductEvent`；事件白名单、推导类型、别名规范化及过滤只在 events.ts。
- 合同：现有事件名、`app=swimmerparty`、隐私过滤和无 cookie 行为；键/地址只从既有环境读取。
- `trackProductEvent` 只发经过过滤的本地 `swimmer-party-event`；没有 PostHog key 时不发送网络请求，测试只观察本地通道，不连接分析服务。
- A1 漏斗：`sample_viewed` 为官方视频首次播放（循环/继续播放不重复，不包括帮助演示）；`actor_viewed` 为实际渲染的演员详情；`download_started` 为单张、懒人包、选角包、多选/模型包的下载尝试（不是成功）；`cast_changed` 为加入、移除、清空；`sign_in_prompt_shown` 为被下载门槛要求登录。成功下载仍走既有 `asset_downloaded`。
- 演员详情用 `data-actor-dossier`，官方视频容器用 `data-official-sample` 标记经服务器确认的公开演员 slug；不从任意路径、标题、媒体 URL 推断或上报身份。A6 的多样片 ID 合同尚未接入。
- 验证：`tools/test/analytics.test.ts`、`e2e/next-stage.spec.ts`；新增事件步骤见 [操作配方](../../../docs/reference/how-to.md)。
