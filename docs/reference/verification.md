---
id: REF-VERIFICATION
title: Verification commands
type: reference
status: active
canonical: true
owner: ai-assisted
created: 2026-10-08
last_reviewed: 2026-10-09
domain: engineering
tags:
  - verification
pinned: false
---

# Verification commands

| 命令                             | 验证范围                           | 2026-10-09 实测                                   |
| -------------------------------- | ---------------------------------- | ------------------------------------------------- |
| `pnpm check`                     | 类型、文案、lint、格式、工具测试   | 12.78 秒；53 项工具测试通过                       |
| `pnpm verify`                    | 上述检查、生产构建、关键浏览器路径 | 连续两次通过：75.69 / 67.94 秒；各 25 项 e2e 通过 |
| `pnpm docs:check`                | 项目治理、文档、清单、链接         | 6.52 秒；0 警告                                   |
| `pnpm exec swimmer-ui-check src` | 组件规则中的品牌颜色令牌           | 4.02 秒；0 违规                                   |

测量环境：macOS arm64、10 逻辑核、Node 24.19.0、pnpm 11.22.0，基线 `a951a71` 的独立工作树；工作树没有真实素材、环境文件或 Vercel 绑定。安装使用本机 pnpm 内容缓存，不是冷缓存网络安装。Playwright 使用 5 个 worker，每次启动本分支的服务，不复用其他会话的服务。机器、依赖或测试范围变化后重测；时间不是性能验收阈值。

## 全新检出

1. 准备 Node 24 和 pnpm 11.22.0。GitHub Packages 的只读 packages 凭证由环境提供，不写入仓库。
2. `pnpm install --frozen-lockfile`。`core-js` 的通知脚本明确禁止执行，不需要交互批准。
3. `pnpm exec playwright install --with-deps chromium`，然后执行上表检查。

浏览器的图片和声音夹具由 `e2e/global-setup.ts` 在 `e2e/fixtures/assets-store/` 生成。只使用几何图形和静音 WAV/MP3，不需要 `media-pack/library/` 或 `.assets-local/`，也不能把夹具作为交付素材。工具测试在各自的临时目录生成夹具并清理；声音缺失时不允许退回真实录音库。

第八轮基线复现了三个阻塞：安装时 `core-js` 脚本处置未声明；工具测试读取被忽略的 lin-xiaoman 录音；浏览器声音接口在没有真实素材时返回 404。首块修复后两次全量验证结果一致。原始日志、页面文本、sitemap、下载文件名和 ZIP 条目快照保留在该工作树的 `.devspace-reports/site-round-8/`，交付摘要写入 PR。

本地预览使用 `pnpm dev`。生产部署、云端 Blob 和付费验收只在 Owner 明确说“发布”后执行。
