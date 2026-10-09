# SWIMMER PARTY — Design System

本文是本站唯一的现行设计系统说明。历史取舍保留在
[并入 Swimmer 家族 ADR](docs/adr/2026-10-03-join-swimmer-family.md)；
重构验收记录见 [健康重构记录](docs/plans/completed/2026-10-04-healthy-site-refactor.md)。

## 定位与内容

名册上的演员是产品，网站是清楚、安静的展示与取用入口。只做动画角色，绝不做真人形象。
立场从 `src/content/doctrine.ts` 取，使用条款从 `src/content/license.ts` 取，不复制另一套说法。
不虚构交付、客户、片单进展或分成；没有图就是研发中，没有已锁定形象就没有种子。

## 主题与字体

UIKit 3.0 的 `grey` 风格是唯一控件风格，明暗为 `light` / `dark`。`<html>` 同时设置
`data-game-ui-style` 和 `data-game-ui-theme`。页头内联脚本在绘制前读取本地偏好；
没有偏好就跟随系统。主题切换不改语言、不重建选择状态。

`src/app/globals.css` 引入 UIKit 的 `styles.css`、`fonts.css`，不引入其 Tailwind 桥。
本站只把背景、前景、卡片、弱表面、分隔线与禁止色映射到 UIKit token。组件不写私有
色板，不给演员分配专属颜色；导出文档与署名标展示底色是明确隔离的例外。

拉丁标题为 Baloo 2，正文为 Geist；中文使用 UIKit 默认的资源圆体，不覆盖字体 token、不描边补重。
等宽字体只服务编号、版本和身高数字。英文界面句首大写；品牌、编号保持原样。

字号、字重、行高及中文差异的数值只在 src/app/globals.css，不在本文维护副本。

自定义布局类放在 `@layer components`，中文差异用 `:lang(zh)`。不用 CSS 强制全大写。

## 布局与控件

容器、间距、圆角与断点以 src/app/globals.css 的布局类为准。卡片安静，状态标签统一使用 UIKit GameBadge，不用颜色单独传递含义。
`SectionHead` 按眉标、标题、说明排列，不加编号和装饰线。

控件直接从 `@pieai/swimmer-ui-kit` 具名导入，不复制或改造 UIKit 的轮廓、阴影、按压形变。
普通操作用 secondary `GameButton`；单张下载、主题、菜单、关闭用带 label 的
`GameIconButton`。勾选、分段选择、模型下拉、提示和真实进度分别用 `GameCheckbox`、`GameSegmentedControl`、`GameSelect`、`LiquidPopover`、`GameToast`、`GameProgress`；图标统一用 `GameIcon`。

主操作用 primary（潮汐液体 CTA），每个页面区域只有一个：页头未登录时的“用泳者账号登录”、首页“免费领取演员资产”、演员页“领取懒人包”和选图工具条“下载所选”、选角单“下载选角包”（空时“去挑演员”）、授权页“复制署名”、工作室“找我们合作”、404“回名册”，以及冷却提示里的登录。页头登录可以和页面主操作同屏。
首页手机文字链接放到主按钮下方；长用途标签限制在容器内，完整文字仍可从提示和辅助技术读取。
跳转类主操作用 `href` 与站内 `Link`；其余导航是文字链接。弹层里只有确认按钮是 primary，其余是 secondary。
液体仅用于 primary、`LiquidPopover` 与 `GameProgress` 的液面；不使用额外液体特效。所有输入有明确可访问名称，
菜单与弹窗支持键盘、Esc、关闭后回到触发位置；不依赖颜色表达状态。

## 角色图与演员页

统一使用 `ActorPicture` 和准确 `sizes` 的 `next/image`。摄影棚背景为 `sp-sweep`：
顶部到 58% 保持背景纸色，再过渡到地面色。

- v1 透明图 contain；全身贴底、上留 4%，加独立接地影，头像居中无影。
- legacy 保留原图黑底，按照片 cover，明确标记“旧规格”；不伪装透明，不叠身高刻度。
- 未交付显示 `Mannequin` SVG 白膜或空格文字，不用生成图冒充。

演员页就是资产库：上面是档案和“领取懒人包”，下面是完整的选图、声音、提示词和署名规则。旧的 `/actors/<slug>/assets` 与 `/kit/<slug>` 永久跳到 `/actors/<slug>#assets`。

基础包固定 21 格：4 转面、3 头像、14 表情。缺图格不可选择、不可下载；可选服装、姿态、
细节等系列只在实际交付后出现。进度只计算真实清单。旧规格计入已交付，但保持独立标识。
数据与母版的唯一规范是[演员资产库 spec](docs/specs/active/actor-asset-library.md)。

资产格全身 2:3，手机 / 中屏 / 桌面 2 / 3 / 4 列；头像 1:1，对应 3 / 4 / 6 列。
间距 12px / 16px；标签不烤入图片。选择外框与图片内部区域分离，空格不放交互控件。
工具条粘在页头下方；手机始终显示底部安全区操作条，页面留出等高空白；零选择点击下载只显示提示，桌面用工具条右侧操作区。
选择按演员保存在 sessionStorage，关闭弹窗、刷新、切语言和登录后仍保留。

游客单张取图有 30 秒窗口；文字复制和 JSON 不受限制。会员选择 ZIP、拼成一张或按模型
打包。拼图默认无字、浅灰，3840×2160，边距 80px、格间距 40px；默认无字意味着完全不
调用文字绘制。未交付的表情不拿空白图顶替，Veo 三图包缺少必要素材时明确提示。

## 动效

保留 UIKit 控件反馈与图片轻微悬停缩放；减少动态时不位移、不缩放。实际值在 globals.css。没有滚动劫持、名册墙、自定义光标、跑马灯或闪烁。

当前页面没有 WebGL 舞台或 Reveal；无图占位使用 SVG。历史 3D 方案留在原 ADR/计划，不是现行要求。

## 多语言与验收

`SwimmerI18nKit 0.2.0` 负责 ICU；本站保留 `/zh`、`/en` 路由。消息只改
`src/i18n/messages.source.ts`，运行 `pnpm messages:generate` 再检查消息合同，结构化内容保持 `{ en, zh }`。
其他语言仅是明确标注、nofollow、不进 sitemap 的机器翻译外链。路由切换保留查询参数。

改产品运行 `pnpm verify` 与 `pnpm exec swimmer-ui-check src`，改文档另跑
`pnpm docs:check`。页面检查同时覆盖 390px / 1440px、light / dark、中 / 英、有图 / 无图。
验收命令与证据边界见 docs/reference/verification.md。截图与执行记录留在 .devspace-reports 对应任务目录，不当作已部署证据。
