# 网站工具

日常验证不接触真实素材或云服务。`pnpm data:generate` 更新网站资料，`pnpm data:check` 核对生成物；二者不生成母版，也不上传。

## 生成物归属与可验证范围

| 生成物                         | 唯一源                                                 | 生成器                          | 一致性证据或明确限制                                                                                                |
| ------------------------------ | ------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 两种语言目录与消息契约         | `src/i18n/messages.source.ts`                          | `gen-messages.ts`               | `pnpm check:i18n` 逐键和契约检查；运行时消费者检查                                                                  |
| 演员档案、名单与版本           | `media-pack/actors/*.json`、casting JSON               | `generate-actor-data.ts`        | `pnpm data:check` 逐字漂移；夹具晋升、反例和未发布隔离测试                                                          |
| `assets.json.looks`            | 生产造型与 `website.visibleLooks`                      | 同上，只拥有 looks 字段         | 逐值漂移；其他字段保持原样                                                                                          |
| 样片元数据                     | 生产 `officialSamples`                                 | 同上                            | 逐字核对；公开地址与文件可用性检查                                                                                  |
| OG JPEG                        | 已提交的 `public/media/assets/*/turnaround.front.webp` | `generate-og-assets.ts`         | 每次构建重生成并 `--check` 逐字节比较；合成夹具漂移测试                                                             |
| 新面孔预览、缩略图、图片清单   | casting 记录和批准 PNG                                 | `generate-new-face-assets.ts`   | 夹具验证算法、哈希、尺寸与保留录音；实际 PNG 被忽略，新克隆不能核对原件字节                                         |
| 大图和模糊占位                 | 已提交 WebP                                            | `generate-asset-derivatives.ts` | 夹具验证输出路径、可重复性和母版键不变；已有大图可能来自旧批准批次，本轮不重写公开文件                              |
| 正式演员预览、清单、原件对象键 | 批准原件与资产规范                                     | `assets-ingest.ts`              | 合成原件的事务、尺寸、哈希、路径保护测试；真实原件新克隆不可用                                                      |
| 声音清单                       | 批准录音、正式演员 `lines.json`、casting 自我介绍      | `generate-voice-manifests.ts`   | 公开声音的路由、格式、转写来源检查；夹具验证哈希与失败不覆盖。音频字节/时长需要未提交录音与 ffprobe，未实测真实录音 |
| 授权页示意图                   | 构图、`LICENSE` 署名和批准样片原图                     | `generate-license-examples.ts`  | 格式/尺寸/引用检查；缺少原图或字体时，不认证源到位图的新鲜度                                                        |
| 黑白署名 PNG                   | `LICENSE.credit`、SVG 方案                             | `credit-kit.ts`                 | SVG 署名来源、PNG/透明通道检查；位图依赖系统字体，不能声称跨机器逐字节可复现                                        |

`generated-media.test.ts` 只用几何图片与静音验证算法；`actor-data.test.ts` 用虚构演员验证晋升。已提交公开素材不能因本轮重构而重新编码。原件转换入口要求 `--generate-media`，缺少任一必要源会在写入前停止；`generate-og-assets.ts` 只处理已提交的公开预览。

## 有意区分的事实

`src/content/tools.ts` 是可选创作工具与模型导出策略的唯一配置入口；社区标签与模型输入限制是不同用途，不混成同一个可选列表。样片 `officialSamples.tools` 记录实际用过什么，不是产品选项。

现行授权、起步包摘要及旧会员 ZIP 原样文字均在 `src/content/license.ts`。旧会员 ZIP 与现行 v1.0 的冲突是明确保留的对外兼容例外，是否更换需 Owner 决定。

目录分工在结构块统一收敛；当前文件名即有效入口。`tools/assets-upload.ts` 是必须保留的发布 CLI。
