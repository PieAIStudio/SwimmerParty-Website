import { strToU8 } from "fflate";
import type { Actor } from "../../content/actors/index.ts";
import type { ActorAssets, AssetItem } from "./asset-types.ts";
import type { ExportTarget } from "../../content/tools.ts";
import { LICENSE, LICENSE_RULES } from "../../content/license.ts";
import { listSeries } from "./asset-series.ts";
import { SITE } from "../../content/site.ts";
import { characterProfile } from "./asset-profile.ts";
import { assetFilename, MAX_BUNDLE_ITEMS, SignInRequired } from "./downloads.ts";
import { zipBlob } from "../../lib/browser-files.ts";
import { loadSignedImages } from "./signed-images.ts";
import { selectModelAssets, veoPlan } from "./export-plan.ts";
import { isFullBodySeries } from "./contracts.ts";
import { createSheetPainter, sheetBlob, type SheetOptions } from "./render-sheet.ts";

export type ExportFormat = "zip" | "sheet" | "model";
export type ExportRequest = {
  actor: Actor;
  assets: ActorAssets;
  selected: AssetItem[];
  format: ExportFormat;
  target: ExportTarget;
  /** Only the one-sheet format reads these; originals and model packs ignore them. */
  sheet?: SheetOptions;
  locale: "zh" | "en";
  labels: Record<string, { en: string; zh: string }>;
  signal: AbortSignal;
};
export { SignInRequired };
function ensureActive(signal: AbortSignal) {
  signal.throwIfAborted();
}

export async function exportPack(input: ExportRequest): Promise<{ blob: Blob; filename: string }> {
  const { actor, assets, selected, signal } = input;
  if (!selected.length || selected.length > MAX_BUNDLE_ITEMS)
    throw new Error("Invalid export selection");
  const veo =
    input.format === "model" && input.target === "veo" ? veoPlan(selected, assets.items) : null;
  if (input.format === "model" && input.target === "veo" && !veo)
    throw new Error("Veo requires a face/front, turnaround and expression references");
  const items =
    input.format === "model"
      ? veo
        ? veo.items
        : selectModelAssets(selected, input.target as "gpt-image" | "seedance")
      : selected;
  ensureActive(signal);
  const images = await loadSignedImages(
    actor.slug,
    items.map((item) => ({ slot: item.slot, filename: assetFilename(actor.slug, item) })),
    { signal, maxBytes: 256 * 1024 * 1024 },
  );
  const blobs = new Map(images.map((item) => [item.slot, item.blob]));
  ensureActive(signal);
  async function sheet(set: AssetItem[], options: SheetOptions): Promise<Blob> {
    const painter = createSheetPainter(
      set.map((item) => ({
        fullBody: isFullBodySeries(item.series),
        labels: input.labels[item.slot] ?? { en: item.key, zh: item.key },
      })),
      options,
    );
    try {
      // Decode at most one full-resolution image at a time, including large multi-selections.
      for (const [index, item] of set.entries()) {
        ensureActive(signal);
        const source = await createImageBitmap(blobs.get(item.slot)!);
        try {
          ensureActive(signal);
          painter.paint(index, { source, width: source.width, height: source.height });
        } finally {
          source.close();
        }
      }
      const output = await sheetBlob(painter.canvas);
      ensureActive(signal);
      return output;
    } finally {
      painter.canvas.width = 1;
      painter.canvas.height = 1;
    }
  }
  if (input.format === "sheet")
    return {
      blob: await sheet(items, input.sheet ?? { labels: "none", background: "grey" }),
      filename: `${actor.slug}_sheet.png`,
    };
  const files: Record<string, Uint8Array> = {};
  const descriptions: string[] = [];
  async function add(filename: string, blob: Blob, description: string) {
    ensureActive(signal);
    files[filename] = new Uint8Array(await blob.arrayBuffer());
    descriptions.push(`Image ${descriptions.length + 1} (${filename}): ${description}`);
  }
  if (veo) {
    await add(
      assetFilename(actor.slug, veo.identity),
      blobs.get(veo.identity.slot)!,
      "Identity reference. Preserve the animated character's face and proportions; do not make a real person.",
    );
    await add(
      `${actor.slug}_turnaround-sheet.png`,
      await sheet(veo.turns, { labels: "none", background: "grey" }),
      "Full-body turnaround references, with no labels.",
    );
    await add(
      `${actor.slug}_expression-sheet.png`,
      await sheet(veo.expressions, { labels: "none", background: "grey", expressionGrid: true }),
      "Expression references on a 4 by 3 grid, with no labels.",
    );
  } else
    for (const item of items) {
      const slot = listSeries()
        .find((series) => series.id === item.series)
        ?.slots.find((candidate) => candidate.key === item.key);
      await add(
        assetFilename(actor.slug, item),
        blobs.get(item.slot)!,
        `${item.series}: ${slot?.direction ?? item.key}.${item.conformance === "legacy" ? " Legacy opaque-background original, not a transparent v1 asset." : " Transparent original."}`,
      );
    }
  files["character.json"] = strToU8(
    JSON.stringify(characterProfile(actor, assets), null, 2) + "\n",
  );
  files["README-for-AI.txt"] = strToU8(
    `${actor.slug} — ${actor.nameEn}\nAnimated character; never a real-person likeness.\n\n${descriptions.join("\n")}\n\nConsult character.json and LICENSE.txt.\n`,
  );
  files["LICENSE.txt"] = strToU8(licenseText(input.locale));
  ensureActive(signal);
  return {
    blob: zipBlob(files, signal),
    filename: `${actor.slug}_assets_${new Date().toISOString().slice(0, 10).replaceAll("-", "")}.zip`,
  };
}

/** The current License v1.0, the same terms the license page and starter pack show. */
export function licenseText(locale: "en" | "zh"): string {
  const zh = locale === "zh";
  const rules = (list: readonly (readonly string[])[]) =>
    list
      .map(
        ([enHead, enBody, zhHead, zhBody]) => `- ${zh ? zhHead : enHead}: ${zh ? zhBody : enBody}`,
      )
      .join("\n");
  return (
    [
      `${LICENSE.title[locale]} v${LICENSE.version}`,
      LICENSE.description[locale],
      `${zh ? "可以" : "You can"}\n${rules(LICENSE_RULES.can)}`,
      `${zh ? "不可以" : "You can't"}\n${rules(LICENSE_RULES.cannot)}`,
      `${zh ? "署名" : "Credit"}: ${LICENSE.credit[locale]}`,
      `${SITE.url}/${locale}/license`,
    ].join("\n\n") + "\n"
  );
}
