import { readFile, mkdtemp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { loadActorProjection } from "../site/actor-data.ts";
import { sourceSamples } from "../site/sample-data.ts";
import {
  publicFile,
  sourceFile,
  requireSources,
  requireMediaOptIn,
} from "./generated-media-common.ts";
import { checkMediaWorkSlot } from "./media-work-guard.ts";
import { writeTransaction } from "./file-transaction.ts";

const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
function probe(file: string) {
  const data = JSON.parse(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "stream=codec_type,width,height,bit_rate,r_frame_rate:format=duration,size,bit_rate",
        "-of",
        "json",
        file,
      ],
      { encoding: "utf8" },
    ),
  );
  const video = data.streams.find((s: { codec_type: string }) => s.codec_type === "video");
  if (!video || !(video.width > 0 && video.height > 0 && Number(data.format.duration) > 0))
    throw new Error(`Invalid video: ${file}`);
  return {
    ...video,
    duration: Number(data.format.duration),
    bitrate: Number(video.bit_rate ?? data.format.bit_rate),
    audio: data.streams.some((s: { codec_type: string }) => s.codec_type === "audio"),
  };
}
/** Originals are read-only. New clips fit the shipped 720×1280 / 24fps / <=4.99Mb/s envelope. */
export async function generateOfficialSampleMedia(
  root = process.cwd(),
  requested: readonly string[] = [],
  dryRun = false,
) {
  const data = await loadActorProjection(root);
  if (requested.some((slug) => !data.actors.some((a) => a.slug === slug)))
    throw new Error("Unknown sample actor");
  const sources = sourceSamples(data.published).filter(
    ({ owner, clip }) =>
      !requested.length ||
      requested.includes(owner) ||
      clip.actorSlugs?.some((slug) => requested.includes(slug)),
  );
  const prepared = sources.flatMap(({ clip }) =>
    clip.media.map((media) => ({
      media,
      source: sourceFile(root, media.source, media.sourceRoot),
    })),
  );
  await requireSources(prepared.map((v) => v.source));
  // Validate the entire input list before touching any public output.
  for (const { media, source } of prepared) {
    if (media.sourceSha256 && sha(await readFile(source)) !== media.sourceSha256)
      throw new Error(`Sample source SHA mismatch: ${source}`);
  }
  const changes = new Map<string, Uint8Array>();
  const receipts: Record<string, unknown>[] = [];
  const scratch = await mkdtemp(path.join(tmpdir(), "swimmer-samples-"));
  try {
    for (const { media, source } of prepared) {
      if (changes.has(publicFile(root, media.public))) continue;
      const input = await readFile(source);
      if (dryRun) {
        receipts.push({
          source: media.source,
          public: media.public,
          sourceBytes: input.length,
          transcode: Boolean(media.transcode),
        });
        continue;
      }
      checkMediaWorkSlot();
      let bytes: Uint8Array;
      if (media.kind === "image") {
        bytes = await sharp(input)
          .resize({ width: 720, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
      } else if (media.transcode) {
        const original = probe(source);
        const scale = Math.min(
          1,
          720 / Math.min(original.width, original.height),
          1280 / Math.max(original.width, original.height),
        );
        const width = Math.max(2, Math.floor((original.width * scale) / 2) * 2);
        const height = Math.max(2, Math.floor((original.height * scale) / 2) * 2);
        const output = path.join(scratch, `${receipts.length}.mp4`);
        execFileSync(
          "ffmpeg",
          [
            "-v",
            "error",
            "-threads",
            "1",
            "-i",
            source,
            "-map",
            "0:v:0",
            "-an",
            "-vf",
            `scale=${width}:${height},setsar=1`,
            "-filter_threads",
            "1",
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-b:v",
            "2400k",
            "-maxrate",
            "3000k",
            "-bufsize",
            "5000k",
            "-r",
            "24",
            "-pix_fmt",
            "yuv420p",
            "-threads",
            "1",
            "-movflags",
            "+faststart",
            "-y",
            output,
          ],
          { timeout: 120000 },
        );
        const actual = probe(output);
        if (
          actual.audio ||
          actual.width > width ||
          actual.height > height ||
          actual.bitrate > 4986257 ||
          Math.abs(actual.duration - original.duration) > 0.15
        )
          throw new Error(`Transcoded sample exceeds the shipped envelope: ${media.public}`);
        execFileSync("ffmpeg", ["-v", "error", "-threads", "1", "-i", output, "-f", "null", "-"], {
          timeout: 120000,
        });
        bytes = await readFile(output);
        const frame = execFileSync(
          "ffmpeg",
          [
            "-v",
            "error",
            "-threads",
            "1",
            "-ss",
            "0.1",
            "-i",
            output,
            "-frames:v",
            "1",
            "-f",
            "image2pipe",
            "-vcodec",
            "png",
            "-threads",
            "1",
            "-",
          ],
          { maxBuffer: 16 * 1024 * 1024 },
        );
        const poster = await sharp(frame)
          .resize({ width: 720, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();
        changes.set(publicFile(root, media.public.replace(/\.mp4$/, ".poster.webp")), poster);
        receipts.push({
          source: media.source,
          sourceSha256: sha(input),
          public: media.public,
          bytes: bytes.length,
          sha256: sha(bytes),
          ...actual,
        });
      } else bytes = input;
      changes.set(publicFile(root, media.public), bytes);
    }
    if (!dryRun)
      await writeTransaction([...changes].map(([file, bytes]) => ({ path: file, bytes })));
    return {
      sources: prepared.length,
      files: changes.size,
      bytes: [...changes.values()].reduce((n, b) => n + b.length, 0),
      receipts,
      dryRun,
    };
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  requireMediaOptIn();
  const args = process.argv.slice(2);
  if (args.some((v) => v.startsWith("--") && !["--generate-media", "--dry-run"].includes(v)))
    throw new Error("Unknown sample option");
  console.log(
    JSON.stringify(
      await generateOfficialSampleMedia(
        process.cwd(),
        args.filter((v) => !v.startsWith("--")),
        args.includes("--dry-run"),
      ),
      null,
      2,
    ),
  );
}
