---
name: promote-new-face
description: Promote an approved SwimmerParty new face without duplicating identity, or rehearse the same projection using an isolated synthetic fixture.
---

# 新面孔晋升

先读 `src/content/actors/README.md`。网站资料是生成结果，禁止直接修改 profile.ts、生成名单或 generated.ts。真实演员必须有 Owner 批准的身份和交付证据；演练绝不更改真实演员。

## 真实晋升

1. 在 casting 找到原 slug、艺名与资料；保留该记录，不改其身份。找到同 slug 的 `media-pack/actors/<slug>.json`，或按批准生产资料建立它，不复制别人的身份。
2. 在生产记录补齐 demographics、website、release，设置 `website.published=true`、`website.status=active`、`status.version=1.0.0`，使用批准的日期、说明、造型及可见范围。`status.published` 属于制作流程，不能拿来代替网站发布开关；未知身高不能猜。
3. 确认同 slug 的 assets.json 已由入库流程生成；资料生成器只改 looks，保留 items、对象键和扩展字段。不得为了通过检查伪造素材。
4. 运行 `pnpm data:generate`、`pnpm data:check` 和 `pnpm check`。审阅：该演员恰好一份、姓名/slug 不变、版本 1.0.0、只抑制其新面孔投影、其他未发布演员不出现。
5. 提交批准的源资料与生成物，不上传/部署；发布另走 release.md。

## 只用夹具演练

从 `tools/test/fixtures/actor-data.ts` 的 `actorDataRoot()` 创建临时根目录；用 `generateActorData(root)` 生成新面孔基线。随后用 `writeJson(root, "media-pack/actors/fixture-actor.json", promotedFixture())` 写入晋升源，再生成和 check。

`promotedFixture()` 是虚构演员的 1.0.0 记录；`loadActorProjection(root)` 可验证 slug/姓名不变、active、唯一、1.0.0，原清单扩展字段与 items 保留。现成演练：`node --test --test-name-pattern="fixture promotion" tools/test/actor-data.test.ts`。任务要求实际演练时执行这个流程并记录断言结果，不修改 casting 真演员来冒充测试。

临时目录由测试 t.after 清理。不要把夹具写进真实 media-pack、演员目录、公开媒体或提交。缺必要字段时返回生产源修正，不为夹具改宽生产 schema。
