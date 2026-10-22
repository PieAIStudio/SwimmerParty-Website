import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  lstatSync,
  realpathSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ACTORS } from "../../src/content/actors/index.ts";
import { siteActorCatalog, syncActorCatalog } from "./community-actor-catalog.ts";

export function catalogOptions(args: string[]) {
  let projectRef = "",
    expectedPlan: string | undefined,
    report: string | undefined;
  let mode: "dry-run" | "check" | "apply" = "dry-run";
  const seen = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (seen.has(key)) throw Error("Duplicate option");
    seen.add(key);
    if (["--dry-run", "--check", "--apply"].includes(key)) {
      if ([...seen].filter((k) => ["--dry-run", "--check", "--apply"].includes(k)).length > 1)
        throw Error("Choose one mode");
      mode = key === "--apply" ? "apply" : key === "--check" ? "check" : "dry-run";
    } else if (
      ["--project-ref", "--expect-plan", "--report"].includes(key) &&
      args[i + 1] &&
      !args[i + 1].startsWith("--")
    ) {
      const value = args[++i];
      if (key === "--project-ref") projectRef = value;
      if (key === "--expect-plan") expectedPlan = value;
      if (key === "--report") report = value;
    } else throw Error("Unknown or incomplete option");
  }
  if (!/^[a-z]{20}$/.test(projectRef)) throw Error("Supply the exact --project-ref");
  if (mode === "apply" && !/^[a-f0-9]{64}$/.test(expectedPlan ?? ""))
    throw Error("Apply requires reviewed --expect-plan SHA-256");
  if (mode !== "apply" && expectedPlan) throw Error("--expect-plan is only for --apply");
  if (
    report &&
    (!report.startsWith(".devspace-reports/") ||
      report.includes("\\") ||
      report.split("/").includes("..") ||
      !report.endsWith(".json"))
  )
    throw Error("Report must be a JSON file under .devspace-reports");
  return { projectRef, mode, expectedPlan, report };
}

async function main() {
  if (process.argv.includes("--help")) {
    console.log(
      "pnpm community:actors:sync --project-ref <ref> [--dry-run|--check|--apply --expect-plan <sha256>] [--report .devspace-reports/<new-file>.json]\nDefault: read-only plan. --check exits 2 on drift. --apply requires separate Owner authorization and the exact reviewed plan. Uses existing Supabase CLI operator login; no website runtime secret.",
    );
    return;
  }
  const options = catalogOptions(process.argv.slice(2));
  if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.CI)
    throw Error("Operator CLI only; never invoke from Vercel or CI");
  const root = process.cwd();
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (
    options.mode === "apply" &&
    execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()
  )
    throw Error("Apply only from a clean committed candidate");
  // A generated actor file from the wrong production source must never become an authorized catalog.
  execFileSync(process.execPath, ["tools/site/generate-actor-data.ts", "--check"], {
    stdio: "pipe",
  });
  const desired = siteActorCatalog(ACTORS);
  const target =
    options.report ?? `.devspace-reports/community-actor-sync/${Date.now()}-${process.pid}.json`;
  if (existsSync(target)) throw Error("Keep existing receipts: choose a new --report path");
  let cursor = root;
  for (const part of target.split("/").slice(0, -1)) {
    cursor = path.join(cursor, part);
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink())
      throw Error("Symlinked report directory rejected");
  }
  mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  if (!realpathSync(path.dirname(target)).startsWith(realpathSync(root) + path.sep))
    throw Error("Report escapes worktree");
  // Atomically reserve a fresh receipt; a concurrent invocation or dangling symlink cannot be overwritten.
  writeFileSync(target, "", { mode: 0o600, flag: "wx" });
  const receipt: Record<string, unknown> = {
    status: "running",
    startedAt: new Date().toISOString(),
    commit,
    projectRef: options.projectRef,
    mode: options.mode,
    databaseWriteAttempted: false,
    deployment: false,
  };
  const save = () =>
    writeFileSync(target, JSON.stringify(receipt, null, 2) + "\n", { mode: 0o600 });
  save();
  const folder = mkdtempSync(path.join(tmpdir(), "swimmer-actor-catalog-"));
  try {
    const result = await syncActorCatalog({
      projectRef: options.projectRef,
      desired,
      apply: options.mode === "apply",
      expectedPlan: options.expectedPlan,
      onPlan: (plan) => {
        receipt.plan = plan;
        save();
      },
      query: async (sql) => {
        const file = path.join(folder, "query.sql");
        writeFileSync(file, sql, { mode: 0o600 });
        if (sql.startsWith("BEGIN;")) {
          if (
            execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== commit ||
            execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()
          )
            throw Error("Source changed after approval");
          receipt.databaseWriteAttempted = true;
          save();
        }
        const output = execFileSync(
          "supabase",
          [
            "db",
            "query",
            "--agent",
            "no",
            "--linked",
            "--project-ref",
            options.projectRef,
            "--file",
            file,
            "-o",
            "json",
          ],
          {
            cwd: folder,
            encoding: "utf8",
            stdio: "pipe",
            timeout: 90000,
            maxBuffer: 16 * 1024 * 1024,
          },
        );
        return JSON.parse(output);
      },
    });
    receipt.status = options.mode === "check" && result.plan.changes.length ? "drift" : "passed";
    receipt.applied = result.applied;
    receipt.independentReadbackVerified = result.verified;
    console.log(
      JSON.stringify({
        status: receipt.status,
        commit,
        projectRef: options.projectRef,
        planSha256: result.plan.planSha256,
        counts: result.plan.counts,
        receipt: target,
      }),
    );
    if (receipt.status === "drift") process.exitCode = 2;
  } catch {
    receipt.status = receipt.databaseWriteAttempted
      ? "apply_outcome_unconfirmed"
      : "failed_without_catalog_write";
    // Do not echo provider bodies, SQL traces, environment values or child-process output.
    console.error(
      `Actor catalog sync stopped (${receipt.status}). Read the receipt and run a new read-only plan; never retry apply blindly. Receipt: ${target}`,
    );
    process.exitCode = 1;
  } finally {
    receipt.finishedAt = new Date().toISOString();
    save();
    rmSync(folder, { recursive: true, force: true });
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => {
    console.error(
      "Actor catalog preflight failed. Use --help; check explicit target, approval hash, clean source and report path. No automatic retry.",
    );
    process.exitCode = 1;
  });
}
