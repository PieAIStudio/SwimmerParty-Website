# Community

C1/C2 消费 SwimmerBackend `sp-community@c29cbfc` 的 v3；仅代码与隔离夹具验收，真实环境留给 C3。

- 入口：`index.ts` 为页面；`client.ts` 只给演员页提供投票；`server/index.ts` 为薄 API。社区入口、投稿、我的作品、详情与审核页均受默认关闭的 `NEXT_PUBLIC_COMMUNITY_ENABLED=1` 控制；关闭时页面 404、API 私有 503。默认关闭状态仍能完整构建和发布。
- `contracts/community.ts` 分开 public / author / owner DTO，严格拒绝额外私有字段；`community-operations.ts` 是固定调用者操作表，`server/remote.ts` 对齐真实 RPC 参数和错误码。`server/context.ts` 只用匿名 publishable 客户端或 AuthKit 每请求验证后的 client；不使用 service_role、本地 Owner 名单、浏览器 userId 或表 CRUD。
- 旧内存实现已退役。旧 v1 API 留为私有 503，不成为绕过 v3 的后门。测试状态机只在 `tools/test/fixtures` 与 `e2e/fixtures`，没有环境变量可把生产路由切到内存。
- `api.ts` 的 WriteSession 保留一次写入的原始 operationId/参数，未知回包先核对再用原 ID 重试；revision 冲突显式重读，不自动覆盖。分页使用后端 cursor，登录身份变化立即隐藏私有结果。
- 三步投稿读取 get_limits，选择已有演员和素材版本，两个权利确认默认不勾选。图片检查原始字节及头部尺寸后浏览器重新编码去元数据，绝不失败后上传原始 EXIF；音频先读取真实时长。音频 description 可提供作者文字稿，未提供则明确告知，不生成假转写。
- 视频只解析 v3 白名单路径；点击前不创建 iframe，YouTube 使用 youtube-nocookie。referrerPolicy 使用 strict-origin-when-cross-origin，满足官方播放器识别而不发送完整页面路径。`PostMedia` 的一处 iframe lint 窄例外只适用于硬白名单的跨源播放器，不能传入同源页面或任意 HTML；沙箱仍禁止顶层导航、弹窗与表单。官方身份规则：<https://developers.google.com/youtube/terms/required-minimum-functionality>。
- `contracts/community-transfer.ts` 是网站待接入能力端口，不是已有 RPC：create_upload 仅返回意图；transfer/media 路由在 B2 签名器和读取接线通过前返回 PROCESSING_UNAVAILABLE。浏览器测试注入这些端口，不能据此宣称已能真实上传。XHR 报真实已传字节，PUT后只发对应swimmer-party-upload-complete的complete_upload能力请求，绝不直调finalize_upload；ready前继续显示validating，重试先读原uploadId，已进入处理的文件不重复上传。签名和读取严格消费c29cbfc原始响应字段，媒体读取显式mode:read；两种能力及完成入口在C3真实接线前均拒绝，不调用service_role RPC。
- 所有交互控件使用 UIKit；本地只保留产品排版、原生媒体语义与流程组合，没有自制通用控件。签名 URL 只在短期组件状态中，过期失效，不写本地持久存储。

验收：`pnpm verify` 检查默认关闭的可发布网站；`PLAYWRIGHT_COMMUNITY=1 pnpm exec playwright test --workers=2` 使用单独的 v3 夹具场景。两轮浏览器均须遵守 SLOTS 第二锁及负载约束。规格与待接线项见[后端消费入口](../../../docs/reference/swimmer-party-community-backend.md)，阶段证据只记在既有实施方案。

## C2 审核台

`/{locale}/admin/review` 与社区统一默认关闭。登录只允许发起读取，真正权限由 `list_review_queue` / `get_review_detail` / 每个写RPC决定，浏览器不判断Owner名单。401/403权限拒绝会撤下私有队列/明细，Owner媒体读取显式带 `mode: review`；签名接线未验收仍503，不回退未审核原件或内存。

队列按待审、隐藏、退回、已发布分页；明细展示媒体、演员版本、创作者文字稿/制作信息、两项确认、举报原因与轮次、后端历史。审核写固定已查看的revision，冲突须重新读取；approve不授予信任，restore不放行legacyV1。退回/隐藏/恢复必须有原因；撤销信任是独立写，不顺带隐藏已发布作品。暂停/恢复投稿先写原因再二次确认，不动本地构建开关，已有作品和审核读取不因此关闭。

所有未知写结果保留原operationId重试，不发新的决定编号；重试完成清除过期的确认面板，失败时不沿用上次成功提示。主站关闭开关的检查与开启开关的合同夹具分别运行。`e2e/community-v3-review.spec.ts` 验证角色撤回、媒体拒绝、原因、旧revision、重复回包和手机键盘；不宣称已通过真实后端staging。
