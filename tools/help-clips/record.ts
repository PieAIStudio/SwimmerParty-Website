/**
 * Records the three "?" help clips (starter, sheet, cast) in zh and en.
 *
 * Usage, from the repository root, against a running local production server:
 *   node tools/help-clips/record.ts [--locale zh,en] [--topic starter,sheet,cast]
 *
 * Start the server in mock-account mode with the synthetic asset fixtures, so the
 * signed-in member is the mock member and no private masters are read:
 *   ACCOUNT_MODE=mock ASSET_STORE=local GUEST_LIMITER=memory \
 *   ASSET_LOCAL_ROOT=e2e/fixtures/assets-store pnpm build && pnpm start -p 3100
 * The base URL defaults to http://127.0.0.1:3100; set HELP_CLIPS_BASE to change it.
 * Use the built server, not `next dev`: the dev indicator would show in the frames.
 *
 * Frames come from the Chromium screencast, sampled at 25 fps, so each clip starts
 * and ends where the scene says. Downloads are discarded in a temporary folder.
 * Each context starts with empty storage, so the cast and sheet state is clean.
 */
import { chromium, type CDPSession, type Page } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { ACTORS, STATUS_LABEL } from "../../src/content/actors/index.ts";
import { messages } from "../../src/i18n/messages.source.ts";

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "../..");
const BASE = process.env.HELP_CLIPS_BASE ?? "http://127.0.0.1:3100";
const OUT_DIR = path.join(ROOT, "public/help");
const WORK_DIR = path.join(ROOT, ".devspace-reports/help-clips");
const FPS = 25;
const FRAME_MS = 1000 / FPS;
const SIZE = { width: 640, height: 400 };
const SHEET_VIEWPORT = { width: 1024, height: 640 };
const CAST_VIEWPORT = { width: 1024, height: 640 };
const CAP_BYTES = 300 * 1024;
const ACTOR = "tang-yunqiu";
const LOCALES = ["zh", "en"] as const;
const TOPICS = ["starter", "sheet", "cast"] as const;
type Locale = (typeof LOCALES)[number];
type Topic = (typeof TOPICS)[number];
type Cursor = { x: number; y: number };

/** Idle cursor spot: bottom right on the phone-sized clips, bottom left on the sheet, away from its thumbnails. */
const PARK: Cursor = { x: SIZE.width - 40, y: SIZE.height - 40 };
const SHEET_PARK: Cursor = { x: 24, y: SHEET_VIEWPORT.height - 24 };
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Button and name copy comes from the message catalog, so the clips cannot drift from the UI. */
function copy(locale: Locale) {
  const actor = ACTORS.find((item) => item.slug === ACTOR);
  if (!actor) throw new Error(`Missing actor ${ACTOR}`);
  return {
    starter: messages["actor.openLibrary"][locale],
    addToCast: messages["cast.add"][locale],
    inCast: messages["cast.added"][locale],
    actorName: locale === "zh" ? actor.nameCn : actor.nameEn,
    status: STATUS_LABEL[actor.status][locale],
  };
}

/** Samples the newest screencast frame at a fixed rate; a static page keeps its last frame. */
type Sampler = { pause: () => void; resume: () => void; stop: () => Promise<number> };
async function startSampler(page: Page, dir: string): Promise<Sampler> {
  const cdp: CDPSession = await page.context().newCDPSession(page);
  let latest: Buffer | undefined;
  cdp.on("Page.screencastFrame", (frame) => {
    latest = Buffer.from(frame.data, "base64");
    void cdp.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
  });
  // Every clip is capped at 1280x800 (16:10), so a viewport change mid-clip still encodes to one size.
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 95,
    maxWidth: 1280,
    maxHeight: 800,
    everyNthFrame: 1,
  });
  while (!latest) await sleep(20);
  let written = 0;
  let running = true;
  let writing = true;
  const t0 = Date.now();
  const loop = (async () => {
    for (let slot = 0; running; slot++) {
      const wait = t0 + slot * FRAME_MS - Date.now();
      if (wait > 0) await sleep(wait);
      if (!running || !writing || !latest) continue;
      written++;
      await writeFile(path.join(dir, `f${String(written).padStart(5, "0")}.jpg`), latest);
    }
  })();
  return {
    // A paused span is not written: the clip cuts from the last frame before it to the first after it.
    pause: () => {
      writing = false;
    },
    resume: () => {
      writing = true;
    },
    stop: async () => {
      running = false;
      await loop;
      await cdp.send("Page.stopScreencast").catch(() => {});
      await cdp.detach().catch(() => {});
      return written;
    },
  };
}

/** A 12 px dark dot with a white ring. It follows the mouse and shrinks while pressed. */
const CURSOR_INIT = `
(() => {
  const install = () => {
    if (document.getElementById("__help-cursor")) return;
    const dot = document.createElement("div");
    dot.id = "__help-cursor";
    dot.style.cssText = [
      "position:fixed", "left:0", "top:0", "width:12px", "height:12px",
      "margin:-6px 0 0 -6px", "border-radius:50%", "background:#1d1b19",
      "box-shadow:0 0 0 2px #ffffff, 0 1px 3px rgba(0,0,0,.35)", "z-index:2147483647",
      "pointer-events:none", "opacity:0", "transition:transform 90ms ease-out",
    ].join(";");
    document.documentElement.appendChild(dot);
    let at = "translate(0px,0px)";
    const place = (event) => {
      at = "translate(" + event.clientX + "px," + event.clientY + "px)";
      dot.style.opacity = "1";
      dot.style.transform = at;
    };
    addEventListener("mousemove", place, true);
    addEventListener("mousedown", () => { dot.style.transform = at + " scale(0.7)"; }, true);
    addEventListener("mouseup", () => { dot.style.transform = at; }, true);
  };
  if (document.documentElement) install();
  addEventListener("DOMContentLoaded", install);
})();
`;

async function glide(page: Page, cursor: Cursor, to: Cursor, ms: number) {
  const steps = Math.max(8, Math.round(ms / 25));
  for (let step = 1; step <= steps; step++) {
    const t = step / steps;
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    await page.mouse.move(cursor.x + (to.x - cursor.x) * eased, cursor.y + (to.y - cursor.y) * eased);
    await sleep(ms / steps);
  }
  cursor.x = to.x;
  cursor.y = to.y;
}

async function centerOf(locator: ReturnType<Page["getByRole"]>): Promise<Cursor> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element has no box");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** Scrolls so the element sits at a fixed height in the frame. */
async function frameAt(locator: ReturnType<Page["getByRole"]>, y: number) {
  await locator.evaluate((element, target) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - target, behavior: "instant" });
  }, y);
  await sleep(250);
}

async function press(page: Page) {
  await page.mouse.down();
  await sleep(150);
  await page.mouse.up();
}

/** After a press the label changes; move the dot off it so the new label reads clearly. */
async function stepOff(page: Page, cursor: Cursor) {
  await glide(page, cursor, { x: cursor.x + 40, y: cursor.y + 40 }, 300);
}

type Scene = {
  viewport: { width: number; height: number };
  path: (locale: Locale) => string;
  /** Waits until the first frame is the calm starting state. */
  ready: (page: Page, locale: Locale) => Promise<void>;
  /** Runs while the sampler records. The clip starts on the calm frame before this. */
  play: (page: Page, cursor: Cursor, locale: Locale, sampler: Sampler) => Promise<void>;
  /** Routes that shape the timing of the clip; nothing else is changed. */
  setup?: (page: Page) => Promise<void>;
};

const SCENES: Record<Topic, Scene> = {
  starter: {
    viewport: SIZE,
    path: (locale) => `/${locale}/actors/${ACTOR}`,
    ready: async (page, locale) => {
      const button = page.getByRole("button", { name: copy(locale).starter }).first();
      await button.waitFor({ state: "visible", timeout: 30_000 });
      await frameAt(button, 282);
    },
    setup: async (page) => {
      // Hold the signed-bundle request so the pending state stays on screen for a moment.
      await page.route("**/api/assets/tang-yunqiu/bundle", async (route) => {
        await sleep(900);
        await route.continue();
      });
    },
    play: async (page, cursor, locale) => {
      const button = page.getByRole("button", { name: copy(locale).starter }).first();
      await sleep(700);
      await glide(page, cursor, await centerOf(button), 700);
      await sleep(250);
      await press(page);
      await stepOff(page, cursor);
      await sleep(1200);
      await glide(page, cursor, PARK, 500);
      await sleep(700);
    },
  },
  sheet: {
    viewport: SHEET_VIEWPORT,
    path: (locale) => `/${locale}/actors/${ACTOR}/sheet`,
    ready: async (page) => {
      await page.waitForFunction(
        () => document.querySelector("canvas[aria-label]")?.getAttribute("data-preview-ready") === "true",
        undefined,
        { timeout: 30_000 },
      );
      // Zoom the desktop layout to 80% so the preview, the thumbnails and the count line share one frame.
      await page.evaluate(() => {
        document.body.style.zoom = "0.8";
        const canvas = document.querySelector("canvas[aria-label]");
        const top = (canvas?.getBoundingClientRect().top ?? 0) + window.scrollY;
        window.scrollTo({ top: top - 70, behavior: "instant" });
      });
      await sleep(400);
    },
    play: async (page, cursor) => {
      const targets = await page.evaluate(() =>
        [...document.querySelectorAll('li[data-asset-slot] button[aria-hidden="true"][data-selected="false"]')]
          .map((frame) => frame.getBoundingClientRect())
          .map((rect) => ({ top: Math.max(rect.top, 70), bottom: Math.min(rect.bottom, 630), left: rect.left, right: rect.right }))
          .filter((rect) => rect.bottom - rect.top >= 90 && rect.right <= window.innerWidth)
          .map((rect) => ({ x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 }))
          .slice(0, 3),
      );
      if (targets.length < 2) throw new Error(`Expected two or three visible thumbnails, found ${targets.length}`);
      await sleep(700);
      for (const target of targets) {
        await glide(page, cursor, target, 480);
        await sleep(150);
        await press(page);
        await sleep(350);
        await page
          .waitForFunction(
            () => document.querySelector("canvas[aria-label]")?.getAttribute("data-preview-ready") === "true",
            undefined,
            { timeout: 4000 },
          )
          .catch(() => {});
        await sleep(400);
      }
      await glide(page, cursor, SHEET_PARK, 500);
      await sleep(600);
    },
  },
  cast: {
    // The actor page uses the starter clip's 640x400 framing. /cast is shown at 1024x640 (about 0.63 in the frame)
    // so its heading and the top half of the first card portrait fit; the cut is a paused span of the sampler.
    viewport: SIZE,
    path: (locale) => `/${locale}/actors/${ACTOR}`,
    ready: async (page, locale) => {
      const button = page.getByRole("button", { name: copy(locale).addToCast }).first();
      await button.waitFor({ state: "visible", timeout: 30_000 });
      await frameAt(button, 282);
    },
    play: async (page, cursor, locale, sampler) => {
      const { addToCast, inCast, actorName } = copy(locale);
      await sleep(900);
      await glide(page, cursor, await centerOf(page.getByRole("button", { name: addToCast }).first()), 650);
      await sleep(250);
      await press(page);
      await page.getByRole("button", { name: inCast }).first().waitFor({ timeout: 5000 });
      await stepOff(page, cursor);
      await sleep(900);
      sampler.pause();
      await page.setViewportSize(CAST_VIEWPORT);
      await page.goto(`${BASE}/${locale}/cast`, { waitUntil: "load" });
      const listed = page.getByText(actorName, { exact: true }).first();
      await listed.waitFor({ timeout: 30_000 });
      await page.evaluate(() => document.fonts.ready);
      // Heading at the top under the header, with the card portrait's top half below it.
      await page.evaluate(() => {
        const heading = document.querySelector("h1");
        if (!heading) throw new Error("No cast heading");
        window.scrollTo({ top: heading.getBoundingClientRect().top + window.scrollY - 80, behavior: "instant" });
      });
      await sleep(300);
      sampler.resume();
      await sleep(1300);
    },
  },
};

/** webm (VP9) and mp4 (H.264, faststart, no audio). Each steps its CRF until the file fits the cap. */
async function encode(frames: string, base: string) {
  const input = ["-framerate", String(FPS), "-i", path.join(frames, "f%05d.jpg")];
  const filter = `scale=${SIZE.width}:${SIZE.height}:flags=lanczos,format=yuv420p`;
  for (let crf = 38; crf <= 50; crf += 2) {
    await run("ffmpeg", ["-y", "-loglevel", "error", ...input, "-vf", filter, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf), "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", `${base}.webm`]);
    if ((await stat(`${base}.webm`)).size <= CAP_BYTES) break;
  }
  for (let crf = 28; crf <= 40; crf += 2) {
    await run("ffmpeg", ["-y", "-loglevel", "error", ...input, "-vf", filter, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p", "-color_range", "tv", "-movflags", "+faststart", `${base}.mp4`]);
    if ((await stat(`${base}.mp4`)).size <= CAP_BYTES) break;
  }
  // The poster is the calm starting frame, the same picture the clip opens on.
  await sharp(path.join(frames, "f00001.jpg")).resize(SIZE.width, SIZE.height, { fit: "fill" }).webp({ quality: 86 }).toFile(`${base}-poster.webp`);
}

async function duration(file: string) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]);
  return Number(Number(stdout.trim()).toFixed(2));
}

async function recordOne(locale: Locale, topic: Topic) {
  const scene = SCENES[topic];
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: scene.viewport,
    deviceScaleFactor: 2,
    colorScheme: "light",
    reducedMotion: "no-preference",
    acceptDownloads: true,
  });
  try {
    const sign = await context.request.post(`${BASE}/api/auth/mock/sign-in`);
    if (!sign.ok()) throw new Error(`Mock sign-in failed with ${sign.status()}`);
    await context.addInitScript(CURSOR_INIT);
    const page = await context.newPage();
    page.on("download", (download) => void download.delete().catch(() => {}));
    if (scene.setup) await scene.setup(page);
    await page.goto(`${BASE}/${locale}/actors/${ACTOR}`, { waitUntil: "load" });
    await page.evaluate(() => {
      localStorage.removeItem("sp-cast");
      sessionStorage.clear();
    });
    await page.goto(`${BASE}${scene.path(locale)}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await scene.ready(page, locale);
    await sleep(900);
    const park: Cursor = topic === "sheet" ? SHEET_PARK : { x: scene.viewport.width - 40, y: scene.viewport.height - 40 };
    const cursor: Cursor = { ...park };
    await page.mouse.move(park.x, park.y);
    // Let the cursor settle on its idle spot before the first sampled frame, so frame 1 is calm.
    await sleep(300);
    const frames = path.join(WORK_DIR, `${locale}-${topic}`);
    await rm(frames, { recursive: true, force: true });
    await mkdir(frames, { recursive: true });
    const sampler = await startSampler(page, frames);
    await scene.play(page, cursor, locale, sampler);
    const count = await sampler.stop();
    const base = path.join(OUT_DIR, locale, topic);
    await mkdir(path.dirname(base), { recursive: true });
    await encode(frames, base);
    const sizes = {
      webm: (await stat(`${base}.webm`)).size,
      mp4: (await stat(`${base}.mp4`)).size,
      poster: (await stat(`${base}-poster.webp`)).size,
    };
    return { locale, topic, frames: count, seconds: await duration(`${base}.mp4`), sizes };
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const pick = <T extends string>(flag: string, all: readonly T[]): T[] => {
    const index = argv.indexOf(flag);
    if (index === -1) return [...all];
    const values = (argv[index + 1] ?? "").split(",").filter(Boolean) as T[];
    for (const value of values) if (!all.includes(value)) throw new Error(`Unknown ${flag} value ${value}`);
    return values;
  };
  const locales = pick("--locale", LOCALES);
  const topics = pick("--topic", TOPICS);
  await mkdir(WORK_DIR, { recursive: true });
  const report = [];
  for (const locale of locales) {
    for (const topic of topics) {
      const result = await recordOne(locale, topic);
      report.push(result);
      console.log(JSON.stringify(result));
    }
  }
  const over = report.flatMap((item) =>
    Object.entries(item.sizes)
      .filter(([, bytes]) => bytes > CAP_BYTES)
      .map(([kind]) => `${item.locale}/${item.topic}.${kind}`),
  );
  if (over.length) throw new Error(`Over the 300 KB cap: ${over.join(", ")}`);
  console.log(`Recorded ${report.length} clip sets into ${path.relative(ROOT, OUT_DIR)}.`);
}

await main();
