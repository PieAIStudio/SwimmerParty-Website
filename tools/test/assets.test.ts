import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import {
  ASSET_FRAMES,
  listSeries,
  requiredSlots,
  slotsOf,
  slotsForLook,
  assetSlotOrder,
  slotLabelKey,
} from "../../src/features/assets/asset-series.ts";
import {
  coreProgress,
  firstImage,
  getActorAssets,
  itemsBySeries,
} from "../../src/features/assets/assets.ts";
import { localAssetStore, objectPath } from "../../src/features/assets/server/asset-store.ts";
import { ingest } from "../assets/assets-ingest.ts";
import { todo, writeTodo } from "../assets/assets-todo.ts";
import { writeTransaction } from "../assets/assets-common.ts";
import { fixtureRoot, syntheticImage, input, emptyInbox } from "./fixtures/assets.ts";
import { ACTORS } from "../../src/content/actors/index.ts";
import { WORKS } from "../../src/content/works.ts";
const tangLooks = getActorAssets("tang-yunqiu").looks;
const mishaLooks = getActorAssets("misha-luo").looks;

const projectLookFields = (look: {
  id: string;
  label: { en: string; zh: string };
  prompt: string;
  role?: { work: string; id: string };
  extras: { key: string; label: { en: string; zh: string }; direction: string }[];
}) => ({
  id: look.id,
  label: look.label,
  prompt: look.prompt,
  role: look.role,
  extras: look.extras,
});

async function rootFor(t: { after: (fn: () => Promise<void>) => void }) {
  const root = await fixtureRoot();
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const missing = (file: string) => assert.rejects(access(file), { code: "ENOENT" });
const run = (root: string, options: Parameters<typeof ingest>[1] = {}) =>
  ingest("zhang-qiang", {
    root,
    store: localAssetStore(path.join(root, ".assets-local")),
    ...options,
  });

function messages(error: unknown): string {
  return error instanceof AggregateError
    ? error.errors.map((item) => item.message).join("\n")
    : String(error);
}

test("the vocabulary is exactly the approved appendix, with 21 unique core slots", async () => {
  const expected = JSON.parse(
    await readFile(new URL("./fixtures/approved-vocabulary.json", import.meta.url), "utf8"),
  );
  const actual = JSON.parse(
    await readFile(new URL("../../src/content/asset-series.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    {
      ...actual,
      series: actual.series.filter(
        (series: { id: string }) => !["voice", "video"].includes(series.id),
      ),
    },
    expected,
  );
  assert.ok(actual.series.some((series: { id: string }) => series.id === "voice"));
  assert.ok(actual.series.some((series: { id: string }) => series.id === "video"));
  assert.equal(requiredSlots().length, 21);
  assert.equal(new Set(requiredSlots().map((slot) => slot.slot)).size, 21);
  assert.equal(slotsOf("expression").filter((slot) => slot.tier === "technical").length, 2);
  assert.equal(slotsOf("wardrobe", "casual")[0].slot, "wardrobe.casual.front");
});

test("every vocabulary label is authored in both locales", async () => {
  for (const locale of ["en", "zh-CN"]) {
    const catalog = JSON.parse(
      await readFile(new URL(`../../messages/${locale}/messages.json`, import.meta.url), "utf8"),
    );
    for (const series of listSeries()) {
      assert.ok(catalog[`assets.series.${series.id}`]);
      for (const slot of series.slots)
        assert.ok(
          catalog[slotLabelKey(series.id, slot.key)],
          `${locale}: ${series.id}.${slot.key}`,
        );
    }
  }
});

test("every delivered manifest item has one ordered asset slot", () => {
  for (const actor of ACTORS) {
    const assets = getActorAssets(actor.slug);
    const slots = new Set(assetSlotOrder(assets.looks));
    const delivered = assets.items.map((item) => item.slot);
    assert.equal(new Set(delivered).size, delivered.length, actor.slug);
    assert.ok(
      delivered.every((slot) => slots.has(slot)),
      actor.slug,
    );
  }
});

test("role looks point to the matching work role", () => {
  for (const look of [...tangLooks, ...mishaLooks].filter((item) => item.role)) {
    const work = WORKS.find((item) => item.code === look.role!.work);
    assert.ok(work, look.id);
    assert.ok(
      work.cast.some((credit) => credit.role?.id === look.role!.id),
      look.id,
    );
  }
});

test("published look copies match the media-pack production descriptions", async () => {
  const sources = [
    ["SP-13", "../../media-pack/actors/tang-yunqiu.json", tangLooks],
    ["SP-03", "../../media-pack/actors/misha-luo.json", mishaLooks],
  ] as const;
  for (const [code, file, siteLooks] of sources) {
    const pack = JSON.parse(await readFile(new URL(file, import.meta.url), "utf8")) as {
      code: string;
      looks: Array<{
        id: string;
        label: { en: string; zh: string };
        prompt: string;
        role?: { work: string; siteWork?: string; id: string };
        extras?: { key: string; label: { en: string; zh: string }; direction: string }[];
      }>;
    };
    assert.equal(pack.code, code);
    const productionLooks = pack.looks.filter((look) => look.id !== "casting-basics");
    assert.deepEqual(
      siteLooks.map(projectLookFields),
      productionLooks.map((look) =>
        projectLookFields({
          ...look,
          role: look.role
            ? { work: look.role.siteWork ?? look.role.work, id: look.role.id }
            : undefined,
          extras: look.extras ?? [],
        }),
      ),
      `${code}: site look copy drifted from media-pack`,
    );
  }
});

test("an undelivered actor has an empty manifest and exactly 21 actionable TODO prompts", async (t) => {
  const root = await rootFor(t);
  assert.deepEqual(coreProgress("misha-luo", root), { done: 0, total: 21 });
  assert.deepEqual(getActorAssets("misha-luo", root).items, []);
  assert.equal(firstImage("misha-luo", ["face.front"], root), undefined);
  const result = await writeTodo("SP-03", { root });
  assert.equal(result.missing.length, 21);
  assert.equal((result.text.match(/^## /gm) ?? []).length, 21);
  assert.match(result.text, /only source of this character's identity: MISHA LUO \(SP-03\)/);
  assert.match(
    result.text,
    /No colored rim light, no visible lamps or light fixtures, no cast floor shadow/,
  );
  assert.match(result.text, /1536 × 2304, transparent background, PNG/);
  assert.match(result.text, /1920 × 1920, transparent background, PNG/);
  assert.match(
    result.text,
    /GPT Image 2.5 · 1920x1920 · background transparent · PNG · quality high/,
  );
  assert.match(result.text, /Create the missing anchors first/);
  assert.equal(todo("SP-03", { root, all: true }).missing.length, 48);
  await missing(path.join(root, "public"));
});

test("dry-run validates without writing previews, masters or manifests", async (t) => {
  const root = await rootFor(t);
  await input(root, "zhang-qiang__turnaround__front__v1.png", await syntheticImage());
  const result = await run(root, { dryRun: true });
  assert.equal(result.manifest.items.length, 1);
  await missing(path.join(root, "public"));
  await missing(path.join(root, ".assets-local"));
  await missing(path.join(root, "src"));
});

test("v1 ingest preserves master bytes and transparent derivatives, and readers use the manifest", async (t) => {
  const root = await rootFor(t);
  const original = await syntheticImage();
  await input(root, "zhang-qiang__turnaround__front__v1.png", original);
  const result = await run(root);
  const item = result.manifest.items[0];
  assert.equal(item.sha256, sha(original));
  assert.equal(item.bytes, original.length);
  assert.equal(item.conformance, "v1");
  assert.deepEqual(await readFile(path.join(root, ".assets-local", item.object)), original);
  for (const [file, expected] of [
    [item.preview, 1024],
    [item.thumb, 384],
  ] as const) {
    const image = sharp(await readFile(path.join(root, "public", file)));
    const meta = await image.metadata();
    assert.equal(Math.max(meta.width!, meta.height!), expected);
    assert.equal(meta.hasAlpha, true);
    assert.equal(
      (
        await image
          .extract({ left: 0, top: 0, width: 8, height: 8 })
          .extractChannel("alpha")
          .raw()
          .toBuffer()
      ).some((alpha) => alpha !== 0),
      false,
    );
  }
  assert.deepEqual(coreProgress("zhang-qiang", root), { done: 1, total: 21 });
  assert.equal(
    firstImage("zhang-qiang", ["face.front", "turnaround.front"], root)?.slot,
    "turnaround.front",
  );
  assert.equal(itemsBySeries("zhang-qiang", root).turnaround.length, 1);
  assert.equal(todo("zhang-qiang", { root }).missing.length, 20);
  assert.equal((await run(root)).manifest.items.length, 1, "identical re-ingest is idempotent");
});

test("invalid dimensions and unknown slots are reported together before any writes", async (t) => {
  const root = await rootFor(t);
  const tiny = await sharp({
    create: { width: 20, height: 20, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();
  await input(root, "zhang-qiang__face__front__v1.png", tiny);
  await input(root, "zhang-qiang__face__invented__v1.png", tiny);
  await assert.rejects(
    run(root),
    (error) => /1920×1920/.test(messages(error)) && /Unknown slot/.test(messages(error)),
  );
  await missing(path.join(root, "public"));
  await missing(path.join(root, "src"));
});

for (const [label, corner] of Object.entries({
  topLeft: [0, 0],
  topRight: [1535, 0],
})) {
  test(`v1 rejects a single non-transparent pixel in the ${label} corner`, async (t) => {
    const root = await rootFor(t);
    await input(
      root,
      "zhang-qiang__turnaround__front__v1.png",
      await syntheticImage("full", corner as [number, number]),
    );
    await assert.rejects(run(root), (error) => /8×8 corner/.test(messages(error)));
  });
}

test("v1 permits a character to touch the bottom edge", async (t) => {
  const root = await rootFor(t);
  await input(
    root,
    "zhang-qiang__turnaround__front__v1.png",
    await syntheticImage("full", [0, 2303]),
  );
  await assert.doesNotReject(run(root));
});

test("v1 rejects opaque PNG and mismatched file formats", async (t) => {
  const root = await rootFor(t);
  const opaque = await sharp({ create: { ...ASSET_FRAMES.head, channels: 3, background: "white" } })
    .png()
    .toBuffer();
  await input(root, "zhang-qiang__face__front__v1.png", opaque);
  await input(root, "zhang-qiang__face__side__v1.webp", opaque);
  await assert.rejects(
    run(root),
    (error) => /alpha channel/.test(messages(error)) && /format must match/.test(messages(error)),
  );
});

test("wardrobe look IDs must be registered before ingest", async (t) => {
  const root = await rootFor(t);
  await input(root, "zhang-qiang__wardrobe-casual__front__v1.png", await syntheticImage());
  await assert.rejects(run(root), (error) => /Register look 'casual'/.test(messages(error)));
  await mkdir(path.join(root, "src/content/actors/zhang-qiang"), { recursive: true });
  await writeFile(
    path.join(root, "src/content/actors/zhang-qiang/assets.json"),
    JSON.stringify({
      code: "zhang-qiang",
      slug: "zhang-qiang",
      looks: [
        {
          id: "casual",
          kind: "personal",
          label: { en: "Casual", zh: "便装" },
          prompt: "a plain casual shirt",
          extras: [],
        },
      ],
      items: [],
    }),
  );
  const { manifest } = await run(root);
  assert.equal(manifest.items[0].slot, "wardrobe.casual.front");
  assert.equal(coreProgress("zhang-qiang", root).done, 0);
  assert.match(todo("zhang-qiang", { root, all: true }).text, /Wardrobe: a plain casual shirt/);
});

test("an anchor upgrade removes old entries and mixed or skipped versions fail", async (t) => {
  const root = await rootFor(t);
  await input(root, "zhang-qiang__turnaround__front__v1.png", await syntheticImage());
  await input(root, "zhang-qiang__face__front__v1.png", await syntheticImage("head"));
  await run(root);
  await emptyInbox(root);
  await input(root, "zhang-qiang__expression__neutral__v3.png", await syntheticImage("head"));
  await assert.rejects(run(root), (error) => /Use v1, or upgrade/.test(messages(error)));
  await emptyInbox(root);
  await input(root, "zhang-qiang__expression__neutral__v2.png", await syntheticImage("head"));
  const result = await run(root);
  assert.equal(result.upgraded, true);
  assert.deepEqual(
    result.manifest.items.map((item) => item.slot),
    ["expression.neutral"],
  );
  await input(root, "zhang-qiang__face__side__v3.png", await syntheticImage("head"));
  await assert.rejects(run(root), (error) => /One batch must use one anchor/.test(messages(error)));
});

test("masters cannot change under an existing key; storage rejects traversal", async (t) => {
  const root = await rootFor(t);
  const store = localAssetStore(root);
  const key = "zhang-qiang/0123456789abcdef/zhang-qiang__turnaround__front__v0.webp";
  await store.put(key, Buffer.from("original"));
  await store.put(key, Buffer.from("original"));
  await assert.rejects(store.put(key, Buffer.from("changed")), /different bytes/);
  for (const object of [
    "../secret",
    "/absolute",
    "zhang-qiang/../../secret",
    "zhang-qiang/0123456789abcdef/a%2fb.png",
  ])
    assert.throws(() => objectPath(root, object), /Invalid/);
});

test("input symlinks and unknown actor codes are rejected", async (t) => {
  const root = await rootFor(t);
  await mkdir(path.join(root, "assets-inbox/zhang-qiang"), { recursive: true });
  const original = path.join(root, "elsewhere.png");
  await writeFile(original, await syntheticImage());
  await symlink(
    original,
    path.join(root, "assets-inbox/zhang-qiang/zhang-qiang__turnaround__front__v1.png"),
  );
  await assert.rejects(run(root), (error) => /regular file/.test(messages(error)));
  await assert.rejects(ingest("SP-99", { root }), /Unknown actor code/);
});

test("a failed visible-file transaction restores previously written files", async (t) => {
  const root = await rootFor(t);
  const target = path.join(root, "existing.txt");
  await writeFile(target, "before");
  const blocker = path.join(root, "not-a-directory");
  await writeFile(blocker, "blocker");
  await assert.rejects(
    writeTransaction([
      { path: target, bytes: Buffer.from("after") },
      { path: path.join(blocker, "child"), bytes: Buffer.from("bad") },
    ]),
  );
  assert.equal(await readFile(target, "utf8"), "before");
});
