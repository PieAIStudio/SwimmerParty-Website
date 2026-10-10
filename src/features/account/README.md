# Account

负责浏览器账号状态、统一账号面板和逐请求服务端身份确认。

- 入口：`index.ts` 的 Provider 与 `AccountMenu`（未登录是泳者登录按钮，登录后是 UIKit `GameAccountMenu`）；`server/index.ts` 的 AuthKit 适配器与 API handler。
- 资料：`profile.ts` 的 `accountProfile` 把账号变成 name、email、avatarUrl；AuthKit 0.9 发布同名函数后只需改 import。当前 AuthKit 0.8 的 `verifiedUser()` 不返回 `user_metadata`，所以名字退回邮箱本地名，头像为空。
- 产品列表：`products.ts` 读取账号中心 `products.json`，用 zod 校验，内存缓存 5 分钟；失败返回空列表并只警告一次。只在已登录后空闲时加载。当前产品标为“当前”且不是链接；有 `clientId` 的产品链接带 `?swimmer_sso=1`。
- 跨产品进入：`arrival.ts` 在首次会话检查后去掉 `swimmer_sso=1`（保留其他参数与 hash）。泳者模式且未登录时只自动发起一次登录；mock 账号从不自动登录。
- 合同：现有 `/api/auth/*`、安全会话 cookie、SSO 回调与返回地址；会话响应的 `user` 为 `{ id, name, email, avatarUrl }`。以 server/account.ts 为准，不复制配置。
- mock 仅供本地；真实模式每次验证会话，不接受本地 fixture cookie。
- 验证：`tools/test/account.test.ts`、`account-menu.test.ts`、`downloads.test.ts`；`e2e/account-menu.spec.ts` 用 `page.route` 提供目录夹具，绝不访问线上账号中心；`e2e/exports.spec.ts` 验证本地登录后选择不丢失。真实 SSO 与线上账号中心由发布验收负责。
