import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { loadActorProjection } from "../site/actor-data.ts";
import { sourceFile, requireSources, requireMediaOptIn } from "./generated-media-common.ts";
import { writeTransaction } from "./file-transaction.ts";
import { actorAssetsSchema, type ActorAssets } from "../../src/contracts/assets.ts";

export async function generateNewFaceAssets(root = process.cwd()) {
  const { newFaces } = await loadActorProjection(root);
  await requireSources(newFaces.map((entry) => sourceFile(root, entry.image)));
  const changes: { path: string; bytes: Uint8Array }[] = [];
  for (const entry of newFaces) {
    const bytes = await readFile(sourceFile(root, entry.image));
    const metadata = await sharp(bytes).metadata();
    if (metadata.format !== "png" || !metadata.width || !metadata.height)
      throw new Error(`Expected approved PNG: ${entry.image}`);
    const slug = entry.slug;
    const publicRoot = path.join(root, "public/media/assets", slug);
    const manifestPath = path.join(root, "src/content/actors", slug, "assets.json");
    let manifest: ActorAssets;
    try {
      manifest = actorAssetsSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      manifest = { slug, looks: [], items: [] };
    }
    if (manifest.slug !== slug) throw new Error(`Manifest slug mismatch: ${manifestPath}`);
    const [preview, large, thumb, blur] = await Promise.all([
      sharp(bytes)
        .resize({ width: 1024, height: 1672, fit: "inside" })
        .webp({ quality: 84 })
        .toBuffer(),
      sharp(bytes)
        .resize({ width: 941, height: 1672, fit: "inside" })
        .webp({ quality: 82 })
        .toBuffer(),
      sharp(bytes)
        .resize({ width: 384, height: 682, fit: "inside" })
        .webp({ quality: 82 })
        .toBuffer(),
      sharp(bytes).resize({ width: 12 }).webp({ quality: 35 }).toBuffer(),
    ]);
    changes.push(
      { path: path.join(publicRoot, "turnaround.front.webp"), bytes: preview },
      { path: path.join(publicRoot, "turnaround.front.large.webp"), bytes: large },
      { path: path.join(publicRoot, "turnaround.front.thumb.webp"), bytes: thumb },
    );
    const hash = createHash("sha256").update(bytes).digest("hex");
    const index = manifest.items.findIndex((item) => item.slot === "turnaround.front");
    const image = {
      ...(index === -1 ? {} : manifest.items[index]),
      kind: "image" as const,
      slot: "turnaround.front",
      series: "turnaround",
      key: "front",
      look: null,
      conformance: "v1" as const,
      version: index === -1 ? 0.1 : manifest.items[index].version,
      width: metadata.width,
      height: metadata.height,
      bytes: bytes.length,
      sha256: hash,
      sourceSha256: hash,
      bbox: { left: 0, top: 0, right: 1, bottom: 1 },
      format: "png" as const,
      object: `${slug}/${entry.source}.png`,
      preview: `/media/assets/${slug}/turnaround.front.webp`,
      large: `/media/assets/${slug}/turnaround.front.large.webp`,
      thumb: `/media/assets/${slug}/turnaround.front.thumb.webp`,
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
    };
    if (index === -1) manifest.items.push(image);
    else manifest.items[index] = image;
    changes.push({
      path: manifestPath,
      bytes: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`),
    });
  }
  await writeTransaction(changes);
  return newFaces.length;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  requireMediaOptIn();
  process.stdout.write(`generated ${await generateNewFaceAssets()} new-face image manifests\n`);
}
