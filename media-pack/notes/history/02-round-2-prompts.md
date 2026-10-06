# 第二轮：A 档 + 生活感 + 正常头身比 + 9:16 竖图

Owner 对第一轮的反馈（2026-10-04）：

- A 档方向对。
- 但戴尔太帅、太像模特。要有真人的种族特征和生活感，长相不完美，是"现实人物的轻微夸张"。所有人种都按这个逻辑。
- 头身比按正常人。CG 感只放在五官的渲染上；服装等其他部分越真实越好，走干净的写实质感。
- 不要方形图，只用 16:9 或 9:16，并测试最高分辨率。

## 项目提示词（已写入 ChatGPT 的"Claude"项目）

项目记忆在建项目时就已经是"仅项目内"，不用改。项目提示词全文：

```text
This project makes reference images for SWIMMER PARTY's AI actors: original, fictional characters who must read as CG at first glance — never photoreal, never the likeness of a real person.

When I ask for an image:
1. Pass my image prompt to the image model exactly as written. Do not rewrite, summarize, translate, embellish or "improve" it. If something is unclear, ask me instead of guessing.
2. Every image prompt must contain the AESTHETIC block below word for word. If my message lacks it, add it unchanged at the top. Never paraphrase it.
3. Generate exactly one image per request unless I ask for more. Always start a brand-new image unless I explicitly ask you to edit one.
4. Never add text, labels, captions, watermarks, borders, logos or extra people.
5. Aspect ratio is either 9:16 (portrait) or 16:9 (landscape), as I specify. Never square. Use the highest resolution available.
6. When I attach reference images, I number them and state each one's role (e.g. "Image 1: identity anchor"). Keep the person's identity exactly; change only what I ask.

CHARACTER RULES (apply to every actor):
- Realistic adult head-to-body proportions, like a real person. Never an enlarged head.
- Faces look like real, ordinary people of their ethnicity, with distinctive, imperfect features and a slight exaggeration of their natural traits. Lived-in, not idealized: no model looks, no flawless beauty.
- The CG signal lives in how the face is rendered (slightly enlarged expressive eyes, smooth simplified skin shading, hair sculpted into clean clumps). Everything else — clothing, fabrics, accessories — is realistic and clean.

AESTHETIC (verbatim, required in every image prompt):
Premium 3D feature-animation style: characters clearly stylized and visibly animated;
environment more realistic than the characters; bright, airy, relaxed mood;
high-key midtone-bright exposure; soft global illumination; open readable shadows;
low-to-medium contrast; rich midtones; clean polished 3D environment.
No gritty realism, no dirty cyberpunk, no noir, no muddy shadows, no crushed blacks.
Prioritize animated stylization over realism.
```

## 第二轮的造型描述（A2）

```text
Character stylization (A2): 3D feature-animation human with realistic adult proportions — real head-to-body ratio, normal head size, natural neck and shoulders.
Face: an ordinary, real-looking person of their ethnicity with distinctive, imperfect features, gently exaggerated from life. Not idealized, not model-like, not glamorous.
CG rendering of the face only: slightly enlarged expressive eyes with clear irises and soft catchlights; smooth, simplified skin shading with soft subsurface scattering and no pores; hair sculpted into clean grouped clumps.
Clothing, fabrics and accessories: realistic materials, true-to-life fit and detail, clean and well kept.
Unmistakably CG at first glance; never photoreal.
```

## 人物（加入了具体、不完美的长相特征）

**戴尔**（沿用原角色表的大鼻子、大耳朵、乱发、胡茬）：

```text
an ordinary-looking man of Russian descent in his late twenties who grew up in Chongqing: long narrow face, prominent slightly crooked nose, ears that stick out a little, heavy brows, deep-set grey-blue eyes, uneven light stubble, thin lips, tousled light-brown hair that is overdue for a cut; lanky build with slightly rounded shoulders; black open-collar shirt under a black suit jacket that fits a little loosely
```

**何姐**：

```text
an ordinary 43-year-old Chinese woman from Chongqing who works in a small home-style restaurant: round face with full cheeks, broad nose, smile lines and faint crow's feet, a few grey strands in dark brown hair loosely tied in a low bun, sturdy build, practical posture; cream short-sleeved collared blouse under a light blue-grey apron with ruffled edges, dark grey midi skirt, flat black shoes
```

## 镜头（每人 2 张，共 4 张）

- **正脸近景**：`Framing: vertical 9:16. Head and upper chest, facing the camera directly, eye level; eyes at about 38% of the image height, horizontally centered. Expression: relaxed resting face, mouth closed, calm open eyes.`
- **正面全身**：`Framing: vertical 9:16. Full body from head to feet, facing the camera directly, relaxed natural standing pose, arms slightly away from the body; crown of the head at about 5% and soles of the feet at about 96% of the image height, horizontally centered. Expression: relaxed resting face.`

两种镜头都附加以下输出要求：

```text
Lighting: soft, even, neutral-white studio light from the front. No colored rim light, no visible lamps.
Background: fully transparent. No text, no watermark, no border.
Output: vertical 9:16 PNG with a transparent background, at the highest resolution available (ideally 2160×3840).
```

## 结果

| 文件 | 人物 | 镜头 | 实际尺寸 | 透明背景 | 备注 |
| ---- | ---- | ---- | -------- | -------- | ---- |
| 11-戴尔-A2-近景.png | 戴尔 | 正脸近景 | 941×1672 | 是 | 有辨识度：长脸、歪鼻、招风耳、浓眉；不再是模特脸，仍是 CG 渲染 |
| 12-戴尔-A2-全身.png | 戴尔 | 正面全身 | 941×1672 | 是 | 正常头身比，瘦高略含肩，西装写实 |
| 13-何姐-A2-近景.png | 何姐 | 正脸近景 | 941×1672 | 是 | 圆脸、宽鼻、笑纹、几缕白发；像普通中年人，仍是 CG 渲染 |
| 14-何姐-A2-全身.png | 何姐 | 正面全身 | 941×1672 | 是 | 正常头身比，敦实，围裙和裙子写实；脸和近景那张不是同一个人 |

## 发现

1. **4K 在 ChatGPT 网页版做不到**：提示词里要求 2160×3840，实际下载仍是 941×1672。
   看图界面的"Resize"只能改比例（1:1、3:4、9:16、4:3、16:9），不能改分辨率。
   三种比例的总像素都约 157 万：方形 1254×1254，竖图 941×1672，横图 1672×941。
   真要 4K，只能走 OpenAI API（官方文档写最高 3840×2160，2560×1440 以上算实验性，按张付费），或者事后用放大工具。
2. **A2 方向对**：两个人都有了真人的长相特征和生活感，头身比正常，服装写实，脸部渲染仍是 CG。
3. **同一段文字分开出两次，就是两个人**：戴尔、何姐的近景和全身各像两个人。一致性必须靠"锚点图"。
   不用上传文件的办法：在同一个对话里先出锚点，再让 ChatGPT 以"上面那张图"为身份依据继续出其他镜头。
