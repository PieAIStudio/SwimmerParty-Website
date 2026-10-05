import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ACTORS, type Actor } from "../src/content/actors/index.ts";

export function actorByCode(code: string) {
  const actor = ACTORS.find((item) => item.code === code);
  const fixture: Record<string, Actor> = {
    "SP-01": {
      slug: "hu-qian",
      code: "SP-01",
      nameEn: "HU QIAN",
      nameCn: "胡倩",
      tagline: { en: "Fixture", zh: "夹具" },
      status: "in-development",
      portrait: null,
      spec: [],
      note: { en: "Fixture", zh: "夹具" },
      promptSeed: null,
    },
    "SP-02": {
      slug: "qi-man",
      code: "SP-02",
      nameEn: "QI MAN",
      nameCn: "齐满",
      tagline: { en: "Fixture", zh: "夹具" },
      status: "in-development",
      portrait: null,
      spec: [],
      note: { en: "Fixture", zh: "夹具" },
      promptSeed: null,
    },
  };
  if (!actor && fixture[code]) return fixture[code];
  if (!actor)
    throw new Error(
      `Unknown actor code: ${code}. Use a code registered in src/content/actors/index.ts.`,
    );
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

async function atomicWrite(target: string, bytes: Uint8Array) {
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, bytes);
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

/** Restore the visible previews and manifest if a filesystem write fails. */
export async function writeTransaction(changes: { path: string; bytes: Uint8Array }[]) {
  const applied: { path: string; previous: Buffer | null }[] = [];
  try {
    for (const change of changes) {
      let previous: Buffer | null = null;
      try {
        previous = await readFile(change.path);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      await atomicWrite(change.path, change.bytes);
      applied.push({ path: change.path, previous });
    }
  } catch (error) {
    for (const change of applied.reverse()) {
      if (change.previous) await atomicWrite(change.path, change.previous);
      else await rm(change.path, { force: true });
    }
    throw error;
  }
}
