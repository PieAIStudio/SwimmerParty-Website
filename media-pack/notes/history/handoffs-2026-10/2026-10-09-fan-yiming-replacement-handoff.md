# 范一鸣（fan-yiming）replacement 比例试镜交接

- 日期：2026-10-09
- 演员：范一鸣 / `fan-yiming`
- 原运行单：`run-mv0etd90-1275564d`（历史试镜已暂停）
- replacement 运行单：`run-mv0i92wb-fb2b654b`（本轮已暂停）
- 网页路线：ChatGPT 订阅图像路线；独立 replacement 对话：`https://chatgpt.com/c/6ac86fbc-b83c-83ec-a688-6a3347d0b535`
- replacement 消息：3 条；实际收到图片：9 张；费用类型：`subscription`

## 结果

本 replacement 重新读取了 `actors/fan-yiming.json`、制作单、项目风格与 `docs/reference/routes/chatgpt-web.md`。上传的 `CC-052.png` 只作为脸部/发型参考；没有使用原 run 的拒收身体图作为参考。

三轮各 3 张候选均实际下载为 941×1672、RGBA、透明底 PNG，双鞋底可见。按原始像素记录最高连续发型点 `crownY`、下巴/胡须下缘 `chinY` 和较低鞋底 `soleY`，9 张约 `5.46–5.61` 头身，目标为约 `7.0`；因此全部 `quality_rejected`。第二、三轮衣服颜色已接近浅蓝，身份仍有发型蓬度/胡须偏重问题；比例门仍未通过。

测量与哈希：`library/actors/fan-yiming/evidence/fan-yiming__proportion-measurements.json`；联系表：`library/actors/fan-yiming/evidence/replacement-20261009/all-contact-sheet.png`。

全部候选已复制到 `library/actors/fan-yiming/evidence/rejected/`，原始 replacement 文件保留在 `evidence/replacement-20261009/`。`library/actors/fan-yiming/staging/` 仍为空；未修改演员 JSON、`pack.json`、网站代码或发布状态；未开始 55 张图片、6 段声音或 Grok 样片。

## 下一步

当前 replacement session 已按 3 条消息上限完成并暂停。只有获得 Owner 明确的新路线/身体锚点方案后，才继续试镜；在此之前不得进入全套图片、声音或视频。

## 模型配置更正

- MediaFactory Codex 监督会话：固定 `gpt-6.1-sol`，thinking `medium`。
- 网页端 ChatGPT 图片生成：制作路线固定 `gpt-5.6-sol`；网页端模型与 Codex 监督模型完全分开。
- 不把 Codex 模型或 thinking 参数传给网页端；后续任何新请求必须先在网页模型选择器核对为 `gpt-5.6-sol`，再按独立消息/图片预算记账。
- 本 replacement 已暂停，不因配置更正重发已拒收请求；现有 9 张仍按原证据保留。
