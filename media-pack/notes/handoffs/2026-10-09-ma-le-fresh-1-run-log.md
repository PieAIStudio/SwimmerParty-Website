# 马乐 Ma Le fresh-1 比例试镜运行记录

- 日期：2026-10-09
- parent actor：`ma-le`
- replacement index：`fresh-1`
- new run：`run-mv0j9vsj-05cd8a54`
- old run IDs：`run-mv0f7uin-c3d106e2`、`run-mv0hcknk-683800a8`
- Codex 监督会话：`gpt-6.1-sol` / `medium`
- 制作单网页出图要求：`gpt-5.6-sol` / `5.6 Pro`；本次实际网页模型未核验，不能视为满足要求。

## 输入和旧照测量

- 演员事实：`media-pack/actors/ma-le.json`。
- 旧照：`library/claude-casting-2026-10-07/final/CC-072.png`；只作脸部身份参考，不能作身体锚点。
- 目标：175 cm、约 7.5 头身、头高约 23.33 cm。
- 旧照测量：`crownY=18`、`chinY=312`、`soleY=1615`、`headsTall=5.4320`；仅脸部参考，拒绝作身体锚点。

## fresh trial 实际结果

同一新聊天共发送 3 条试镜消息，页面各返回 1 张图；没有重复未知请求。请求没有成功进入 Pics-A，且没有逐字包含项目包要求的 aesthetic/character-rules CG 风格块，因此即使像素规格满足，也不能进入 Owner 候选审看。

- `candidate-1`：941×1672 RGBA，`crownY=18`、`chinY=240`、`soleY=1610`、`headsTall=7.1712`，拒收；SHA-256 `1b73da6c16f2284d6f267edf9a276210e2308e0f525808bfd973ef83be5fc58c`。
- `candidate-2`：941×1672 RGBA，`crownY=22`、`chinY=225`、`soleY=1637`、`headsTall=7.9557`，拒收；SHA-256 `2a9b971e58ea4aa91365ca295cd2eff3697f1d3dd0a590d17297511525d4fa8b`。
- `candidate-3`：941×1672 RGBA，`crownY=43`、`chinY=233`、`soleY=1628`、`headsTall=8.3421`，拒收；SHA-256 `a4c94ec5ca22f4efa0d753de2064ca995b90fdcab78f8cba6c55eb6e1dff1a16`。

三张 PNG 已保留在 `library/actors/ma-le/evidence/fresh-1/rejected/`；`staging/fresh-1/` 没有候选入场。审看与测量页：`library/actors/ma-le/evidence/fresh-1/evidence-review.html`；详细 JSON：`library/actors/ma-le/evidence/fresh-1/measurements.json`。

## 下载和能力关口

浏览器下载按钮已点击，但文件仍以 `.crdownload` 保留，未取得正式完成回执；按规则不能当作已收货交付。当前已创建并保留 Codex 内置浏览器 iab 专用标签，但因本轮先前误用 Edge，网页模型、上传参考图和下载完成状态均未达可验收条件。不得以 `.crdownload` 重命名替代正式收货，不得继续生成。

订阅账：本 fresh run 记录 3 条消息、3 张页面返回图；连同旧 run 账本，累计至少 9 条消息、15 张返回图。旧 run 继续只作证据，拒收身体图不复用。

## 关口

状态停在 `waiting-capability` / replacement。未改 `actors/ma-le.json`，`anchors.body` 仍为 `null`；未入库、未做 55 张、声音、Grok、网站状态或发布。Owner 需要在正确的 iab Pics-A、核验 `5.6 Pro`、成功 filechooser 上传 CC-072（仅脸部参考）和正式下载回执后，另行继续 replacement。
