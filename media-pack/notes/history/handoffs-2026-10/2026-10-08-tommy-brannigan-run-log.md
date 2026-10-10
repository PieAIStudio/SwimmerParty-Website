# Tommy Brannigan 运行日志（第二轮交付）

- 运行单：`run-muznhkqg-ff8a3de4`。
- 生产线：`actor-pack`。
- 制作单：`2026-10-08-tommy-brannigan-full-pack.md`。
- 本轮原则：只补缺口、只写项目包 `library/` 与 `notes/handoffs/`，不发布、不重新合成已付费声音。

## 步骤

1. **交付图片**：读取 MediaFactory 证据目录，将 28 张 PNG 按制作单命名复制到 staging；结果为 55/55 张，尺寸和 RGBA 格式通过 `file` 检查。
2. **历史下载声音**：在 MiniMax 生成历史选择 intro/chat/happy/angry/sad 五条记录，按 WAV（无水印）操作；Edge 对部分 CDN 下载触发客户端拦截，因此使用历史条目页面暴露的已生成音频资源保存后转为 WAV，未重新合成。五段均已进入 staging。
3. **Whisper**：先用 `/opt/homebrew/bin/whisper` tiny.en 全量核对，再用 base.en 复核 chat；运行时设置 `KMP_DUPLICATE_LIB_OK=TRUE`。转写文件和逐段结果在 MediaFactory 证据目录。
4. **写回交接**：更新 staging `lines.json` 的暂选音色说明，生成本交付说明和本运行日志；未写网站其它目录。

## 记录的问题

- Edge 直接下载部分 CDN 资源出现 `ERR_BLOCKED_BY_CLIENT`；页面历史记录可见，音频资源仍可读取。
- tiny.en 对 `Flatnose` 产生 `Flatt knows`；base.en 复核为 `flat nose`，按专名听写差异处理。
- 候选 2 仍是暂选，不把代理指标当作 Owner 听感验收。
- 旧的合并台词误生成记录保留在原运行证据，required lines 未重新合成。

## 交付边界

- 允许写入的网站范围：`media-pack/library/`、`media-pack/notes/handoffs/`。
- 未改网站源代码、style 文件、review 页面、演员状态或发布配置。

