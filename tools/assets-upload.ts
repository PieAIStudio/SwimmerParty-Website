import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { ACTORS } from "../src/content/actors/index.ts";
import { getActorAssets } from "../src/features/assets/assets.ts";
import { blobAssetStore } from "../src/features/assets/server/blob-store.ts";

// Uploads every manifest master (images and voices) to the private Blob store.
// Sources are found by sha256 under the local master folders, so renamed or re-foldered
// files still match. Existing objects are skipped; a size mismatch stops the run because
// masters never change under the same key.
// Usage: node --env-file=.vercel/.env.production.local tools/assets-upload.ts [--dry-run]
const dryRun = process.argv.includes("--dry-run");
const roots = [".assets-local", "media-pack/library"];
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not set");

const items = ACTORS.flatMap((actor) => getActorAssets(actor.slug).items);
const sizes = new Set(items.map((item) => item.bytes));
const sources = new Map<string, string>();
async function walk(dir: string): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.isFile() && sizes.has((await stat(file)).size)) {
      const sha = createHash("sha256")
        .update(await readFile(file))
        .digest("hex");
      if (!sources.has(sha)) sources.set(sha, file);
    }
  }
}
for (const root of roots) await walk(root);
const missing = items.filter((item) => !sources.has(item.sha256));
if (missing.length) {
  for (const item of missing) console.error(`no local source: ${item.object}`);
  throw new Error(`${missing.length} masters have no local source`);
}

const sdk = await import("@vercel/blob");
const store = blobAssetStore(sdk);
const stored = new Map<string, number>();
let cursor: string | undefined;
do {
  const page = await sdk.list({ cursor, limit: 1000 });
  for (const blob of page.blobs) stored.set(blob.pathname, blob.size);
  cursor = page.cursor;
} while (cursor);

const pending = items.filter((item) => {
  const size = stored.get(item.object);
  if (size !== undefined && size !== item.bytes)
    throw new Error(`Stored master differs in size: ${item.object}`);
  return size === undefined;
});
console.log(`${items.length} masters, ${items.length - pending.length} already stored`);
if (dryRun) {
  console.log(`would upload ${pending.length}`);
  process.exit(0);
}
let done = 0;
const queue = [...pending];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      await store.put(item.object, await readFile(sources.get(item.sha256)!));
      if ((await store.exists(item.object)) !== item.bytes)
        throw new Error(`Upload did not verify: ${item.object}`);
      if (++done % 25 === 0) console.log(`uploaded ${done}/${pending.length}`);
    }
  }),
);
console.log(`uploaded ${done}`);
