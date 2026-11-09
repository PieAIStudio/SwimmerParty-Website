import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
function arg(name: string, fallback?: string) { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : fallback; }
const input = arg("--input"); const output = arg("--out"); const base = arg("--base-url", process.env.SWIMMERPARTY_BASE_URL ?? "http://127.0.0.1:3000");
if (!input || !output) throw new Error("Usage: pnpm film:shot -- --input shot.json --out shot.png [--base-url URL]");
const payload = JSON.parse(await readFile(input, "utf8")); const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const url = new URL("/en/scene/film?shot=" + encoded, base).toString(); const browser = await chromium.launch({ headless: true });
try { const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 }); await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 }); await page.locator('canvas[data-film-ready="true"]').waitFor({ state: "attached", timeout: 120_000 });
  const result = await page.evaluate(async () => { if (!window.__filmStageExport) throw new Error("film stage exporter unavailable"); return window.__filmStageExport(); });
  await writeFile(output, Buffer.from(result, "base64"));
} finally { await browser.close(); }
