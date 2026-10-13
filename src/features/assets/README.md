# Assets

负责素材浏览、选图、语音及下载，不拥有演员身份。

- 入口：`index.ts` 为页面组件；`client.ts` 为浏览器选角包调用；`queries.ts` 只供服务端清单读取；`contracts.ts` 导出跨功能类型；`server/index.ts` 对接薄 API 路由。
- 浏览器下载共用 `signed-images.ts` 与 `lib/browser-files.ts`，ZIP、拼图、模型包和懒人包各自只保留业务差异。拼成一张的挑图与附件在 `features/sheet`；下载弹窗只保留原图打包与按模型打包，并链接到设定图页。`client.ts` 是设定图页复用的浏览器入口。
- 合同：`/api/assets/**`、`/api/voice/**`、下载名/ZIP 条目、对象键和游客额度。参数与格式见 [资产规范](../../../docs/specs/active/actor-asset-library.md)。
- 服务端能力只在 server；local/Blob 原件与签名不进入客户端依赖图。
- `signed-images.ts` 只在对象身份通过、实际响应完整取回及大小检查通过后报告文件计数；多演员取回量累加。PackProgress 只组合 UIKit GameProgress，不用计时百分比。文件取齐仍显示准备最终下载，不冒充渲染/ZIP已完成；取消或失败不生成成功事件。
- 首次成功保存发送 guidance/client 的本地提示事件。懒人包、多选包、选角包、设定图均保留取消与错误，不修改请求合同、签名、文件内容或账号逻辑。
- 验证：工具 assets、downloads、exports、generated-media 测试；浏览器 assets、downloads、exports、site 测试。夹具不是真实素材。
