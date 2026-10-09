# Account

负责浏览器账号状态和逐请求服务端身份确认。

- 入口：`index.ts` 的 Provider/账号控件；`server/index.ts` 的 AuthKit 适配器与 API handler。
- 合同：现有 `/api/auth/*`、安全会话 cookie、SSO 回调与返回地址；以 server/account.ts 为准，不复制配置。
- mock 仅供本地；真实模式每次验证会话，不接受本地 fixture cookie。
- 验证：`tools/test/account.test.ts`、`downloads.test.ts`；`e2e/exports.spec.ts` 验证本地登录后选择不丢失。真实 SSO 由发布验收负责。
