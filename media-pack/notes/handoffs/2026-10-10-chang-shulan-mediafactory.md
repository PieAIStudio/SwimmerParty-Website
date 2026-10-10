# 常淑兰 / Chang Shulan — MediaFactory 交接记录（2026-10-10）

- actor: `chang-shulan`
- casting source: `CC-016`
- run: `run-chang-shulan-20261010`
- status: `waiting-capability`
- website status: `delivered: 0`, `published: false`（未修改）

## 已完成

- 已读取演员 JSON、五位新增演员选择记录、十位全套制作单和最新 `source-bound-visual-bands-v2` 比例规范。
- 已固定该演员目标：152 cm、6.8–7.2 头身、正面直立 frameGuide 0.86–0.94 占画幅、上下留白 0.04–0.10。
- 已绑定 casting 原图：941×1672 RGBA，SHA-256 `37a6d01059b701fba8f666fc4657ca0a05a2f6df3d719ce734667fa94703b51e`，Vision alphaBBox `[195,38,748,1627]`。
- 已运行 macOS Vision `vision-face-contour-v2`，证据在 run 的 `CC-016.vision.json`，检测到 1 张脸、无警告。
- 已写入演员 staging `source-manifest.json`；casting 图仅作脸部/发型身份参考，未冒充身体锚点。

## 能力关口

Codex 内置 IAB 的 Pics-A GPT 页面连续恢复后仍显示“无法加载此 GPT”。因此未生成 2–3 张独立透明全身比例候选，未填写 `annotation.bands`，未生成比例审看页，也未选择身体锚点。没有身体锚点就不能合法开始 55 张图、6 段正式 WAV 或 Grok 样片；本次未调用 MiniMax/Grok，费用为 0。

恢复条件：沿同一演员 run/session 恢复可用的 Pics-A GPT（GPT-5.6 Pro），上传 CC-016 作为脸部身份参考后生成 2–3 张独立透明全身候选；对每张 PNG 绑定 SHA/尺寸/alpha、Vision 证据和两次独立原图复核，再按比例与 frameGuide 双门验收。恢复后继续本 run，不新建替代 run。

## 二次恢复尝试

- Pics-A 项目页已成功恢复，页面明确显示模型 `GPT-5.6 Pro`。
- 已沿同一 IAB 打开“Add photos & files”，但上传 CC-016 需要 macOS 文件选择器；当前执行环境报告 Mac locked，无法完成本地文件选择。
- 因未能上传脸部身份参考，未发送任何生成请求；仍未产生候选图、费用或替代 run。
