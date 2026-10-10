# 范一鸣（fan-yiming）端到端生产交接（试镜关口暂停）

- 日期：2026-10-09
- 演员：范一鸣 / `fan-yiming`
- MediaFactory 运行单：`run-mv0etd90-1275564d`
- 网页路线：ChatGPT 订阅路线，Pics-A 独立对话
- 对话：`https://chatgpt.com/g/g-p-6ac396efc218819190830b751d24ab00-pics-a/c/6ac86391-4fe4-83e9-94f1-6273533bdee6`
- 试镜消息：3/3（已达到该阶段上限）
- 实际收到图片：8 张（第一轮 3、第二轮 3、第三轮 2）
- 费用记账：`subscription`，不读取余额

## 结果

旧照 `CC-052.png` 和三轮新候选都没有达到制作单要求的成人比例，未接受身体锚点，因此没有开始 55 张全套图片、6 段声音或 Grok 样片视频。运行单已暂停，`staging/` 保持为空，演员 JSON、`pack.json` 和发布状态未修改。

制作单目标：168 cm、约 7.0 头身、头顶到下巴约 24 cm。测量方法是直接在原始 941×1672 PNG 上标记最高连续头发冠部、下巴/山羊胡下缘和鞋底，使用 `(鞋底Y - 冠部Y) / (下巴Y - 冠部Y)` 计算头身比，人工标记误差约 ±6 px。完整数据和比例检查图见：

- `library/actors/fan-yiming/evidence/fan-yiming__proportion-measurements.json`
- `library/actors/fan-yiming/evidence/fan-yiming__measurement__*.png`

最佳候选是第二轮 candidate-3，约 6.027 头身，仍低于 7.0；第三轮两张约 5.69 头身。所有候选均拒收。

## 图片证据

所有文件均为 941×1672、RGBA、带透明通道、单人正面全身，但比例不通过，留在 `library/actors/fan-yiming/evidence/rejected/`：

- `fan-yiming__audition__round-1__candidate-1.png` — SHA-256 `d8aceb02323b4b19d89902d927073a1b86b057ce7ffd3ed93403682ba0c2b21f`
- `fan-yiming__audition__round-1__candidate-2.png` — SHA-256 `333004e6e51ab99b19841ecc996fb920416a8488efecb9b875cfeebd19efef96`
- `fan-yiming__audition__round-1__candidate-3.png` — SHA-256 `fa13db30b7109eda56315caeb11796ebc71ea4a4e44b36592e117638b229255c`
- `fan-yiming__audition__round-2__candidate-1.png` — SHA-256 `885ffe663add7e6908aef5d9f3cf7f8511c851922d09c9cc9ebbe9ef562e36a0`
- `fan-yiming__audition__round-2__candidate-2.png` — SHA-256 `2752c4c323386aee7b8a75d2e53dcab79c36794d0d21ea59c87d0cb60b558492`
- `fan-yiming__audition__round-2__candidate-3.png` — SHA-256 `a55b935e3b3b609bf5f00b2833f9dafd1cf44adf51cb6acc4f8ddfdfd490d847`
- `fan-yiming__audition__round-3__candidate-1.png` — SHA-256 `b1af310a07c85337fbf3977e56371fff8e7061cdf570af15eb952469d89cff1b`
- `fan-yiming__audition__round-3__candidate-2.png` — SHA-256 `c2a915439e5ee9a56963d98316107739f27e9d60864db9d908acc0859d629ff1`

旧照只作为脸部和发型参考：`library/claude-casting-2026-10-07/final/CC-052.png`，SHA-256 `80749bf84f85e5ee648321d075061d676483bb7bffc1adc26414837dbf5bbb35`；未作为身体锚点。

## 继续条件

当前运行单可以从 `run-mv0etd90-1275564d` 恢复，但必须先提供一个通过约 7.0 头身测量的范一鸣身体锚点，或由 Owner 明确批准新的可行出图路线。获得合格锚点后，才能按制作单继续 55 张图片、6 段声音和 Grok 样片；在此之前不应把拒收图复制到 staging，也不应修改演员状态或发布。

- 页面证据截图：`library/actors/fan-yiming/evidence/fan-yiming__chatgpt-proof.png`
- 当前运行单记账修订后累计：3 条消息、8 张图片（订阅路线）。
