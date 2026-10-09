# Assets

负责素材浏览、选图、语音及下载，不拥有演员身份。

- 入口：`index.ts` 为页面组件；`client.ts` 为浏览器选角包调用；`queries.ts` 只供服务端清单读取；`contracts.ts` 导出跨功能类型；`server/index.ts` 对接薄 API 路由。
- 浏览器下载共用 `signed-images.ts` 与 `lib/browser-files.ts`，ZIP、拼图、模型包和懒人包各自只保留业务差异。
- 合同：`/api/assets/**`、`/api/voice/**`、下载名/ZIP 条目、对象键和游客额度。参数与格式见 [资产规范](../../../docs/specs/active/actor-asset-library.md)。
- 服务端能力只在 server；local/Blob 原件与签名不进入客户端依赖图。
- 验证：工具 assets、downloads、exports、generated-media 测试；浏览器 assets、downloads、exports、site 测试。夹具不是真实素材。
