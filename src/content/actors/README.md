# 演员数据

网站数据是生成物，不在这里手工改资料。

| 要改的事实                                           | 唯一编辑处                                                            | 生成或消费                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| 新面孔的姓名、年龄、身高、来历、声音、形象和初始版本 | `media-pack/casting/new-faces-2026-10.json`                           | `new-face-profiles.generated.ts`            |
| 正式演员的身份、身高、造型                           | `media-pack/actors/<slug>.json` 的既有字段                            | `<slug>/profile.ts`、`assets.json.looks`    |
| 年龄、性别、来历、语言                               | 同一生产记录的 `demographics`                                         | 网站筛选与规格行                            |
| 网站介绍、显示顺序、公开造型范围                     | 同一生产记录的 `website`                                              | 只负责展示；不改变生产的 `status.published` |
| 当前版本、日期、说明和历史                           | 正式演员 `status.version` 与 `release`；新面孔在 casting 的 `release` | 档案与导出共用                              |
| 样片的公开地址、工具、批准日期                       | 正式演员 `officialSamples`                                            | `../official-samples.generated.ts`          |
| 图片、录音交付的字节、对象键、哈希                   | 入库工具生成的 `<slug>/assets.json.items`                             | 下载与导出；资料生成器不改它们              |

`pnpm data:generate` 生成，`pnpm data:check` 逐字核对网站档案与样片，逐值核对清单的造型字段。日常 `pnpm check` 已包含核对。所有写入预先计算后一次事务落盘；缺少必要清单、无效资料、重名或漂移都会指出源文件。

网站文案由网站维护者在 `website` 撰写，生产身份字段由生产侧维护。`website.specOrder` 只定义展示顺序，年龄和身高直接来自结构化事实；`ageDisplay` 仅保留经批准的年龄表达。未确认的身高保持空值，不猜测。`website.exportPrompt` 仅用于已经与生产提示词不同的批准导出文案，否则直接读 `identity`。

晋升时保留 casting 记录，在同名生产记录设置 `website.published`、`status.version` 和 `release`。生成器只抑制这个 slug 的新面孔副本，不发布其他制作中的演员；姓名必须保持一致。合成夹具与反例见 `tools/test/actor-data.test.ts`。

旧的 `new-faces.ts` 和三份手写 `looks.ts` 已退役：它们分别逐值匹配 casting 和生产造型，消费者已转向生成档案或清单；不包含独有原件。既有版本可从 Git 恢复。

## 原件与样片交付

经授权的整包来源由生产记录 `assetDelivery` 固定，不凭目录里“最新”的文件猜版本。`assets-inbox/<slug-or-code>/` 是网站入库口，制作库和 MediaFactory run 只读；`assets:ingest --source-originals` 保留 PNG 原字节，声音入口 `assets:voices` 同样核对来源，原件对象键包含内容哈希。清单的 `source-original` 不等于 v1 规格验收或 Owner 主观认可，待看状态与来源证据不能删掉。

`officialSamples` 支持数组，每个 sampleId 只有一位生产所有者，可关联两位演员；页面按关联显示，媒体只存一份。只收 Root 通过且未被 Owner 拒收的非测试片；没有合格片就是0条，每位最多4条。新片源SHA、审核证据及有界转码是生成器的前置条件。退役演员从生产名册和站点生成物移除，不改写Git历史，不删除制作原件或旧Blob对象。

## 生成素材的边界

纯资料核对不需要真实素材。图片、录音和字体原件不在全新克隆里，不能把“公开文件哈希没变”说成“源到产物已经重生成验证”。生成物清单、可执行核对和明确例外见 `tools/test/generated-media.test.ts`；真实转换工具只在恢复批准原件并显式要求生成时使用，不能在普通验证中运行。
