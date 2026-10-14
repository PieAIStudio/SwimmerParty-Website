# Community

C3 按 Owner 提供的 SwimmerBackend `main@b218557` 最终 v3 合同消费。测试为隔离传输/浏览器，真实环境由 Owner 部署后验收；本线程不读写后端仓库。

`NEXT_PUBLIC_COMMUNITY_MODE=off|owner|on` 控制发布，默认off；构建与运行值必须一致，改档需重新构建。owner通过AuthKit及后台Owner队列核对入口、页面/RSC和每个业务API，非Owner404且不入sitemap。on开放公开作品和票数，不放宽作者或审核权限。旧布尔开关已退役，旧v1写接口保持503。

- `contracts/community*` 为严格DTO、固定调用表和能力回包；`server/context.ts`组合每请求AuthKit/匿名客户端；`server/edge.ts`只允许三个目标函数，不接受任意URL或service_*。真正Owner权限每次由后台确认。
- 上传：create_upload申报重新编码后文件的实际bytes/mime；target → PUT → complete，完成只走swimmer-party-upload-complete，永不直调finalize_upload。过期明确重新create_upload；丢回包沿用原operationId，状态先读get_upload_status。原件上限先检，编码失败不回退上传EXIF原件。
- 媒体：读显式mode:read，审核mode:review；只取派生成品短期地址，按服务端期限失效，不永久保存。实际Origin如实传递，预览/本机来源不冒充正式来源。错误与拒绝按最终统一合同呈现，私有媒体拒绝不推断原因。
- 投稿器三步与我的作品保留C1修订/幂等恢复；审核台保留C2原因、确认、举报历史、独立撤信、暂停确认和权限失效撤下明细。点赞和新面孔票由后台读回，不是浏览器自增。
- 社区流精选/最新、类型、演员过滤沿用后端游标；换筛选重开第一页。演员页固定演员过滤；首页只基于完整新面孔票数显示领先/并列或零票，无自动转正承诺。官方样片与用户作品分开标。
- UI控件全部复用UIKit；SiteHeader只收组合props，不从visual原语反向依赖feature。原生媒体语义保留；YouTube点击前不建iframe，点击后只用youtube-nocookie，其他平台也是严格白名单与原站降级。

本地验收：默认 `pnpm verify`；on档合同夹具 `PLAYWRIGHT_COMMUNITY=1 pnpm exec playwright test --workers=2`；owner档拒绝/入口夹具 `PLAYWRIGHT_COMMUNITY=1 PLAYWRIGHT_COMMUNITY_MODE=owner pnpm exec playwright test --workers=1`。Owner真实加密grant/每请求原生身份验证、Bearer转发和后台角色拒绝通过tools/test的隔离传输测试，不以客户端模拟替代。

真实合同、开关与边界见[消费入口](../../../docs/reference/swimmer-party-community-backend.md)；进度/验收及Owner操作步骤只记在既有实施方案。正式站三类作品投稿→审核→公开→删除仍待Owner执行，生产注销不在此轮范围。
