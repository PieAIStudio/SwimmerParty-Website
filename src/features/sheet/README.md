# Sheet

负责角色设定图页：预设、挑图、样式、一起打包和预览，页面状态只写在网址里，登录往返后仍在。入口是 `index.ts`（SheetView 与 canMakeSheet），浏览器交互在 `SheetBuilder.tsx`，预设、网址读写和附件内容是不引入 React 的纯函数（`sheet-presets.ts`、`sheet-state.ts`、`sheet-bundle.ts`）；上限 16 张、全身 8 张在 `assets/contracts.ts`，与下载弹窗的链接共用。拼图、签名原图、标签和许可文本都从 `@/features/assets/client` 取，不在本功能复制；声音和视频与 VoiceTile 走同一地址（`previewUrl ?? preview`）。合同是路由 `/[locale]/actors/[slug]/sheet` 与查询参数 `preset`、`slots`、`labels`、`bg`、`voice`、`video`、`prompt`，非法值忽略。验证：`tools/test/sheet.test.ts`、`e2e/sheet.spec.ts` 及 axe 页面覆盖。
