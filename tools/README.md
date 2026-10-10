# 网站工具

从仓库根目录运行。命令名以 package.json 为准；本页是工具、生成物及测试的归属清单。日常验证不接触真实素材或云服务。

## 目录与调用者

| 目录 | 工具与用途 |
| --- | --- |
| `site/` | `generate-actor-data.ts` / `actor-data.ts` 由 data:generate / data:check 调用；`gen-messages.ts` 由 messages:generate 调用；`check-messages.ts` / `message-analysis.ts` 由 check:i18n 调用；`check-boundaries.ts` / `boundary-analysis.ts` 由 lint 调用；`check-generated-media.ts` 由 data:check 调用；`generate-og-assets.ts` 由 build 调用。 |
| `assets/` | `assets-ingest.ts` / `assets-todo.ts` 由同名 package 命令调用；`assets-common.ts` / `file-transaction.ts` / `generated-media-common.ts` 是其共享文件操作。真实媒体生成入口见下表，不进入日常检查。 |
| `release/` | `shots.ts` 本地截图；`compare-shots.ts` 对比两组截图。手工 CLI：`node tools/release/shots.ts <目录>`、`node tools/release/compare-shots.ts <前> <后>`。输出仅放忽略的报告目录，不发布。 |
| `test/` | test:tools 自动发现合同测试；fixtures 中只有合成图、静音、批准词表和请求/生产记录夹具。 |
| `assets-upload.ts` | 保留原路径的发布 CLI；只能按 release.md 的明确授权执行，先 dry-run。不删除旧对象、不修改现有同键字节。 |
| `help-clips/` | `record.ts` 录制演员页“?”帮助卡的三段循环演示（starter、sheet、cast；zh、en），输出 `public/help/<locale>/`。手工 CLI，不进入日常检查：先用 `ACCOUNT_MODE=mock ASSET_STORE=local GUEST_LIMITER=memory ASSET_LOCAL_ROOT=e2e/fixtures/assets-store pnpm build && pnpm start -p 3100` 启动生产构建，再 `node tools/help-clips/record.ts [--locale zh,en] [--topic starter,sheet,cast]`。需要 ffmpeg；按 Chromium 截屏帧采样，下载被丢弃，不读取私有素材。 |

## 生成物与一致性

| 生成物 | 唯一源 → 生成器 | 检查与限制 |
| --- | --- | --- |
| 消息目录、ICU 合同 | messages.source.ts → site/gen-messages.ts | check:i18n、目录一致性与有限动态消费者检查 |
| 演员 profile、名单、版本和样片元数据 | media-pack/actors 与 casting → site/generate-actor-data.ts | data:check 逐字核对；晋升、未发布隔离与身份保持测试 |
| 清单 looks | 生产造型与 website.visibleLooks → 同上 | 逐值核对，items/扩展字段原样保留 |
| OG JPEG | 已提交公开预览 → site/generate-og-assets.ts | 每次 build 生成并逐字节 --check |
| 正式演员预览、原件键和清单 items | 批准原件 → assets/assets-ingest.ts | 合成夹具检验尺寸、哈希、格式与入库；真实原件新克隆不可用 |
| 新面孔预览与缩略图 | casting 记录和批准 PNG → assets/generate-new-face-assets.ts | 合成夹具检查算法/哈希/尺寸/录音保留；真实母版不可用 |
| 大图、模糊占位 | 公开 WebP → assets/generate-asset-derivatives.ts | 夹具检验路径和可重复性；已有批准图不因重构重编码 |
| 声音清单 | 批准录音/转写 → assets/generate-voice-manifests.ts | 路由、格式、转写来源；真实字节、时长还需要未提交录音及 ffprobe |
| 公开样片文件 | 批准样片原件 → assets/generate-official-samples.ts | 资料投影与公开引用；原件转换不是普通测试 |
| 授权示意图 | 批准图、构图、LICENSE → assets/generate-license-examples.ts | 引用、格式、尺寸；缺原图或字体时不认证实际源到位图新鲜度 |
| 黑白署名 PNG | LICENSE.credit、SVG 方案 → assets/credit-kit.ts | 署名、PNG/透明通道；依赖字体，不能承诺跨机器相同位图 |
| 浏览器原件夹具 | 合成图与静音 → test/fixtures/prepare-downloads.ts | Playwright global setup 生成；不能交付 |
| 文档 MANIFEST | 治理文档 → pnpm doc-gov scan | docs:check；不手改清单 |

原件生成工具要求 --generate-media；缺源即停止。公开引用/格式检查不等于真实原件重生成。现行授权与旧会员 ZIP 文本均在 content/license.ts，但其语义差异需 Owner 决定，见 decisions.md。

## 测试保护什么

| 文件组（test/） | 合同 |
| --- | --- |
| actor-data、roster | 生产投影、晋升、唯一身份、片单引用、全部可交付的隔离夹具 |
| assets、generated-media | 规格词表、入库与生成路径；不读取私有制作库 |
| account、downloads | 会话、签名、游客窗口、响应/对象键和部署模式 |
| exports | 图片挑选、拼图排版、文件名；实际 ZIP/登录/懒人包由 e2e/exports 补足 |
| community、community-moderation | 原型状态、审核和非 mock 503 |
| messages、boundaries、metadata | 单一文案源、有限消费者、依赖方向、canonical/sitemap |
| analytics | 外部白名单、规范化与不发送个人/自由文本 |
| help-clips | 帮助卡演示文件存在、容器签名、每个文件不超过 300 KB，并且 `public/help` 只含约定的文件 |

`pnpm dlx knip` 的三项明确配置不是死代码豁免：两个 release CLI 由人调用；libphonenumber-js 是 AuthKit 的隐式运行时依赖并在 Next tracing 指定；ffprobe 是制作侧外部可执行程序，不是 npm 包。其余无消费者文件/导出/依赖应为零。

公开文件有一个明确留存例外：`public/media/assets/yan-lin/turnaround.front.large.webp` 没有当前清单消费者，但它已经是公开网址，且本轮不能改变外部下载/引用。保留原字节，不为清零删除已有 URL；是否退役须另查外部使用并获授权。其余公开预览、样片、署名示意图和构建 OG 均有清单、页面或生成器消费者。