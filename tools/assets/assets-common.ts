export { writeTransaction } from "./file-transaction.ts";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ACTORS, type Actor } from "../../src/content/actors/index.ts";

export function actorByCode(code: string) {
  const legacySlugs: Record<string, string> = {
    "SP-03": "misha-luo",
    "SP-13": "tang-yunqiu",
    "SP-14": "zhang-qiang",
    "SP-17": "chen-wei",
    "SP-18": "yan-lin",
  };
  const actor = ACTORS.find((item) => item.slug === (legacySlugs[code] ?? code));
  const fixture: Record<string, Actor> = {
    "SP-01": {
      slug: "hu-qian",
      nameEn: "HU QIAN",
      nameCn: "胡倩",
      tagline: { en: "Fixture", zh: "夹具" },
      status: "in-development",
      gender: "male",
      age: 0,
      portrait: null,
      spec: [],
      note: { en: "Fixture", zh: "夹具" },
      promptSeed: null,
    },
    "SP-02": {
      slug: "qi-man",
      nameEn: "QI MAN",
      nameCn: "齐满",
      tagline: { en: "Fixture", zh: "夹具" },
      status: "in-development",
      gender: "male",
      age: 0,
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
