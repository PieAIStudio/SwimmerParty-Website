import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { loadActorProjection } from "../site/actor-data.ts";
import {
  publicFile,
  sourceFile,
  requireSources,
  requireMediaOptIn,
} from "./generated-media-common.ts";
import { writeTransaction } from "./file-transaction.ts";

// Metadata has a separate pure generator; conversion requires approved local originals.
export async function generateOfficialSampleMedia(root = process.cwd()) {
  const { published } = await loadActorProjection(root);
  const media = published.flatMap((actor) => actor.officialSamples?.media ?? []);
  await requireSources(media.map((item) => sourceFile(root, item.source)));
  const changes: { path: string; bytes: Uint8Array }[] = [];
  for (const item of media) {
    const bytes = await readFile(sourceFile(root, item.source));
    changes.push({
      path: publicFile(root, item.public),
      bytes:
        item.kind === "image"
          ? await sharp(bytes)
              .resize({ width: 720, withoutEnlargement: true })
              .webp({ quality: 82 })
              .toBuffer()
          : bytes,
    });
  }
  await writeTransaction(changes);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  requireMediaOptIn();
  await generateOfficialSampleMedia();
}
