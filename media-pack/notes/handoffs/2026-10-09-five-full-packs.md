# 制作单：严琳、包满、雷乐、范一鸣、马乐 全套资产

Claude 写，2026-10-09，**替换** `2026-10-09-trio-full-packs.md`（那份作废）。五位由 Owner 挑选，其中四位改了名字，马乐改了身高。名单源头 `media-pack/casting/new-faces-2026-10.py` 已经改好并重新生成。

| 原名             | 新名          | slug         | 改动                |
| ---------------- | ------------- | ------------ | ------------------- |
| 严若琳           | 严琳 Yan Lin  | `yan-lin`    | 改名                |
| 包满仓           | 包满 Bao Man  | `bao-man`    | 改名                |
| 雷大海           | 雷乐 Lei Le   | `lei-le`     | 改名                |
| 范一鸣           | 范一鸣 Fan Yiming | `fan-yiming` | 不变            |
| 尤嘉乐           | 马乐 Ma Le    | `ma-le`      | 改名；身高 165 → 175 cm |

这些演员还没在正式站发布过，所以 slug 可以改，不需要做跳转。

## 0. 共同部分

- **格位与规格**：55 张图的格位表见 `media-pack/pack.json` 的 `fullPack`；命名、尺寸、透明底和交付位置见 `pack.json` 与 `checks.md`。（原汤米制作单已移到 `notes/history/handoffs-2026-10/`。）
- **声音 6 段**：intro、intro-alt（英文）、chat、happy、angry、sad。
- **流程**：照 MediaFactory 的 `docs/reference/ordering-from-another-project.md`。**一次只做一位**，顺序：严琳 → 包满 → 雷乐 → 范一鸣 → 马乐。
- **汤米留下的教训**，必须做到：
  - 交付进 `media-pack/library/actors/<slug>/staging/`，按命名；
  - 声音下载成 WAV 文件；
  - 一位演员只占一个 MiniMax 音色槽，保存前先查有没有同名的；
  - 合成前确认编辑器已经清空；
  - 用 whisper 核对台词：`/opt/homebrew/bin/whisper`，运行前设 `KMP_DUPLICATE_LIB_OK=TRUE`。
- **声贝**：每位最多 3,000，合计最多 15,000（Owner 已同意）。
- **音色槽**：标准版上限 10 个，现在已经用了 5 个，五位全做完会到 10 个，正好用满。不要删除任何已有音色；满了就停下来问 Owner。

## 1. 第一步：先重拍试镜照，Owner 点头再做全套

原来 95 张试镜照的**头普遍偏大**。Claude 量了这五张，从头顶到下巴只有身高的 1/5 到 1/6.3，成年人应该在 1/7 到 1/7.5。旧照片不能直接当身份锚点。

1. 每位先出一张**新的正面全身试镜照**：
   - 脸、发型、特征照旧照片（旧照片只当脸部参考）；
   - 身高和头身比照下表；
   - 穿试镜基础装，941×1672，透明底；
   - 每位出 2 到 3 张候选。
2. 五位的新照片放进同一个审看页，旁边并排旧照片，叠上头身比刻度线，交给 Owner。
3. **Owner 选定以后**，新照片才成为身份锚点，再做 55 张图和 6 段声音。

| 演员   | 身高   | 头身比 | 头顶到下巴 |
| ------ | ------ | ------ | ---------- |
| 严琳   | 165 cm | 约 7.25 | 约 22.5 cm |
| 包满   | 172 cm | 约 7.4 | 约 23 cm   |
| 雷乐   | 170 cm | 约 7   | 约 24 cm   |
| 范一鸣 | 168 cm | 约 7   | 约 24 cm   |
| 马乐   | 175 cm | 约 7.5 | 约 23 cm   |

## 2. 严琳（yan-lin）

- 41 岁，165 cm，北京。
- 旧照片：`media-pack/library/claude-casting-2026-10-07/final/CC-061.png`。

**身份描述**（英文原样）：

> The same fictional Chinese woman of East Asian appearance as the reference: about 41 years old, slim and upright, about 165 cm, realistic adult proportions about 7.25 heads tall (crown to chin about 22–23 cm), never a large head. Signature features: a high forehead, thin precise eyebrows, calm narrow eyes, and black hair pulled into a tight low bun. Keep these features recognizable in every angle, expression and wardrobe.

**造型**（英文原样）：

- 试镜基础装：charcoal-grey plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.
- 个人风格：Personal style: a tailored camel trench coat over a crisp white shirt, slim black ankle trousers, black low heels, small pearl stud earrings; no logos. Her own black hair in a tight low bun.
- 个人风格另外 4 张：
  - `portrait`：近景；
  - `manuscript`：戴着眼镜看稿子；
  - `red-pen`：用红笔在稿子上改；
  - `half-smile`：难得的一个浅笑，眼睛看向一边。

**声音**：

- MiniMax 音色设计描述：

  > 41岁北京女性，普通话字正腔圆，带一点京味但不油滑，声音清冷、精确，语速平稳，有距离感，偶尔透出一点温度。自然口语，有真实的呼吸和停顿，不是播音腔。
- 音色名 `yan-lin`。

| 格位        | 情绪 | 台词（原样）                                                                                                                                                       |
| ----------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `intro`     | —    | 我是严琳，北京人，四十一岁。我说话直接，不爱绕弯子。很多人觉得我冷，其实我只是认真。我适合演严格的主编、医院的主任，或者那种你以为是反派、最后才发现一直在帮你的人。 |
| `intro-alt` | —    | I'm Yan Lin, forty-one, from Beijing. I say what I mean, and I don't do small talk. People think I'm cold; I'm just paying attention. Cast me as the strict editor, the head of the ward, or the villain who turns out to be on your side. |
| `chat`      | —    | 我每天早上六点起，先去后海边上走一圈，回来喝一碗豆汁儿。别皱眉，喝习惯了真香。我们组里年轻人都不敢尝，就我一个人喝得特带劲。                                     |
| `happy`     | 开心 | 过了？这条真过了？……行，我承认，我刚才是有点紧张。走吧，今天我请大家吃涮羊肉，铜锅的，谁也别跟我客气。                                                          |
| `angry`     | 生气 | 这稿子谁改的？第三页三个错别字，第五页数据对不上。我不需要解释，我需要明天早上九点之前，一份干净的稿子放在我桌上。                                               |
| `sad`       | 难过 | 我妈住院那阵子，我每天下了班去陪她。她不认得我了，老问我"姑娘你是哪个科的"。我就说我是新来的护士。她拉着我的手说，你们这儿的护士，真好。                         |

## 3. 包满（bao-man）

- 33 岁，172 cm，天津。
- 旧照片：`CC-007.png`。

**身份描述**（英文原样）：

> The same fictional Chinese man of East Asian appearance as the reference: about 33 years old, average build with a slightly soft middle, about 172 cm, realistic adult proportions about 7.4 heads tall (crown to chin about 23 cm), never a large head. Signature features: a round face with full cheeks, small narrow eyes that almost close when he smiles, a slightly receding hairline with short black hair, and a wide, friendly grin. Keep these features recognizable in every angle, expression and wardrobe.

**造型**（英文原样）：

- 试镜基础装：navy plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.
- 个人风格：Personal style: a faded olive bomber jacket over a plain white T-shirt, loose khaki trousers, black cloth shoes, a folding fan tucked into his back pocket; no logos. His own short black hair with the receding hairline.
- 个人风格另外 4 张：
  - `portrait`：近景；
  - `jianbing`：手里拿着刚出锅的煎饼果子；
  - `folding-fan`：打开折扇，摆出说相声的架势；
  - `bike-bell`：推着自行车按车铃。

**声音**：

- MiniMax 音色设计描述：

  > 33岁天津男人，普通话带浓重的天津口音（天津话的声调，不是北京腔），声音明亮，嘴快幽默，节奏感强，像说相声，爱用"嘿""您""得"。自然口语，有真实的呼吸和停顿，不是播音腔。
- 音色名 `bao-man`。

| 格位        | 情绪 | 台词（原样）                                                                                                                                                                            |
| ----------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intro`     | —    | 嘿，各位好，我叫包满，天津卫的，三十三了。我爷爷说"满"字好，饭碗满、口袋满，啥都满。结果就我这脑门儿最满，满得发亮，省电。我打小听相声长大，演个嘴贫的、演个老实人吃亏的，都行！ |
| `intro-alt` | —    | Hey, everybody. I'm Bao Man, thirty-three, from Tianjin. My grandpa picked "Man" because it means "full": a full bowl, full pockets. The only thing that got full was my forehead. Cast me as the guy who talks too much, or the honest guy who always gets the short end. |
| `chat`      | —    | 您知道天津人早上吃什么吗？煎饼果子！可有一条，得是绿豆面儿的，果子得是现炸的薄脆，不能放香菜……您说什么？您要放香菜？得，咱俩这交情到头了。                                            |
| `happy`     | 开心 | 嘿！成了！我就说嘛，这叫什么？这叫天时地利人和！今儿晚上我请客，包子管够！……啊，就是别点太贵的。                                                                                    |
| `angry`     | 生气 | 不是，您这就不讲理了啊！我排了俩钟头的队，您一来就往前插？咱天津人讲究什么？讲究个面儿！今儿这面儿您不给，我还非得跟您掰扯掰扯！                                                    |
| `sad`       | 难过 | 我爷爷走之前，最后一回听相声，是我给他说的。说到一半他睡着了，脸上还挂着笑。我没敢停，一直说完了。那是我这辈子说得最好的一段。                                                        |

## 4. 雷乐（lei-le）

- 46 岁，170 cm，湖北武汉。
- 旧照片：`CC-012.png`。

**身份描述**（英文原样）：

> The same fictional Chinese man of East Asian appearance as the reference: about 46 years old, heavy-set with a big beer belly and a thick neck, about 170 cm, realistic adult proportions about 7 heads tall (crown to chin about 24 cm), never a large head. Signature features: a broad round face, a black buzz cut, small eyes, and a booming open-mouthed laugh. Keep these features recognizable in every angle, expression and wardrobe.

**造型**（英文原样）：

- 试镜基础装：heather-grey plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.
- 个人风格：Personal style: a short-sleeved navy polo shirt stretched over his belly, khaki cargo shorts, black sandals, a car key on a red lanyard around his wrist; no logos. His own black buzz cut.
- 个人风格另外 4 张：
  - `portrait`：近景；
  - `hot-dry-noodles`：端着纸碗吃热干面；
  - `car-key`：甩着车钥匙往前走；
  - `belly-laugh`：仰头大笑，一手拍肚子。

**声音**：

- MiniMax 音色设计描述：

  > 46岁武汉男人，普通话带浓重的武汉口音（武汉话的声调），声音洪亮粗犷，豪爽，急脾气但热心，笑声很大。自然口语，有真实的呼吸和停顿，不是播音腔。
- 音色名 `lei-le`。

| 格位        | 情绪 | 台词（原样）                                                                                                                                                                                   |
| ----------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intro`     | —    | 我叫雷乐，武汉的，四十六。名字里有个乐，所以我一天到晚乐呵呵的，笑起来整条街都听得到。你看我这个肚子，都是热干面跟啤酒喂出来的。以前开过出租车，满武汉没有我不熟的路。演司机、演大排档老板，那是本色出演！ |
| `intro-alt` | —    | I'm Lei Le, forty-six, from Wuhan. "Le" means happy, and I laugh so loud the whole street hears it. This belly? Hot dry noodles and beer. I drove a taxi for years, so there's no road in Wuhan I don't know. Cast me as the driver, or the guy running the late-night food stall. |
| `chat`      | —    | 你来武汉，早上必须过早。热干面要芝麻酱多一点，再来碗蛋酒。我跟你讲，我开出租那几年，凌晨四点收工，就蹲在户部巷门口吃，那叫一个舒服！                                                           |
| `happy`     | 开心 | 哎呀我的个妈！真的中了？哈哈哈哈！走走走，今天大排档我包了，小龙虾管够，哪个都不准跟我抢！                                                                                                    |
| `angry`     | 生气 | 你这个人怎么开车的咧？变道不打灯，还按喇叭按得比我还响！我开了二十年车，没见过你这么横的！下来，我们讲讲道理！                                                                                 |
| `sad`       | 难过 | 我老爸走的那天，我还在跑车，接了个去机场的单。客人下车说"师傅辛苦了"，我说"不辛苦"。关了车门，我一个人在停车场坐了一个钟头。                                                                 |

## 5. 范一鸣（fan-yiming）

- 36 岁，168 cm，江苏无锡。
- 旧照片：`CC-052.png`。

**身份描述**（英文原样）：

> The same fictional Chinese man of East Asian appearance as the reference: about 36 years old, soft build with a round middle, about 168 cm, realistic adult proportions about 7 heads tall (crown to chin about 24 cm), never a large head. Signature features: a round face, side-parted wavy black hair, a thin moustache with a small tuft of goatee, and cheerful raised eyebrows. Keep these features recognizable in every angle, expression and wardrobe.

**造型**（英文原样）：

- 试镜基础装：light-blue plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.
- 个人风格：Personal style: a burgundy velvet blazer over a white shirt with a black bow tie, dark trousers, polished brown shoes, like a wedding host; no logos. His own side-parted wavy hair and goatee.
- 个人风格另外 4 张：
  - `portrait`：近景；
  - `microphone`：拿着话筒正在宣布；
  - `bow`：一手按胸口鞠躬；
  - `thumbs-up`：笑着竖大拇指。

**声音**：

- MiniMax 音色设计描述：

  > 36岁无锡男人，普通话带一点吴语口音，声音圆润，温和健谈，有点小得意，像婚礼主持人，但私下说话很松弛。自然口语，有真实的呼吸和停顿，不是播音腔。
- 音色名 `fan-yiming`。

| 格位        | 情绪 | 台词（原样）                                                                                                                                                       |
| ----------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `intro`     | —    | 大家好，我是范一鸣，无锡人，三十六岁。以前在婚庆公司当过主持人，三百多场婚礼，台下的人哭我也跟着哭。这撮小胡子是我的标志。我适合演热心的主持人、爱面子的小老板，或者暖心的大哥。 |
| `intro-alt` | —    | Hi everyone, I'm Fan Yiming, thirty-six, from Wuxi. I used to host weddings, more than three hundred of them, and I cried at every single one. This little goatee is my trademark. Cast me as the warm host, the proud small-business owner, or the big brother who always shows up. |
| `chat`      | —    | 无锡人吃东西偏甜，小笼包里都是汤，咬之前要先吹一吹。我主持婚礼那几年，最怕新人敬酒敬到我这桌，一喝就脸红，台上还得笑得像没事一样。                               |
| `happy`     | 开心 | 各位来宾，各位朋友！今天是个好日子——不好意思，职业病，一高兴就想主持。真的谢谢大家，这杯我干了！                                                                  |
| `angry`     | 生气 | 我主持了三百多场婚礼，没见过音响能在新娘出场的时候断掉的！你跟我说说，这根线是谁拔的？现在、马上、给我接上！                                                       |
| `sad`       | 难过 | 有一场婚礼，新郎的父亲前一个月走了。轮到他讲话，他拿着话筒，半天说不出来。我就站在旁边，帮他把那句"爸，我结婚了"说完了。                                          |

## 6. 马乐（ma-le）

- 24 岁，**175 cm**，广西南宁。
- 旧照片：`CC-072.png`。旧照按 165 cm 画的，这次按 175 cm 重画。

**身份描述**（英文原样）：

> The same fictional Chinese man of East Asian appearance as the reference: about 24 years old, slim and long-limbed, about 175 cm, realistic adult proportions about 7.5 heads tall (crown to chin about 23 cm), never a large head. Signature features: a lean face, curly permed black hair, a one-sided smile that starts at one corner of the mouth, and bright playful eyes. Keep these features recognizable in every angle, expression and wardrobe.

**造型**（英文原样）：

- 试镜基础装：mustard-yellow plain fitted crew-neck T-shirt, dark straight-leg trousers, clean white low-top sneakers, no jewelry, no watch, no accessories, no logos.
- 个人风格：Personal style: an oversized pastel-green short-sleeved shirt with a small leaf print worn open over a white T-shirt, wide cream shorts, white sneakers; no logos. His own curly permed hair.
- 个人风格另外 4 张：
  - `portrait`：近景；
  - `noodle-slurp`：捧着碗嗦米粉；
  - `skateboard`：夹着滑板；
  - `peace-sign`：歪头比耶，单边嘴角笑。

**声音**：

- MiniMax 音色设计描述：

  > 24岁南宁男生，普通话带一点广西口音，声音明亮俏皮，爱开玩笑，语速快，阳光。自然口语，有真实的呼吸和笑声，不是播音腔。
- 音色名 `ma-le`。

| 格位        | 情绪 | 台词（原样）                                                                                                                                                       |
| ----------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `intro`     | —    | 嗨嗨，我是马乐，南宁的，二十四岁，一米七五。我笑的时候只有一边嘴角动，朋友说我笑得很欠揍，哈哈。这个卷是我妈带我去烫的。我想演那种搞笑的室友、机灵的小跟班，或者一不小心成了主角的普通人。 |
| `intro-alt` | —    | Hey hey, I'm Ma Le, twenty-four, from Nanning. One seventy-five. When I smile, only one side of my mouth moves. My friends say it makes me look like I'm up to something. They're right. Cast me as the funny roommate, the sidekick, or the ordinary guy who ends up the hero by accident. |
| `chat`      | —    | 我们南宁人早上要嗦一碗老友粉，酸笋放多一点，那个味道你第一次闻可能想跑，嗦完你就离不开了。我室友就是，第一天骂我，第三天比我起得还早。                           |
| `happy`     | 开心 | 真的假的？我被选上了？哈哈哈，等一下等一下，我先发个朋友圈……不对，先给我妈打电话！                                                                                |
| `angry`     | 生气 | 哎，那是我的老友粉！我就去拿个筷子的工夫，你就给我喝了一半汤？你知道这碗酸笋放了多少吗？赔我！                                                                    |
| `sad`       | 难过 | 我爷爷以前在邕江边上摆摊修自行车。我小时候坐在他旁边递扳手。后来摊子没了，爷爷也走了。我每次路过那里，还是会放慢一点。                                            |

## 7. 网站侧

- 网站数据重新从名单导入（见第 7.5 轮计划第 6 节）。五位的 `media-pack/actors/<slug>.json` 由指挥会话照本制作单建，然后在 `pack.json` 登记。
- 新照片定稿后：
  - 网站上这五位的试镜照换成新照片（版本仍是 0.1.0）；
  - 全套做完、Owner 点头后升到 1.0.0。版本说明用第七轮文案稿第 15 节的通用写法。

## 8. 精简执行规则

五位演员可以并行，但每位演员只允许一个活动 session。每个 session 只做一位演员，使用独立 run、浏览器标签、输出目录和文件前缀；Pics-A 的共享 composer 同一时间只允许一个 session 操作，其他 session 排队，不抢占。

模型设置必须分开记录：

- MediaFactory Codex session：`gpt-6.1-sol`，`medium`；
- 网页端 ChatGPT 出图：制作单指定的 `gpt-5.6-sol / 5.6 Pro`；
- 前者只负责编排、测量、验收和记账，不能修改后者。

本轮演员安排：

- 严琳：保留现有 run 和已完成的 20 张图，继续补缺，不重新开 session；
- 包满、雷乐、范一鸣、马乐：旧 run 只保留证据，重新开 fresh session；先读本制作单和 actor JSON，再从比例试镜开始。

## 9. 一条演员交付链

`读取事实 → 测量旧照 → 比例试镜 → Owner 选锚点 → 55 张图 → 6 段声音 → Grok 样片 → 审看页`

- 比例试镜不合格：保存拒收证据，自动进入同一演员的 replacement session；不要把不合格身体图当参考。
- 少出图：查询原任务，只补确认缺口；不重复未知请求。
- composer 忙或模型暂时不可用：排队、等待或开独立 replacement；不把可恢复故障当作任务结束。
- 只有预算超限、声贝超过 3,000、音色槽满、外部结果未知、事实缺失或准备发布时才停下来问 Owner。
- Owner 点头前不入库、不改演员状态、不发布；每位演员的审看页必须包含图片、声音、视频和验收数字。

## 10. 比例验收口径

> 2026-10-10 更正：本节原先把“发型最高连续点”当头顶，会把发髻、蓬松发算进头高，系统性地把头身比量小（例：米丽娅姆 5.5 → 实际约 6.3）。该口径作废。现行口径只在 MediaFactory `.agents/skills/mf-actor-pack/references/proportion-review.md`：头骨顶由眼线和下巴推算（含张嘴、俯仰、年龄修正），发型顶只作显示。

目标：严琳 165 cm / 7.25；包满 172 cm / 7.4；雷乐 170 cm / 7.0；范一鸣 168 cm / 7.0；马乐 175 cm / 7.5。

每个 replacement 在交接记录里写 `parent actor`、`replacement index`、累计消息/图片/费用和失败原因；这样换 session 不会丢账，也不会因为一次 trial 上限把演员任务永久停掉。
