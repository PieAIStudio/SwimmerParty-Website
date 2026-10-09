import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { ACTORS } from "../src/content/actors/index.ts";

const root = process.cwd();
const slots = {
  intro: "intro",
  "intro-alt": "intro-en",
  chat: "chat",
  happy: "happy",
  angry: "angry",
  sad: "sad",
  "role-maid": "role-maid",
  "role-ceo": "role-ceo",
} as const;
const authored = new Set(["tang-yunqiu", "misha-luo", "zhang-qiang", "chen-wei", "yan-lin"]);
const requested = new Set(process.argv.slice(2));
const unknown = [...requested].filter((slug) => !ACTORS.some((actor) => actor.slug === slug));
if (unknown.length) throw new Error(`Unknown actor slug(s): ${unknown.join(", ")}`);
for (const actor of ACTORS.filter((item) => !requested.size || requested.has(item.slug))) {
  const manifestPath = path.join(root, "src/content/actors", actor.slug, "assets.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.slug = actor.slug;
  delete manifest.code;
  const items = (manifest.items ?? [])
    .filter((item: Record<string, unknown>) => item.kind !== "voice")
    .map((item: Record<string, unknown>) => {
      if ((item.series ?? "") !== "voice") {
        item.kind = "image";
        if (typeof item.object === "string")
          item.object = item.object.replace(/SP-\d{2,4}__/g, `${actor.slug}__`);
      }
      return item;
    });
  const voiceRoot =
    actor.status === "new-face"
      ? path.join(root, "media-pack/library/voice/new-faces", actor.slug)
      : path.join(root, "media-pack/library/voice", actor.slug);
  let files: string[] = [];
  try {
    files = await readdir(voiceRoot);
  } catch {
    files = [];
  }
  const linesPath = path.join(voiceRoot, "lines.json");
  let lines: Record<string, { text?: string }> = {};
  try {
    lines = JSON.parse(await readFile(linesPath, "utf8")).lines ?? {};
  } catch {
    /* new-face source has its line in actor data */
  }
  const addVoice = async (slot: string, file: string, text: string | undefined) => {
    const filename = path.join(voiceRoot, file);
    const bytes = await readFile(filename);
    const duration = Number(
      execFileSync(
        "ffprobe",
        [
          "-v",
          "error",
          "-show_entries",
          "format=duration",
          "-of",
          "default=noprint_wrappers=1:nokey=1",
          filename,
        ],
        { encoding: "utf8" },
      ).trim(),
    );
    const item: Record<string, unknown> = {
      kind: "voice",
      slot: `voice.${slot}`,
      series: "voice",
      key: slot,
      look: null,
      conformance: "v1",
      version: 1,
      width: 0,
      height: 0,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      sourceSha256: createHash("sha256").update(bytes).digest("hex"),
      bbox: { left: 0, top: 0, right: 0, bottom: 0 },
      format: file.endsWith(".wav") ? "wav" : "mp3",
      object: `voice/${actor.slug}/${file}`,
      preview: `/api/voice/${actor.slug}/${slot}`,
      thumb: `/api/voice/${actor.slug}/${slot}`,
      previewUrl: `/api/voice/${actor.slug}/${slot}`,
      durationSec: Number.isFinite(duration) ? Math.round(duration * 10) / 10 : 0,
    };
    if (text) item.transcript = { text };
    items.push(item);
  };
  if (actor.status === "new-face") {
    const file = "candidate-1.mp3";
    const source = JSON.parse(
      await readFile(path.join(root, "media-pack/casting/new-faces-2026-10.json"), "utf8"),
    ).actors.find((item: { slug: string }) => item.slug === actor.slug);
    await addVoice("intro", file, source?.voice?.introLine);
  } else if (actor.slug === "zhang-qiang" || actor.slug === "chen-wei") {
    if (files.includes("candidate-1.mp3"))
      await addVoice("intro", "candidate-1.mp3", lines.intro?.text);
  } else if (authored.has(actor.slug)) {
    for (const [slot, stem] of Object.entries(slots)) {
      const stems = slot === "intro-alt" ? [stem, "intro-alt"] : [stem];
      const file = files.find((name) =>
        stems.some((candidate) => name.includes(`__voice__${candidate}__v1.`)),
      );
      if (file) await addVoice(slot, file, lines[slot]?.text);
    }
  }
  manifest.items = items;
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
