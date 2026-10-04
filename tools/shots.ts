import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { ACTORS } from "../src/content/actors.ts";

/** Seventeen document targets, plus asset libraries once they exist.
 * Real scroll entrances run before the full-page capture; nothing is force-shown.
 * Top frames keep the studio's actual viewport lighting available for review.
 */
const OUT = process.argv[2];
if (!OUT) throw new Error("Usage: node tools/shots.mjs <output-directory> [name-filter]");
const FILTER = process.argv[3] ?? "";
const BASE = process.env.SHOTS_BASE ?? "http://127.0.0.1:3398";
const pages = ["", "/actors", "/works", "/kit", "/studio", "/casting", "/pact"];
const targets = [
  ...["zh", "en"].flatMap(locale => [
    ...pages.map(route => [`${route.slice(1) || "home"}-${locale}`, `/${locale}${route}`]),
    ...ACTORS.flatMap(actor => [
      [`${actor.slug}-${locale}`, `/${locale}/actors/${actor.slug}`],
      [`assets-${actor.slug}-${locale}`, `/${locale}/kit/${actor.slug}`],
    ]),
    [`404-${locale}`, `/${locale}/actors/not-an-actor`],
  ]),
];
await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const theme of ["light", "dark"]) {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, colorScheme: theme, reducedMotion: "reduce", deviceScaleFactor: 1 });
      const page = await context.newPage();
      for (const [name, route] of targets) {
        if (FILTER && !new RegExp(FILTER).test(name)) continue;
        const errors = [];
        const onError = error => errors.push(String(error));
        page.on("pageerror", onError);
        const response = await page.goto(BASE + route, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const stage = page.locator("[data-clay-stage] canvas");
        if (await page.locator("[data-clay-stage]").count()) await stage.waitFor({ state: "visible" });
        const metrics = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth, theme: document.documentElement.dataset.gameUiTheme, style: document.documentElement.dataset.gameUiStyle }));
        const height = page.viewportSize().height;
        for (let y = 0; y < metrics.height; y += Math.floor(height * 0.8)) {
          await page.evaluate(top => window.scrollTo(0, top), y);
          await page.waitForTimeout(16);
        }
        await page.waitForTimeout(100);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);
        const prefix = `${name}-${theme}-${width}`;
        await page.screenshot({ path: path.join(OUT, `${prefix}.png`), fullPage: true });
        await page.screenshot({ path: path.join(OUT, `${prefix}-top.png`) });
        const canvases = page.locator("[data-clay-stage] canvas");
        if (await canvases.count()) {
          await canvases.first().scrollIntoViewIfNeeded();
          await page.waitForTimeout(100);
          await canvases.first().screenshot({ path: path.join(OUT, `${prefix}-clay.png`) });
        }
        const status = response?.status();
        const validStatus = name.startsWith("404") ? status === 404 : status === 200;
        const ok = validStatus && !errors.length && metrics.width <= width && metrics.theme === theme && metrics.style === "grey";
        results.push({ name, route, theme, width, status, metrics, errors, ok, file: `${prefix}.png` });
        console.log(`${ok ? "PASS" : "FAIL"} ${prefix} status=${status} size=${metrics.width}x${metrics.height}`);
        page.off("pageerror", onError);
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  let previous = [];
  if (FILTER) {
    try { previous = JSON.parse(await fs.readFile(path.join(OUT, "index.json"), "utf8")); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  const identity = result => `${result.name}:${result.theme}:${result.width}`;
  const merged = new Map(previous.map(result => [identity(result), result]));
  results.forEach(result => merged.set(identity(result), result));
  await fs.writeFile(path.join(OUT, "index.json"), JSON.stringify([...merged.values()], null, 2) + "\n");
}
// Four-theme/width contact sheets group each document for visual inspection.
for (const [name] of targets) {
  const group = results.filter(result => result.name === name);
  if (!group.length) continue;
  const panels = await Promise.all(group.map(async result => {
    const input = await sharp(path.join(OUT, result.file)).resize({ width: 360 }).png().toBuffer();
    return { input, height: (await sharp(input).metadata()).height };
  }));
  const panelHeight = Math.max(...panels.map(panel => panel.height));
  await sharp({ create: { width: 360 * panels.length, height: panelHeight, channels: 4, background: { r: 125, g: 125, b: 125, alpha: 1 } } }).composite(panels.map((panel, index) => ({ input: panel.input, left: 360 * index, top: 0 }))).png().toFile(path.join(OUT, `${name}-review.png`));
}
if (results.some(result => !result.ok)) process.exitCode = 1;
console.log(`Saved ${results.length} page/theme/width combinations to ${OUT}`);
