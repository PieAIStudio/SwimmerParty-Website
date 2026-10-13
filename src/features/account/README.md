# Account

负责浏览器账号状态、统一账号面板和逐请求服务端身份确认。

- 入口：`index.ts` 的 Provider 与 `AccountMenu`（未登录是泳者登录按钮，登录后是 UIKit `GameAccountMenu`）；`server/index.ts` 的 AuthKit 适配器与 API handler。
- 资料：使用正式 AuthKit 0.9.1。真实模式的 `/api/auth/session` 由 AuthKit 处理，在同一次已验证请求中分别返回身份 `user` 和展示资料 `profile`；菜单读 `profile.name` / `profile.avatarUrl`。`verifiedUser()` 仍只提供身份，不从它推导共享头像，也不额外请求原始用户 metadata。`profile.ts` 仅转出 AuthKit 的展示 helper，不再维护本地副本。
- 产品列表：`products.ts` 读取账号中心 `products.json`，用 zod 校验，内存缓存 5 分钟；失败返回空列表并只警告一次。只在已登录后空闲时加载。当前产品标为“当前”且不是链接；有 `clientId` 的产品链接带 `?swimmer_sso=1`。
- 跨产品进入：`arrival.ts` 在首次会话检查后去掉 `swimmer_sso=1`（保留其他参数与 hash）。泳者模式且未登录时只自动发起一次登录；mock 账号从不自动登录。
- 合同：`/api/auth/*`、安全会话 cookie、SSO 回调与返回地址不变。真实模式沿用 AuthKit `{ user, profile? }`；未登录为 `{ user: null }`。`session.ts` 将它投影成现有 UI 状态，核对 `profile.id === user.id`，拒绝匿名/缺失/错账号资料；兼容本地 mock 和发布过渡期间的旧 `{ mode, user: profile }` 响应。下载等受保护请求仍每次调用 `verifiedUser()`，展示昵称/头像从不用于授权。
- mock 仅供本地；真实模式每次验证会话，不接受本地 fixture cookie。
- 验证：`tools/test/account-avatar.test.ts` 用本机合成 grant 和内存传输经过已安装的 SSO 适配器，覆盖资料刷新、隔离、撤销和 MFA；`account-session.test.ts` 覆盖浏览器投影边界；另有 `account.test.ts`、`account-menu.test.ts`、`downloads.test.ts`；`e2e/account-menu.spec.ts` 用 `page.route` 提供目录夹具，绝不访问线上账号中心；`e2e/exports.spec.ts` 验证本地登录后选择不丢失。真实 SSO 与线上账号中心由发布验收负责。
