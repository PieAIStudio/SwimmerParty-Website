# Grok 视频路线：用命令行，不用网页

Claude 写，2026-10-09。用于"同一个人"样片（第七轮计划第 7 节、第 7.5 轮计划第 6.4 节），以后其他视频也可以沿用。

MediaFactory 第二轮重构结束后，请把这份收进 MediaFactory 的 `docs/reference/routes/grok-cli.md`，作为唯一出处，这里改成一句链接。

## 为什么用命令行

本机装的 Grok 命令行（Grok Build，`~/.grok/bin/grok`）自带出图、改图和视频工具，还附了官方使用技能 `~/.grok/bundled/skills/imagine/SKILL.md`。

| 比较项                 | 命令行（采用）                                                 | 网页版                                       |
| ---------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| 用我们自己的演员图     | 可以，直接给本地文件路径，当第一帧或参考图                     | 要靠点按钮上传                               |
| 拿到文件               | 直接存成本地文件                                               | 要靠点击下载，容易拿错文件                   |
| 和 ChatGPT、MiniMax 抢浏览器 | 不占浏览器，可以和它们同时进行                           | 占浏览器，只能排队                           |
| 记录                   | 输出 JSON，能写进运行日志                                      | 只能截图                                     |
| 使用方法               | 官方技能已经写好                                               | 要另外写一份操作说明                         |

网页版只作为备用，比如命令行登录不上的时候。

## 前提：Owner 先登录一次

Claude 2026-10-09 实测，命令行提示"Not signed in"：网页登录不等于命令行登录。

**已完成**：2026-10-09 Owner 已经登录。以后如果检查命令又返回 "Not signed in"，就请 Owner 再运行一次：

```bash
~/.grok/bin/grok login
```

浏览器会打开，用订阅账号登录。不要用 `XAI_API_KEY`，那是另外按量计费的 API，要 Owner 另行决定。

**检查是否登录成功**（花费极少）：

```bash
~/.grok/bin/grok -p "Reply with OK only." --output-format json
```

返回 `OK` 就是登录成功。还没登录，就停下来告诉 Owner，不要尝试别的登录方式。

## 实测结果（Claude，2026-10-09 02:20）

- **登录**：Owner 已用设备码完成命令行登录，显示 "Signed in as PIEAI@HOTMAIL.COM"。检查命令返回 OK。
- **测试做了什么**：唐韵秋的正面全身图，先垫上浅灰底当第一帧，透明原图放进 `images`。参数是 9:16、6 秒、480p，动作是挥手加镜头推近。
- **结果**：
  - 视频直接存成本地 mp4，约 1.1 MB，480×848，24fps，时长 6.04 秒；
  - 首帧是唐韵秋，中段挥手，结尾推到半身，脸、发型、衣服都稳定；
  - 命令行报告的花费是 0.035 美元（检查命令约 0.014 美元），看起来走的是订阅额度；
  - 一次调用要跑 3 轮 agent。
- **音轨**：视频自带一条环境音（平均 -32 dB），不是演员的声音。**样片一律去掉音轨**：

  ```bash
  ffmpeg -i in.mp4 -an -c:v copy out.mp4
  ```
- **透明图垫底**，生成第一帧时用：

  ```bash
  ffmpeg -f lavfi -i color=c=0xE8E6E1:s=941x1672 -i front.png -filter_complex "[0][1]overlay=format=auto" -frames:v 1 front-grey.png
  ```

  正式样片用 ChatGPT 生成的场景图当第一帧，效果更好。

## 视频工具 `reference_to_video` 的要点

完整说明见官方技能，下面是我们用得到的部分：

- **参数**：
  - `first_frame`：钉死为第一帧的图；
  - `images`：最多 14 张参考图，用来保持身份；
  - `prompt`：必填；
  - `aspect_ratio`：必填，我们用 `9:16`；
  - `duration`：1 到 15 秒，我们用 6 秒；
  - `resolution_name`：用 `720p`。
- **参考图会被缩到长边约 768 像素**，所以细节不要靠参考图传。
- **不用 `voices`**：那是 Grok 的预设声音，不是我们演员的声音。视频不带人声；以后要配音，用演员自己的 MiniMax 声音另外合成。
- **遇到内容审核拦截就停**：不改写提示词去绕开，记进日志，告诉 Owner。
- 订阅档才能用视频工具。返回"需要升级"就停下来。

## 做"同一个人"样片的流程

每位可出演演员：唐韵秋、罗米沙、张强、陈伟。

1. **两张场景图**，用 ChatGPT 网页，照选角配方：
   - 上传懒人包里的正面全身和正面头像；
   - 用角色提示词，加一个日常场景描述；
   - 9:16，不透明背景。
2. **一段视频**，用 Grok 命令行：
   - 拿第 1 步的一张场景图当 `first_frame`；
   - 演员的正面全身、正面头像放进 `images` 保持身份；
   - 6 秒，720p，9:16。
   - **不要直接拿透明底的演员图当第一帧**，透明底动起来容易出黑底或贴纸感。
3. **命令模板**：每次只做一段，`$OUT` 是输出目录：

   ```bash
   ~/.grok/bin/grok --always-approve --output-format json --cwd "$OUT" -p "Use the reference_to_video tool exactly once and nothing else. first_frame: $OUT/<scene>.png. images: $ACTOR/front.png, $ACTOR/face.png. aspect_ratio: 9:16. duration: 6. resolution_name: 720p. prompt: '<一两句英文：一个瞬间、可见的位移、一个镜头运动>. Animated 3D feature-film character, not photoreal.' Save the video as $OUT/<slug>__sample__video-01__v1.mp4 and reply with only the saved path."
   ```
4. **提示词写法**：
   - 一个瞬间；
   - 动作写成画面里的位置变化（"从画面左边走到中间"），不要只写"走动"；
   - 配一个简单的镜头运动（慢慢推近、环绕）；
   - 不写真人名字。
5. **验收**：
   - 用 ffmpeg 取首帧和尾帧，确认人物确实动了；
   - 确认还是这位演员，对照 `media-pack/checks.md`；
   - 确认是动画，不写实。
6. **文件**：
   - 存到 `media-pack/library/samples/<slug>/`；
   - 命名：`<slug>__sample__image-01__v1.png`、`<slug>__sample__image-02__v1.png`、`<slug>__sample__video-01__v1.mp4`；
   - 运行日志记下每次的命令、用时、结果。
7. **先做唐韵秋一位给 Owner 看**，Owner 点头后再做另外三位。之后照第七轮计划第 7 节，作为官方帖子发到"作品"。
