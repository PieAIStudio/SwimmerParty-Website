# SWIMMER PARTY — Website

SWIMMER PARTY 是 PieAI Studio 旗下的**合成演员厂牌**：我们设计、制造并授权原创
AI 演员。这个仓库是公开官网和演员资产库。

**我们不找演员，我们造演员。只做动画角色，绝不做真人形象。**
立场的唯一出处是 `src/content/doctrine.ts`；使用规则在 `src/content/kit.ts`。
不摆假客户、假记录，不把未交付的图、未签定的分成写成事实。

## 页面

下表路径前都有 `/zh` 或 `/en`；根路径按语言偏好协商。

| 页面                        | 用途                                       |
| --------------------------- | ------------------------------------------ |
| `/`                         | 白黏土主视觉、厂牌定位、真实统计与名册入口 |
| `/actors`、`/actors/[slug]` | 可出演 / 研发中名册、演员档案与资产入口    |
| `/works`、`/studio`         | 真实片单进展和制作工序                     |
| `/kit`、`/kit/[slug]`       | 开放物料、21 格基础资产、选择和下载        |
| `/casting`、`/pact`         | 合作入口、立场、使用与共赢约定             |

当前名册为 13 位，包括 SP-13 何姐。实际资产仍是 SP-01 的 3 张旧规格、SP-02 的
1 张旧规格；其他人不假装已有定妆板。角色种子没有就明确说明，不生成占位演员照片。

## 本地开发与验证

使用 Node 24 和仓库指定的 pnpm 11。本分支引用两个**尚未发布**的邻接候选 tarball，
不是从任意机器克隆后即可独立安装的正式发布包：

- UIKit：`swimmer-ui-kit-3.0.0.tgz`
- AuthKit：`swimmer-auth-kit-0.8.0-rc.0.tgz`

具体定位以 `package.json` 的 file 依赖为准。校验值与接入授权见[执行计划第 0 节](docs/plans/active/2026-10-03-swimmer-family-rebuild.md)。
候选缺失时先取得已批准的相同候选；不要临时发布或复制另一份品牌组件。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
pnpm docs:check
pnpm exec swimmer-ui-check src
```

`verify` 包含 ICU / 类型 / lint / 格式 / 工具测试 / 构建 / Playwright。开发服务默认
3000；Playwright 自建 3399 的生产构建，使用隔离的合成像素夹具，不修改生产资产清单。
默认配置是 `ASSET_STORE=local`、`ACCOUNT_MODE=mock`、`GUEST_LIMITER=memory`；不用凭据。
模拟会员 cookie 仅用于本机，页面明确显示“本地模拟账号”。

任意存在 `VERCEL_ENV` 的环境只要仍选中 local、mock 或 memory，API 就拒绝服务 503；
本地文件路由直接 404。不能通过预览部署偷偷使用测试身份或本机存储。

## 资产入库

词表在 `src/content/asset-series.json`，已交付清单在 `src/content/assets/*.json`。
基础包是 4 转面、3 头像、14 表情。母版与格位规则见
[演员资产库 spec](docs/specs/active/actor-asset-library.md)。

```bash
pnpm assets:todo SP-03
pnpm assets:ingest SP-01 --dry-run
pnpm assets:ingest SP-01
```

生产人员把符合命名、透明度、尺寸与锚点版本的单张文件放进 `assets-inbox/SP-XX/`。
本地原件进 `.assets-local/`，公开缩略图和预览进 `public/media/assets/`；脚本统一写清单。
两处私有目录、测试字节和 `.devspace-reports/` 都不提交、不进入部署文件追踪。
`--legacy` 只用于保留旧规格原始字节，不是绕过新母版规范的入口。当前四张旧图已迁入。

K-04 / K-05 / K-06 是否开放由真实系列计算，不手工把未来物料改成已交付。
原件不允许在相同键下换内容；重新锁定形象要递增锚点版本。`--dry-run` 只验证、不写文件。

## 下载与账号

游客可取单张原图，按 IP 每 30 秒一张；复制文字与下载双语 `character.json` 不限。
多图下载需要会员；选择保存在当前演员的 sessionStorage，跨语言和登录后保留。
本地原件通过 120 秒 HMAC URL 读取，不暴露为永久公开目录。

会员原图 ZIP 保留实际文件格式，附角色 JSON、英文逐图使用说明和当前语言完整条款。
拼图输出 3840×2160 PNG，可选标签和三种底色，默认无字。按模型包的配置在
`src/content/export-targets.ts`：GPT Image 16 张、Veo 三图包、Seedance 9 张；Seedance 的
官方上限仍待核实。真实数据尚无表情图时，不用空白拼图凑 Veo 三张，界面会说明缺项。

生产模式有三个独立适配器：私有 Vercel Blob、AuthKit Swimmer SSO、Vercel WAF 限速。
这里完成的是本地实现和注入式验证，不代表这些服务已建好或已经连通。

## 正式接入的前置条件

先由 Owner 批准 UIKit 3.0 / AuthKit 0.8 联合发布并切换正式依赖，再另行授权发布与云验收。
正式模式必须同时设置 `ASSET_STORE=blob`、`ACCOUNT_MODE=swimmer`、`GUEST_LIMITER=vercel`。

账号适配器读取 `SWIMMER_BACKEND_URL`、`SWIMMER_PUBLISHABLE_KEY`、`SWIMMER_ACCOUNT_URL`、
`SWIMMER_OAUTH_CLIENT_ID`、`SWIMMER_COOKIE_PASSWORD`（至少 32 字符）。这些是**变量名**，
仓库不存凭据。当前配置要求账号中心明确登记公开 PKCE 客户端、本站 canonical origin 和
AuthKit callback；cookie 与 OAuth 校验交给 AuthKit，不自己实现生产会话。

Blob 适配器让 SDK 解析平台 token / OIDC；私有原件、浏览器签名 URL 跨域读取和生产授权
仍须真实验收。WAF 需登记 `guest-asset-download`，按 IP 每 30 秒 1 次；规则不存在时
接口失败关闭，不回退到内存限速。生产 Analytics 仅在 `VERCEL_ENV=production` 加载，
本地构建没有统计上报。登录邀请只列计划已登记的 University、Directing。

## 技术与内容维护

Next.js 16 / React 19：App Router 静态页面 + Pages Router Node API。UIKit 3.0 `grey`
风格支持浅色 / 深色；SwimmerI18nKit 0.2.0 提供 ICU；R3F / three.js 提供单渲染器、
ACES、一次 sRGB 输出的白黏土舞台。Tailwind 只管布局；fflate 在浏览器生成 ZIP；sharp
用于本地入库。PGS 治理边界和检查保持不变。

只编辑双语源 `tools/gen-messages.py`，再运行：

```bash
python3 tools/gen-messages.py
pnpm exec swimmer-i18n-check types --out src/i18n/message-contracts.ts
pnpm check:i18n
```

公开路由仍为 `/zh` / `/en`，ICU 目录为 `zh-CN` / `en`；不要手改生成的消息 JSON。
结构化产品内容保留 `{ en, zh }`，机器翻译外链继续明确标注并排除在 sitemap 外。

现行设计见 [`DESIGN.md`](DESIGN.md)，AI 入口见 [`AGENTS.md`](AGENTS.md)，
当前阶段见 [current-work](docs/reference/execution/current-work.md)。
