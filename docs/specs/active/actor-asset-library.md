---
id: SPEC-ACTOR-ASSET-LIBRARY
title: AI 演员资产库
type: spec
status: active
canonical: true
owner: human
created: 2026-10-03
last_reviewed: 2026-10-09
domain: product
tags:
  - assets
  - actors
  - i18n
  - downloads
pinned: false
related:
  - ADR-2026-10-03-JOIN-SWIMMER-FAMILY
  - PLAN-SWIMMER-FAMILY-REBUILD
  - REF-CURRENT-WORK
---

# AI 演员资产库

## 问题

传统 AIGC 角色表一次生成一张大图：同一分辨率被十几格平分（现有样例 1672×941，
一张表情脸约 250 px），说明用中文烤进图里，不能换语言、不能复用，也不能按镜头挑。
每个项目于是从头反复调。网站面向全世界，又要把演员资产做成 Swimmer 账号的引流入口。
决定见 [ADR：并入 Swimmer 家族](../../adr/2026-10-03-join-swimmer-family.md)；
执行步骤与设计细节见 [重构计划](../../plans/completed/2026-10-03-swimmer-family-rebuild.md)。

## 目标与不做

1. 每个演员按统一的"系列"框架齐备：转面、面部、表情、服装、动作、细节、文字。
2. 每张图单独、高清、透明底、无文字；所有说明随界面语言变化。
3. 别人点选后单张下载或整包带走；角色表、模型参考包由站点按需拼出。
4. 游客每 30 秒一张高清；Swimmer 账号可多选、打包、拼图。

不做：站内调用生成模型；自建账号；把母版放进 Git。

## 1. 三层模型

| 层   | 是什么                                                              | 谁写                |
| ---- | ------------------------------------------------------------------- | ------------------- |
| 母版 | 单张、透明底 PNG、无文字、规范尺寸                                  | 生产流程（第 5 节） |
| 档案 | `src/content/actors/<slug>/profile.ts` 中的双语资料（沿用现有结构） | 人                  |
| 导出 | 网页预览、单张下载、ZIP、拼图、模型参考包                           | 站点自动派生        |

## 2. 资产系列框架

一个演员 = 若干系列；一个系列 = 若干固定"格位"（slot）。格位是词表里的稳定 key，
格位 id 写作 `{series}.{key}`，服装写作 `wardrobe.{look}.{key}`。

| 系列 series     | 格位                                        | 必交 | 构图        | 母版尺寸  |
| --------------- | ------------------------------------------- | ---- | ----------- | --------- |
| turnaround 转面 | front, three-quarter, side, back            | 是   | 全身        | 1536×2304 |
| face 面部       | front, three-quarter, side                  | 是   | 头肩特写    | 1920×1920 |
| expression 表情 | 基础 12 + 技术态 2（见第 3 节）             | 是   | 头肩正面    | 1920×1920 |
| expression 扩展 | 12 个可选（见第 3 节）                      | 否   | 头肩正面    | 1920×1920 |
| wardrobe 服装   | 每套造型 × front, three-quarter, side, back | 否   | 全身        | 1536×2304 |
| pose 动作       | walk, run, sit, point, arms-crossed, phone  | 否   | 全身 3/4 侧 | 1536×2304 |
| detail 细节     | hands, hair-back, prop                      | 否   | 特写        | 1920×1920 |
| 文字            | 角色种子、档案 JSON、授权说明               | —    | —           | —         |

必交合计 4 + 3 + 14 = **基础包 21 张**。页面上必交格位永远显示（未交付就显示
"待交付"空位，同时是出图清单）；可选系列有了第一张才出现。

## 3. 母版规范 v2

出图模型 GPT Image 2.5。OpenAI 文档（2026-10 核实）：支持透明背景；宽高为 16 的
倍数；像素数不超过 2560×1440（3,686,400）为稳定档，最高 3840×2160 为实验档；
编辑接口最多 16 张参考图。v1 只用稳定档，上表尺寸都在稳定档内。

- 透明背景 PNG（`background: transparent`）；网页按明暗铺底，导出给 AI 时铺中性底。
- 中性柔光；不加彩色轮廓光、地面投影或入画灯具（参考图里的布光会被模型学走）。
- 同一造型内服装、发型一致；无文字、无水印、无边框。
- 新交付统一使用 941×1672（9:16）透明 PNG；仍接受 v1 的精确画幅，用于已有生产物。
- 入库会把 alpha ≤3 归零、≥250 归满，并记录透明人物的 `bbox` 百分比；拼图和身高刻度使用实测边界。
- 同一母版内容使用 `<slug>/<sha256 前 16 位>/<文件名>` 对象键；原文件摘要保存在 `sourceSha256`。
- 命名 `{code}__{series}__{key}__v{n}.png`，服装 `{code}__wardrobe-{look}__{key}__v{n}.png`。
- 锚点：`face.front` 与 `turnaround.front`。改形象就升锚点版本、整套重出。
- **旧规格（legacy）**：v1 之前已交付的黑底 WebP（SP-01 三视图、SP-02 正面）按原样
  入库并标 `legacy`，可浏览可下载，界面注明"旧规格"；新规格交付后替换。

表情词表（key — 中 / 英标签 — 出图用英文表演指导）：

- 基础 12：neutral 平静、smile 浅笑、laugh 大笑、sad 难过、cry 哭、annoyed 烦躁、
  angry 发怒、surprised 惊讶、scared 害怕、disgusted 嫌弃、embarrassed 窘迫、tired 疲惫。
- 技术态 2：speaking 说话中（张嘴露牙）、eyes-closed 闭眼。
- 扩展 12：worried 发愁、skeptical 怀疑、smug 得意、contempt 不屑、confused 困惑、
  thinking 思考、determined 坚定、shy 害羞、pain 吃痛、sleepy 犯困、
  awkward-smile 尴尬笑、deadpan 面无表情。

原则：参考价值最高的是离中性脸变形最大的表情（大笑挤眼、哭、发怒、张嘴露牙），
模型最容易在这里"换脸"；细微状态可由平静推出。英文表演指导的原文在重构计划附录。

## 4. 数据与多语言

- 演员档案从生产资料生成到 `src/content/actors/<slug>/profile.ts`（`L = { en, zh }` 与双语规格行），新增可选
  `heightCm`（身高刻度用）；移除 `plate`、`views`、`accent`。
- 词表：`src/content/asset-series.json`（key、尺寸、必交、构图、英文指导），类型与
  读取函数在 `src/features/assets/asset-series.ts`。
- 造型注册在 `media-pack/actors/<slug>.json`；资料生成器仅拥有清单 looks，入库工具拥有 items，不手工维护生成副本。每项记录
  `slot`、`series`、`key`、`look`、`conformance`（`v1` / `legacy`）、`version`、
  `width`、`height`、`bytes`、`sha256`、`sourceSha256`、`bbox`、`format`、`object`（母版对象键）、`preview`、`thumb`。
- 所有界面文字（系列名、格位名、按钮、提示）进 I18nKit 目录，源头是
  `src/i18n/messages.source.ts`；安装版本以 package.json 为准。
- 给模型的文字（种子、表演指导、参考包说明）以英文为准，不随界面语言变。
- 图上永远没有字；"给人看"的拼图可选加中文或英文标签，由浏览器在导出时画上。

## 5. 生产流程

1. 锁脸：出 `face.front` 与 `turnaround.front`，Owner 认可后定为锚点 v1。
2. `pnpm assets:todo <code>` 列出缺的格位，每格附可直接粘贴的英文出图提示词。
3. 以锚点为参考图逐格生成（一张张做或批量做都可以），与锚点并排验收，不过就重出。
4. 放进 `media-pack/library/staging/<code>/`（不进 Git），在交接单
   `media-pack/notes/handoffs/` 留下批次记录，再运行 `pnpm assets:ingest <code>`。

生产角色名不等于演员身份。实际交付和公开状态分别以生产资料及资产清单为准；已发布资产不可因旧计划重新置空。

## 6. 存储与分发

- 预览（长边 1024 与 384 的透明 WebP）随站点发布，公开。
- 母版放 **Vercel Blob 私有存储**，用 Owner 已有的 Vercel Pro 会员，不新开服务。
  下载 API 校验身份与限速后，用 Vercel Signed URLs 签出短时效链接，文件由 Vercel CDN
  直接发给用户，不经过网站函数。
- 开发与测试用本地存储适配器（`.assets-local/`），不连云。
  存储取舍见 [当前决定](../../reference/decisions.md)，历史估价只留在 Git，不作为现行费用承诺。

## 7. 访问分级与引流

| 能力                              | 游客                   | Swimmer 账号 |
| --------------------------------- | ---------------------- | ------------ |
| 浏览全部预览、复制种子、档案 JSON | ✓                      | ✓            |
| 单张高清母版                      | 每 30 秒 1 张          | 不限         |
| 多选下载、打包、拼图、模型参考包  | 可选中，下载时引导登录 | ✓            |

- 限速：Vercel WAF（`@vercel/firewall`），只对游客按 IP 计数；它是引导不是防盗。
  界面倒计时 + 登录邀请，不显示错误页。窗口秒数是一个常量。
- 登录：账号中心 `accounts.swiminai.com` 的 SSO（AuthKit `createNodeAuth` 的 `sso`）。
- 登录提示只描述已提供能力，不把其他产品的未验证状态当作承诺。
- 当前社区不接生产数据库；产品事件只走 PostHog，白名单见 src/features/analytics/events.ts。

## 8. 导出

| 方式       | 结果                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 原图打包   | 每张保留实际原始格式（v1 PNG，legacy WebP）+ `character.json` + `README-for-AI.txt` + `LICENSE.txt` |
| 拼成一张   | 选中图自动排成一张 16:9 PNG，可选标签语言与底色                                                     |
| 按模型打包 | GPT Image 2.5 ≤16 张原图；Veo 3.1 恰好 3 张（正脸 + 转面拼图 + 表情拼图）；Seedance 2.0 ≤9 张       |

参考图上限（2026-10）：GPT Image 2.5 为 16（OpenAI 文档）；Veo 3.1 为 3（Google 文档
"up to three asset images of a single person"）；Seedance 2.0 为 9（第三方资料，待官方
核实）；可灵待核实。上限写在一张带核实日期的数据表里，变了只改表。

## 验收

- 站内与所有下载物的图片都没有烤入文字；切换语言只改界面与说明，不改图片文件。
- 入库脚本能接收 v1 与 legacy；`/kit` 与资产页的"已开放 / 待交付"由清单计算。
- 游客窗口内第二次下载得到倒计时与登录邀请；会员不受限，可打包、拼图、按模型打包。
- Veo 导出恰好 3 张，GPT Image ≤16，Seedance ≤9，说明文字逐张对应。
- `pnpm verify` 通过，Playwright 覆盖上述行为（模拟会话与本地存储）。

## 待定

1. Seedance、可灵的官方参考图上限。
2. 真实 SSO、Blob、WAF 与移动实机验收。品牌依赖已锁定 UIKit `3.0.0-rc.1` / AuthKit `0.8.0-rc.1`；正式域名是 `https://swimmerparty.swiminai.com`，上线操作见 [release.md](../../reference/release.md)。
