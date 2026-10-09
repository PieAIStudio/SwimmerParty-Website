export { writeTransaction } from "./file-transaction.ts";
import path from "node:path";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { ACTORS } from "../../src/content/actors/index.ts";

export function actorByCode(code: string) {
  const directory = fileURLToPath(new URL("../../media-pack/actors/", import.meta.url));
  const production = code.startsWith("SP-")
    ? readdirSync(directory)
        .filter((name) => name.endsWith(".json"))
        .map((name) => JSON.parse(readFileSync(path.join(directory, name), "utf8")))
        .find((record) => record.code === code)
    : undefined;
  const actor = ACTORS.find((item) => item.slug === (production?.slug ?? code));
  if (!actor)
    throw new Error(`Unknown actor code: ${code}. Use a published actor slug or production code.`);
  return actor;
}

export const isMain = (url: string) =>
  Boolean(process.argv[1]) && pathToFileURL(path.resolve(process.argv[1])).href === url;

export function cliArgs(allowed: readonly string[]) {
  const [code, ...flags] = process.argv.slice(2);
  if (!code || flags.some((flag) => !allowed.includes(flag)))
    throw new Error(`Expected <code> ${allowed.join(" ")}`);
  return { code, flags };
}

export function reportError(error: unknown) {
  const errors = error instanceof AggregateError ? error.errors : [error];
  for (const item of errors) {
    if (item instanceof AggregateError) reportError(item);
    else console.error(item instanceof Error ? item.message : String(item));
  }
  process.exitCode = 1;
}
