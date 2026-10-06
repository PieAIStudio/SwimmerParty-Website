# SwimmerParty 演员工作室（出图）

这个文件夹专门给 SWIMMER PARTY 的 AI 演员出图：在 ChatGPT 网页版里生成参考图，检查、命名、整理，再交给网站上线。
网站代码不在这里，在 `../SwimmerParty-Website`。本文件由 Claude 在 2026-10-05 写好，总结了前几轮出图的经验。

## 和 Owner 打交道

- 和 Owner 说中文；文件和文件夹用英文名。
- **故事、角色、造型这些内容事实只来自 Owner。**缺什么就先提方案，Owner 说"可以"再出图。
  （2026-10-05 曾经自编了"小店老板何姐"就开始出图，被 Owner 叫停。）
- 改 ChatGPT 的设置（项目说明、记忆）要先问 Owner。给对话选模型不算改设置。

## 第一次进来先做

做完后把这一节改成"已完成（日期）"，并把结果写进最后的"下载设置"。

1. **搬家**：把 `../SwimmerParty-Website/AI演员-尝试/` 里的全部内容移到本文件夹：
   - `assets-staging/SP-13`、`assets-staging/SP-03` → `staging/SP-13`、`staging/SP-03`
   - `rejects/` → `rejects/`
   - 编号笔记 `0x-*.md` 和 `10-website-media-placeholders.md` → `notes/`（文件名不变）
   - 总览图 `9x-*.png`、比例检查 `09-*.png` → `overviews/`
   - 其余早期试验图 → `trials/`

   搬完删掉 `../SwimmerParty-Website/.git/info/exclude` 里 `/AI演员-尝试/` 那一行，再确认网站仓库 `git status` 是干净的。
2. **校准下载**：按技能里"New host? Calibrate downloads once"这一节，找到 Codex 内置浏览器把下载存到哪里、叫什么名字，
   把 `CWIS_DOWNLOADS`、`CWIS_GLOB` 写进最后的"下载设置"。
3. **ChatGPT 项目**（Owner 同意后做；Owner 可能已经自己做了，先看一眼）：
   - 在项目 **Pics-A** 的项目说明里，原样粘贴 `chatgpt-project-instructions.md` 里的英文正文。
   - 把 **Claude** 项目里两位演员的出图对话移进 Pics-A 并改名，见下面的"一个演员一个对话"。

## 目录

| 文件夹 | 放什么 |
| ------ | ------ |
| `staging/<code>/` | 检查合格、按规则命名的最终图。网站入库只从这里拿。 |
| `rejects/` | 不合格的图（不删，留着对照）。 |
| `overviews/` | 总览联系表、比例检查图。 |
| `notes/` | 演员设定、造型方案、进度、交接单。 |
| `trials/` | 早期试验图。 |

## ChatGPT 的约定

- 用 Codex 内置浏览器，Owner 已经登录了 ChatGPT。不登录、不读 cookie、不过验证码；遇到验证就停下告诉 Owner。
- 项目：**Pics-A**（只用项目内记忆）。模型：**5.6 Pro**（GPT-5.6 Sol，思考强度拉满）。
- **一个演员一个对话**：长相只在同一个对话里延续，换了对话就容易换脸。
  - SP-13 唐韵秋 → 对话改名为 `SP-13 唐韵秋`（原来是 Claude 项目里的 "Generate Character Image"）。
  - SP-03 罗米沙 → 对话改名为 `SP-03 罗米沙`（原来是 Claude 项目里的 "Generate Portrait Image"）。
  - 新演员开新对话。多人同框或场景图另开对话，先上传两人的 `face.front`、`turnaround.front` 作锚点，写明"只取长相"。
- **打开对话一律用鼠标点侧边栏。**用网址或脚本点击打开，经常出现"Could not load this ChatGPT conversation"。
  整个标签页都打不开对话时，关掉它，新开一个 chatgpt.com 再点侧边栏。
- **永远不点"分享"里的任何选项。**不小心打开分享框就点 `Close dialog`。

## 怎么出图

用技能 `$chatgpt-web-image-series`（在 `~/.agents/skills/chatgpt-web-image-series/`），按它的流程做。最要紧的几条：

- 一条消息只要求**一次**画图调用，返回 N 张**分开的**图（N ≤ 8）。分成多次调用，出来的全是同一张。
- 消息结构：先指明身份参考图（"只取长相，不取角度和表情"）→ 共同说明写一次 → 编号清单只写每张的不同之处。
- 每条出图消息都必须**逐字**包含 Owner 的美学原文：

  ```text
  Premium 3D feature-animation style: characters clearly stylized and visibly animated;
  environment more realistic than the characters; bright, airy, relaxed mood;
  high-key midtone-bright exposure; soft global illumination; open readable shadows;
  low-to-medium contrast; rich midtones; clean polished 3D environment.
  No gritty realism, no dirty cyberpunk, no noir, no muddy shadows, no crushed blacks.
  Prioritize animated stylization over realism.
  ```

- 人物风格块（脸部 CG 化的程度、成人比例）照最近一次成功的消息抄。完整例子在 `notes/06-第五轮-一次多张.md`，
  以及技能的 `references/prompt-template.md`。
- 默认：单人 9:16 透明背景 PNG（941×1672）；场景、横幅 16:9（1672×941）。
- 不出任何品牌、logo，不像任何真人或知名角色。被拦（"similarity to third-party content"）就把东西改成通用款、换掉像名作的造型，再拆成小批。

## 每批都要检查

1. 张数对；是分开的图，不是一张拼图；透明背景；尺寸对。
2. 同一个人：和 `staging/<code>/` 里的 `face__front`、`turnaround__front` 并排看。
3. 每张和要求对号。左右一律按"画面左边/右边"判断，不按人物自己的左右。
4. 全身图跑 `proportions.mjs`，和该演员的 `turnaround__front` 比（唐韵秋约 7 头身，罗米沙约 7.5 头身）。
5. 不合格的只重画那几张；旧图移进 `rejects/`。

联系表和比例检查要用 Playwright，从网站仓库借：

```bash
CWIS_PLAYWRIGHT_FROM=../SwimmerParty-Website node ~/.agents/skills/chatgpt-web-image-series/scripts/sheet.mjs overviews/<名字>.png staging/SP-13/*.png
```

## 命名

- `{code}__{series}__{key}__v1.png`；服装和角色造型写成 `{code}__wardrobe-{look}__{key}__v1.png`。
- `key` 用英文小写和短横线。系列和固定格位以网站词表为准：`../SwimmerParty-Website/src/content/asset-series.json`。
- `v1` 是"锚点版本"：只有换脸（重做 `face.front` 或 `turnaround.front`）才整套升 `v2`。单张重画仍叫 `v1`，直接替换 `staging/` 里的文件，旧的进 `rejects/`。

## 交给网站

出图会话**不改网站仓库**。一批图合格后，在 `notes/handoff-<日期>.md` 写一张交接单：

- 新增或替换了哪些文件（路径）；
- 新造型：`id`、中英文名、英文造型描述、额外格位的 `key` 和中英文名、属于哪部作品的哪个角色；
- 联系表在哪里。

然后告诉 Owner："这一批可以交给网站会话入库发布了。"网站会话负责登记造型、入库、发布。

## 演员资料（摘要）

详细内容在 `notes/04-演员与角色设定.md` 和 `notes/07-东游记角色造型方案.md`。

- **SP-13 唐韵秋 / Tang Yunqiu**：重庆人，43 岁，163 cm，嘴唇偏厚，深棕色及肩微卷披发，带几缕白发。
- **SP-03 罗米沙 / Misha Luo**：俄罗斯血统，重庆长大，二十八九岁；长窄脸，鼻子略歪，招风耳，浓眉，灰蓝眼，乱糟糟的浅棕头发。
- **《东游记》/ Journey to the East**：第一集《戏里戏外》，剧本在 `../AnvilLocal/screenplays/journey-to-the-east/东游记-EP01.fountain`。
  - 何姐（唐韵秋饰）：剧组里的中年女演员，在短剧《霸道总裁爱上我的中年女佣》里演女佣。
  - 戴尔（罗米沙饰）：剧组里的男演员，长着外国霸总脸，其实是老重庆，在短剧里演霸道总裁。
- **《摩登怪咖》/ Modern Freaks**：两人都出演，角色未定。
- **已有造型**：两人的个人风格 `personal`；何姐的女佣 `maid`（Owner 选定浓妆版）；戴尔的霸总 `ceo`（宝蓝亮面西装）。
  剧本里戴尔穿黑西装，但"油头 + 灰/黑西装 + 细领带"那一版两次被 ChatGPT 以"像第三方内容"拦下，要不要再试由 Owner 决定。
- 现状：两人各 63 张，已全部上线 `https://swimmerparty.swiminai.com`。

## 待办（Owner 决定后才做）

- 16:9 网站横幅和档案主图：需要场景，先出方案给 Owner 看。
- 《摩登怪咖》的角色造型：等 Owner 定角色。
- 声音、视频、三维、动作：网站已经留好"规划中"的位置，见 `notes/10-website-media-placeholders.md`。

## 经验记录

学到值得以后复用的新经验，就在这里加一行，写明日期。不要写一次性的过程。

## 下载设置

（第一次校准后填写：`CWIS_DOWNLOADS=…`、`CWIS_GLOB=…`）
