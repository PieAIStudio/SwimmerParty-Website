# 制作单：汤米·布兰尼根（tommy-brannigan）全套资产

Claude 写，2026-10-08。用途有两个：

1. 把新面孔汤米从 0.1.0（一张试镜照、一段声音）做成完整演员（1.0.0），和唐韵秋的资产结构一样，只是没有角色造型；
2. **测试自动化**：在网站项目里的 Codex 会话负责下单、开 MediaFactory 会话、收货、验收；MediaFactory 会话负责生产。全程记录哪里卡住，作为 MediaFactory 下一次重构的依据。

人设、造型、台词由 Claude 写定（Owner 已授权新面孔的设定可以编）。执行的人不改内容，有问题记进运行日志。

## 1. 演员事实

| 项         | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| slug       | `tommy-brannigan`                                                                    |
| 名字       | Tommy Brannigan / 汤米·布兰尼根                                                      |
| 年龄、身高 | 41 岁，约 167 cm                                                                     |
| 籍贯       | Liverpool, England / 英国利物浦                                                      |
| 一句话     | Short and stocky, square head, a nose flattened in the ring. / 矮壮，方脑袋，鼻子被打扁过。 |
| 身份锚点   | 试镜照 `media-pack/library/claude-casting-2026-10-07/final/CC-029.png`（正面全身）    |
| 语言       | 英语                                                                                 |

**身份描述**（写进 `media-pack/actors/tommy-brannigan.json` 的 identity，英文原样）：

> The same fictional white man as the reference: about 41 years old, short and stocky, about 167 cm, realistic adult proportions around 7 heads tall; a heavy, powerful build with broad shoulders, a thick neck and muscular forearms; no oversized head and no shortened legs. Signature features: a square head and square jaw, a very short dark-brown buzz cut, a broad flattened boxer's nose, a heavy brow, small deep-set eyes that crinkle when he smiles. Keep these features recognizable in every angle, expression and wardrobe. Do not make him a generic tough guy or an average face.

**风格**：照 `media-pack/style/aesthetic.md` 原文，再照 `style/character-rules.md`，再加上面的身份描述。比例检查按约 7 头身。

## 2. 造型

| 造型       | 描述（英文原样进提示词）                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 试镜基础装 | heather-grey plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.          |
| 个人风格   | Personal style: a faded red zip-up track jacket worn open over a plain white crew-neck T-shirt; grey cotton joggers; scuffed black trainers; no logos, no text. His own short dark-brown buzz cut. |

## 3. 图片：55 张

命名：`tommy-brannigan__{种类}__{格位}__v1.png`，941×1672，透明底，单人，无文字。

| 种类（文件名里的写法）  | 格位                                                                                                                                                                                                                                   | 张数 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `turnaround`            | front、three-quarter、side、back、back-three-quarter-left、back-three-quarter-right                                                                                                                                                    | 6    |
| `face`                  | front、three-quarter、side、three-quarter-left、side-right、up、down                                                                                                                                                                   | 7    |
| `expression`            | neutral、smile、laugh、sad、cry、annoyed、angry、surprised、scared、disgusted、embarrassed、tired、speaking、eyes-closed、worried、skeptical、smug、contempt、confused、thinking、determined、shy、pain、sleepy、awkward-smile、deadpan | 26   |
| `wardrobe-personal`     | front、three-quarter、side、back、portrait（近景）、hand-wraps（正在缠拳击绷带）、jump-rope（跳绳跳到半空）、mug-of-tea（端着一杯茶咧嘴笑）                                                                                            | 8    |
| `pose`                  | walk、run、sit、point、arms-crossed、phone                                                                                                                                                                                             | 6    |
| `detail`                | hands、hair-back                                                                                                                                                                                                                       | 2    |

转面、脸部、表情、姿势、细节都穿试镜基础装。左右一律按"画面左/右"。逐张按 `media-pack/checks.md` 验收。

**出图方法**：ChatGPT 网页，按 MediaFactory `mf-image` 的选角配方：

- 每批开新对话，每批不超过 5 张；
- 先上传身份锚点；
- 写具体、看得见的特征；
- 每批看总览，不对就停。

## 4. 声音：5 段

| 格位    | 情绪 | 台词（英文原样）                                                                                                                                                                                         |
| ------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intro` | —    | Alright, I'm Tommy Brannigan, forty-one, from Liverpool. I boxed for fifteen years, hence the nose. Now I run a gym for kids who need somewhere to go after school. I'm tougher on the outside than the inside. Cast me as the trainer, the bouncer, or the dad who never gives up. |
| `chat`  | —    | You know what the kids at the gym call me? Uncle Flatnose. Cheeky lot. I pretend I'm offended, then I buy them chips anyway. Every Friday, same chippy, same order. Don't tell their mums.               |
| `happy` | 开心 | Get in! Did you see that? First round, clean as you like! Right, drinks are on me. Well, squash for the kids. But still, on me!                                                                          |
| `angry` | 生气 | No, no, no. Stop. You don't drop your hands. Ever. I've told you a hundred times. You drop your hands, you get hit. Again. From the top.                                                                 |
| `sad`   | 难过 | My dad never came to one of my fights. Not one. After he passed, I found every ticket stub in a shoebox under his bed. Every single one. He was there the whole time. Sat at the back.                   |

- `intro-alt` 和角色格位这次不做，网站上显示"规划中"。
- 命名 `tommy-brannigan__voice__{格位}__v1.wav`，另附 `lines.json`，格式照 `media-pack/library/voice/tang-yunqiu/lines.json`。

**音色**：

1. MiniMax 网页"音色设计"。描述用：

   > 41岁利物浦男人，说英语，带明显的利物浦口音（Scouse），英式，不是美式。声音粗犷、直爽、幽默，语速偏快，有拳击手的劲儿。自然口语，有真实的呼吸和停顿，不是播音腔。

   试听文本用 `intro` 台词。
2. 一次出 3 个候选，按口音、自然度、像不像这个人挑一个，存成 MiniMax 音色 `tommy-brannigan`。
3. 用 speech-2.8-hd 合成 5 段；带情绪的格位先选中文字，再加情绪。
4. 3 个候选都下载保存，Owner 验收时可能换。

**声贝预算**：本次最多 3,000 声贝，Owner 已预先同意；超出就停下来问。计费是汉字算 2、其他字符算 1。

MiniMax 的坑见 `media-pack/style/voice-rules.md`：

- 一组候选占一个标签页；
- 下载要真实点击；
- 用 whisper 抽查。

## 5. 交付

- **放哪**：全部文件放进 `media-pack/library/actors/tommy-brannigan/staging/`（第六轮的存档布局）。
- **交接说明**：写在 `media-pack/notes/handoffs/2026-10-08-tommy-brannigan-delivered.md`，内容有：
  - 文件清单和哈希；
  - 挑中的音色和理由；
  - 声贝用量；
  - 没过检查的格位。
- **运行日志**：写在 `media-pack/notes/handoffs/2026-10-08-tommy-brannigan-run-log.md`。每一步记：
  - 开始、结束时间；
  - 读了哪些文件和技能；
  - 哪里不清楚、哪里走错；
  - 重试几次；
  - 花了多少。

  这份日志是 MediaFactory 重构的输入，**越具体越好**。

## 6. 验收和上线

- 网站侧的 Codex 收货后：
  - 逐项核对张数、命名、尺寸、透明底；
  - 用 whisper 核对 5 段台词；
  - 做一个本地审看页（图片总览加声音播放），交给 Owner。
- **Owner 看过点头之后**，才入库成 1.0.0（版本说明用第七轮文案稿第 15 节的通用写法）。如果第六轮的入库工具还没做好，就停在 staging，不自己写临时入库。
- 汤米的状态从"新面孔"改成"可出演"，也要等 Owner 点头。
