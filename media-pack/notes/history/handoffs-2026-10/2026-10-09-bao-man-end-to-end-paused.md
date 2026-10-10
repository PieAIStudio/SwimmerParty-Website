# 包满（bao-man）端到端交接：比例关口暂停

- 日期：2026-10-09
- Run ID：`run-mv0et1xj-936486b2`
- 演员：包满 / `bao-man`
- 状态：`paused`（试镜比例不合格，未进入 55 张图片、声音或视频）
- ChatGPT 对话：`https://chatgpt.com/g/g-p-6ac396efc218819190830b751d24ab00-pics-a/c/6ac861c8-d810-83e9-bf10-aa50722c285f`
- 路线：ChatGPT Web（Codex In-app Browser，`iab`），项目 `Pics-A`，页面可见模型 `5.6 Pro`；订阅路线只记消息/图片，不读取余额。

## 范围与关口

Owner 修订后的范围要求先量化旧照，再必要时重拍，合格后才进入全套 55 张、6 段声音和 Grok 样片。本次严格只处理 `bao-man`。旧照只作为脸部/发型参考，不作为身体比例锚点。没有修改 `actors/bao-man.json`、`pack.json` 或发布状态。

## 测量结果

使用 RGBA alpha 非透明像素找人物可见 crown/feet 范围，用 20 px 横线审看页定位 crown-to-chin；比例 = 可见人物高度 ÷ crown-to-chin。结果为人工地标近似值，审看页见 `media-pack/library/actors/bao-man/quality/bao-man__head-landmark-review.png`。

| 文件 | 可见高度（px） | crown-to-chin（px，约） | 估算头身比 | 结论 |
| --- | ---: | ---: | ---: | --- |
| 旧照 `CC-007.png` | 1562 | 258 | 6.1 | 不合格（目标约 7.4） |
| `candidate-1.png` | 1547 | 230 | 6.7 | 不合格 |
| `candidate-2.png` | 1524 | 235 | 6.5 | 不合格 |
| `candidate-3.png` | 1544 | 241 | 6.4 | 不合格 |

目标为约 7.4 头身、头顶到下巴约 23 cm；三张最终候选均保留了身份、透明底和基础装，但头仍偏大，不能成为身体锚点。两轮纠正后仍未通过，因此不扩散到全套。

## 试镜回执与文件

实际发送 3 条消息，收到 9 张独立图片；运行单订阅记账累计 `messages=3, images=9`。第一批和第二批退件已移入 `media-pack/library/rejects/bao-man/2026-10-09-audition-proportion-fail/` 与 `...-round-2/`；最终一批保留在 staging 供复核，但状态仍为退件。

最终候选（均 941×1672 RGBA PNG）：

- `media-pack/library/actors/bao-man/staging/bao-man__audition__candidate-1.png` — SHA-256 `bf538adef3aa5c10d9b06dd7ee9031c5bd4e99456a27fc38c249a8f4369bc446`
- `media-pack/library/actors/bao-man/staging/bao-man__audition__candidate-2.png` — SHA-256 `4f2523a09b00cc4456c06ebb6c398febc340588afccdba827929879a41594d88`
- `media-pack/library/actors/bao-man/staging/bao-man__audition__candidate-3.png` — SHA-256 `4fb5b2868e6cdb98892f0a58c133bf5aa216a4e9328544b6cd048db44819d4d6`
- 审看页：`media-pack/library/actors/bao-man/quality/bao-man__head-landmark-review.png` — SHA-256 `529205115045a50a4149b74bed8e22ce86f3a4fd09b978d8aa0eddb7f7fbc5bf`

## 后续

恢复同一 Run ID 后，先取得一批符合约 7.4 头身的正面全身锚点，再按制作单做 55 张图片、6 段声音和 1 段 Grok 样片。当前没有批准的身体锚点，所以这些步骤未执行。
