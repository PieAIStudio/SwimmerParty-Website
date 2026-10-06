# SWIMMER PARTY 项目包（media pack）

这个文件夹是 SWIMMER PARTY 交给 MediaFactory 的**创作资料包**。它回答"给谁做、做成什么样、有哪些人物、做完交到哪里"；
"怎么做"（操作 ChatGPT 网页、下载、通用检查、调本地显卡）由 MediaFactory 负责，不写在这里。

- 格式：`media-pack-1`。格式说明由 MediaFactory 维护（`docs/reference/media-packs.md`，第一轮完成后存在）；
  在那之前，以本文件和 `pack.json` 为准。
- 规则：**MediaFactory 不保存任何创作事实**，事实都从这里或任务单里来。这里没写的事实（故事、角色、造型），先提方案，Owner 同意后再用。
- 由 Claude 在 2026-10-06 整理，内容来自前几轮出图的实际经验。

## 里面有什么

| 路径 | 内容 | 进 Git |
| ---- | ---- | ------ |
| `pack.json` | 总入口：风格、演员、作品、检查、交付、出图路线 | 是 |
| `style/aesthetic.md` | Owner 的美学原文，每条出图提示词都要逐字包含 | 是 |
| `style/character-rules.md` | 人物通用规则：成人比例、脸部 CG 化、衣服写实 | 是 |
| `style/chatgpt-project-instructions.md` | ChatGPT 项目说明的英文正文 | 是 |
| `cast/<code>.json` | 每位演员：事实、身份描述、风格块、比例、锚点图、造型、ChatGPT 对话 | 是 |
| `works/<id>.json` | 每部作品：剧本位置、已定角色、剧本里出现但还没定造型的人物 | 是 |
| `checks.md` | 验收标准：每批图怎么判断合格 | 是 |
| `notes/` | 设定、造型方案、进度；`history/` 是早期试验记录；`handoffs/` 是交接单 | 是 |
| `library/staging/<code>/` | 检查合格、按规范命名的定稿图 | **否** |
| `library/rejects/`、`overviews/`、`trials/` | 废图、总览联系表、早期试验图 | **否** |

`library/` 不进 Git：已发布的原图在网站的私有 Blob 里，这里是本机的工作库。丢了可以从 Blob 找回已发布的部分，未发布的要自己备份。

## 一批新图从出图到上线

1. **MediaFactory**：按 `pack.json` 出图、检查，把合格的图放进 `library/staging/<code>/`，在 `notes/handoffs/` 写交接单。
2. **Owner**：看总览图，确认。
3. **网站会话**：把交接单里的新造型同步到 `src/content/actors/<slug>/looks.ts`；新演员还要建档案；
   复制图到 `assets-inbox/<code>/`，运行 `pnpm assets:ingest`，按 `docs/reference/release.md` 发布。

## 改这个包

- 造型的生产描述以本包为准；网站的 `looks.ts` 发布时从这里同步。两边不一致时，以本包为准，并修正网站。
- 新增演员：在 `cast/` 加文件，在 `pack.json` 登记。演员编号、艺名由 Owner 决定。
- 新增作品：在 `works/` 加文件，在 `pack.json` 登记。
