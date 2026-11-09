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
if (!input || !output) throw new Error("Usage: pnpm film:shot -- --input shot.json --out shot.png [--batch] [--base-url URL]");

const document = JSON.parse(await readFile(input, "utf8"));
const shots = batch ? (Array.isArray(document) ? document : document.shots) : [document];
if (!Array.isArray(shots) || shots.length === 0) throw new Error("film:shot input must contain one shot or a nonempty shots array");
if (batch) await mkdir(output, { recursive: true });
const cameraRecords: Array<{ id: string; camera: unknown }> = [];

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await page.goto(new URL("/en/scene/film-harness", base).toString(), {
    waitUntil: "networkidle",
    timeout: 120_000,
  });
  await page.waitForFunction(() => typeof window.__MF_SET_FILM_SHOT__ === "function", null, {
    timeout: 120_000,
  });
  for (const shot of shots) {
    await page.evaluate((payload) => window.__MF_SET_FILM_SHOT__?.(payload), shot);
    await page.waitForFunction(
      (id) =>
        document.body.dataset.mfShotId === id &&
        typeof window.__filmStageExport === "function" &&
        Boolean(document.querySelector("canvas")?.dataset.sceneCamera),
      shot.id,
      { timeout: 120_000 },
    );
    const result = await page.evaluate(async () => {
      if (!window.__filmStageExport) throw new Error("film stage exporter unavailable");
      return window.__filmStageExport();
    });
    const target = batch ? join(output, `${shot.id}.png`) : output;
    const camera = await page.evaluate(() => {
      const raw = document.querySelector("canvas")?.dataset.sceneCamera;
      return raw ? JSON.parse(raw) : null;
    });
    cameraRecords.push({ id: shot.id, camera });
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, Buffer.from(result, "base64"));
  }
  if (batch) await writeFile(join(output, "camera-data.json"), JSON.stringify(cameraRecords, null, 2) + "\n");
} finally {
  await browser.close();
}
