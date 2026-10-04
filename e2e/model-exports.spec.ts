import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
import sharp from "sharp";
import { ACTORS } from "../src/content/actors";
import { assetFilename } from "../src/features/assets/downloads";
import { syntheticAssetRecords } from "../tools/fixtures/asset-records";
import { installExportBrowserModules } from "./export-browser-modules";

for (const [target, count] of [
  ["gpt-image", 16],
  ["seedance", 9],
  ["veo", 3],
] as const) {
  test(`actual browser export engine packs twenty synthetic selections for ${target}: ${count} images`, async ({
    page,
  }) => {
    const assets = syntheticAssetRecords();
    const actor = ACTORS.find((item) => item.slug === assets.slug)!;
    const pixels = await readFile("e2e/fixtures/assets-store/synthetic.png");
    await installExportBrowserModules(page);
    await page.route("**/__synthetic-image.png", (route) =>
      route.fulfill({ contentType: "image/png", body: pixels }),
    );
    await page.route("**/api/assets/hu-qian/bundle", async (route) => {
      const slots = route.request().postDataJSON().slots as string[];
      const items = slots.map((slot) => assets.items.find((item) => item.slot === slot)!);
      await route.fulfill({
        json: {
          items: items.map((item) => ({
            ...item,
            url: "/__synthetic-image.png",
            filename: assetFilename(actor.code, item),
          })),
        },
      });
    });
    await page.goto("/en/kit/hu-qian");
    const result = await page.evaluate(
      async (input) => {
        const modulePath = "/__export_modules/src/lib/export-packs.ts";
        const { exportPack } = (await import(
          modulePath
        )) as typeof import("../src/features/assets/export-packs");
        const file = await exportPack({
          actor: input.actor,
          assets: input.assets,
          selected: input.assets.items,
          target: input.target,
          format: "model",
          locale: "en",
          sheet: { labels: "none", background: "grey" },
          labels: Object.fromEntries(
            input.assets.items.map((item) => [item.slot, { en: item.key, zh: item.key }]),
          ),
          signal: new AbortController().signal,
        });
        return {
          filename: file.filename,
          bytes: [...new Uint8Array(await file.blob.arrayBuffer())],
        };
      },
      { actor, assets, target },
    );
    const files = unzipSync(new Uint8Array(result.bytes));
    const images = Object.keys(files).filter((name) => /\.(png|webp)$/.test(name));
    expect(images).toHaveLength(count);
    expect(strFromU8(files["README-for-AI.txt"]).match(/^Image \d+ /gm)).toHaveLength(count);
    if (target !== "veo") {
      expect(images[0]).toBe("SP-01_face-front.png");
      for (const name of images) expect(files[name]).toEqual(new Uint8Array(pixels));
    } else {
      expect(images).toEqual([
        "SP-01_face-front.png",
        "SP-01_turnaround-sheet.png",
        "SP-01_expression-sheet.png",
      ]);
      for (const name of images.filter((filename) => filename.endsWith("-sheet.png"))) {
        const image = await sharp(files[name]).metadata();
        expect([image.width, image.height]).toEqual([3840, 2160]);
      }
    }
  });
}
