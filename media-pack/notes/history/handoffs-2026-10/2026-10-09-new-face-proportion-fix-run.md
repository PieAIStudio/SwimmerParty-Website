# 交接说明：new-face-proportion-fix（暂停）

- 状态：`waiting-capability`
- Run ID：`run-muztyjk7-af4e1d07`
- 制作单：`/Users/yuanfei/PieAI/SwimmerParty-Website/media-pack/notes/handoffs/2026-10-09-five-full-packs.md`
- 范围：只执行制作单第 1 节“先重拍试镜照”；第 2–6 节未执行。
- 顺序：严琳 `yan-lin` → 包满 `bao-man` → 雷乐 `lei-le` → 范一鸣 `fan-yiming` → 马乐 `ma-le`。

## 结果

在严琳开始前完成了 `pnpm mf doctor`、运行单建立、制作单与五份演员 JSON/项目规则读取，并在 Codex 内置浏览器的 `Pics-A` 项目中实测到目标模型 `5.6 Pro`。成功上传严琳旧脸部参考图 `CC-061.png`；没有提交图片生成，因此五位候选数量均为 0，未收到任何新图片，也没有生成统一审看页。

| 演员 | 候选数量 | 输出路径 | SHA-256 |
| --- | ---: | --- | --- |
| 严琳 `yan-lin` | 0 | 无 | 无 |
| 包满 `bao-man` | 0 | 无 | 无 |
| 雷乐 `lei-le` | 0 | 无 | 无 |
| 范一鸣 `fan-yiming` | 0 | 无 | 无 |
| 马乐 `ma-le` | 0 | 无 | 无 |

试镜候选目录已创建但为空：
`/Users/yuanfei/PieAI/SwimmerParty-Website/media-pack/library/trials/2026-10-09-new-face-proportion-fix/`

## 路线、预算与关口

- 实际路线：ChatGPT Web（Codex In-app Browser，`iab`）
- 实际项目：`Pics-A`
- 实际模型：`5.6 Pro`（页面可见）；未提交生成，未产生模型回执或图片请求 ID。
- 账户可见状态：`SET Pro`；网页没有显示可比较的次数、额度或余额读数。
- 预算：运行单登记 `15000 credits`；制作单声音预算为每位最多 3000 声贝，但本阶段明确不做声音。
- 费用：未知。没有把未知写成 0，也没有调用 `mf run cost` 伪造数值；按 `docs/reference/routes/chatgpt-web.md` 的预算关口停止。
- 重试：0 次生成重试；上传严琳 `CC-061.png` 1 次成功；没有重复提交未知任务。
- 错误/关口：`waiting-capability`：图片路线可达，但生成前缺少可比较的账户用量/额度读数，无法完成操作前后成本记账。

## 已读取输入哈希

- `pack.json`: `8cb5a42abc1f79f7c14f251b8db8898d29b562c0d6ff993f8f68449809507e86`
- `style/aesthetic.md`: `80e8710d5a1252c568fe36e05d19fe5ec041326c5fa579e78d507bfbdeacf1ee`
- `style/character-rules.md`: `5167926069051965a61c9bd35b95328c5815faecba29434ce488c1b8f1138b05`
- `checks.md`: `eb1e741b2d253cd8b026d8e72bf1033262fe4f8829551718654908e8f757b953` 
- `actors/yan-lin.json`: `b9e03bda3be765f2d2f06513908683acf9aaf0d1309b5be85e309ca8a2ff0dd7`
- `actors/bao-man.json`: `fd408c5f6b4c39000d544bb32d4aaf59be81746209a775ec9aa1650a14590164`
- `actors/lei-le.json`: `b8d5aee1fed2d8d8520090bff889bcb5ac4679961c444b486ed4760c6a2109b1`
- `actors/fan-yiming.json`: `33e9f10dfe29b5da5846e5668c5447f3a05fd0a4530caa8c2a7b0797e67f77b4`
- `actors/ma-le.json`: `113ea876a690174b8aa198369c1c0ba528ece61a2b9fe82d761dba2dc4abb461`
- `CC-061.png`: `886a0ee0d92f0dc4a3d0f7f9213e88e0721aa1dc7e045ece061a54b887ff2135`
- `CC-007.png`: `e1a0cf4187881d650a53166adab176ce95c948344198c8c18d889fbc90acf754`
- `CC-012.png`: `2afe969855c85269e87a5ab6d24a05affa3eabcd7d48ce75dec8aa2fa5a56ff7`
- `CC-052.png`: `80749bf84f85e5ee648321d075061d676483bb7bffc1adc26414837dbf5bbb35`
- `CC-072.png`: `b76427ce4f355f1d4524bd98f7a61d6a67fb9284a31929f22de1125dda9af08c`

> 注：`checks.md` 的正确 SHA-256 需要在恢复运行前重新读取确认；本次运行单已把文件列为输入，但交接文字不应携带错误哈希。

## Owner 待决定

1. 提供或启用 ChatGPT Web 可比较的生成前/生成后次数或额度读数，或批准一条可真实记账的替代图片路线。
2. 关口解除后，从 `yan-lin` 重新开始；严琳完成验收后才进入 `bao-man`，依此类推。
3. 在新试镜候选通过 Owner 选择前，不改演员状态、不更新 anchors、不做全套图片或声音。
