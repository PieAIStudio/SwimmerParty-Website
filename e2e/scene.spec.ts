import { test, expect, type Page } from "@playwright/test";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { PerspectiveCamera, Vector3 } from "three";
import { ACTORS } from "../src/content/actors";
import {
  BUILDS,
  DRAFT_KEY,
  FRAMES,
  FIGURE_BANDS,
  POSES,
  initialScene,
  readDraft,
} from "../src/features/scene/model";
import { figureScale, loadFigure } from "../src/features/scene/figure-assets";
import manifest from "../public/scene/figures/manifest.json";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

const evidencePrefix = process.env.SCENE_EVIDENCE_PREFIX ?? "C";
const evidenceRoot = process.env.PLAYWRIGHT_EVIDENCE_DIR ?? "run-1";
const five = ACTORS.slice(0, 5)
  .map((actor) => actor.slug)
  .join(",");
type CameraEvidence = {
  subject: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  aspect: number;
  bodies: { id: string; min: number[]; max: number[] }[];
};
const cameraEvidence = async (page: Page): Promise<CameraEvidence> =>
  JSON.parse((await page.locator("canvas").getAttribute("data-scene-camera"))!);
function expectFullFit(state: CameraEvidence) {
  const camera = new PerspectiveCamera(state.fov, state.aspect, 0.05, 10000);
  camera.position.set(...state.position);
  camera.lookAt(new Vector3(...state.target));
  camera.updateMatrixWorld(true);
  for (const body of state.bodies) {
    for (const x of [body.min[0], body.max[0]])
      for (const y of [body.min[1], body.max[1] + 0.28])
        for (const z of [body.min[2], body.max[2]]) {
          const projected = new Vector3(x, y, z).project(camera);
          expect(Math.abs(projected.x)).toBeLessThanOrEqual(1.01);
          expect(Math.abs(projected.y)).toBeLessThanOrEqual(1.01);
        }
  }
}
const ready = async (page: Page) => {
  await expect(page.locator("canvas[data-scene-ready=true]")).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(async () => {
      const state = readDraft(JSON.stringify(await draft(page)))!;
      return (
        !state.camera.fit &&
        (await page.locator("canvas").getAttribute("data-scene-assets")) ===
          state.figures.map((figure) => loadFigure(figure.build, figure.pose)).join(",")
      );
    })
    .toBe(true);
};
const draft = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), DRAFT_KEY);
test.use({ channel: "chrome" });

for (const locale of ["en", "zh"] as const)
  for (const width of [1440, 390]) {
    test(`scene controls and clean PNGs ${locale} ${width}`, async ({ page }) => {
      test.setTimeout(120_000);
      const m = locale === "en" ? en : zh;
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await mkdir(`${evidenceRoot}/shots`, { recursive: true });
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      // A fresh single-actor entry, all builds, then the same flow with five actors.
      await page.goto(`/${locale}/cast?a=${ACTORS[0].slug}`);
      await page.locator("[data-scene-entry]").click();
      await ready(page);
      await expect(page.locator("[data-scene-figures] button")).toHaveCount(1);
      for (const build of BUILDS) {
        await page.getByLabel(m["scene.build"], { exact: true }).selectOption(build);
        await ready(page);
        await page.locator("[data-scene-frame]").scrollIntoViewIfNeeded();
      }
      await page.goto(`/${locale}/cast?a=${five}`);
      await page.locator("[data-scene-entry]").click();
      await ready(page);
      await page.evaluate(() => document.fonts.ready);

      await expect(page.locator("[data-scene-figures] button")).toHaveCount(5);
      await expect(page.getByRole("button", { name: m["scene.add"], exact: true })).toBeEnabled();
      // Five standing figures reuse one GLB; there is no family preload.
      const initialGlbs = await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.endsWith(".glb"))
          .map((entry) => ({
            path: new URL(entry.name).pathname,
            bytes: (entry as PerformanceResourceTiming).encodedBodySize,
          })),
      );
      expect(initialGlbs.map((entry) => entry.path)).toEqual([loadFigure("average", "stand")]);
      await writeFile(
        `${evidenceRoot}/${evidencePrefix}-five-load-${locale}-${width}.json`,
        JSON.stringify(initialGlbs, null, 2),
      );
      for (const build of BUILDS) {
        for (let index = 0; index < 5; index++) {
          await page.locator("[data-scene-figures] button").nth(index).click();
          await page.getByLabel(m["scene.build"], { exact: true }).selectOption(build);
          await ready(page);
        }
        await page.locator("[data-scene-frame]").scrollIntoViewIfNeeded();
      }
      await page.locator("[data-scene-figures] button").first().click();
      const prompt = page.locator("[data-scene-prompt] textarea");
      for (let index = 0; index < 5; index++) {
        const actor = ACTORS[index];
        const name = locale === "zh" ? actor.nameCn : actor.nameEn;
        await expect(prompt).toHaveValue(new RegExp(`${index + 1} · ${name}`));
        await expect(prompt).toHaveValue(new RegExp(`/${locale}/actors/${actor.slug}/sheet`));
        await expect(prompt).toHaveValue(
          new RegExp(m[`scene.colour.${FIGURE_BANDS[index].colour}`]),
        );
      }
      await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
      await page
        .locator("[data-scene-prompt]")
        .getByRole("button", { name: m["scene.copyPrompt"], exact: true })
        .click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        await prompt.inputValue(),
      );
      await page.locator("[data-scene-prompt]").scrollIntoViewIfNeeded();

      // All six static poses and three independent model variants remain usable.
      for (const pose of POSES) {
        await page.getByLabel(m["scene.pose"], { exact: true }).selectOption(pose);
        await ready(page);
      }
      for (const build of BUILDS) {
        await page.getByLabel(m["scene.build"], { exact: true }).selectOption(build);
        await ready(page);
      }
      await page.getByRole("slider", { name: new RegExp(m["scene.height"]) }).press("End");
      await page.getByLabel(m["scene.axis.x"], { exact: true }).fill("-2.5");
      await page.getByRole("button", { name: m["scene.undo"], exact: true }).click();
      await page.getByRole("button", { name: m["scene.redo"], exact: true }).click();
      await expect.poll(async () => (await draft(page)).figures[0].x).toBe(-2.5);
      await page.reload();
      await ready(page);
      await expect(page.getByLabel(m["scene.build"], { exact: true })).toHaveValue("broad");
      await expect(page.getByLabel(m["scene.pose"], { exact: true })).toHaveValue("arms-crossed");
      await expect(page.getByLabel(m["scene.axis.x"], { exact: true })).toHaveValue("-2.5");
      await page.getByRole("button", { name: m["scene.faceOff"], exact: true }).click();
      for (const view of ["low", "high", "eye", "shoulder"] as const) {
        await page.getByRole("button", { name: m[`scene.view.${view}`], exact: true }).click();
        await ready(page);
        expect((await draft(page)).camera.view).toBe(view);
        if (view !== "shoulder") expectFullFit(await cameraEvidence(page));
      }
      await page.getByRole("button", { name: m["scene.view.eye"], exact: true }).click();
      await page.getByLabel(m["scene.subject"], { exact: true }).selectOption("everyone");
      await page.getByRole("button", { name: m["scene.fit"], exact: true }).click();
      await page.locator("[data-scene-frame]").scrollIntoViewIfNeeded();

      await page.locator("aside[aria-label]").last().scrollIntoViewIfNeeded();

      for (const [frame, dimensions] of Object.entries(FRAMES)) {
        await page.getByLabel(m["scene.frame"], { exact: true }).selectOption(frame);
        await page.getByRole("button", { name: m["scene.fit"], exact: true }).click();
        const frameBox = await page.locator("[data-scene-frame]").boundingBox();
        expect(frameBox!.width / frameBox!.height).toBeCloseTo(dimensions[0] / dimensions[1], 1);
        const downloadPromise = page.waitForEvent("download");
        await page.getByRole("button", { name: m["scene.savePng"], exact: true }).click();
        const download = await downloadPromise;
        const bytes = await readFile((await download.path())!);
        expect(bytes.readUInt32BE(16)).toBe(dimensions[0]);
        const keyRows = Math.ceil(5 / Math.floor(dimensions[0] / 280));
        expect(bytes.readUInt32BE(20)).toBe(dimensions[1] + keyRows * 64 + 48);
        expect(bytes.length).toBeGreaterThan(15_000);
        // Figure bands remain above the separate, non-overlapping name key.
        const { data, info } = await sharp(bytes)
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        for (const band of FIGURE_BANDS.slice(0, 5)) {
          const rgb = band.hex
            .slice(1)
            .match(/../g)!
            .map((part) => parseInt(part, 16));
          let pixels = 0;
          for (
            let offset = 0;
            offset < info.width * dimensions[1] * info.channels;
            offset += info.channels
          )
            if (rgb.every((value, channel) => Math.abs(data[offset + channel] - value) <= 2))
              pixels++;
          expect(pixels, `${band.colour} band in saved PNG`).toBeGreaterThan(10);
        }
        // Export leaves the canvas at its preview dimensions and keeps the same aspect.
        const after = await page.locator("[data-scene-frame]").boundingBox();
        expect(after!.width).toBeCloseTo(frameBox!.width);
        await page.locator("[data-scene-frame]").scrollIntoViewIfNeeded();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      // The two main framing tasks, through the real controls in every locale/size.
      await page.getByLabel(m["scene.frame"], { exact: true }).selectOption("landscape");
      await page.getByRole("button", { name: m["scene.layout.talk"], exact: true }).click();
      await page.locator("[data-scene-figures] button").last().click();
      await page.getByLabel(m["scene.subject"], { exact: true }).selectOption("selected");
      await page.getByLabel(m["scene.pose"], { exact: true }).selectOption("sit");
      await page.getByRole("button", { name: m["scene.shot.full"], exact: true }).click();
      await ready(page);
      const posed = await cameraEvidence(page);
      const seated = posed.bodies.find((body) => body.id === posed.subject)!;
      expect(posed.target[1]).toBeCloseTo((seated.min[1] + seated.max[1] + 0.28) / 2, 3);
      await page.getByLabel(m["scene.pose"], { exact: true }).selectOption("arms-crossed");
      await page.getByRole("button", { name: m["scene.shot.close"], exact: true }).click();
      const lensDistances: number[] = [];
      for (const lens of [24, 50, 85]) {
        await page.getByRole("button", { name: `${lens} mm`, exact: true }).click();
        await ready(page);
        const state = (await draft(page)).camera;
        expect(state.lens).toBe(lens);
        lensDistances.push(
          Math.hypot(
            ...state.position.map((value: number, index: number) => value - state.target[index]),
          ),
        );
      }
      expect(lensDistances[2]).toBeGreaterThan(lensDistances[0] * 2);
      const closeCamera = (await draft(page)).camera;
      await page.reload();
      await ready(page);
      expect((await draft(page)).camera).toEqual(closeCamera);
      const sceneDownload = page.waitForEvent("download");
      await page.getByRole("button", { name: m["scene.saveScene"], exact: true }).click();
      const exportedScene = JSON.parse(
        await readFile((await (await sceneDownload).path())!, "utf8"),
      );
      expect(exportedScene.camera).toEqual(closeCamera);
      await writeFile(
        `${evidenceRoot}/two-close-${locale}-${width}.json`,
        JSON.stringify({ scene: exportedScene, camera: await cameraEvidence(page) }, null, 2),
      );
      if ((locale === "en" && width === 1440) || (locale === "zh" && width === 390)) {
        await page
          .locator("[data-scene-workspace]")
          .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 128));
        await page.screenshot({ path: `${evidenceRoot}/shots/two-close-${locale}-${width}.png` });
      }
      if (locale === "en" && width === 1440) {
        const png = page.waitForEvent("download");
        await page.getByRole("button", { name: m["scene.savePng"], exact: true }).click();
        await (await png).saveAs(`${evidenceRoot}/shots/two-close-export.png`);
        expect((await draft(page)).camera).toEqual(closeCamera);
      }
      await page.getByRole("button", { name: m["scene.layout.lineup"], exact: true }).click();
      await ready(page);
      await expect(page.locator("[data-scene-figures] button")).toHaveCount(8);
      expect((await draft(page)).camera).toMatchObject({ shot: "full", subject: "everyone" });
      expectFullFit(await cameraEvidence(page));
      await writeFile(
        `${evidenceRoot}/eight-wide-${locale}-${width}.json`,
        JSON.stringify({ scene: await draft(page), camera: await cameraEvidence(page) }, null, 2),
      );
      if ((locale === "zh" && width === 1440) || (locale === "en" && width === 390)) {
        await page
          .locator("[data-scene-workspace]")
          .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 128));
        await page.screenshot({ path: `${evidenceRoot}/shots/eight-wide-${locale}-${width}.png` });
      }
      if (locale === "zh" && width === 1440) {
        const png = page.waitForEvent("download");
        await page.getByRole("button", { name: m["scene.savePng"], exact: true }).click();
        await (await png).saveAs(`${evidenceRoot}/shots/eight-wide-export.png`);
      }
      expect(errors).toEqual([]);
    });
  }

test("layouts and an uncapped cast keep numbered identities and undo", async ({ page }) => {
  const all = ACTORS.slice(0, 20)
    .map((actor) => actor.slug)
    .join(",");
  await page.addInitScript((cast) => localStorage.setItem("sp-cast", cast), all);
  await page.goto(`/en/scene?a=${all}`);
  await ready(page);
  await expect(page.locator("[data-scene-figures] button")).toHaveCount(20);
  expect(await page.evaluate(() => localStorage.getItem("sp-cast"))).toBe(all);
  await expect(page.locator("[data-scene-key]")).toContainText("20 ·");
  const largePng = page.waitForEvent("download");
  await page.getByRole("button", { name: en["scene.savePng"], exact: true }).click();
  const largeBytes = await readFile((await (await largePng).path())!);
  expect(largeBytes.readUInt32BE(20)).toBe(1080 + Math.ceil(20 / 6) * 64 + 48);
  for (const [layout, count] of [
    ["talk", 2],
    ["triangle", 3],
    ["group", 5],
    ["lineup", 8],
  ] as const) {
    await page.getByRole("button", { name: en[`scene.layout.${layout}`], exact: true }).click();
    await ready(page);
    await expect(page.locator("[data-scene-figures] button")).toHaveCount(count);
    expect(readDraft(JSON.stringify(await draft(page)))?.figures).toHaveLength(count);
  }
  await page.getByRole("button", { name: en["scene.add"], exact: true }).click();
  await expect(page.locator("[data-scene-figures] button")).toHaveCount(9);
  await expect(page.locator("[data-scene-key]")).toContainText("9 ·");
  await page.getByRole("button", { name: en["scene.undo"], exact: true }).click();
  await expect(page.locator("[data-scene-figures] button")).toHaveCount(8);
  await page.reload();
  await ready(page);
  await expect(page.locator("[data-scene-figures] button")).toHaveCount(8);
  const before = (await draft(page)).camera;
  await page.locator("[data-scene-frame]").scrollIntoViewIfNeeded();
  const canvas = (await page.locator("canvas").boundingBox())!;
  await page.mouse.move(canvas.x + 20, canvas.y + 20);
  await page.mouse.down();
  await page.mouse.move(canvas.x + 100, canvas.y + 35, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await draft(page)).camera.position).not.toEqual(before.position);
  const orbited = (await draft(page)).camera;
  await page.getByRole("button", { name: en["scene.undo"], exact: true }).click();
  await expect.poll(async () => (await draft(page)).camera.position).toEqual(before.position);
  await page.getByRole("button", { name: en["scene.redo"], exact: true }).click();
  await expect.poll(async () => (await draft(page)).camera.position).toEqual(orbited.position);
  await page.locator("[data-scene-frame]").scrollIntoViewIfNeeded();
  await page.mouse.move(canvas.x + 20, canvas.y + 20);
  await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await draft(page)).camera.position).not.toEqual(orbited.position);
  const zoomed = (await draft(page)).camera;
  await page.reload();
  await ready(page);
  expect((await draft(page)).camera).toEqual(zoomed);
});

test("figure GLBs and local draft obey the static asset contract", async () => {
  expect(readDraft("broken JSON")).toBeNull();
  const state = initialScene();
  const { setting, ...oldDraft } = state;
  const oldCamera = { view: "eye", position: [0, 2, 7], target: [0, 1, 0] };
  expect(readDraft(JSON.stringify({ ...state, camera: oldCamera }))?.camera).toMatchObject({
    ...oldCamera,
    lens: 50,
    shot: "full",
    sensorWidth: 36,
    subject: "everyone",
    fit: false,
  });
  expect(readDraft(JSON.stringify(oldDraft))?.setting).toEqual(setting);
  expect(
    readDraft(JSON.stringify({ ...state, setting: { selected: "unknown", sentences: {} } })),
  ).toBeNull();
  expect(
    readDraft(
      JSON.stringify({
        ...state,
        setting: { selected: "studio", sentences: { studio: "x".repeat(301) } },
      }),
    ),
  ).toBeNull();
  expect(
    readDraft(JSON.stringify({ ...state, figures: Array(6).fill(state.figures[0]) })),
  ).toBeNull();
  const legacy = { ...state, figures: [{ ...state.figures[0], build: "regular", pose: "guard" }] };
  expect(readDraft(JSON.stringify(legacy))?.figures[0]).toMatchObject({
    build: "average",
    pose: "arms-crossed",
  });
  const results = [];
  for (const [producerPath, record] of Object.entries(manifest.files)) {
    const path = producerPath.replace(/^deliver\//, "public/scene/figures/");
    const bytes = await readFile(path);
    expect(bytes.length).toBe(record.bytes);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(record.sha256);
    const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
    const triangles = gltf.meshes
      .flatMap((mesh: { primitives: { indices: number }[] }) => mesh.primitives)
      .reduce(
        (total: number, primitive: { indices: number }) =>
          total + gltf.accessors[primitive.indices].count / 3,
        0,
      );
    expect(triangles).toBe(7478);
    expect(triangles).toBeLessThanOrEqual(10_000);
    expect(gltf.animations ?? []).toEqual([]);
    expect(gltf.skins ?? []).toEqual([]);
    expect(gltf.images ?? []).toEqual([]);
    results.push({ path, bytes: bytes.length, triangles, sha256: record.sha256 });
  }
  expect(
    createHash("sha256")
      .update(await readFile("public/scene/figures/LICENSE.md"))
      .digest("hex"),
  ).toBe(manifest.licenceSha256);
  for (const build of BUILDS) {
    const height = manifest.builds[build].defaultStats.boundsGltfYUpM.size[1];
    expect(height * figureScale(build, 185)).toBeCloseTo(1.85, 6);
    for (const pose of POSES)
      expect(await readFile(`public${loadFigure(build, pose)}`)).toBeTruthy();
  }
  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(
    `${evidenceRoot}/${evidencePrefix}-assets.json`,
    JSON.stringify(results, null, 2),
  );
});

test("3D JavaScript is isolated from main pages and within its incremental budget", async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const chunks = await readdir(".next/static/chunks");
  const runtime = new Set<string>();
  for (const file of chunks.filter((name) => name.endsWith(".js"))) {
    if (
      /THREE\.WebGLRenderer|R3F:|@react-three\/fiber/.test(
        await readFile(`.next/static/chunks/${file}`, "utf8"),
      )
    )
      runtime.add(file);
  }
  expect(runtime.size).toBeGreaterThan(0);
  const routes = [
    "/en",
    "/en/actors",
    "/en/actors/tang-yunqiu",
    "/en/cast",
    "/en/guide",
    "/en/scene",
  ];
  const allMain = new Set<string>();
  const report: {
    path: string;
    gzipBytes: number;
    runtime: string[];
    files: { name: string; gzip: number }[];
  }[] = [];
  let incremental = 0;
  for (const path of routes) {
    const context = await browser.newContext({ baseURL: test.info().project.use.baseURL });
    const page = await context.newPage();
    const bodies = new Map<string, Buffer>();
    const reads: Promise<void>[] = [];
    page.on("response", (response) => {
      const name = new URL(response.url()).pathname.split("/").pop()!;
      if (name.endsWith(".js"))
        reads.push(
          response.body().then((body) => {
            bodies.set(name, body);
          }),
        );
    });
    await page.goto(path, { waitUntil: "networkidle" });
    if (path.endsWith("/scene")) await ready(page);
    await Promise.all(reads);
    const loadedRuntime = [...bodies.keys()].filter((name) => runtime.has(name));
    if (!path.endsWith("/scene")) {
      expect(loadedRuntime, path).toEqual([]);
      for (const name of bodies.keys()) allMain.add(name);
    } else {
      expect(loadedRuntime.length).toBeGreaterThan(0);
      for (const [name, body] of bodies)
        if (!allMain.has(name)) incremental += gzipSync(body).length;
    }
    report.push({
      path,
      gzipBytes: [...bodies.values()].reduce((sum, body) => sum + gzipSync(body).length, 0),
      runtime: loadedRuntime,
      files: [...bodies].map(([name, body]) => ({ name, gzip: gzipSync(body).length })),
    });
    await context.close();
  }
  await writeFile(
    `${evidenceRoot}/${evidencePrefix}-bundle.json`,
    JSON.stringify(
      {
        definition:
          "Additional scene JS vs union of the five main routes (including Guide), each actual production response gzipped separately",
        limitBytes: 600_000,
        incrementalGzipBytes: incremental,
        runtimeChunks: [...runtime],
        routes: report,
      },
      null,
      2,
    ),
  );
  expect(incremental).toBeLessThanOrEqual(600_000);
});

test("phone-size Chrome performance under 4x CPU throttling", async ({ page, browser }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const started = Date.now();
  const mixed = initialScene(
    ACTORS.slice(0, 5).map((actor) => ({
      slug: actor.slug,
      name: actor.nameEn,
      heightCm: actor.heightCm,
    })),
    five,
  );
  const variants = [
    ["slim", "stand"],
    ["average", "walk"],
    ["broad", "wave"],
    ["slim", "sit"],
    ["broad", "arms-crossed"],
  ] as const;
  mixed.figures.forEach((figure, index) => {
    [figure.build, figure.pose] = variants[index];
  });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: DRAFT_KEY,
    value: JSON.stringify(mixed),
  });
  await page.goto(`/en/scene?a=${five}`);
  await ready(page);
  const glbs = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.endsWith(".glb"))
      .map((entry) => ({
        path: new URL(entry.name).pathname,
        encodedBytes: (entry as PerformanceResourceTiming).encodedBodySize,
        decodedBytes: (entry as PerformanceResourceTiming).decodedBodySize,
        transferBytes: (entry as PerformanceResourceTiming).transferSize,
      })),
  );
  expect(glbs.map((entry) => entry.path).sort()).toEqual(
    mixed.figures.map((figure) => loadFigure(figure.build, figure.pose)).sort(),
  );
  expect(glbs.reduce((sum, entry) => sum + entry.decodedBytes, 0)).toBe(
    mixed.figures.reduce((sum, figure) => {
      const path = loadFigure(figure.build, figure.pose).replace("/scene/figures/", "deliver/");
      return sum + manifest.files[path as keyof typeof manifest.files].bytes;
    }, 0),
  );
  const firstReadyMs = Date.now() - started;
  const samples = [];
  for (let run = 0; run < 3; run++) {
    await page.getByRole("button", { name: en["scene.line"], exact: true }).click();
    await page.locator("[data-scene-frame]").scrollIntoViewIfNeeded();
    const canvas = (await page.locator("canvas").boundingBox())!;
    await page.evaluate(() => {
      const sample = {
        start: performance.now(),
        frames: [] as { ms: number; drew: boolean }[],
        draws: 0,
        active: true,
      };
      (window as unknown as { scenePerf: typeof sample }).scenePerf = sample;
      const prototype = WebGL2RenderingContext.prototype;
      const original = prototype.drawElements;
      prototype.drawElements = function (...args) {
        sample.draws++;
        return original.apply(this, args);
      };
      let last = performance.now();
      function tick(now: number) {
        sample.frames.push({ ms: now - last, drew: sample.draws > 0 });
        sample.draws = 0;
        last = now;
        if (sample.active) requestAnimationFrame(tick);
        else prototype.drawElements = original;
      }
      requestAnimationFrame(tick);
    });
    // The middle figure starts at the frame centre. This is a real pointer drag.
    await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height * 0.48);
    await page.mouse.down();
    for (let index = 0; index < 300; index++) {
      await page.mouse.move(
        canvas.x + canvas.width / 2 + Math.sin(index / 10) * 35,
        canvas.y + canvas.height * 0.48 + Math.cos(index / 10) * 10,
      );
    }
    await page.mouse.up();
    samples.push(
      await page.evaluate(() => {
        const sample = (
          window as unknown as {
            scenePerf: { start: number; frames: { ms: number; drew: boolean }[]; active: boolean };
          }
        ).scenePerf;
        sample.active = false;
        const elapsed = performance.now() - sample.start;
        const times = sample.frames.map((frame) => frame.ms).sort((a, b) => a - b);
        return {
          elapsedMs: elapsed,
          inputMoves: 300,
          displayFps: (sample.frames.length * 1000) / elapsed,
          renderedFps: (sample.frames.filter((frame) => frame.drew).length * 1000) / elapsed,
          frameP95Ms: times[Math.floor(times.length * 0.95)],
          raw: sample.frames,
        };
      }),
    );
    // Let the previous sample restore drawElements before the next one wraps it.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  }
  await writeFile(
    `${evidenceRoot}/${evidencePrefix}-perf.json`,
    JSON.stringify(
      {
        browser: browser.version(),
        viewport: "390x844",
        dpr: await page.evaluate(() => devicePixelRatio),
        cpuThrottling: 4,
        network: "local production server, no network throttle",
        figures: 5,
        glbs,
        glbDecodedBytesLoaded: glbs.reduce((sum, entry) => sum + entry.decodedBytes, 0),
        glbEncodedBytesLoaded: glbs.reduce((sum, entry) => sum + entry.encodedBytes, 0),
        glbTransferBytesLoaded: glbs.reduce((sum, entry) => sum + entry.transferBytes, 0),
        firstReadyMs,
        measurement:
          "Three paced pointer drags; rAF cadence and frames containing real WebGL drawElements calls. Emulation is not physical-phone thermal/GPU evidence.",
        samples,
      },
      null,
      2,
    ),
  );
  expect(samples.every((sample) => sample.renderedFps > 0)).toBe(true);
});
