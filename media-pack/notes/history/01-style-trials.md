# 风格试验 01：夸张程度 A / B / C

目的：在美学提示词原文完全一样的前提下，只改变"夸张程度"一段，比较三档效果，并确认 ChatGPT 实际输出的尺寸和背景。

- 只用文字描述人物，不上传参考图。参考图会把人物拉回原图的夸张程度，干扰比较。
- 每张图新开一个对话，避免 ChatGPT 去改上一张图。
- 出图工具：ChatGPT 网页版（项目"Claude"），2026-10-04。

## 共同部分

每条消息的结构：开头一句"请原样传给图像模型"，然后依次是美学原文（一字不改）、夸张程度一段、人物、构图、光线、背景。

```text
Generate one brand-new image. Pass the prompt below to the image model exactly as written. Do not rewrite, shorten, translate or add to it.

Premium 3D feature-animation style: characters clearly stylized and visibly animated;
environment more realistic than the characters; bright, airy, relaxed mood;
high-key midtone-bright exposure; soft global illumination; open readable shadows;
low-to-medium contrast; rich midtones; clean polished 3D environment.
No gritty realism, no dirty cyberpunk, no noir, no muddy shadows, no crushed blacks.
Prioritize animated stylization over realism.

{STYLIZATION}

Character: {CHARACTER}
Framing: head and shoulders, facing the camera directly, eye level, eyes at about 42% of the image height, horizontally centered.
Expression: relaxed resting face, mouth closed, calm open eyes.
Lighting: soft, even, neutral-white studio light from the front. No colored rim light, no visible lamps.
Background: fully transparent. No text, no watermark, no border.
Output: square PNG with a transparent background.
```

## 夸张程度三档

**A（接近参考图 1、3）**

```text
Stylization level A: classic animated-feature human — noticeably large expressive eyes, slightly enlarged head, soft rounded features with gentle exaggeration. Unmistakably CG; never photoreal.
```

**B（介于两者之间）**

```text
Stylization level B: semi-stylized animated human — moderately enlarged eyes, near-realistic head and facial proportions with gentle simplification. Unmistakably CG; never photoreal.
```

**C（接近参考图 2 的五官，但明亮干净）**

```text
Character stylization (fixed for every SWIMMER PARTY actor): semi-stylized 3D feature-animation human — more realistic than classic animated features, yet unmistakably CG at first glance; never photoreal.
Realistic adult body proportions; head not enlarged.
Eyes only slightly larger than real, with clear irises and soft catchlights; no oversized cartoon eyes.
Nose, ears and jaw follow real anatomy with gentle simplification; no caricature.
Skin smooth with soft subsurface scattering; no pores, no fine facial hair, no photographic skin detail.
Hair sculpted into clean grouped clumps.
Clothing in clean, readable fabric shapes; no grime, no heavy weathering.
```

## 人物

**戴尔（SP-03）**

```text
a man in his late twenties of Russian descent who grew up in Chongqing, with European facial features, tousled medium-length light-brown hair, light stubble, slim build, wearing a black open-collar shirt under a black suit jacket
```

**何姐（SP-13）**

```text
a 43-year-old Chinese woman from Chongqing, warm and hard-working, dark brown hair loosely tied in a low bun with a few soft strands framing her face, faint smile lines, wearing a cream short-sleeved collared blouse under a light blue-grey apron with ruffled edges
```

## 结果

| 文件 | 人物 | 档位 | 实际尺寸 | 透明背景 | 备注 |
| ---- | ---- | ---- | -------- | -------- | ---- |
| 01-戴尔-A.png | 戴尔 | A | 1254×1254 | 是 | 一眼是 CG：眼睛偏大、皮肤平滑，接近参考图 1 但没那么夸张 |
| 02-戴尔-B.png | 戴尔 | B | 1254×1254 | 是 | 太像真人：缩小看几乎像修过的照片 |
| 03-戴尔-C.png | 戴尔 | C | 1254×1254 | 是 | 太像真人，和 B 很接近 |
| 04-何姐-A.png | 何姐 | A | 1254×1254 | 是 | 一眼是 CG：大眼睛、红脸颊，接近参考图 3 |
| 05-何姐-B.png | 何姐 | B | 1254×1254 | 是 | 偏真人，皮肤略有 CG 平滑感 |
| 06-何姐-C.png | 何姐 | C | 1254×1254 | 是 | 偏真人，比 B 更收敛 |

## 发现

1. **透明背景可以直接出**：6 张都是带透明通道的 PNG，四角完全透明。
   人物部分的不透明度是 253/255（约 99%），肉眼看不出；入库时可以把 ≥250 的值补成 255。
2. **方形图固定是 1254×1254**，和规范写的 1920×1920 不一样；全身竖图的尺寸还没测。规范和入库工具要按实际输出调整。
3. **夸张程度不是线性的**：一旦去掉"眼睛明显放大"这类描述，GPT Image 2.5 会直接跳到接近照片的写实，B 和 C 差别很小。
   参考图 2（胡谦）看起来是 CG，主要靠的是材质和头发的风格化，不是靠五官比例。
4. **判断（主观，需要 Owner 确认）**：只有 A 稳定地"一眼是 CG"。下一轮应该在 A 和 B 之间找，
   并且用材质、皮肤、头发这些"CG 标记"来压住写实，而不是只调眼睛大小。
5. **流程**：每张图约 1–2 分钟（Pro 模型）。可以连续开多个对话同时生成，再逐个下载。
   下载按钮在看图界面右上角；桌面版浏览器会把文件存成 ~/Downloads 里的临时文件名，再复制出来。
