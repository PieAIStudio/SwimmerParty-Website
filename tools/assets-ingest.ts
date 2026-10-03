import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ASSET_FRAMES, assetSlotOrder, listSeries, slotsOf } from "../src/content/asset-series.ts";
import { getActorAssets, type ActorAssets, type AssetItem } from "../src/content/assets.ts";
import { localAssetStore, type AssetStore } from "../src/server/asset-store.ts";
import { configuredBlobStore } from "../src/server/blob-store.ts";
import { runtimeModes } from "../src/server/runtime-mode.ts";
import { actorByCode, cliArgs, isMain, reportError, writeTransaction } from "./assets-common.ts";

export type IngestOptions = { root?: string; legacy?: boolean; dryRun?: boolean; store?: AssetStore };
type Prepared = { item: AssetItem; source: Buffer; preview: Buffer; thumb: Buffer };

async function prepare(file: string, code: string, manifest: ActorAssets, root: string, legacy: boolean): Promise<Prepared> {
  const match = /^(SP-\d{2,4})__([a-z0-9-]+)__([a-z0-9-]+)__v(\d+)\.(png|webp)$/.exec(file);
  if (!match || match[1] !== code) throw new Error("Filename must match the actor code, series, key, version and png/webp protocol");
  const [, , group, key, number, format] = match;
  const series = listSeries().find(item => item.id === group || item.perLook && group.startsWith(`${item.id}-`));
  if (!series) throw new Error(`Unknown series: ${group}`);
  const look = series.perLook ? group.slice(series.id.length + 1) : null;
  if (series.perLook && !manifest.looks.some(item => item.id === look && item.prompt.trim())) {
    throw new Error(`Register look '${look}' in src/content/assets/${manifest.slug}.json looks with id, bilingual label and prompt before ingesting it.`);
  }
  const slot = slotsOf(series.id, look).find(item => item.key === key);
  if (!slot) throw new Error(`Unknown slot: ${series.id}.${key}`);
  const version = Number(number);
  if (!Number.isSafeInteger(version) || (legacy ? version !== 0 : version < 1)) throw new Error(legacy ? "Legacy assets must use v0" : "New assets must use v1 or later");
  const sourcePath = path.join(root, "assets-inbox", code, file);
  if (!(await lstat(sourcePath)).isFile()) throw new Error("Input must be a regular file, not a directory or symbolic link");
  const source = await readFile(sourcePath);
  const image = sharp(source, { limitInputPixels: 40_000_000 });
  const metadata = await image.metadata();
  if (metadata.format !== format || !metadata.width || !metadata.height) throw new Error("Actual image format must match its filename");
  if (!legacy) {
    if (format !== "png") throw new Error("New assets must be PNG");
    const frame = ASSET_FRAMES[series.frame];
    if (metadata.width !== frame.width || metadata.height !== frame.height) throw new Error(`Expected ${frame.width}×${frame.height}; received ${metadata.width}×${metadata.height}`);
    if (!metadata.hasAlpha) throw new Error("New assets require an alpha channel");
    for (const [left, top] of [[0, 0], [frame.width - 8, 0], [0, frame.height - 8], [frame.width - 8, frame.height - 8]]) {
      const alpha = await image.clone().extract({ left, top, width: 8, height: 8 }).extractChannel("alpha").raw().toBuffer();
      if (alpha.some(value => value !== 0)) throw new Error("Each 8×8 corner must be fully transparent");
    }
  }
  const sha256 = createHash("sha256").update(source).digest("hex");
  const item: AssetItem = {
    slot: slot.slot, series: series.id, key, look, conformance: legacy ? "legacy" : "v1", version,
    width: metadata.width, height: metadata.height, bytes: source.length, sha256,
    format: format as "png" | "webp", object: `${manifest.slug}/v${version}/${file}`,
    preview: `/media/assets/${manifest.slug}/${slot.slot}.webp`,
    thumb: `/media/assets/${manifest.slug}/${slot.slot}.thumb.webp`,
  };
  const existing = manifest.items.find(candidate => candidate.object === item.object);
  if (existing && existing.sha256 !== sha256) throw new Error(`Immutable master changed: ${item.object}. Increment the anchor version.`);
  return {
    item, source,
    preview: await image.clone().resize({ width: 1024, height: 1024, fit: "inside" }).webp({ quality: 86 }).toBuffer(),
    thumb: await image.clone().resize({ width: 384, height: 384, fit: "inside" }).webp({ quality: 86 }).toBuffer(),
  };
}

export async function ingest(code: string, options: IngestOptions = {}) {
  const root = path.resolve(options.root ?? process.cwd());
  const actor = actorByCode(code);
  const current = getActorAssets(actor.slug, root);
  const files = (await readdir(path.join(root, "assets-inbox", code))).filter(file => !["TODO.md", ".DS_Store"].includes(file)).sort();
  if (!files.length) throw new Error(`No input images in assets-inbox/${code}`);
  const prepared: Prepared[] = [];
  const errors: Error[] = [];
  for (const file of files) {
    try { prepared.push(await prepare(file, code, current, root, options.legacy ?? false)); }
    catch (error) { errors.push(new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`)); }
  }
  const seen = new Set<string>();
  for (const { item } of prepared) {
    if (seen.has(item.slot)) errors.push(new Error(`Duplicate slot in batch: ${item.slot}`));
    seen.add(item.slot);
  }
  const versions = new Set(prepared.map(({ item }) => item.version));
  const previousVersions = new Set(current.items.filter(item => item.conformance === "v1").map(item => item.version));
  if (previousVersions.size > 1) errors.push(new Error("Manifest contains mixed anchor versions; repair it before ingest"));
  const previous = [...previousVersions][0];
  const version = [...versions][0];
  if (versions.size > 1) errors.push(new Error("One batch must use one anchor version"));
  if (!options.legacy && previous !== undefined && version !== previous && version !== previous + 1) errors.push(new Error(`Use v${previous}, or upgrade the entire batch to v${previous + 1}`));
  if (options.legacy && prepared.some(({ item }) => current.items.some(old => old.slot === item.slot && old.conformance === "v1"))) errors.push(new Error("Legacy input cannot replace a delivered v1 slot"));
  if (errors.length) throw new AggregateError(errors, "Asset validation failed; nothing written");
  const upgraded = !options.legacy && previous !== undefined && version === previous + 1;
  const items = upgraded ? [] : current.items.filter(item => !seen.has(item.slot));
  items.push(...prepared.map(({ item }) => item));
  const order = assetSlotOrder(current.looks);
  items.sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
  const manifest = { ...current, items };
  if (options.dryRun) return { manifest, ingested: prepared.length, upgraded, dryRun: true };
  const store = options.store ?? (runtimeModes().store === "blob"
    ? await configuredBlobStore()
    : localAssetStore(path.resolve(root, process.env.ASSET_LOCAL_ROOT ?? ".assets-local")));
  for (const item of prepared) await store.put(item.item.object, item.source);
  await writeTransaction([
    ...prepared.flatMap(({ item, preview, thumb }) => [
      { path: path.join(root, "public", item.preview), bytes: preview },
      { path: path.join(root, "public", item.thumb), bytes: thumb },
    ]),
    { path: path.join(root, "src/content/assets", `${actor.slug}.json`), bytes: Buffer.from(JSON.stringify(manifest, null, 2) + "\n") },
  ]);
  return { manifest, ingested: prepared.length, upgraded, dryRun: false };
}

if (isMain(import.meta.url)) {
  Promise.resolve().then(async () => {
    const { code, flags } = cliArgs(["--legacy", "--dry-run"]);
    const result = await ingest(code, { legacy: flags.includes("--legacy"), dryRun: flags.includes("--dry-run") });
    console.log(`${result.dryRun ? "Validated only" : "Ingested"}: ${code}, ${result.ingested} image(s)${result.upgraded ? "; previous anchor entries removed" : ""}`);
  }).catch(reportError);
}
