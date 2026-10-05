import { createHash } from "node:crypto";
import { lstat, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  ASSET_FRAMES,
  assetSlotOrder,
  listSeries,
  slotsOf,
} from "../src/features/assets/asset-series.ts";
import { getActorAssets, type ActorAssets, type AssetItem } from "../src/features/assets/assets.ts";
import { localAssetStore, type AssetStore } from "../src/features/assets/server/asset-store.ts";
import { configuredBlobStore } from "../src/features/assets/server/blob-store.ts";
import { runtimeModes } from "../src/lib/server/runtime-mode.ts";
import { actorByCode, isMain, reportError, writeTransaction } from "./assets-common.ts";

export type IngestOptions = {
  root?: string;
  legacy?: boolean;
  dryRun?: boolean;
  store?: AssetStore;
};
type Prepared = { item: AssetItem; source: Buffer; preview: Buffer; thumb: Buffer };

async function writeDryRunReport(
  root: string,
  results: { code: string; result: Awaited<ReturnType<typeof ingest>> }[],
) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const destination = path.join(root, ".devspace-reports", "assets", stamp);
  await mkdir(destination, { recursive: true });
  const report = results.map(({ code, result }) => ({
    code,
    ingested: result.ingested,
    upgraded: result.upgraded,
    items: result.manifest.items.map(
      ({ slot, series, key, look, version, width, height, sourceSha256, bbox }) => ({
        slot,
        series,
        key,
        look,
        version,
        width,
        height,
        sourceSha256,
        bbox,
      }),
    ),
  }));
  await writeFile(
    path.join(destination, "report.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2) + "\n",
  );
  const files = (
    await Promise.all(
      results.flatMap(({ code }) =>
        readdir(path.join(root, "assets-inbox", code)).then((names) =>
          names.filter((name) => /\.(png|webp)$/.test(name)).map((name) => ({ code, name })),
        ),
      ),
    )
  ).flat();
  const cell = 256;
  const columns = 4;
  const rows = Math.max(1, Math.ceil(files.length / columns));
  const composites = await Promise.all(
    files.map(async ({ code, name }, index) => {
      const image = await sharp(path.join(root, "assets-inbox", code, name))
        .resize({ width: 224, height: 224, fit: "inside" })
        .png()
        .toBuffer();
      const label = Buffer.from(
        `<svg width="${cell}" height="32"><rect width="100%" height="100%" fill="#202124"/><text x="8" y="21" fill="white" font-size="11">${code} ${name.replaceAll("&", "&amp;")}</text></svg>`,
      );
      const input = await sharp({
        create: { width: cell, height: cell, channels: 4, background: "#f4f4f4" },
      })
        .composite([
          { input: image, left: 16, top: 0 },
          { input: label, left: 0, top: 224 },
        ])
        .png()
        .toBuffer();
      return { input, left: (index % columns) * cell, top: Math.floor(index / columns) * cell };
    }),
  );
  await sharp({
    create: { width: columns * cell, height: rows * cell, channels: 4, background: "#f4f4f4" },
  })
    .composite(composites.map((item) => ({ input: item.input, left: item.left, top: item.top })))
    .png()
    .toFile(path.join(destination, "contact-sheet.png"));
  return destination;
}

async function prepare(
  file: string,
  code: string,
  manifest: ActorAssets,
  root: string,
  legacy: boolean,
): Promise<Prepared> {
  const match = /^(SP-\d{2,4})__([a-z0-9-]+)__([a-z0-9-]+)__v(\d+)\.(png|webp)$/.exec(file);
  if (!match || match[1] !== code)
    throw new Error(
      "Filename must match the actor code, series, key, version and png/webp protocol",
    );
  const [, , group, key, number, format] = match;
  const series = listSeries().find(
    (item) => item.id === group || (item.perLook && group.startsWith(`${item.id}-`)),
  );
  if (!series) throw new Error(`Unknown series: ${group}`);
  const look = series.perLook ? group.slice(series.id.length + 1) : null;
  if (series.perLook && !manifest.looks.some((item) => item.id === look && item.prompt.trim())) {
    throw new Error(
      `Register look '${look}' in src/content/actors/${manifest.slug}/assets.json looks with id, bilingual label and prompt before ingesting it.`,
    );
  }
  const slot =
    slotsOf(series.id, look).find((item) => item.key === key) ??
    (series.perLook && look
      ? (() => {
          const extra = manifest.looks
            .find((item) => item.id === look)
            ?.extras.find((item) => item.key === key);
          return extra
            ? {
                slot: `${series.id}.${look}.${key}`,
                series: series.id,
                frame: series.frame,
                look,
                key,
                required: false,
                direction: extra.direction,
              }
            : undefined;
        })()
      : undefined);
  if (!slot) throw new Error(`Unknown slot: ${series.id}.${key}`);
  const version = Number(number);
  if (!Number.isSafeInteger(version) || (legacy ? version !== 0 : version < 1))
    throw new Error(legacy ? "Legacy assets must use v0" : "New assets must use v1 or later");
  const sourcePath = path.join(root, "assets-inbox", code, file);
  if (!(await lstat(sourcePath)).isFile())
    throw new Error("Input must be a regular file, not a directory or symbolic link");
  const source = await readFile(sourcePath);
  const sourceSha256 = createHash("sha256").update(source).digest("hex");
  const originalImage = sharp(source, { limitInputPixels: 40_000_000 });
  const image = originalImage.clone();
  const metadata = await image.metadata();
  if (metadata.format !== format || !metadata.width || !metadata.height)
    throw new Error("Actual image format must match its filename");
  if (!legacy) {
    if (format !== "png") throw new Error("New assets must be PNG");
    const frame = ASSET_FRAMES[series.frame];
    const accepted = [frame, ASSET_FRAMES.portrait];
    if (
      !accepted.some(
        (candidate) => metadata.width === candidate.width && metadata.height === candidate.height,
      )
    )
      throw new Error(
        `Expected ${accepted.map((candidate) => `${candidate.width}×${candidate.height}`).join(" or ")}; received ${metadata.width}×${metadata.height}`,
      );
    if (!metadata.hasAlpha) throw new Error("New assets require an alpha channel");
    for (const [left, top] of [
      [0, 0],
      [metadata.width - 8, 0],
    ]) {
      const alpha = await image
        .clone()
        .extract({ left, top, width: 8, height: 8 })
        .extractChannel("alpha")
        .raw()
        .toBuffer();
      if (alpha.some((value) => value > 8))
        throw new Error("Each 8×8 corner must have alpha at most 8");
    }
  }
  const raw = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  for (let index = 3; index < raw.data.length; index += raw.info.channels) {
    const alpha = raw.data[index];
    if (alpha <= 3) raw.data[index] = 0;
    else if (alpha >= 250) raw.data[index] = 255;
    if (raw.data[index] === 0) transparent++;
  }
  if (!legacy && transparent / (raw.info.width * raw.info.height) < 0.05)
    throw new Error("Corrected image must retain at least 5% transparent pixels");
  const corrected = legacy ? source : await sharp(raw.data, { raw: raw.info }).png().toBuffer();
  const correctedImage = legacy ? image : sharp(corrected, { limitInputPixels: 40_000_000 });
  const correctedMeta = await correctedImage.metadata();
  const alphaBuffer = await correctedImage
    .clone()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = alphaBuffer.info.width,
    top = alphaBuffer.info.height,
    right = 0,
    bottom = 0;
  for (let y = 0; y < alphaBuffer.info.height; y++)
    for (let x = 0; x < alphaBuffer.info.width; x++) {
      if (alphaBuffer.data[(y * alphaBuffer.info.width + x) * alphaBuffer.info.channels + 3] > 0) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x + 1);
        bottom = Math.max(bottom, y + 1);
      }
    }
  const bbox = {
    left: left / alphaBuffer.info.width,
    top: top / alphaBuffer.info.height,
    right: right / alphaBuffer.info.width,
    bottom: bottom / alphaBuffer.info.height,
  };
  const sha256 = createHash("sha256").update(corrected).digest("hex");
  const item: AssetItem = {
    slot: slot.slot,
    series: series.id,
    key,
    look,
    conformance: legacy ? "legacy" : "v1",
    version,
    width: correctedMeta.width!,
    height: correctedMeta.height!,
    bytes: corrected.length,
    sha256,
    sourceSha256,
    bbox,
    format: legacy ? (format as "png" | "webp") : "png",
    object: `${manifest.slug}/${sha256.slice(0, 16)}/${file}`,
    preview: `/media/assets/${manifest.slug}/${slot.slot}.webp`,
    thumb: `/media/assets/${manifest.slug}/${slot.slot}.thumb.webp`,
  };
  const existing = manifest.items.find((candidate) => candidate.object === item.object);
  if (existing && existing.sha256 !== sha256)
    throw new Error(`Immutable master changed: ${item.object}. Increment the anchor version.`);
  return {
    item,
    source: corrected,
    preview: await correctedImage
      .clone()
      .resize({ width: 1024, height: 1024, fit: "inside" })
      .webp({ quality: 86 })
      .toBuffer(),
    thumb: await correctedImage
      .clone()
      .resize({ width: 384, height: 384, fit: "inside" })
      .webp({ quality: 86 })
      .toBuffer(),
  };
}

export async function ingest(code: string, options: IngestOptions = {}) {
  const root = path.resolve(options.root ?? process.cwd());
  const actor = actorByCode(code);
  const current = getActorAssets(actor.slug, root);
  const files = (await readdir(path.join(root, "assets-inbox", code)))
    .filter((file) => !["TODO.md", ".DS_Store"].includes(file))
    .sort();
  if (!files.length) throw new Error(`No input images in assets-inbox/${code}`);
  const prepared: Prepared[] = [];
  const errors: Error[] = [];
  for (const file of files) {
    try {
      prepared.push(await prepare(file, code, current, root, options.legacy ?? false));
    } catch (error) {
      errors.push(new Error(`${file}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
  const seen = new Set<string>();
  for (const { item } of prepared) {
    if (seen.has(item.slot)) errors.push(new Error(`Duplicate slot in batch: ${item.slot}`));
    seen.add(item.slot);
  }
  const versions = new Set(prepared.map(({ item }) => item.version));
  const previousVersions = new Set(
    current.items.filter((item) => item.conformance === "v1").map((item) => item.version),
  );
  if (previousVersions.size > 1)
    errors.push(new Error("Manifest contains mixed anchor versions; repair it before ingest"));
  const previous = [...previousVersions][0];
  const version = [...versions][0];
  if (versions.size > 1) errors.push(new Error("One batch must use one anchor version"));
  if (!options.legacy && previous !== undefined && version !== previous && version !== previous + 1)
    errors.push(new Error(`Use v${previous}, or upgrade the entire batch to v${previous + 1}`));
  if (
    options.legacy &&
    prepared.some(({ item }) =>
      current.items.some((old) => old.slot === item.slot && old.conformance === "v1"),
    )
  )
    errors.push(new Error("Legacy input cannot replace a delivered v1 slot"));
  if (errors.length) throw new AggregateError(errors, "Asset validation failed; nothing written");
  const upgraded = !options.legacy && previous !== undefined && version === previous + 1;
  const items = upgraded ? [] : current.items.filter((item) => !seen.has(item.slot));
  items.push(...prepared.map(({ item }) => item));
  const order = assetSlotOrder(current.looks);
  items.sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
  const manifest = { ...current, items };
  if (options.dryRun) return { manifest, ingested: prepared.length, upgraded, dryRun: true };
  const store =
    options.store ??
    (runtimeModes().store === "blob"
      ? await configuredBlobStore()
      : localAssetStore(path.resolve(root, process.env.ASSET_LOCAL_ROOT ?? ".assets-local")));
  for (const item of prepared) await store.put(item.item.object, item.source);
  await writeTransaction([
    ...prepared.flatMap(({ item, preview, thumb }) => [
      { path: path.join(root, "public", item.preview), bytes: preview },
      { path: path.join(root, "public", item.thumb), bytes: thumb },
    ]),
    {
      path: path.join(root, "src/content/actors", actor.slug, "assets.json"),
      bytes: Buffer.from(JSON.stringify(manifest, null, 2) + "\n"),
    },
  ]);
  return { manifest, ingested: prepared.length, upgraded, dryRun: false };
}

if (isMain(import.meta.url)) {
  Promise.resolve()
    .then(async () => {
      const args = process.argv.slice(2);
      const flags = new Set(args.filter((arg) => arg.startsWith("--")));
      const codes = args.filter((arg) => !arg.startsWith("--"));
      if (flags.has("--all"))
        codes.push(
          ...(await import("../src/content/actors/index.ts")).ACTORS.map((actor) => actor.code),
        );
      if (
        !codes.length ||
        [...flags].some((flag) => !["--legacy", "--dry-run", "--all"].includes(flag))
      )
        throw new Error("Expected <code>... [--all] [--legacy] [--dry-run]");
      const uniqueCodes = [...new Set(codes)];
      const results: { code: string; result: Awaited<ReturnType<typeof ingest>> }[] = [];
      const errors: Error[] = [];
      for (const code of uniqueCodes) {
        try {
          const result = await ingest(code, {
            legacy: flags.has("--legacy"),
            dryRun: flags.has("--dry-run"),
          });
          results.push({ code, result });
          console.log(
            `${result.dryRun ? "Validated only" : "Ingested"}: ${code}, ${result.ingested} image(s)${result.upgraded ? "; previous anchor entries removed" : ""}`,
          );
        } catch (error) {
          if (error instanceof AggregateError)
            errors.push(
              ...error.errors.map(
                (item) =>
                  new Error(`${code}: ${item instanceof Error ? item.message : String(item)}`),
              ),
            );
          else
            errors.push(
              new Error(`${code}: ${error instanceof Error ? error.message : String(error)}`),
            );
        }
      }
      if (flags.has("--dry-run") && results.length)
        console.log(`Report: ${await writeDryRunReport(process.cwd(), results)}`);
      if (errors.length) throw new AggregateError(errors, "Asset validation failed");
    })
    .catch(reportError);
}
