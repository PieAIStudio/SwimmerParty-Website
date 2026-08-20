import { chromium, devices } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

/**
 * Visual QA capture.
 *
 * Viewport frames at a series of scroll offsets, not `fullPage`. This site
 * pins and sticks several sections, and a full-page capture composites
 * those at whatever position they were stuck at — which produces images
 * that show section order that no visitor ever sees. Stepping the scroll
 * and shooting the viewport is what the visitor actually gets.
 */
const OUT = process.argv[2];
const ONLY = process.argv[3];
// Matches the dev server in .claude/launch.json.
const BASE = "http://localhost:3311";

const SETTLE = `
  document.querySelectorAll('.sp-word').forEach(w => { w.style.opacity='1'; w.style.transform='none'; });
  document.querySelectorAll('.sp-reveal,.sp-clip').forEach(e => e.classList.add('is-in'));
`;

const TARGETS = [
  ["home", "/zh", 14],
  ["home-en", "/en", 14],
  ["actors", "/zh/actors", 7],
  ["hu-qian", "/zh/actors/hu-qian", 5],
  ["dai-er", "/zh/actors/dai-er", 5],
  ["kit", "/zh/kit", 7],
  ["pact", "/zh/pact", 8],
  ["works", "/zh/works", 4],
  ["studio", "/zh/studio", 5],
  ["casting", "/zh/casting", 4],
];

const browser = await chromium.launch();
const errors = [];

async function run(vname, contextOptions) {
  const ctx = await browser.newContext(contextOptions);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${vname} ${e}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${vname} ${m.text()}`);
  });

  for (const [name, url, frames] of TARGETS) {
    if (ONLY && !name.startsWith(ONLY)) continue;
    if (vname === "phone" && name.endsWith("-en")) continue;

    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1400);

    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = page.viewportSize().height;
    const span = Math.max(0, total - vh);

    for (let i = 0; i < frames; i += 1) {
      const y = frames === 1 ? 0 : Math.round((span * i) / (frames - 1));
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(420);
      await page.evaluate(SETTLE);
      await page.waitForTimeout(180);
      await page.screenshot({
        path: path.join(OUT, `${vname}-${name}-${String(i).padStart(2, "0")}.png`),
      });
    }
    console.log("shot", vname, name, frames, `doc=${total}`);
  }
  await ctx.close();
}

fs.mkdirSync(OUT, { recursive: true });
await run("desk", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await run("phone", { ...devices["iPhone 14"], deviceScaleFactor: 1 });
await browser.close();

if (errors.length) {
  console.log("\nPAGE ERRORS:");
  for (const e of [...new Set(errors)].slice(0, 20)) console.log(" -", e);
} else {
  console.log("\nno page errors");
}
