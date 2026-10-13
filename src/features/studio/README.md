# Studio

负责工作室介绍、开发中项目与合作入口。项目区只消费 `src/content/works.ts`，保留真实制作状态和既有详情 URL；没有成片就不显示成片播放器。

- 入口：`index.ts` 的 StudioView，路由只提供语言和 metadata。
- 合同：既有联系方式、合作链接和双语表意。通用布局属于 site，控件使用 UIKit。
- 验证：消息检查、生产构建、`e2e/home-next-stage.spec.ts` 的项目状态/详情路由核对及完整页面 HTML 文本对比。
