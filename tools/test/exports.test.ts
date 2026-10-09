import test from "node:test";
import assert from "node:assert/strict";
import { syntheticAssetRecords } from "./fixtures/asset-records.ts";
import { selectModelAssets, veoPlan } from "../../src/features/assets/export-plan.ts";
import { sheetLayout, SHEET_WIDTH, SHEET_HEIGHT } from "../../src/features/assets/sheet-layout.ts";
import { EXPORT_TARGETS } from "../../src/content/tools.ts";
import { assetFilename } from "../../src/features/assets/downloads.ts";
import { getKitManifest } from "../../src/features/assets/kit-assets.ts";
const assets = syntheticAssetRecords();

test("twenty selected references retain the explicit GPT and Seedance priorities and caps", () => {
  assert.equal(assets.items.length, 20);
  const gpt = selectModelAssets([...assets.items].reverse(), "gpt-image");
  assert.equal(gpt.length, 16);
  assert.deepEqual(
    gpt.slice(0, 7).map((item) => item.slot),
    [
      "face.front",
      "turnaround.front",
      "face.three-quarter",
      "turnaround.three-quarter",
      "turnaround.side",
      "face.side",
      "turnaround.back",
    ],
  );
  assert.equal(gpt[7].slot, "expression.neutral");
  assert.equal(selectModelAssets(assets.items, "seedance").length, 9);
  assert.equal(EXPORT_TARGETS.find((target) => target.id === "seedance")!.verifiedAt, null);
});

test("Veo uses delivered fallback references and never invents its missing expression sheet", () => {
  const one = [assets.items.find((item) => item.slot === "face.front")!];
  const plan = veoPlan(one, assets.items)!;
  assert.equal(plan.identity.slot, "face.front");
  assert.equal(plan.turns.length, 4);
  assert.equal(plan.expressions.length, 12);
  assert.equal(new Set(plan.items.map((item) => item.slot)).size, plan.items.length);
  assert.equal(
    veoPlan(
      assets.items.filter((item) => item.series === "turnaround"),
      assets.items.filter((item) => item.series === "turnaround"),
    ),
    null,
  );
});

test("one-kind and mixed contact sheets stay inside 3840×2160 with exact margins and no overlaps", () => {
  for (const count of [1, 3, 12, 20, 64])
    for (const kind of ["full", "head", "mixed"])
      for (const labels of [true, false]) {
        const flags = Array.from(
          { length: count },
          (_, index) => kind === "full" || (kind === "mixed" && index < Math.min(4, count - 1)),
        );
        const boxes = sheetLayout(flags, labels);
        assert.equal(boxes.length, count);
        for (const box of boxes) {
          assert.ok(box.width > 0 && box.height > 0);
          assert.ok(box.x >= 80 && box.y >= 80);
          assert.ok(box.x + box.width <= SHEET_WIDTH - 80 + 0.01);
          assert.ok(box.y + box.height <= SHEET_HEIGHT - 80 + 0.01);
          if (labels) assert.ok(box.labelY <= SHEET_HEIGHT - 80);
        }
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i],
              b = boxes[j];
            assert.ok(
              a.x + a.width <= b.x + 0.01 ||
                b.x + b.width <= a.x + 0.01 ||
                a.y + a.height <= b.y + 0.01 ||
                b.y + b.height <= a.y + 0.01,
            );
          }
      }
  const expressions = sheetLayout(Array(12).fill(false), false, true);
  assert.equal(new Set(expressions.map((box) => box.x)).size, 4);
  assert.equal(new Set(expressions.map((box) => box.y)).size, 3);
});

test("download filenames preserve series, registered look and actual source format", () => {
  assert.equal(
    assetFilename("SP-01", { series: "turnaround", key: "front", look: null, format: "webp" }),
    "SP-01_turnaround-front.webp",
  );
  assert.equal(
    assetFilename("SP-01", { series: "wardrobe", key: "side", look: "work", format: "png" }),
    "SP-01_wardrobe-work-side.png",
  );
});

test("K-04 is live only because real turnarounds exist; K-05 and K-06 are not fictitiously live", () => {
  const kit = getKitManifest();
  assert.equal(kit.find((item) => item.index === "K-04")?.status, "live");
  assert.equal(kit.find((item) => item.index === "K-05")?.status, "live");
  assert.equal(kit.find((item) => item.index === "K-06")?.status, "live");
});
