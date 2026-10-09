import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { messages } from "../../src/i18n/messages.source.ts";
import { analyzeMessages, runtimeSources } from "./message-analysis.ts";

export function checkMessages() {
  return analyzeMessages({
    sources: runtimeSources(),
    keys: Object.keys(messages),
    vocabulary: JSON.parse(readFileSync("src/content/asset-series.json", "utf8")),
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = checkMessages();
  for (const issue of result.issues)
    process.stderr.write(`${issue.file}:${issue.line}: ${issue.message}\n`);
  for (const key of result.unused) process.stderr.write(`Unconsumed message: ${key}\n`);
  if (result.issues.length || result.unused.length) process.exitCode = 1;
  else
    process.stdout.write(
      `Message usage/copy check passed (${result.used.size} keys, ${result.dynamicEvidence.length} finite references).\n`,
    );
}
