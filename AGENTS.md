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
2. **Verify, then push — related checks only.** For the complete outgoing change
   range against the target base, tooling selects checks automatically from
   changed paths and dependency relationships, not a hand-picked test list:
   formatting, lint, type checks and unit tests for affected packages, plus the
   browser tests affected by the change. Documentation-only changes run their
   relevant document/governance checks, not unrelated engineering suites.
   Do not run repository-wide full verification, the entire browser suite or
   the entire timing suite before an ordinary push or merely to finish a task.
   Any failing related check blocks the push. Ordinary push/PR saves code; it
   must not start hosted Actions or Vercel preview/production deployments.
3. **Release explicitly — full suite for the release candidate.** Only before
   an authorized release, run all applicable unit tests, browser tests, timing
   tests and full verification once for that exact candidate. Any failure or
   missing required evidence blocks release. Keep existing release/security
   gates and production runtime monitoring. Check credentials, environment and
   budget before cloud acceptance/publication; publish only the tested source
   or artifact. Reuse results only while source, dependencies, relevant
   environment and retained artifacts remain valid.

Dependency-based browser selection (for example Playwright
`--only-changed=<ref>` where supported) sees changed tests and their imports;
it does not infer application-source-to-browser-test coverage when tests do not
import the application. Each project must therefore supply a maintained source
path-to-test mapping or a fixed smoke set, used by the selector, and document
its blind spots. Missing selection evidence is a gap to report, not proof that
zero tests cover the change and not a reason to silently run the full suite.

Never use `--no-verify`, bypass hooks, or rerun failures merely to obtain green.
Investigate failures with a smaller reproducer and retain the original result;
rerun only after a relevant fix or new evidence. Do not add nightly full runs:
full suites belong only to pre-release validation. Delivery reports name the
selected related checks, their selection basis, results and coverage limits.
An explicitly requested preview/staging acceptance belongs to stage 3. An edit
or push request stops at stage 2; do not relabel routine saves as releases.
These rules govern engineering validation, not separately authorized creative
production, and do not introduce engineering tests for unrelated prose.

### Fast Release Gate

<!-- PGS-DELIVERY:FAST-RELEASE -->

A full run is paid once per candidate: make it fail early and never pay twice
for the same mistake. Each project implements these with its own commands.

- **Preflight before queuing.** Before waiting for a heavy-work lock, run a
  light preflight (about a minute) that checks the candidate and worktree,
  required environment flags, budget files and credentials by name, and the
  cheap deterministic global checks. A failed preflight never enters the queue.
- **Cheapest first, stop at the first red.** Run fast deterministic checks and
  a small fixed smoke set (navigation, sign-in, the main phone screen) before
  long unit and browser stages.
- **After a red: narrow, fix, then one full run.** Keep the original result,
  reproduce the single failure, fix it, and verify the failing test plus what
  the fix affects. Narrow runs are diagnosis, never release evidence. Then run
  the full suite once on the fixed candidate, reusing passed results only where
  the project can prove their inputs are unchanged.
- **Close the gap that let it through.** When a release-only red could have
  been caught before push, the same fix adds the missing source-to-test mapping
  or moves the cheap check into the push gate.
- **Separate waiting from working.** Release receipts record queue/lock wait
  and each stage's execution time separately; speed claims name what they
  measured.
- **Reuse proven results; balance long suites.** A project whose full run takes
  more than about 30 minutes must keep a result-reuse record: each passed check
  is stored with the identity of its inputs (source, test code, dependencies,
  fixtures, content, tool versions, relevant config and built artifacts), and a
  later full run re-executes only checks whose identity changed. Timing tests,
  live paid-AI tests and production read-backs are always re-executed. It must
  also split long test files so parallel workers finish close together.


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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
