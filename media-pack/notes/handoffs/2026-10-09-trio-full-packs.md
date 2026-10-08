# 制作单：林小满、包满仓、钱素梅 全套资产

Claude 写，2026-10-09。目标：把三位新面孔从 0.1.0（一张试镜照、一段声音）做成完整演员（1.0.0）。

人设、造型、台词由 Claude 写定（Owner 已授权新面孔的设定可以编）。执行的人不改内容，有问题写进运行日志。

## 0. 共同部分

**照汤米的制作单做**：`2026-10-08-tommy-brannigan-full-pack.md`，以下几节都照它：

- 第 3 节：55 张图的格位表、命名、尺寸、透明底；
- 第 5 节：交付位置、交付说明、运行日志；
- 第 6 节：验收和上线。

和汤米不同的地方只有两处：

- **声音是 6 段**：多一段 `intro-alt`（英文自我介绍），和唐韵秋、罗米沙一样；
- 中文台词的情绪用 MiniMax 的情绪菜单加。

**流程**：照 MediaFactory 的 `docs/reference/ordering-from-another-project.md`。

**一次只做一位**，三位排队：林小满 → 包满仓 → 钱素梅。原因：

- 几个会话共用一个浏览器和同一个 ChatGPT、MiniMax 账号；
- MiniMax 页面只有在前台才会生成；
- 下载都落在同一个"下载"文件夹里。

同时开几个会话会互相抢浏览器、抢下载文件。

**汤米留下的教训**，这次必须做到：

- 交付到 `media-pack/library/actors/<slug>/staging/`，按命名规则，不停在 MediaFactory 的证据目录；
- **声音下载成 WAV 文件**，不能只留在网页里；
- 保存音色前先看"我的音色"里有没有同名的，一位演员只占一个音色槽；
- 合成前确认编辑器已经清空；
- 用 whisper 核对每段台词：`/opt/homebrew/bin/whisper`，运行前设 `KMP_DUPLICATE_LIB_OK=TRUE`。

**声贝预算**：每位最多 3,000，三位合计最多 9,000。Owner 已同意；超出就停下来问。

**音色槽**：现在已经用了 5 个，标准版上限 10 个，这三位做完会用到 8 个。不要删除任何已有音色（删除要 Owner 同意）。

## 1. 林小满（lin-xiaoman）

| 项         | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 名字       | Lin Xiaoman / 林小满                                                                            |
| 年龄、身高 | 23 岁，约 156 cm                                                                                |
| 籍贯       | 黑龙江哈尔滨 / Harbin, Heilongjiang                                                             |
| 身份锚点   | `media-pack/library/claude-casting-2026-10-07/final/CC-001.png`                                 |

**身份描述**（英文原样）：

> The same fictional Chinese woman of East Asian appearance as the reference: about 23 years old, petite and slim, about 156 cm, realistic adult proportions around 7 heads tall; clearly an adult woman, never a child. Signature features: a round face, wide-set bright eyes, a small beauty mark under one eye on the same side as in the reference, and a blunt black chin-length bob with straight-cut bangs. Keep these features recognizable in every angle, expression and wardrobe.

**造型**：

| 造型       | 描述（英文原样）                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 试镜基础装 | dusty-pink plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.                           |
| 个人风格   | Personal style: an oversized cream puffer jacket worn open over a dusty-pink knit sweater, high-waisted straight-leg jeans, chunky white sneakers, a red knit scarf; no logos. Her own blunt black bob with bangs. |

个人风格的另外 4 张：

- `portrait`：近景；
- `frozen-pear`：捧着一个冻梨咬了一口；
- `snowball`：攥着雪球准备扔；
- `cupped-shout`：双手拢在嘴边大喊。

**声音**：

- MiniMax 音色设计的描述：

  > 23岁哈尔滨姑娘，普通话带明显的东北口音（东北话的声调和儿化），声音清亮脆生，语速快，爱笑，说话直来直去，有喜剧感。自然口语，有真实的呼吸和笑声，不是播音腔，也不是童声。
- 音色名：`lin-xiaoman`。

| 格位        | 情绪 | 台词（原样）                                                                                                                                                                                      |
| ----------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intro`     | —    | 大家好啊，我叫林小满，哈尔滨的，今年二十三。别看我个儿小，嗓门可一点不小，片场喊一嗓子全组都能听见。我最想演那种表面乖乖的、心里一肚子小主意的人。有戏找我，保证不掉链子！                     |
| `intro-alt` | —    | Hi! I'm Lin Xiaoman, twenty-three, from Harbin, where winter lasts half the year. I'm small, but my voice is not. One shout and the whole set turns around. I'd love to play the quiet girl who's secretly running the whole plan. |
| `chat`      | —    | 哎我跟你说，我们哈尔滨冬天零下三十度，我小时候舔过铁栏杆，舌头粘上了，我妈拿热水浇了半天才下来。你别笑，这是我们东北小孩儿的必修课！                                                             |
| `happy`     | 开心 | 妈呀！真的选上了？我我我……我先蹦一会儿！不行，我得给我妈打个电话，她肯定说"我就知道我闺女行"！                                                                                                 |
| `angry`     | 生气 | 你说谁小孩儿呢？我二十三了！个儿小咋了，个儿小嗓门不小！下回再管我叫小妹妹，我就站凳子上跟你说话！                                                                                              |
| `sad`       | 难过 | 第一次离家来拍戏，晚上一个人住酒店。我妈给我发语音，说锅包肉做多了，没人吃。我听完就把被子蒙上了，可我没让她听出来我在哭。                                                                     |

## 2. 包满仓（bao-mancang）

| 项         | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| 名字       | Bao Mancang / 包满仓                                            |
| 年龄、身高 | 33 岁，约 172 cm                                                |
| 籍贯       | 天津 / Tianjin                                                  |
| 身份锚点   | `media-pack/library/claude-casting-2026-10-07/final/CC-007.png` |

**身份描述**（英文原样）：

> The same fictional Chinese man of East Asian appearance as the reference: about 33 years old, average build with a slightly soft middle, about 172 cm, realistic adult proportions around 7.5 heads tall. Signature features: a round face with full cheeks, small narrow eyes that almost close when he smiles, a slightly receding hairline with short black hair, and a wide, friendly grin. Keep these features recognizable in every angle, expression and wardrobe.

**造型**：

| 造型       | 描述（英文原样）                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 试镜基础装 | navy plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.                            |
| 个人风格   | Personal style: a faded olive bomber jacket over a plain white T-shirt, loose khaki trousers, black cloth shoes, a folding fan tucked into his back pocket; no logos. His own short black hair with the receding hairline. |

个人风格的另外 4 张：

- `portrait`：近景；
- `jianbing`：手里拿着刚出锅的煎饼果子；
- `folding-fan`：打开折扇，摆出说相声的架势；
- `bike-bell`：推着自行车按车铃。

**声音**：

- MiniMax 音色设计的描述：

  > 33岁天津男人，普通话带浓重的天津口音（天津话的声调，不是北京腔），声音明亮，嘴快幽默，节奏感强，像说相声的捧哏逗哏，爱用"嘿""您""得"。自然口语，有真实的呼吸和停顿，不是播音腔。
- 音色名：`bao-mancang`。

| 格位        | 情绪 | 台词（原样）                                                                                                                                                                                                       |
| ----------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `intro`     | —    | 嘿，各位好，我叫包满仓，天津卫的，三十三了。这名儿是我爷爷起的，说是粮仓满满不愁吃。您看我这脑门儿，越来越亮了，省电。我打小听相声长大，演个嘴贫的、演个老实人吃亏的，都行！                                     |
| `intro-alt` | —    | Hey, everybody. I'm Bao Mancang, thirty-three, from Tianjin. My grandpa named me "full granary", so I'd never go hungry. It worked. My hairline is moving out to make room for my forehead. Cast me as the guy who talks too much, or the honest guy who always gets the short end. |
| `chat`      | —    | 您知道天津人早上吃什么吗？煎饼果子！可有一条，得是绿豆面儿的，果子得是现炸的薄脆，不能放香菜……您说什么？您要放香菜？得，咱俩这交情到头了。                                                                       |
| `happy`     | 开心 | 嘿！成了！我就说嘛，这叫什么？这叫天时地利人和！今儿晚上我请客，包子管够！……啊，就是别点太贵的。                                                                                                               |
| `angry`     | 生气 | 不是，您这就不讲理了啊！我排了俩钟头的队，您一来就往前插？咱天津人讲究什么？讲究个面儿！今儿这面儿您不给，我还非得跟您掰扯掰扯！                                                                               |
| `sad`       | 难过 | 我爷爷走之前，最后一回听相声，是我给他说的。说到一半他睡着了，脸上还挂着笑。我没敢停，一直说完了。那是我这辈子说得最好的一段。                                                                                   |

## 3. 钱素梅（qian-sumei）

| 项         | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| 名字       | Qian Sumei / 钱素梅                                             |
| 年龄、身高 | 71 岁，约 150 cm                                                |
| 籍贯       | 江苏苏州 / Suzhou, Jiangsu                                      |
| 身份锚点   | `media-pack/library/claude-casting-2026-10-07/final/CC-036.png` |

**身份描述**（英文原样）：

> The same fictional Chinese woman of East Asian appearance as the reference: about 71 years old, thin and small, about 150 cm, realistic elderly adult proportions around 7 heads tall, standing upright, not hunched. Signature features: a finely wrinkled, kind face with gentle smile lines, a small mole on one cheek on the same side as in the reference, and white hair pinned in a tight, neat bun. Keep these features recognizable in every angle, expression and wardrobe.

**造型**：

| 造型       | 描述（英文原样）                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 试镜基础装 | lavender plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.                                                |
| 个人风格   | Personal style: a dove-grey quilted jacket with a mandarin collar and cloth knot buttons over a lavender blouse, dark straight trousers, black cloth shoes, a small pale jade bangle; no logos. Her own white hair in a tight bun. |

个人风格的另外 4 张：

- `portrait`：近景；
- `osmanthus-cake`：端着一碟桂花糕；
- `radio`：把一台旧收音机贴在耳边听；
- `knitting`：坐着织毛线，抬头笑。

**声音**：

- MiniMax 音色设计的描述：

  > 71岁苏州老太太，普通话带吴语的软糯口音，声音轻柔、慢、带笑，气息略弱但字字清楚，慈祥，像在跟孙辈说话。自然口语，有真实的呼吸和停顿，不是播音腔，也不要刻意装老。
- 音色名：`qian-sumei`。

| 格位        | 情绪 | 台词（原样）                                                                                                                                                                  |
| ----------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intro`     | —    | 我叫钱素梅，苏州人，今年七十一岁啦。我说话慢，你们不要急哦。年轻时候在评弹团里打过杂，听了一辈子的好故事。现在能自己来演戏，我开心得不得了。演外婆、演老邻居，我最拿手。   |
| `intro-alt` | —    | Hello, my name is Qian Sumei. I'm seventy-one, from Suzhou. I speak slowly, so please be patient with me. When I was young, I helped out backstage at a storytelling troupe, and I've listened to good stories all my life. Now I get to act in them myself. |
| `chat`      | —    | 我们苏州人呀，早上要吃一碗头汤面，汤要清，面要细，浇头要现炒的。我老头子在的时候，每天陪我去吃。现在呀，我一个人也去，还是坐那个靠窗的位置。                               |
| `happy`     | 开心 | 哎哟，这个是给我的呀？你怎么晓得我喜欢桂花糕的？好的呀好的呀，今天真是开心得不得了，我要多吃一块！                                                                          |
| `angry`     | 生气 | 这个人怎么好这样的！插队还要讲道理？我七十一岁了，排了一个钟头，你说让一让就让一让？今天我偏不让！                                                                          |
| `sad`       | 难过 | 老头子走了以后，我把他的收音机一直放在床头。晚上睡不着，我就打开来听评弹。听着听着，就好像他还坐在旁边，跟着哼两句。                                                        |

## 4. 网站侧

- 三位的 `media-pack/actors/<slug>.json` 由网站侧的指挥会话照本制作单建，格式照 `tommy-brannigan.json`；然后在 `media-pack/pack.json` 的 cast 列表里登记。
- 版本说明用第七轮文案稿第 15 节的通用写法。
- 入库、改状态、发布，都等 Owner 看过点头。
