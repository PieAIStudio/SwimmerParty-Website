import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, readFile, lstat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ACTORS } from "../src/content/actors/index.ts";
import { getActorAssets } from "../src/features/assets/assets.ts";
import { blobAssetStore, privateObjectType } from "../src/features/assets/server/blob-store.ts";
import { checkMediaWorkSlot } from "./assets/media-work-guard.ts";

type Master = { object: string; bytes: number; sha256: string };
type RemotePage = { blobs: { pathname: string; size: number }[]; cursor?: string };
type UploadClient = {
  list: (cursor?: string) => Promise<RemotePage>;
  putNew: (object: string, bytes: Uint8Array, contentType: string) => Promise<void>;
  exists: (object: string) => Promise<number | null>;
};
async function hash(file: string) {
  const digest = createHash("sha256");
  for await (const chunk of createReadStream(file)) digest.update(chunk);
  return digest.digest("hex");
}
async function regular(file: string) {
  try {
    const stat = await lstat(file);
    return stat.isFile() ? stat : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
/** Append-only originals upload; dry-run does all source checks and reports exact pending bytes. */
export async function uploadMasters({
  root = process.cwd(),
  items,
  client,
  dryRun,
  sourceRoots = [],
  onProgress = () => undefined,
}: {
  root?: string;
  items: readonly Master[];
  client: UploadClient;
  dryRun: boolean;
  sourceRoots?: readonly string[];
  onProgress?: (event: { uploaded: number; pending: number; uploadedBytes: number }) => void;
}) {
  const unique = new Map<string, Master>();
  for (const item of items) {
    privateObjectType(item.object);
    if (!Number.isSafeInteger(item.bytes) || item.bytes <= 0 || !/^[a-f0-9]{64}$/.test(item.sha256))
      throw new Error("Invalid master metadata");
    const previous = unique.get(item.object);
    if (previous && (previous.sha256 !== item.sha256 || previous.bytes !== item.bytes))
      throw new Error(`Conflicting master identity: ${item.object}`);
    unique.set(item.object, item);
  }
  const masters = [...unique.values()];
  async function listAll() {
    const stored = new Map<string, number>(),
      seen = new Set<string>();
    let cursor: string | undefined;
    do {
      checkMediaWorkSlot();
      const page = await client.list(cursor);
      for (const blob of page.blobs) stored.set(blob.pathname, blob.size);
      cursor = page.cursor;
      if (cursor && seen.has(cursor)) throw new Error("Blob listing cursor did not advance");
      if (cursor) seen.add(cursor);
    } while (cursor);
    return stored;
  }
  const stored = await listAll();
  const pending = masters.filter((item) => {
    const size = stored.get(item.object);
    if (size !== undefined && size !== item.bytes)
      throw new Error(`Stored master differs in size: ${item.object}`);
    return size === undefined;
  });
  const sources = new Map<string, string>();
  // Check the exact object path first; already-stored objects need no local rematerialization.
  for (const item of pending) {
    checkMediaWorkSlot();
    const file = path.join(root, ".assets-local", item.object),
      stat = await regular(file);
    if (!stat) continue;
    if (stat.size !== item.bytes || (await hash(file)) !== item.sha256)
      throw new Error(`Local master differs from manifest: ${item.object}`);
    sources.set(item.sha256, file);
  }
  const needed = new Map(pending.filter((i) => !sources.has(i.sha256)).map((i) => [i.sha256, i]));
  const sizes = new Set([...needed.values()].map((item) => item.bytes));
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      if ([...needed.keys()].every((key) => sources.has(key))) return;
      checkMediaWorkSlot();
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) {
        const stat = await regular(file);
        if (stat && sizes.has(stat.size)) {
          const sha = await hash(file);
          if (needed.has(sha) && !sources.has(sha)) sources.set(sha, file);
        }
      }
    }
  }
  if (needed.size)
    for (const folder of [
      path.join(root, ".assets-local"),
      path.join(root, "media-pack/library"),
      ...sourceRoots,
    ])
      await walk(folder);
  const missing = pending.filter((item) => !sources.has(item.sha256));
  if (missing.length)
    throw new Error(
      `${missing.length} pending masters have no matching local source: ${missing.map((i) => i.object).join(", ")}`,
    );
  const summary = {
    dryRun,
    masters: masters.length,
    totalBytes: masters.reduce((n, i) => n + i.bytes, 0),
    alreadyStored: masters.length - pending.length,
    pendingFiles: pending.length,
    pendingBytes: pending.reduce((n, i) => n + i.bytes, 0),
    uploadedFiles: 0,
    uploadedBytes: 0,
    verifiedFiles: 0,
    verifiedBytes: 0,
    pendingObjects: pending.map((i) => ({ object: i.object, bytes: i.bytes, sha256: i.sha256 })),
    remoteBeforeFiles: stored.size,
    remoteBeforeBytes: [...stored.values()].reduce((n, bytes) => n + bytes, 0),
    remoteAfterFiles: 0,
    remoteAfterBytes: 0,
    previousObjectsRetained: false,
  };
  if (dryRun) return summary;
  // Sequential puts respect the shared Mac's load-sensitive lane. Never overwrite or delete.
  for (const item of pending) {
    checkMediaWorkSlot();
    const bytes = await readFile(sources.get(item.sha256)!);
    if (
      bytes.length !== item.bytes ||
      createHash("sha256").update(bytes).digest("hex") !== item.sha256
    )
      throw new Error(`Source changed before upload: ${item.object}`);
    await client.putNew(item.object, bytes, privateObjectType(item.object));
    if ((await client.exists(item.object)) !== item.bytes)
      throw new Error(`Upload did not verify: ${item.object}`);
    summary.uploadedFiles++;
    summary.uploadedBytes += item.bytes;
    onProgress({
      uploaded: summary.uploadedFiles,
      pending: pending.length,
      uploadedBytes: summary.uploadedBytes,
    });
  }
  const after = await listAll();
  for (const [object, bytes] of stored) {
    if (after.get(object) !== bytes)
      throw new Error(`Existing Blob object changed during upload: ${object}`);
  }
  summary.remoteAfterFiles = after.size;
  summary.remoteAfterBytes = [...after.values()].reduce((n, bytes) => n + bytes, 0);
  summary.previousObjectsRetained = true;
  for (const item of masters) {
    if (after.get(item.object) !== item.bytes)
      throw new Error(`Final Blob readback mismatch: ${item.object}`);
    summary.verifiedFiles++;
    summary.verifiedBytes += item.bytes;
  }
  return summary;
}

async function main() {
  const args = process.argv.slice(2),
    slugs: string[] = [],
    sourceRoots: string[] = [];
  let dryRun = false,
    report: string | undefined;
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === "--dry-run") dryRun = true;
    else if (value === "--source-root" && args[index + 1])
      sourceRoots.push(path.resolve(args[++index]));
    else if (value === "--report" && args[index + 1]) report = args[++index];
    else if (value.startsWith("--")) throw new Error(`Unknown upload option: ${value}`);
    else slugs.push(value);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  if (slugs.some((slug) => !ACTORS.some((actor) => actor.slug === slug)))
    throw new Error("Unknown or retired actor requested for upload");
  if (report && (!report.startsWith(".devspace-reports/") || report.split(/[\\/]/).includes("..")))
    throw new Error("Upload report must stay under .devspace-reports");
  const actors = ACTORS.filter((actor) => !slugs.length || slugs.includes(actor.slug));
  const sdk = await import("@vercel/blob"),
    store = blobAssetStore(sdk);
  const result = await uploadMasters({
    items: actors.flatMap((actor) => getActorAssets(actor.slug).items),
    dryRun,
    sourceRoots,
    client: {
      list: async (cursor) => sdk.list({ cursor, limit: 1000 }),
      exists: (object) => store.exists(object),
      putNew: async (object, bytes, contentType) => {
        await sdk.put(object, Buffer.from(bytes), {
          access: "private",
          contentType,
          addRandomSuffix: false,
          allowOverwrite: false,
        });
      },
    },
    onProgress: (event) => {
      if (event.uploaded % 25 === 0) console.log(JSON.stringify({ event: "progress", ...event }));
    },
  });
  const receipt = {
    ...result,
    actors: actors.map((a) => a.slug),
    completedAt: new Date().toISOString(),
  };
  if (report) {
    await mkdir(path.dirname(report), { recursive: true });
    await writeFile(report, JSON.stringify(receipt, null, 2) + "\n");
  }
  console.log(JSON.stringify(receipt, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    let message = error instanceof Error ? error.message : String(error);
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) message = message.split(token).join("[REDACTED]");
    console.error(message);
    process.exitCode = 1;
  });
}
