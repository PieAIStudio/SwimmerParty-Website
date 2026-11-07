import { test, expect, type Page } from "@playwright/test";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  Box3,
  Euler,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  SkinnedMesh,
  Vector3,
  type Intersection,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { poseFigure, type FigurePose } from "../src/features/scene/rigged-figure";
import { createFigureIK, shoulderContact } from "../src/features/scene/figure-ik";
import { ACTORS } from "../src/content/actors";
import {
  BUILDS,
  DRAFT_KEY,
  FRAMES,
  FIGURE_BANDS,
  POSES,
  initialScene,
  makeFigure,
  readDraft,
  defaultBuild,
} from "../src/features/scene/model";
import { figureScale, loadFigure, loadPose } from "../src/features/scene/figure-assets";
import manifest from "../public/scene/rigged/manifest.json";
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
  seats: string[];
  joints: Record<string, Record<string, [number, number, number]>>;
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
const ready = async (page: Page, expanded = true) => {
  await expect(page.locator("canvas[data-scene-ready=true]")).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(async () => {
      const state = readDraft(JSON.stringify(await draft(page)))!;
      return (
        !state.camera.fit &&
        (await page.locator("canvas").getAttribute("data-scene-assets")) ===
          state.figures.map((figure) => loadFigure(figure.build)).join(",") &&
        (await page.locator("canvas").getAttribute("data-scene-poses")) ===
          state.figures.map((figure) => figure.pose).join(",") &&
        (await page.locator("canvas").getAttribute("data-scene-joints")) ===
          JSON.stringify(state.figures.map((figure) => figure.joints))
      );
    })
    .toBe(true);
  // Legacy detailed coverage deliberately opens the new progressive controls.
  // The build-3 first-fold walks below use the real collapsed defaults.
  if (expanded)
    await page.locator("details").evaluateAll((items) =>
      items.forEach((item) => {
        (item as HTMLDetailsElement).open = true;
      }),
    );
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
      // Only the bodies actually requested are loaded; poses share those GLBs.
      const initialGlbs = await page.evaluate(() =>
        performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.endsWith(".glb"))
          .map((entry) => ({
            path: new URL(entry.name).pathname,
            bytes: (entry as PerformanceResourceTiming).encodedBodySize,
          })),
      );
      expect(initialGlbs.map((entry) => entry.path).sort()).toEqual(
        [
          ...new Set(
            ACTORS.slice(0, 5).map((actor) =>
              loadFigure(
                defaultBuild({ slug: actor.slug, name: actor.nameEn, gender: actor.gender }),
              ),
            ),
          ),
        ].sort(),
      );
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

      // Twelve shared poses and six independently cloned body variants.
      for (const pose of POSES) {
        await page.getByLabel(m["scene.pose"], { exact: true }).selectOption(pose);
        await ready(page);
      }
      for (const build of BUILDS) {
        await page.getByLabel(m["scene.build"], { exact: true }).selectOption(build);
        await ready(page);
        expect((await draft(page)).figures[0].pose).toBe("kneel");
      }
      await page.getByRole("slider", { name: new RegExp(m["scene.height"]) }).press("End");
      await page.getByLabel(m["scene.axis.x"], { exact: true }).fill("-2.5");
      await page.getByRole("button", { name: m["scene.undo"], exact: true }).click();
      await page.getByRole("button", { name: m["scene.redo"], exact: true }).click();
      await expect.poll(async () => (await draft(page)).figures[0].x).toBe(-2.5);
      await page.reload();
      await ready(page);
      await expect(page.getByLabel(m["scene.build"], { exact: true })).toHaveValue("broad-f");
      await expect(page.getByLabel(m["scene.pose"], { exact: true })).toHaveValue("kneel");
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
      await page.getByRole("button", { name: m["scene.reset"], exact: true }).click();
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
      expect(posed.seats).toEqual([posed.subject]);
      await page.getByLabel(m["scene.pose"], { exact: true }).selectOption("hand-on-hip");
      await page.getByLabel(m["scene.subject"], { exact: true }).selectOption("everyone");
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
      expect(exportedScene.figures).toEqual((await draft(page)).figures);
      expect(exportedScene.figures.map((figure: { pose: string }) => figure.pose)).toEqual([
        "stand",
        "hand-on-hip",
      ]);
      await writeFile(
        `${evidenceRoot}/two-close-${locale}-${width}.json`,
        JSON.stringify({ scene: exportedScene, camera: await cameraEvidence(page) }, null, 2),
      );
      if ((locale === "en" && width === 1440) || (locale === "zh" && width === 390)) {
        await page
          .locator("[data-scene-workspace]")
          .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 128));
      }
      if (locale === "en" && width === 1440) {
        const png = page.waitForEvent("download");
        await page.getByRole("button", { name: m["scene.savePng"], exact: true }).click();
        expect((await readFile((await (await png).path())!)).length).toBeGreaterThan(15_000);
        expect((await draft(page)).camera).toEqual(closeCamera);
      }
      await page.getByRole("button", { name: m["scene.layout.group"], exact: true }).click();
      // The preset now seats person 1; this separate manual-seat case moves that seat to 4.
      await page.locator("[data-scene-figures] button").first().click();
      await page.getByLabel(m["scene.pose"], { exact: true }).selectOption("stand");
      await page.locator("[data-scene-figures] button").nth(3).click();
      await page.getByLabel(m["scene.pose"], { exact: true }).selectOption("sit");
      await ready(page);
      expectFullFit(await cameraEvidence(page));
      expect((await cameraEvidence(page)).seats).toHaveLength(1);
      await writeFile(
        `${evidenceRoot}/five-sit-${locale}-${width}.json`,
        JSON.stringify({ scene: await draft(page), camera: await cameraEvidence(page) }, null, 2),
      );
      if ((locale === "zh" && width === 1440) || (locale === "en" && width === 390)) {
        await page
          .locator("[data-scene-workspace]")
          .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 128));
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
      }
      if (locale === "zh" && width === 1440) {
        const png = page.waitForEvent("download");
        await page.getByRole("button", { name: m["scene.savePng"], exact: true }).click();
        expect((await readFile((await (await png).path())!)).length).toBeGreaterThan(15_000);
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

test("rigged bodies, shared poses and local drafts keep the delivery contract", async () => {
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
  expect(defaultBuild()).toBe("average");
  expect(defaultBuild({ slug: "known", name: "Known", gender: "female" })).toBe("average-f");
  expect(defaultBuild({ slug: "known", name: "Known", gender: "female", build: "broad" })).toBe(
    "broad-f",
  );
  expect(defaultBuild({ slug: "known", name: "Known", build: "slim" })).toBe("slim");
  const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
  expect(hash(await readFile("public/scene/rigged/manifest.json"))).toBe(
    "e7575edb5f09e030362b2d0a310f7bc2a03a35fa09abe4e83ef35e3098545231",
  );
  expect(hash(await readFile("public/scene/rigged/LICENSE.md"))).toBe(
    "28825bce62bf4aa0f2836b8338bc5ef69d9e2cfd936fe148f534f01b1405fa05",
  );
  expect(Object.keys(manifest.bodies)).toEqual([...BUILDS]);
  expect(Object.keys(manifest.poses)).toEqual([...POSES]);
  const poses = new Map<string, FigurePose>();
  const results = [];
  for (const pose of POSES) {
    const record = manifest.poses[pose];
    const bytes = await readFile(`public${loadPose(pose)}`);
    expect(bytes.length).toBe(record.bytes);
    expect(hash(bytes)).toBe(record.sha256);
    const data = JSON.parse(bytes.toString()) as FigurePose;
    expect(Object.keys(data.bones).sort()).toEqual([...manifest.sharedSkeleton.boneList].sort());
    for (const quaternion of Object.values(data.bones)) {
      expect(quaternion).toHaveLength(4);
      expect(quaternion.every(Number.isFinite)).toBe(true);
      expect(Math.hypot(...quaternion)).toBeCloseTo(1, 4);
    }
    poses.set(pose, data);
    results.push({ path: loadPose(pose), bytes: bytes.length, sha256: record.sha256 });
  }
  const loader = new GLTFLoader();
  for (const build of BUILDS) {
    const record = manifest.bodies[build];
    const bytes = await readFile(`public${loadFigure(build)}`);
    expect(bytes.length).toBe(record.bytes);
    expect(hash(bytes)).toBe(record.sha256);
    const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
    const triangles = gltf.meshes
      .flatMap((mesh: { primitives: { indices: number }[] }) => mesh.primitives)
      .reduce(
        (sum: number, primitive: { indices: number }) =>
          sum + gltf.accessors[primitive.indices].count / 3,
        0,
      );
    expect(triangles).toBe(record.triangles);
    expect(triangles).toBeLessThanOrEqual(10_000);
    expect(gltf.skins).toHaveLength(1);
    expect(gltf.skins[0].joints).toHaveLength(53);
    expect(gltf.animations ?? []).toEqual([]);
    expect(gltf.images ?? []).toEqual([]);
    const source = (
      await loader.parseAsync(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
        "",
      )
    ).scene;
    const originalBones = source.getObjectByName("head")!.quaternion.toArray();
    const contactBody = poseFigure(
      source,
      poses.get("hand-on-hip")!,
      figureScale(build, 175),
      false,
    );
    const hip = contactBody.object.getObjectByName("pelvis")!.getWorldPosition(new Vector3());
    const hand = contactBody.object.getObjectByName("hand_l")!;
    const wrist = hand.getWorldPosition(new Vector3());
    const finger = contactBody.object
      .getObjectByName("middle_01_l")!
      .getWorldPosition(new Vector3())
      .sub(wrist)
      .normalize();
    expect(wrist.y - hip.y).toBeGreaterThan(0.03);
    expect(wrist.y - hip.y).toBeLessThan(0.08);
    expect(wrist.x - hip.x).toBeLessThan(0.22);
    expect(finger.y).toBeLessThan(-0.7);
    expect(finger.z).toBeGreaterThan(0.2);
    const acrossPalm = contactBody.object
      .getObjectByName("index_01_l")!
      .getWorldPosition(new Vector3())
      .sub(contactBody.object.getObjectByName("pinky_01_l")!.getWorldPosition(new Vector3()))
      .normalize();
    expect(finger.clone().cross(acrossPalm).normalize().x).toBeLessThan(-0.7);
    const shelf = poseFigure(
      source,
      { ...poses.get("hand-on-hip")!, name: undefined },
      figureScale(build, 175),
      false,
    );
    const originalHip = shelf.object.getObjectByName("pelvis")!.getWorldPosition(new Vector3());
    const origin = originalHip
      .clone()
      .add(new Vector3(0.6, 0.045, 0).multiplyScalar(figureScale(build, 175)));
    const surface = new Raycaster(origin, new Vector3(-1, 0, 0), 0, 1)
      .intersectObject(shelf.object, true)
      .find((hit) => hit.object instanceof SkinnedMesh)!;
    expect(wrist.distanceTo(surface.point)).toBeLessThan(0.035);
    shelf.dispose();
    contactBody.object.position.x = 0.325;
    contactBody.object.rotation.y = (-65 * Math.PI) / 180;
    contactBody.object.updateWorldMatrix(true, true);
    for (const from of [
      [0.001807, 1.015, 5.813251],
      [-0.30653, 1.2775, 3.236629],
    ]) {
      const contact = shoulderContact(
        contactBody.object,
        contactBody.object.getObjectByName("upperarm_r")!,
        new Vector3(...from),
      );
      expect(contact, `${build}: visible shoulder from ${from}`).not.toBeNull();
      expect(contact!.wrist.distanceTo(contact!.point)).toBeCloseTo(0.025, 8);
      expect(contact!.normal.length()).toBeCloseTo(1, 8);
    }
    contactBody.dispose();
    const manual = poseFigure(source, poses.get("stand")!, figureScale(build, 185), false);
    manual.object.position.x = 0.6;
    manual.object.rotation.y = 0.65;
    manual.object.updateWorldMatrix(true, true);
    const ik = createFigureIK(manual.object);
    ik.begin("leftWrist");
    const clavicle = manual.object.getObjectByName("clavicle_l")!;
    const clavicleBase = clavicle.quaternion.clone();
    const start = ik.position("leftWrist");
    const shoulder = manual.object.getObjectByName("upperarm_l")!;
    const destination = shoulder.getWorldPosition(new Vector3()).add(new Vector3(0.25, 0.1, 0.32));
    const elbow = manual.object.getObjectByName("lowerarm_l")!;
    const previous = shoulder.quaternion.clone();
    for (let step = 1; step <= 30; step++) {
      ik.solve("leftWrist", start.clone().lerp(destination, step / 30));
      expect(elbow.rotation.x).toBeGreaterThanOrEqual(0.039);
      expect(elbow.rotation.x).toBeLessThanOrEqual(2.651);
      expect(previous.angleTo(shoulder.quaternion)).toBeLessThan(Math.PI / 2);
      previous.copy(shoulder.quaternion);
    }
    expect(ik.position("leftWrist").distanceTo(destination)).toBeLessThan(0.02);
    expect(clavicleBase.angleTo(clavicle.quaternion)).toBeGreaterThan(0.01);
    expect(clavicleBase.angleTo(clavicle.quaternion)).toBeLessThan(Math.PI * 0.201);
    const followed = clavicle.quaternion.clone();
    for (let repeat = 0; repeat < 12; repeat++) ik.solve("leftWrist", destination);
    expect(followed.angleTo(clavicle.quaternion)).toBeLessThan(0.000001);
    const rightStart = ik.position("rightWrist");
    const rightTarget = manual.object
      .getObjectByName("upperarm_r")!
      .getWorldPosition(new Vector3())
      .add(new Vector3(-0.25, 0.1, 0.32));
    ik.begin("rightWrist");
    for (let step = 1; step <= 30; step++)
      ik.solve("rightWrist", rightStart.clone().lerp(rightTarget, step / 30));
    expect(ik.position("rightWrist").distanceTo(rightTarget)).toBeLessThan(0.02);
    ik.dispose();
    manual.dispose();
    const first = poseFigure(source, poses.get("stand")!, figureScale(build, 185), false);
    let runtimeTriangles = 0;
    first.object.traverse((node) => {
      if (!(node instanceof SkinnedMesh)) return;
      runtimeTriangles += node.geometry.index!.count / 3;
      expect(node.geometry).not.toBe((source.getObjectByName(node.name) as SkinnedMesh).geometry);
      const original = (source.getObjectByName(node.name) as SkinnedMesh).geometry.attributes
        .position;
      expect(node.geometry.attributes.position.count).toBeGreaterThan(original.count);
      // The projecting nose tip is pulled back in SP; no GLB or crown-height edit.
      let tip = -1;
      for (let i = 0; i < original.count; i++)
        if (original.getY(i) > 1.4 && (tip < 0 || original.getZ(i) > original.getZ(tip))) tip = i;
      const refined = node.geometry.attributes.position;
      const matching = Array.from({ length: refined.count }, (_, i) => i).find(
        (i) =>
          Math.abs(refined.getX(i) - original.getX(tip)) < 1e-7 &&
          Math.abs(refined.getY(i) - original.getY(tip)) < 1e-7,
      )!;
      expect(original.getZ(tip) - refined.getZ(matching)).toBeGreaterThan(0.004);
      expect(original.getZ(tip) - refined.getZ(matching)).toBeLessThan(0.02);
      expect(Array.from(refined.array).every(Number.isFinite)).toBe(true);
      // Lip polish must not flatten the forehead/eyes along with the mouth.
      let brow = -1;
      for (let i = 0; i < original.count; i++)
        if (
          original.getY(i) > original.getY(tip) + 0.06 &&
          Math.abs(original.getX(i)) < 0.03 &&
          (brow < 0 || original.getZ(i) > original.getZ(brow))
        )
          brow = i;
      expect(
        Array.from({ length: refined.count }, (_, i) => i).some(
          (i) =>
            Math.abs(refined.getX(i) - original.getX(brow)) < 1e-7 &&
            Math.abs(refined.getY(i) - original.getY(brow)) < 1e-7 &&
            Math.abs(refined.getZ(i) - original.getZ(brow)) < 1e-7,
        ),
      ).toBe(true);
    });
    expect(runtimeTriangles).toBeGreaterThan(triangles);
    expect(runtimeTriangles).toBeLessThanOrEqual(10_000);
    expect(new Box3().setFromObject(first.object, true).max.y).toBeCloseTo(1.85, 6);
    for (const pose of POSES) {
      const figure = poseFigure(source, poses.get(pose)!, figureScale(build, 185), pose === "sit");
      expect(figure.object.getObjectByName("head")).not.toBe(first.object.getObjectByName("head"));
      expect(source.getObjectByName("head")!.quaternion.toArray()).toEqual(originalBones);
      const box = new Box3().setFromObject(figure.object, true);
      expect(box.min.y).toBeCloseTo(0, 6);
      expect(box.max.y).toBeGreaterThan(1);
      expect(first.object.getObjectByName("head")!.quaternion.toArray()).toEqual(
        poses.get("stand")!.bones.head,
      );
      figure.object.position.x = 0.4;
      figure.object.rotation.y = 0.5;
      figure.object.updateMatrixWorld(true);
      figure.object.traverse((node) => {
        if (!(node instanceof SkinnedMesh)) return;
        node.skeleton.update();
        const ray = new Raycaster(new Vector3(0.4, box.max.y * 0.7, 4), new Vector3(0, 0, -1));
        const expected: Intersection[] = [];
        const actual: Intersection[] = [];
        SkinnedMesh.prototype.raycast.call(node, ray, expected);
        node.raycast(ray, actual);
        expect(actual.length).toBe(expected.length);
        expect(actual.length).toBeGreaterThan(0);
        actual.forEach((hit, index) => {
          expect(hit.object).toBe(node);
          expect(hit.distance).toBeCloseTo(expected[index].distance, 5);
          expect(hit.point.distanceTo(expected[index].point)).toBeLessThan(0.00001);
        });
      });
      expect(Boolean(figure.seat)).toBe(pose === "sit");
      if (pose === "lean-in")
        for (const side of ["l", "r"])
          expect(
            figure.object
              .getObjectByName(`upperarm_${side}`)!
              .quaternion.clone()
              .normalize()
              .angleTo(new Quaternion(...poses.get(pose)!.bones[`upperarm_${side}`]).normalize()),
          ).toBeCloseTo(Math.PI / 18, 5);
      if (pose === "stand") {
        expect(
          figure.object
            .getObjectByName("middle_02_l")!
            .quaternion.angleTo(new Quaternion(...poses.get(pose)!.bones.middle_02_l)),
        ).toBeCloseTo(0.2, 5);
        const editing = poseFigure(
          source,
          poses.get(pose)!,
          figureScale(build, 185),
          false,
          {},
          undefined,
          true,
        );
        editing.object.position.copy(figure.object.position);
        editing.object.rotation.copy(figure.object.rotation);
        editing.object.updateWorldMatrix(true, true);
        const free = editing.object.getObjectByName("hand_r")!.getWorldPosition(new Vector3());
        const resting = figure.object.getObjectByName("hand_r")!.getWorldPosition(new Vector3());
        expect(Math.hypot(free.x - resting.x, free.z - resting.z)).toBeLessThan(0.02);
        expect(
          editing.object.getObjectByName("middle_03_r")!.getWorldPosition(new Vector3()).y,
        ).toBeLessThan(free.y - 0.06);
        for (const finger of ["middle_02_r", "thumb_01_r", "thumb_02_r", "thumb_03_r"])
          expect(editing.object.getObjectByName(finger)!.quaternion.toArray()).toEqual(
            figure.object.getObjectByName(finger)!.quaternion.toArray(),
          );
        editing.dispose();
        const freeHip = poseFigure(
          source,
          poses.get("hand-on-hip")!,
          figureScale(build, 185),
          false,
          {},
          undefined,
          true,
        );
        for (const side of ["l", "r"]) {
          const wrist = freeHip.object
            .getObjectByName(`hand_${side}`)!
            .getWorldPosition(new Vector3());
          expect(
            freeHip.object.getObjectByName(`middle_03_${side}`)!.getWorldPosition(new Vector3()).y,
          ).toBeLessThan(wrist.y - 0.06);
          for (const finger of ["middle_02", "thumb_01", "thumb_02", "thumb_03"])
            expect(
              freeHip.object
                .getObjectByName(`${finger}_${side}`)!
                .quaternion.clone()
                .normalize()
                .angleTo(
                  figure.object
                    .getObjectByName(`${finger}_${side}`)!
                    .quaternion.clone()
                    .normalize(),
                ),
            ).toBeLessThan(0.00001);
        }
        freeHip.dispose();
      }
      if (pose === "arms-crossed")
        for (const side of ["l", "r"]) {
          const other = side === "l" ? "r" : "l";
          const fingers = figure.object
            .getObjectByName(`middle_03_${side}`)!
            .getWorldPosition(new Vector3());
          const biceps = figure.object
            .getObjectByName(`upperarm_${other}`)!
            .getWorldPosition(new Vector3());
          const elbow = figure.object
            .getObjectByName(`lowerarm_${other}`)!
            .getWorldPosition(new Vector3());
          expect(Math.abs(fingers.x - biceps.x)).toBeLessThan(0.1);
          expect(fingers.z).toBeLessThan(elbow.z);
        }
      if (figure.seat) {
        for (const side of ["l", "r"]) {
          const wrist = figure.object
            .getObjectByName(`hand_${side}`)!
            .getWorldPosition(new Vector3());
          const thigh = figure.object
            .getObjectByName(`thigh_${side}`)!
            .getWorldPosition(new Vector3());
          const knee = figure.object
            .getObjectByName(`calf_${side}`)!
            .getWorldPosition(new Vector3());
          const centre = thigh.lerp(knee, 0.42);
          expect(Math.abs(wrist.x - centre.x)).toBeLessThan(0.015);
          expect(Math.abs(wrist.z - centre.z)).toBeLessThan(0.015);
          expect(wrist.y - centre.y).toBeGreaterThan(0.05);
          expect(wrist.y - centre.y).toBeLessThan(0.17);
        }
        expect(figure.seat.position[1] - figure.seat.size[1] / 2).toBeCloseTo(0, 6);
        expect(figure.seat.size[1]).toBeGreaterThan(0.3);
        expect(figure.seat.size[1]).toBeLessThan(0.7);
      }
      expect(
        readDraft(JSON.stringify({ ...state, figures: [{ ...state.figures[0], build, pose }] }))
          ?.figures[0],
      ).toMatchObject({ build, pose });
      figure.dispose();
    }
    expect(new Box3().setFromObject(first.object, true).max.y).toBeCloseTo(1.85, 6);
    first.dispose();
    results.push({
      path: loadFigure(build),
      bytes: bytes.length,
      triangles,
      runtimeTriangles,
      sha256: record.sha256,
    });
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
    [...new Set(mixed.figures.map((figure) => loadFigure(figure.build)))].sort(),
  );
  expect(glbs.reduce((sum, entry) => sum + entry.decodedBytes, 0)).toBe(
    [...new Set(mixed.figures.map((figure) => figure.build))].reduce(
      (sum, build) => sum + manifest.bodies[build].bytes,
      0,
    ),
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

test("straight-on neutral faces at 1440", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const scene = initialScene([], "");
  scene.figures = ["average", "average-f"].map((build, index) => ({
    ...scene.figures[0],
    id: `face-${index}`,
    build: build as (typeof BUILDS)[number],
    pose: "stand",
    heightCm: 175,
    x: index ? 0.16 : -0.16,
    z: 0,
    turn: 0,
    joints: {},
  }));
  scene.camera = {
    ...scene.camera,
    lens: 85,
    shot: "close",
    view: "eye",
    subject: "everyone",
    fit: false,
    position: [0, 1.64, 1.5],
    target: [0, 1.64, 0],
  };
  await page.addInitScript(({ key, scene }) => localStorage.setItem(key, JSON.stringify(scene)), {
    key: DRAFT_KEY,
    scene,
  });
  await page.goto("/en/scene");
  await ready(page, false);
  await page.evaluate(() => document.fonts.ready);
  await mkdir(`${evidenceRoot}/shots`, { recursive: true });
  await page.screenshot({ path: `${evidenceRoot}/shots/face-front-1440.png` });
  await writeFile(
    `${evidenceRoot}/face-front.json`,
    JSON.stringify(await cameraEvidence(page), null, 2),
  );
  await context.close();
});

test("crowded High shot separates twelve labels with leaders", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const scene = initialScene();
  // Reproduce A-S17's 12-person positions, heights and 24 mm High camera.
  const placements = [
    [0.22, -2.2, -85, 163, "stand", "average-f"],
    [-0.22, -2.2, 85, 175, "lean-in", "average"],
    [0.35, 0.9, -165, 176, "stand", "average"],
    [-0.45, 1.1, 165, 173, "sit", "average"],
    [2, -0.9, -35, 165, "arms-crossed", "average-f"],
    [-1.65, 0.8, 140, 175, "stand", "average"],
    [-1.15, -0.35, 65, 172, "arms-crossed", "average"],
    [-1.35, -1.1, 75, 162, "sit", "average"],
    [-0.85, -1.5, 45, 166, "sit", "average-f"],
    [1.15, -1.1, -75, 170, "sit", "average"],
    [1.35, -0.35, -65, 174, "hands-on-table", "average"],
    [1.75, 0.7, -140, 163, "stand", "average"],
  ] as const;
  scene.figures = placements.map(([x, z, turn, heightCm, pose, build], index) => ({
    ...makeFigure(`crowd-${index + 1}`),
    x,
    z,
    turn,
    heightCm,
    pose,
    build,
  }));
  scene.camera = {
    ...scene.camera,
    view: "high",
    lens: 24,
    fit: false,
    position: [0.16420425205939637, 4.847423196471918, 5.307862210445461],
    target: [0.16420425205939637, 1.0199974981967965, -0.5804850176701095],
  };
  await page.addInitScript(({ key, scene }) => localStorage.setItem(key, JSON.stringify(scene)), {
    key: DRAFT_KEY,
    scene,
  });
  await page.goto("/en/scene");
  await ready(page, false);
  type Label = { id: string; x: number; y: number; width: number; height: number; leader: boolean };
  const labels = async (): Promise<Label[]> =>
    JSON.parse((await page.locator("canvas").getAttribute("data-scene-labels"))!);
  await expect.poll(async () => (await labels()).length).toBe(12);
  const boxes = await labels();
  expect(boxes.some((box) => box.leader)).toBe(true);
  for (const [index, a] of boxes.entries())
    for (const b of boxes.slice(index + 1))
      expect(
        Math.abs(a.x - b.x) >= (a.width + b.width) / 2 + 3 ||
          Math.abs(a.y - b.y) >= (a.height + b.height) / 2 + 3,
        `${a.id} / ${b.id}`,
      ).toBe(true);
  const frame = (await page.locator("canvas").boundingBox())!;
  const camera = await cameraEvidence(page);
  const lens = new PerspectiveCamera(camera.fov, camera.aspect, 0.05, 10000);
  lens.position.set(...camera.position);
  lens.lookAt(new Vector3(...camera.target));
  lens.updateMatrixWorld(true);
  const third = boxes[2];
  for (const figure of scene.figures.slice(0, 2)) {
    const ring = [-0.34, 0.34].flatMap((x) =>
      [-0.34, 0.34].map((z) =>
        new Vector3(x, 0.008, z)
          .applyAxisAngle(new Vector3(0, 1, 0), (figure.turn * Math.PI) / 180)
          .add(new Vector3(figure.x, 0, figure.z))
          .project(lens),
      ),
    );
    const left = ((Math.min(...ring.map((p) => p.x)) + 1) * frame.width) / 2;
    const right = ((Math.max(...ring.map((p) => p.x)) + 1) * frame.width) / 2;
    const top = ((1 - Math.max(...ring.map((p) => p.y))) * frame.height) / 2;
    const bottom = ((1 - Math.min(...ring.map((p) => p.y))) * frame.height) / 2;
    expect(
      third.x + 10 < left || third.x - 10 > right || third.y + 10 < top || third.y - 10 > bottom,
      `Label 3 clears ${figure.id}'s floor ring`,
    ).toBe(true);
  }
  await mkdir(`${evidenceRoot}/shots`, { recursive: true });
  await page.screenshot({ path: `${evidenceRoot}/shots/crowd-12-1440.png` });
  await writeFile(
    `${evidenceRoot}/crowd-12.json`,
    JSON.stringify({ scene, labels: boxes, camera: await cameraEvidence(page) }, null, 2),
  );
  await context.close();
});

for (const width of [1440, 390]) {
  test(`build 10 fresh dialogue, first fold and shoulder drag ${width}`, async ({ browser }) => {
    test.setTimeout(120_000);
    const locale = width === 1440 ? "en" : "zh";
    const m = locale === "en" ? en : zh;
    const height = width === 1440 ? 900 : 844;
    const context = await browser.newContext({
      baseURL: test.info().project.use.baseURL,
      viewport: { width, height },
      deviceScaleFactor: 2,
      recordVideo: { dir: `${evidenceRoot}/walks`, size: { width, height } },
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const steps: { action: string; elapsedMs: number }[] = [];
    const started = Date.now();
    const step = (action: string) => steps.push({ action, elapsedMs: Date.now() - started });
    const capture = async (name: string) => {
      if (process.env.SCENE_CAPTURE_SHOTS === "0") return;
      // Capture the actual first view: no scroll that can hide the layout heading.
      expect(await page.evaluate(() => scrollY)).toBe(0);
      await page.screenshot({ path: `${evidenceRoot}/shots/${name}-${width}.png` });
    };
    await page.goto(`/${locale}/scene`);
    await ready(page, false);
    step("Fresh page ready; no saved draft");
    await page.getByRole("button", { name: m["scene.layout.talk"], exact: true }).click();
    await ready(page, false);
    step("One-tap two-person conversation");
    const panel = page.locator("[data-scene-camera-panel]");
    await panel.locator("summary").click();
    await page.getByRole("button", { name: m["scene.shot.close"], exact: true }).click();
    await ready(page, false);
    await panel.locator("summary").click();
    step("Choose Close-up and fold camera controls");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: m["scene.savePng"], exact: true }).click();
    const bytes = await readFile((await (await download).path())!);
    expect(bytes.readUInt32BE(16)).toBe(1920);
    expect(bytes.readUInt32BE(20)).toBe(1080 + 64 + 48);
    step("Dialogue PNG downloaded");
    const toast = page.locator("[data-scene-toast]");
    await expect(toast).toHaveText(m["scene.exported"]);
    await expect(toast).toHaveCSS("position", "absolute");
    const toastBox = (await toast.boundingBox())!;
    const toastFrame = (await page.locator("[data-scene-frame]").boundingBox())!;
    expect(toastBox.x).toBeGreaterThanOrEqual(toastFrame.x);
    expect(toastBox.x + toastBox.width).toBeLessThanOrEqual(toastFrame.x + toastFrame.width);
    expect(toastBox.x + toastBox.width / 2).toBeCloseTo(toastFrame.x + toastFrame.width / 2, 0);
    expect(toastFrame.y + toastFrame.height - toastBox.y - toastBox.height).toBeCloseTo(12, 0);
    const castLink = (await page.locator(".sp-scene-page > div a").first().boundingBox())!;
    expect(toastBox.y).toBeGreaterThan(castLink.y + castLink.height);
    const elapsedMs = Date.now() - started;
    expect(elapsedMs).toBeLessThan(30_000);
    if (width === 390 && process.env.SCENE_CAPTURE_SHOTS !== "0") {
      await mkdir(`${evidenceRoot}/shots`, { recursive: true });
      await page.screenshot({ path: `${evidenceRoot}/shots/png-toast-390.png` });
    }
    await expect(toast).toHaveCount(0, { timeout: 2500 });
    expect(await page.evaluate(() => scrollY)).toBe(0);
    const assertFold = async () => {
      for (const selector of [
        "[data-scene-layouts]",
        "[data-scene-actions]",
        "[data-scene-quick]",
        "[data-scene-bottom]",
      ]) {
        const box = (await page.locator(selector).boundingBox())!;
        expect(box.y, selector).toBeGreaterThanOrEqual(72);
        expect(box.y + box.height, selector).toBeLessThanOrEqual(height);
      }
      const frame = (await page.locator("[data-scene-frame]").boundingBox())!;
      expect(frame.width / frame.height).toBeCloseTo(16 / 9, 2);
      if (width === 1440) {
        const workspace = (await page.locator("[data-scene-workspace]").boundingBox())!;
        // The compact band must fit a full-width, undistorted first-view stage.
        expect(frame.width).toBeCloseTo(workspace.width, 0);
        const selects = (await page.locator("[data-scene-quick]").boundingBox())!;
        const gap = frame.y - selects.y - selects.height;
        const pose = (await page
          .getByRole("button", { name: m["scene.limbs"], exact: true })
          .boundingBox())!;
        const note = (await page.locator("[data-scene-bottom]").boundingBox())!;
        await writeFile(
          `${evidenceRoot}/layout-${width}.json`,
          JSON.stringify(
            {
              frame,
              workspace,
              selects,
              pose,
              note,
              gap,
              scrollY: await page.evaluate(() => scrollY),
            },
            null,
            2,
          ),
        );
        expect(gap).toBeGreaterThanOrEqual(12);
        expect(gap).toBeLessThanOrEqual(16);
        expect(Math.abs(pose.y + pose.height / 2 - note.y - note.height / 2)).toBeLessThan(1);
        expect(frame.x + frame.width / 2).toBeCloseTo(workspace.x + workspace.width / 2, 0);
        expect(frame.y + frame.height).toBeLessThanOrEqual(height - 8);
        const heading = (await page
          .getByRole("heading", { name: m["scene.layouts"], exact: true })
          .boundingBox())!;
        expect(heading.y).toBeGreaterThanOrEqual(72);
        const buttons = await page.locator("[data-scene-layouts] button").all();
        const top = (await buttons[0].boundingBox())!.y;
        for (const button of buttons) {
          await expect(button).toHaveCSS("white-space", "nowrap");
          expect((await button.boundingBox())!.y).toBeCloseTo(top, 0);
        }
        const settings = (await page.locator("[data-setting-picker]").boundingBox())!;
        expect(settings.width).toBeCloseTo(workspace.width, 0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width === 390) {
        const undo = (await page
          .getByRole("button", { name: m["scene.undo"], exact: true })
          .boundingBox())!;
        const reset = (await page
          .getByRole("button", { name: m["scene.reset"], exact: true })
          .boundingBox())!;
        expect(Math.abs(undo.y - reset.y)).toBeLessThan(1);
      }
    };
    await assertFold();
    const close = await cameraEvidence(page);
    const camera = new PerspectiveCamera(close.fov, close.aspect, 0.05, 10000);
    camera.position.set(...close.position);
    camera.lookAt(new Vector3(...close.target));
    camera.updateMatrixWorld(true);
    // The real head bones, not standing-height estimates, sit in the upper half.
    for (const figure of (await draft(page)).figures) {
      const head = new Vector3(...close.joints[figure.id].head).project(camera);
      expect(head.y).toBeGreaterThan(0.1);
      expect(head.y).toBeLessThan(0.85);
      const body = close.bodies.find((body) => body.id === figure.id)!;
      const number = new Vector3(figure.x, body.max[1] + 0.08, figure.z).project(camera);
      expect(number.y).toBeLessThan(0.85); // Whole badge, not a clipped band at the frame edge.
    }
    await mkdir(`${evidenceRoot}/shots`, { recursive: true });
    await capture("dialogue");
    await writeFile(
      `${evidenceRoot}/timed-walk-${width}.json`,
      JSON.stringify(
        {
          kind: "automated fresh-user pointer walk, not Owner timing",
          locale,
          width,
          height,
          elapsedMs,
          limitMs: 30_000,
          steps,
          scene: await draft(page),
          camera: close,
        },
        null,
        2,
      ),
    );

    await page.getByRole("button", { name: m["scene.layout.shoulder"], exact: true }).click();
    await ready(page, false);
    expect((await draft(page)).camera).toMatchObject({ view: "shoulder", shot: "medium" });
    await page.getByRole("button", { name: m["scene.layout.group"], exact: true }).click();
    await ready(page, false);
    expect((await draft(page)).figures).toHaveLength(5);
    const five = (await draft(page)).figures;
    expect(five[0].pose).toBe("sit");
    expect(five[0].x).toBe(Math.min(...five.map((item: { x: number }) => item.x)));
    expect(five[0].z).toBe(Math.max(...five.map((item: { z: number }) => item.z)));
    expect(five[0].z - five[2].z).toBeCloseTo(0.6, 6);
    // #2 is close enough to support the sitter, rather than an unreachable rear gap.
    expect(five[0].z - five[1].z).toBeCloseTo(0.3, 6);
    expect(five[1].x).toBeGreaterThan(five[0].x);
    expect(five[1].x).toBeLessThan(five[2].x);
    for (const index of [3]) {
      expect(five[index].z).toBeLessThan(five[2].z - 0.5);
      expect(five[index].x).toBeGreaterThan(five[index - 1].x);
      expect(five[index].x).toBeLessThan(five[index + 1].x);
    }
    expect(five[1].pose).toBe("lean-in");
    expect(five.map((item: { pose: string }) => item.pose)).toEqual([
      "sit",
      "lean-in",
      "arms-crossed",
      "stand",
      "stand",
    ]);
    expect(five.map((item: { turn: number }) => item.turn)).toEqual([-25, -25, -25, -30, -60]);
    for (const item of five.slice(1)) expect(item.turn).toBeLessThan(0);
    const seated = await cameraEvidence(page);
    expect(
      new Vector3(...seated.joints[five[1].id].hand_r).distanceTo(
        new Vector3(...seated.joints[five[0].id].upperarm_l),
      ),
    ).toBeLessThan(0.12);
    expect(seated.seats).toHaveLength(1);
    expectFullFit(seated);
    const groupLens = new PerspectiveCamera(seated.fov, seated.aspect, 0.05, 10000);
    groupLens.position.set(...seated.position);
    groupLens.lookAt(new Vector3(...seated.target));
    groupLens.updateMatrixWorld(true);
    const intervals = seated.bodies.map((body) => {
      const xs = [];
      for (const x of [body.min[0], body.max[0]])
        for (const y of [body.min[1], body.max[1]])
          for (const z of [body.min[2], body.max[2]])
            xs.push(new Vector3(x, y, z).project(groupLens).x);
      return { id: body.id, min: Math.min(...xs), max: Math.max(...xs) };
    });
    for (const a of intervals)
      for (const b of intervals) {
        if (a.id === b.id) continue;
        const overlap = Math.max(0, Math.min(a.max, b.max) - Math.max(a.min, b.min));
        expect(overlap / Math.min(a.max - a.min, b.max - b.min)).toBeLessThanOrEqual(0.15);
      }
    await writeFile(
      `${evidenceRoot}/five-sit-${width}.json`,
      JSON.stringify({ figures: five, camera: seated, intervals }, null, 2),
    );
    await assertFold();
    await capture("five-sit");
    await page.getByRole("button", { name: m["scene.layout.lineup"], exact: true }).click();
    await ready(page, false);
    const group = (await draft(page)).figures;
    expect(group).toHaveLength(8);
    expect(new Set(group.map((item: { pose: string }) => item.pose)).size).toBeGreaterThanOrEqual(
      3,
    );
    expect(new Set(group.map((item: { build: string }) => item.build)).size).toBe(6);
    for (const item of group) {
      expect(item.z).toBeGreaterThanOrEqual(-0.45);
      expect(item.z).toBeLessThanOrEqual(0.45);
      expect(Math.abs(item.turn)).toBeGreaterThanOrEqual(15);
      expect(Math.abs(item.turn)).toBeLessThanOrEqual(35);
      expect(item.x * item.turn).toBeLessThan(0);
    }
    const wide = await cameraEvidence(page);
    expectFullFit(wide);
    expect(wide.position[2]).toBeGreaterThanOrEqual(7.5);
    expect(wide.position[2]).toBeLessThanOrEqual(8.5);
    await assertFold();
    if (process.env.SCENE_CAPTURE_SHOTS !== "0") {
      await capture("wide-group");
      if (width === 1440) {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await ready(page, false);
        expect(await page.evaluate(() => scrollY)).toBe(0);
        const largeFrame = (await page.locator("[data-scene-frame]").boundingBox())!;
        expect(largeFrame.y + largeFrame.height).toBeLessThanOrEqual(1080);
        const selects = (await page.locator("[data-scene-quick]").boundingBox())!;
        const gap = largeFrame.y - selects.y - selects.height;
        expect(gap).toBeGreaterThanOrEqual(12);
        expect(gap).toBeLessThanOrEqual(16);
        await writeFile(
          `${evidenceRoot}/layout-1920.json`,
          JSON.stringify(
            { frame: largeFrame, selects, gap, scrollY: await page.evaluate(() => scrollY) },
            null,
            2,
          ),
        );
        const shoulder = page.getByRole("button", {
          name: m["scene.layout.shoulder"],
          exact: true,
        });
        await expect(shoulder).toHaveCSS("white-space", "nowrap");
        expect((await shoulder.boundingBox())!.height).toBeCloseTo(
          (await page.locator("[data-scene-layouts] button").first().boundingBox())!.height,
          0,
        );
        await page.screenshot({ path: `${evidenceRoot}/shots/wide-group-1920.png` });
        await page.setViewportSize({ width, height });
        await ready(page, false);
      }
    }

    await page.getByRole("button", { name: m["scene.layout.talk"], exact: true }).click();
    await panel.locator("summary").click();
    await page.getByRole("button", { name: m["scene.shot.full"], exact: true }).click();
    await ready(page, false);
    await panel.locator("summary").click();
    await page.getByRole("button", { name: m["scene.limbs"], exact: true }).click();
    await expect(page.locator("[data-scene-handle]")).toHaveCount(5);
    await ready(page, false);
    expect((await draft(page)).camera).toMatchObject({
      shot: "medium",
      view: "eye",
      subject: (await draft(page)).figures[0].id,
    });
    const dot = page.locator('[data-scene-handle="leftWrist"]');
    const hitBox = (await dot.boundingBox())!;
    expect(hitBox.width).toBeGreaterThanOrEqual(32);
    expect(hitBox.height).toBeGreaterThanOrEqual(32);
    const visibleDot = (await dot.locator("svg circle").boundingBox())!;
    expect(visibleDot.width).toBeGreaterThanOrEqual(14);
    expect(visibleDot.width).toBeLessThanOrEqual(18);
    const paint = dot.locator(".game-ui-droplet path").first();
    await expect(paint).toHaveCSS("fill", "rgba(0, 0, 0, 0)");
    const viewport = (await page.locator("canvas").boundingBox())!;
    const headDot = (await page.locator('[data-scene-handle="head"]').boundingBox())!;
    expect(headDot.y).toBeGreaterThanOrEqual(viewport.y);
    expect(headDot.y + headDot.height).toBeLessThanOrEqual(viewport.y + viewport.height);
    for (const wrist of ["leftWrist", "rightWrist"]) {
      const handle = (await page.locator(`[data-scene-handle="${wrist}"]`).boundingBox())!;
      expect(handle.y + handle.height / 2 - 8).toBeGreaterThanOrEqual(viewport.y);
      expect(handle.y + handle.height / 2 + 8).toBeLessThanOrEqual(viewport.y + viewport.height);
    }
    const before = await cameraEvidence(page);
    const figures = (await draft(page)).figures;
    const target = new Vector3(...before.joints[figures[1].id].upperarm_r);
    const lens = new PerspectiveCamera(before.fov, before.aspect, 0.05, 10000);
    lens.position.set(...before.position);
    lens.lookAt(new Vector3(...before.target));
    lens.updateMatrixWorld(true);
    const edges = before.bodies.flatMap((body) =>
      [body.min[0], body.max[0]].flatMap((x) =>
        [body.min[2], body.max[2]].map((z) => new Vector3(x, 1, z).project(lens).x),
      ),
    );
    const left = Math.min(...edges);
    const right = Math.max(...edges);
    expect((right - left) / 2).toBeGreaterThanOrEqual(0.55);
    expect((right - left) / 2).toBeLessThanOrEqual(0.65);
    expect(Math.abs((left + right) / 2)).toBeLessThan(0.06);
    const crowns = before.bodies.map((body) => {
      const head = before.joints[body.id].head;
      return (1 - new Vector3(head[0], body.max[1], head[2]).project(lens).y) / 2;
    });
    expect(Math.min(...crowns)).toBeGreaterThanOrEqual(0.085);
    expect(Math.min(...crowns)).toBeLessThanOrEqual(0.13);
    const projected = target.clone().project(lens);
    const frame = (await page.locator("canvas").boundingBox())!;
    const hand = (await page.locator('[data-scene-handle="leftWrist"]').boundingBox())!;
    await page.mouse.move(hand.x + hand.width / 2, hand.y + hand.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      frame.x + ((projected.x + 1) * frame.width) / 2,
      frame.y + ((1 - projected.y) * frame.height) / 2,
      { steps: 30 },
    );
    await page.mouse.up();
    await ready(page, false);
    const after = await cameraEvidence(page);
    await writeFile(
      `${evidenceRoot}/drag-attempt-${width}.json`,
      JSON.stringify(
        { before, after, scene: await draft(page), hand, frame, target: target.toArray() },
        null,
        2,
      ),
    );
    const contact = JSON.parse((await page.locator("canvas").getAttribute("data-scene-contact"))!);
    expect(contact).not.toBeNull();
    const wrist = new Vector3(...after.joints[figures[0].id].hand_l);
    // Same accuracy, now against the visible skin target instead of an interior bone.
    expect(wrist.distanceTo(new Vector3(...contact.wrist))).toBeLessThan(0.035);
    expect(
      wrist
        .clone()
        .sub(new Vector3(...contact.point))
        .dot(new Vector3(...contact.normal)),
    ).toBeGreaterThan(0.015);
    const points = after.joints[figures[0].id];
    const along = new Vector3(...points.middle_01_l).sub(wrist).normalize();
    const across = new Vector3(...points.index_01_l)
      .sub(new Vector3(...points.pinky_01_l))
      .normalize();
    const palm = along.clone().cross(across).normalize();
    expect(Math.abs(along.dot(new Vector3(...contact.normal)))).toBeLessThan(0.01);
    expect(palm.dot(new Vector3(...contact.normal))).toBeLessThan(-0.95);
    await expect(dot.locator("svg circle")).toHaveAttribute("fill", "none");
    await expect(dot.locator("svg circle")).toHaveAttribute("stroke-width", "2");
    const custom = (await draft(page)).figures[0].joints;
    const elbow = new Euler().setFromQuaternion(new Quaternion(...custom.lowerarm_l));
    expect(elbow.x).toBeGreaterThanOrEqual(0.039);
    expect(elbow.x).toBeLessThanOrEqual(2.651);
    expect((await draft(page)).camera.position).toEqual(before.position);
    await assertFold();
    await capture("limb-drag");
    await writeFile(
      `${evidenceRoot}/limb-drag-${width}.json`,
      JSON.stringify(
        {
          before,
          after,
          contact,
          palm: palm.toArray(),
          target: target.toArray(),
          elbow: elbow.toArray(),
          joints: custom,
        },
        null,
        2,
      ),
    );
    await page.getByRole("button", { name: m["scene.undo"], exact: true }).click();
    expect((await draft(page)).figures[0].joints).toEqual({});
    await page.getByRole("button", { name: m["scene.redo"], exact: true }).click();
    await page.reload();
    await ready(page, false);
    expect((await draft(page)).figures[0].joints).toEqual(custom);
    if (width === 1440 && process.env.SCENE_CAPTURE_SHOTS !== "0") {
      // Supplement the nine review originals with real front/profile and broad-f lean PNGs.
      await mkdir(`${evidenceRoot}/details`, { recursive: true });
      const saveDetail = async (name: string) => {
        await ready(page, false);
        const detailDownload = page.waitForEvent("download");
        await page.getByRole("button", { name: m["scene.savePng"], exact: true }).click();
        await (await detailDownload).saveAs(`${evidenceRoot}/details/${name}.png`);
      };
      await page.getByRole("button", { name: m["scene.reset"], exact: true }).click();
      await page
        .getByRole("combobox", { name: m["scene.figures"], exact: true })
        .selectOption(figures[1].id);
      await page.locator("[data-scene-inspector] summary").click();
      await page.getByLabel(m["scene.build"], { exact: true }).selectOption("broad-f");
      await page.getByLabel(m["scene.pose"], { exact: true }).selectOption("lean-in");
      const facing = page.getByRole("slider", { name: new RegExp(m["scene.turn"]) });
      await facing.press("Home");
      for (let i = 0; i < 36; i++) await facing.press("ArrowRight");
      await panel.locator("summary").click();
      await page.getByLabel(m["scene.subject"], { exact: true }).selectOption("selected");
      await page.getByRole("button", { name: m["scene.shot.full"], exact: true }).click();
      await saveDetail("lean-broad-f-full");
      await page.getByRole("button", { name: m["scene.shot.medium"], exact: true }).click();
      await saveDetail("lean-broad-f-medium");
      await page.getByLabel(m["scene.pose"], { exact: true }).selectOption("stand");
      await page.getByRole("button", { name: m["scene.shot.close"], exact: true }).click();
      await saveDetail("face-front");
      for (let i = 0; i < 18; i++) await facing.press("ArrowRight");
      await saveDetail("face-profile");
    }
    expect(errors).toEqual([]);
    const video = page.video()!;
    await context.close();
    await video.saveAs(`${evidenceRoot}/walks/fresh-dialogue-and-drag-${width}.webm`);
  });
}
