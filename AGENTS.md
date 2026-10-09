# SwimmerParty-Website AI Router

## PGS Router Block

<!-- PGS-ROUTER:BEGIN v1.1 -->

## Boundary

- PGS governs this `AGENTS.md` entry and governed Markdown under `docs/**`.
- `AGENTS.md` is the canonical project router; `CLAUDE.md` must be the exact
  relative symlink `AGENTS.md`.
- `.agents/skills/` is the canonical project skill root; `.claude/skills`
  must be the exact relative symlink `../.agents/skills`.
- Product artifacts outside `docs/**` are not governed docs unless this project explicitly opts them in.
- `README.md` is the human-facing introduction; read it only for positioning,
  public explanation, or README work.
- `docs/reference/execution/current-work.md` is the active-work index; read it
  when the task depends on current priorities or in-flight work.
- This project's adopted profile is `engineering-runtime`.
- Its selected agents routing file is `docs/governance/agents-routing/engineering-runtime-v1.1.md` under
  `docs/governance/agents-routing/`.

## Policy Discovery

All Markdown under `docs/policy/**/*.md`, including subdirectories and any
symlinked shared-rule files, belongs to the discoverable policy index. This is
not a command to load every policy at startup. Read the project-local baseline
and only the shared rules whose task surface actually matches.

## Skill Availability

An asset manifest or lock records desired state; it does not prove that an
optional skill is installed, host-discoverable, loaded, or invoked. Use a skill
only when its SKILL.md actually exists and can be read. Centrally managed
project links may need the portfolio control plane to materialize them after a
fresh clone; their absence must not hide or replace the portable policy rules.

## Documentation Tasks

When the task creates, edits, moves, deletes, or governs documentation, read
`docs/governance/boundary.md`, `docs/governance/ssot-v1.1.md`,
`docs/governance/doc-agent-rules.md`, `docs/governance/doc-types.md`, the
selected agents routing file, and the policy files that govern the changed
surface. Keep project AI development policy in `docs/policy/`.

## Credentials And Local Environment

For credentials, login or local environment files, first read
`<portfolio-root>/.secrets/README.md`, then
`docs/policy/shared-rules/cloud-platform-access.md`. Use the project's existing
adapter and recorded central location; do not assume secrets belong in this repository.

<!-- PGS-ROUTER:END -->

## Three-Stage Delivery

<!-- PGS-DELIVERY:THREE-STAGE -->

1. **Edit locally.** Run relevant local checks with isolated data and mocks; do
   not start paid external validation during ordinary development.
2. **Verify, then push.** Pass the checks appropriate to the changed surface
   before pushing. Ordinary push/PR saves code; it must not start hosted Actions
   or Vercel preview/production deployments.
3. **Release explicitly.** A release request may continue through cloud acceptance
   and publication within the agreed budget. Check credentials, environment and
   candidate readiness first; failed or missing required evidence blocks release.
   Publish only the tested source/artifact. Reuse results only while source,
   dependencies, relevant environment and retained artifacts remain valid.

An explicitly requested preview/staging acceptance belongs to stage 3. An edit
or push request stops at stage 2. Do not relabel routine saves as release requests.
Repeated failures require a smaller reproducer, logs and a relevant fix or new
evidence before rerunning; do not loop whole suites or silently raise budgets.
Keep existing release/security gates and production runtime monitoring. These
rules govern engineering validation, not separately authorized creative production.

## Upstream Rule

Do not locally invent doc-gov core changes such as new document statuses,
frontmatter schema, lifecycle rules, shared agents-routing rules, or external
shared-rule placement contracts. Propose them in the Project Governance System
upstream repository first.

## Document Convergence

When documented truth changes or work completes, read `docs/policy/shared-rules/document-convergence.md`; reconcile current sources and links while preserving original decisions and evidence.

## Task Router

SWIMMER PARTY 展示原创合成演员与真实交付素材。先遵守 `docs/policy/best-practice-for-this-project.md`，再按任务只读需要的入口：

| 任务                  | 去哪里                                                                    |
| --------------------- | ------------------------------------------------------------------------- |
| 定位代码和事实        | `docs/reference/architecture.md`，然后对应 feature 的 README              |
| 常见修改              | `docs/reference/how-to.md`；晋升流程使用其中链接的项目技能                |
| 改演员/造型/版本/样片 | `src/content/actors/README.md`；改生产源，不改生成物                      |
| 改界面文案            | `src/i18n/messages.source.ts`；生成命令和检查见 how-to                    |
| 改视觉                | `DESIGN.md`；共享组件以 UIKit 为准                                        |
| 验证、工具和生成物    | `docs/reference/verification.md`、`tools/README.md`                       |
| 查当前任务/既有决定   | `docs/reference/execution/current-work.md`、`docs/reference/decisions.md` |
| 明确获准发布          | `docs/reference/release.md` 是唯一操作步骤；普通改动/PR 不进入此流程      |

历史计划只用于追溯批准和证据，不是开工必读。不存在的真实原件不能用测试夹具替代；未提交的并行制作资料不属于当前任务。
