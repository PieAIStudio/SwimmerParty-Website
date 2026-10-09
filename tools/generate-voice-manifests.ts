import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { actorAssetsSchema, type AssetItem } from "../src/contracts/assets.ts";
import { slotsOf } from "../src/features/assets/asset-series.ts";
import { loadActorProjection } from "./actor-data.ts";
import { requireSources, requireMediaOptIn } from "./generated-media-common.ts";
import { writeTransaction } from "./file-transaction.ts";

type DurationProbe = (file: string) => number | Promise<number>;
const durationOf: DurationProbe = (file) =>
  Number(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        file,
      ],
      { encoding: "utf8" },
    ).trim(),
  );

/** Upsert approved recordings; never remove deliveries or rewrite unrelated objects. */
export async function generateVoiceManifests(
  root = process.cwd(),
  requested: readonly string[] = [],
  probe: DurationProbe = durationOf,
) {
  const data = await loadActorProjection(root);
  const unknown = requested.filter((slug) => !data.actors.some((actor) => actor.slug === slug));
  if (unknown.length) throw new Error(`Unknown actor slug(s): ${unknown.join(", ")}`);
  const changes: { path: string; bytes: Uint8Array }[] = [];
  let count = 0;
  for (const actor of data.actors.filter(
    (item) => !requested.length || requested.includes(item.slug),
  )) {
    const manifestPath = path.join(root, "src/content/actors", actor.slug, "assets.json");
    const manifest = actorAssetsSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
    if (manifest.slug !== actor.slug) throw new Error(`Manifest slug mismatch: ${manifestPath}`);
    const voiceRoot = path.join(
      root,
      "media-pack/library/voice",
      actor.status === "new-face" ? "new-faces" : "",
      actor.slug,
    );
    await requireSources([voiceRoot]);
    const files = await readdir(voiceRoot);
    const existing = manifest.items.filter((item) => item.kind === "voice");
    await requireSources(existing.map((item) => path.join(voiceRoot, path.basename(item.object))));
    let lines: Record<string, { text?: string }> = {};
    try {
      lines = JSON.parse(await readFile(path.join(voiceRoot, "lines.json"), "utf8")).lines ?? {};
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const selected: { key: string; file: string; previous?: AssetItem; text?: string }[] = [];
    for (const slot of slotsOf("voice")) {
      const previous = existing.find((item) => item.key === slot.key);
      const stems = slot.key === "intro-alt" ? ["intro-en", "intro-alt"] : [slot.key];
      const matches = files.filter(
        (file) =>
          /\.(wav|mp3)$/.test(file) && stems.some((stem) => file.includes(`__voice__${stem}__v1.`)),
      );
      if (!previous && matches.length > 1)
        throw new Error(`Ambiguous approved voice: ${actor.slug}/${slot.key}`);
      const file = previous
        ? path.basename(previous.object)
        : (matches[0] ??
          (slot.key === "intro" && files.includes("candidate-1.mp3")
            ? "candidate-1.mp3"
            : undefined));
      if (file)
        selected.push({
          key: slot.key,
          file,
          previous,
          text:
            actor.status === "new-face"
              ? data.newFaces.find((face) => face.slug === actor.slug)?.voice.introLine
              : lines[slot.key]?.text,
        });
    }
    if (!selected.length)
      throw new Error(
        `No approved voice sources: ${voiceRoot}; existing deliveries were not replaced.`,
      );
    for (const source of selected) {
      const file = path.join(voiceRoot, source.file);
      const bytes = await readFile(file);
      const duration = await probe(file);
      if (!Number.isFinite(duration) || duration <= 0)
        throw new Error(`Invalid voice duration: ${file}`);
      const hash = createHash("sha256").update(bytes).digest("hex");
      const url = `/api/voice/${actor.slug}/${source.key}`;
      const item: AssetItem = {
        ...source.previous,
        kind: "voice",
        slot: `voice.${source.key}`,
        series: "voice",
        key: source.key,
        look: null,
        conformance: "v1",
        version: source.previous?.version ?? 1,
        width: 0,
        height: 0,
        bytes: bytes.length,
        sha256: hash,
        sourceSha256: hash,
        bbox: { left: 0, top: 0, right: 0, bottom: 0 },
        format: source.file.endsWith(".wav") ? "wav" : "mp3",
        object: source.previous?.object ?? `voice/${actor.slug}/${source.file}`,
        preview: url,
        thumb: url,
        previewUrl: url,
        durationSec: Math.round(duration * 10) / 10,
        ...(source.text ? { transcript: { text: source.text } } : {}),
      };
      const index = manifest.items.findIndex((current) => current.slot === item.slot);
      if (index === -1) manifest.items.push(item);
      else manifest.items[index] = item;
      count++;
    }
    changes.push({
      path: manifestPath,
      bytes: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`),
    });
  }
  await writeTransaction(changes);
  return count;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  requireMediaOptIn();
  const slugs = process.argv.slice(2).filter((value) => value !== "--generate-media");
  process.stdout.write(
    `generated ${await generateVoiceManifests(process.cwd(), slugs)} voice entries\n`,
  );
}
