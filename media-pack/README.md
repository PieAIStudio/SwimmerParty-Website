# SWIMMER PARTY 项目包（media pack）

这个文件夹是 SWIMMER PARTY 交给 MediaFactory 的**创作资料包**。它回答"给谁做、做成什么样、有哪些人物、做完交到哪里"；
"怎么做"（操作 ChatGPT 网页、下载、通用检查、调本地显卡）由 MediaFactory 负责，不写在这里。

- 格式说明只在 [MediaFactory 项目包规范](../../MediaFactory/docs/reference/media-packs.md) 维护；本包 `pack.json` 声明实际资料路径，本页不另定义 schema。
- 规则：**MediaFactory 不保存任何创作事实**，事实都从这里或任务单里来。这里没写的事实（故事、角色、造型），先提方案，Owner 同意后再用。
- 由 Claude 在 2026-10-06 整理，内容来自前几轮出图的实际经验。

## 里面有什么

| 路径 | 内容 | 进 Git |
| ---- | ---- | ------ |
| `pack.json` | 总入口：风格、演员、作品、检查、交付、出图路线 | 是 |
| `style/aesthetic.md` | Owner 的美学原文，每条出图提示词都要逐字包含 | 是 |
| `style/character-rules.md` | 人物通用规则：成人比例、脸部 CG 化、衣服写实 | 是 |
| `style/chatgpt-project-instructions.md` | ChatGPT 项目说明的英文正文 | 是 |
| `actors/<slug>.json`、`casting/` | 正式演员与新面孔的生产事实、身份、造型、版本、批准网站字段；入口由 pack.json 声明 | 是 |
| `works/<id>.json` | 每部作品：剧本位置、已定角色、剧本里出现但还没定造型的人物 | 是 |
| `checks.md` | 验收标准：每批图怎么判断合格 | 是 |
| `notes/` | 设定、造型方案、进度；`history/` 是早期试验记录；`handoffs/` 是交接单 | 是 |
| `library/staging/<code>/` | 检查合格、按规范命名的定稿图 | **否** |
| `library/rejects/`、`overviews/`、`trials/` | 废图、总览联系表、早期试验图 | **否** |

`library/` 不进 Git：已发布的原图在网站的私有 Blob 里，这里是本机的工作库。丢了可以从 Blob 找回已发布的部分，未发布的要自己备份。

## 一批新图从出图到上线

1. **MediaFactory**：按 `pack.json` 出图、检查，把合格的图放进 `library/staging/<code>/`，在 `notes/handoffs/` 写交接单。
2. **Owner**：看总览图，确认。
3. **网站会话**：按 [演员数据归属](../src/content/actors/README.md) 更新批准的生产字段，运行 `pnpm data:generate`；交付图片按资产规范入库，再按 `docs/reference/release.md` 另行获得发布授权。生成档案和 looks 不手工同步。
## 改这个包

- 身份、造型、版本与样片以本包生产记录为源；生成器核对网站投影，清单原件 items 仍归素材工具。字段分工只见上述演员数据说明。
- 新增演员：在 pack.json 声明的生产目录登记；演员编号、永久 slug、艺名由 Owner 决定。新面孔晋升不删除其 casting 来源记录。
- 新增作品：在 `works/` 加文件，在 `pack.json` 登记。
