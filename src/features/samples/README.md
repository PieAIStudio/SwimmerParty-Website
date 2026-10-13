# Samples

负责官方样片在演员页、作品页和首页的展示。

- 入口：`index.ts` 的 OfficialSamplesSection、ActorSample；`client.ts` 的 SampleVideo 为首页复用原生播放器与 UIKit 播放按钮。
- 唯一源：生产记录 officialSamples → `content/official-samples.generated.ts`；单一 sampleId 可关联两位演员，仅保存一份视频。每演员最多四条，零条不显示占位。
- 新样片必须有 Root passed 证据、源 SHA 与有界转码；Root 技术复核不代表 Owner 最终验收。既有单对象 video-01 输入保持兼容。
- `pnpm assets:samples <slug...> --generate-media [--dry-run]` 只读 production 指定的 media-pack / assets-inbox 原件；一次预检后事务写公开文件。新片静音、24fps、720短边/1280长边以内且不放大，码率不高于现有 video-01 上限。纯 `data:generate` 不转换原件。
- 首先加载海报，点击 UIKit 按钮才设置视频地址，离开可见区域暂停；不自动连播。
- 验证：`tools/test/samples.test.ts`、`actor-data.test.ts`、`generated-media.test.ts`、`e2e/samples-refresh.spec.ts` 和演员/首页回归。
