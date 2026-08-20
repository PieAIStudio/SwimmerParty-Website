# SWIMMER PARTY — Website

SWIMMER PARTY 是 PieAI Studio 旗下的**合成演员厂牌**：我们设计、制造并授权原创
AI 演员。这个仓库是它的公开官网。

站点定位一句话：**我们不找演员，我们造演员。**

## 这个站在讲什么

| 页面             | 作用                                                  |
| ---------------- | ----------------------------------------------------- |
| `/`              | 主舞台。3D 白膜展台 + 定位主张 + 名册入口             |
| `/actors`        | 演员名册。可出演 / 研发中分区                         |
| `/actors/[slug]` | 演员档案。定妆板 + **规格书**（本站的招牌视觉）+ 档期 |
| `/works`         | 片单。在做什么，做到哪一步                            |
| `/studio`        | 工作室。一个演员是怎么被造出来的                      |
| `/casting`       | 合作。授权出演 / 定制演员 / 联合出品                  |

## 内容诚实规则

这是一个要拿去谈商务的站，对方会去核实。所以：

- 不摆假客户 logo、假播放量、假获奖、假出演记录。
- 没有交付定妆板的演员，名册上就明写 `IN DEVELOPMENT`，展示白膜，不用生成图冒充。
- 片单只写真实进度（`SHOOTING` / `WRITING` / `DEVELOPMENT`）。

一个新厂牌承认自己新，比伪造五十个 campaign 可信一百倍。

## 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm verify       # typecheck + lint + format + build
```

## 技术栈

- **Next.js 16**（App Router，全静态预渲染）— 名册必须能被搜到
- **React Three Fiber + three.js** — 白膜展台。单渲染器、ACES、一次 sRGB 编码、DPR 钳制
- **@pieai/swimmer-ui-kit** — 品牌 UI 库，本站通过 `[data-game-ui-theme='acid']` 主题消费
- **Tailwind CSS 4** — 排版与布局
- **PGS**（`@pieai/pro-gov` / `@pieai/doc-gov`）— 治理、版本与边界

设计系统与主题决策见 [`DESIGN.md`](DESIGN.md)。AI 协作入口见
[`AGENTS.md`](AGENTS.md)。
