import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { chromium } from "@playwright/test";

function arg(name: string, fallback?: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const input = arg("--input");
const output = arg("--out");
const base = arg("--base-url", process.env.SWIMMERPARTY_BASE_URL ?? "http://127.0.0.1:3000");
const batch = process.argv.includes("--batch");
if (!input || !output)
  throw new Error(
    "Usage: pnpm film:shot -- --input shot.json --out shot.png [--batch] [--base-url URL]",
  );

const document = JSON.parse(await readFile(input, "utf8"));
const shots = batch ? (Array.isArray(document) ? document : document.shots) : [document];
if (!Array.isArray(shots) || shots.length === 0)
  throw new Error("film:shot input must contain one shot or a nonempty shots array");
if (batch) await mkdir(output, { recursive: true });
const cameraRecords: Array<{ id: string; camera: unknown; stage: unknown }> = [];
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });
  await page.goto(new URL("/en/scene/film-harness", base).toString(), {
    waitUntil: "networkidle",
    timeout: 120_000,
  });
  await page.waitForFunction(
    () =>
      document.body.dataset.mfHarnessReady === "true" &&
      typeof window.__MF_SET_FILM_SHOT__ === "function",
    null,
    { timeout: 120_000 },
  );
  for (const shot of shots) {
    await page.evaluate((payload) => {
      document.querySelector("canvas")?.removeAttribute("data-scene-frame-margins");
      window.__MF_SET_FILM_SHOT__?.(payload);
    }, shot);
    let result: string | null = null; // The React scene exporter is cleared and reattached on each shot remount.
    // Never accept a readiness observation from the previous shot.
    for (let attempt = 0; attempt < 6 && !result; attempt++) {
      await page.waitForFunction(
        ({ id, people }) => {
          const canvas = document.querySelector("canvas");
          if (
            document.body.dataset.mfShotId !== id ||
            canvas?.dataset.sceneReady !== "true" ||
            typeof window.__filmStageExport !== "function"
          )
            return false;
          try {
            const margins = JSON.parse(canvas.dataset.sceneFrameMargins ?? "{}");
            return people.every(
              (personId: string) =>
                typeof margins[personId]?.min === "number" &&
                Number.isFinite(margins[personId].min),
            );
          } catch {
            return false;
          }
        },
        { id: shot.id, people: Array.isArray(shot.onScreenIds) ? shot.onScreenIds : [] },
        { timeout: 120_000 },
      );
      result = await page.evaluate(async () => {
        const exporter = window.__filmStageExport;
        return exporter ? exporter() : null;
      });
    }
    if (!result) throw new Error(`${shot.id}: film stage exporter did not settle`);
    const target = batch ? join(output, `${shot.id}.png`) : output;
    const camera = await page.evaluate(() => {
      const raw = document.querySelector("canvas")?.dataset.sceneCamera;
      return raw ? JSON.parse(raw) : null;
    });
    const stage = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const parse = (raw?: string) => {
        try {
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      };
      return {
        hiddenObjects: parse(canvas?.dataset.sceneHiddenObjects) ?? [],
        personInsideProps: parse(canvas?.dataset.scenePropCheck) ?? [],
        frameMargins: parse(canvas?.dataset.sceneFrameMargins) ?? {},
      };
    });
    cameraRecords.push({ id: shot.id, camera, stage });
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(result, "base64"));
  }
  if (batch)
    await writeFile(
      join(output, "camera-data.json"),
      JSON.stringify(cameraRecords, null, 2) + "\n",
    );
} finally {
  await browser.close();
}
