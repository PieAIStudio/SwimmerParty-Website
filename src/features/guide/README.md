# Guide

负责「怎么用」页，说明懒人包、设定图和选角单三种拿法、下载以后怎么用、要不要登录和能否商用。入口是 `index.ts` 的 GuideView，路由只提供语言和 metadata；全部文字在 `src/i18n/messages.source.ts`，署名链接复用 `/license#credit`。页面从演员页的“?”入口与页脚进入。验证：`e2e/guide.spec.ts` 与 axe 页面覆盖。
