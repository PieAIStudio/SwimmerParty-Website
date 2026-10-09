import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { EXPORT_TARGETS } from "../../src/content/tools.ts";
import {
  ASSET_FRAMES,
  listSeries,
  seriesOf,
  slotsOf,
} from "../../src/features/assets/asset-series.ts";
import { getActorAssets } from "../../src/features/assets/assets.ts";
import { actorByCode, cliArgs, isMain, reportError } from "./assets-common.ts";

export function todo(code: string, options: { root?: string; all?: boolean } = {}) {
  const root = options.root ?? process.cwd();
  const actor = actorByCode(code);
  const manifest = getActorAssets(actor.slug, root);
  const delivered = new Set(manifest.items.map((item) => item.slot));
  const missing = listSeries()
    .filter((series) => !["voice", "video"].includes(series.id))
    .flatMap((series) =>
      series.perLook
        ? options.all
          ? manifest.looks.flatMap((look) => slotsOf(series.id, look.id))
          : []
        : slotsOf(series.id).filter((slot) => options.all || slot.required),
    )
    .filter((slot) => !delivered.has(slot.slot));
  const version = Math.max(
    1,
    ...manifest.items.filter((item) => item.conformance === "v1").map((item) => item.version),
  );
  const text = [
    `# ${code} ${actor.nameEn} — ${missing.length} missing slots`,
    "",
    ...missing.flatMap((slot) => {
      const series = seriesOf(slot.series);
      const frame = ASSET_FRAMES[slot.frame];
      const group = slot.look ? `${series.id}-${slot.look}` : series.id;
      const look = manifest.looks.find((item) => item.id === slot.look);
      const direction = series.prompt
        .replace("{direction}", slot.direction)
        .replace("{look}", look?.prompt ?? "");
      return [
        `## ${slot.slot}`,
        "",
        `Output: ${code}__${group}__${slot.key}__v${version}.png — ${frame.width} × ${frame.height}, transparent background, PNG.`,
        "",
        `Use the attached reference images as the only source of this character's identity: ${actor.nameEn.toUpperCase()} (${code}).`,
        "Keep the face structure, eye shape, hairstyle, skin tone, body proportions and wardrobe identical to the references.",
        "Stylised 3D animated character, feature-animation look, NOT photorealistic. Do not render as a real human. Do not add photographic skin detail.",
        direction,
        "Lighting: soft, even, neutral-white studio light from the front. No colored rim light, no visible lamps or light fixtures, no cast floor shadow.",
        "Background: fully transparent. No text, no watermark, no border, no other people.",
        "",
        `${EXPORT_TARGETS.find((target) => target.id === "gpt-image")!.name} · ${frame.width}x${frame.height} · background transparent · PNG · quality high`,
        delivered.has("face.front") && delivered.has("turnaround.front")
          ? "References: face.front and turnaround.front."
          : "References: face.front and turnaround.front. Create the missing anchors first.",
        "",
      ];
    }),
  ].join("\n");
  return { missing, text };
}

export async function writeTodo(code: string, options: { root?: string; all?: boolean } = {}) {
  const result = todo(code, options);
  const destination = path.join(options.root ?? process.cwd(), "assets-inbox", code);
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "TODO.md"), result.text);
  return result;
}

if (isMain(import.meta.url)) {
  Promise.resolve()
    .then(async () => {
      const { code, flags } = cliArgs(["--all"]);
      const result = await writeTodo(code, { all: flags.includes("--all") });
      console.log(result.text);
      console.log(`Saved assets-inbox/${code}/TODO.md`);
    })
    .catch(reportError);
}
