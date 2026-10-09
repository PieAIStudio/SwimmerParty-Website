# 马乐 Ma Le 全套资产验收与交付完成

- 演员：马乐 Ma Le (`ma-le`)
- Owner 于 2026-10-09 验收通过：55 张图片为同一人物，比例正确，符合项目 CG 风格。
- 身体锚点：Owner 选择 fresh-2 candidate-3；175 cm，约 7.5 头身。
- 声音：Owner 选择 candidate 1；6 段正式 WAV 已冻结并完成转写。

## 交付

- `media-pack/library/actors/ma-le/staging/`：55 张 PNG（6 turnaround、7 face、26 expression、8 wardrobe-personal、6 pose、2 detail）
- `media-pack/library/voice/ma-le/`：intro、intro-alt、chat、happy、angry、sad 六段 WAV 与 `lines.json`
- `media-pack/library/samples/ma-le/`：两张场景图与一段 6 秒挥手视频
- `media-pack/actors/ma-le.json`：正式演员、版本 `1.0.0`、发布日期 `2026-10-09`、网站顺序第 6 位

## 入库与修复

- `pnpm assets:ingest ma-le --dry-run`：55 张通过；随后正式入库 55 张。
- `detail/hands` 的 staging 原件保留不变；为满足统一入库协议，只在 `assets-inbox/ma-le` 工作副本清除右上角 8×8 的不透明边缘像素。
- `wardrobe-personal/portrait` 已在 production look extras 注册。
- 旧新面孔 `voice/ma-le/candidate-1.mp3` 交付从 manifest 移除，替换为 6 段正式 WAV；没有删除旧 Blob 对象。
- 生成结果：Ma Le manifest 为 55 image + 6 voice，声音均有 transcript，路由为 `/api/voice/ma-le/<slot>`。

## 网站与 Blob

- `pnpm data:generate` 后，active roster 为 6，new faces 为 93；Ma Le 排在 Yan Lin 后面。
- 样片已生成到 `/media/works/samples/ma-le/image-01.webp`、`image-02.webp`、`video-01.mp4`，接入演员页与 Works 页。
- Blob 上传：492 masters，431 已存在，61 本次上传（55 图片 + 6 声音）；上传完成后全部 492 个对象已存储。

本次没有部署网站；发布仍由单独的 release 流程处理。
