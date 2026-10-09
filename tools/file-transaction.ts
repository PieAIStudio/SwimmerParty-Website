import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

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

/** Prepare all output before calling; restore changed files if a write fails. */
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
