import test from "node:test";
import assert from "node:assert/strict";
import { createFirstUseTracker, isFirstUseKind } from "../../src/features/guidance/first-use.ts";
import { loadSignedImages } from "../../src/features/assets/signed-images.ts";
import { starterPack } from "../../src/features/assets/starter-pack.ts";

test("first-use accepts exactly four non-personal operation kinds", () => {
  for (const kind of ["download", "cast", "post", "vote"]) assert.equal(isFirstUseKind(kind), true);
  for (const kind of [null, {}, "login", "email", "download:someone"])
    assert.equal(isFirstUseKind(kind), false);
});
test("seen preferences are per kind, persist and do not consume unviewed topics", () => {
  const saved = new Map<string, string>();
  const storage = () => ({
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => {
      saved.set(key, value);
    },
  });
  const tracker = createFirstUseTracker(storage);
  assert.equal(tracker.seen("download"), false);
  tracker.markSeen("download");
  assert.equal(tracker.seen("download"), true);
  assert.equal(tracker.seen("post"), false);
  assert.equal(createFirstUseTracker(storage).seen("download"), true);
  assert.deepEqual([...saved], [["sp-first-use-v1:download", "seen"]]);
});
test("denied storage falls back to this session without throwing or claiming durable state", () => {
  const denied = () => {
    throw new Error("storage denied");
  };
  const tracker = createFirstUseTracker(denied);
  assert.equal(tracker.seen("cast"), false);
  tracker.markSeen("cast");
  assert.equal(tracker.seen("cast"), true);
  assert.equal(createFirstUseTracker(denied).seen("cast"), false);
});
const items = ["one", "two"].map((slot) => ({
  slot,
  url: `https://fixture.invalid/${slot}`,
  filename: `${slot}.png`,
}));
const expected = items.map(({ slot, filename }) => ({ slot, filename }));
const image = () =>
  new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } });

test("progress counts only completed, identity-checked fetched images", async (context) => {
  context.mock.method(globalThis, "fetch", async (url: string) =>
    url.includes("/bundle") ? Response.json({ items: items.slice().reverse() }) : image(),
  );
  const steps: unknown[] = [];
  const result = await loadSignedImages("fixture", expected, {
    onProgress: (value) => steps.push(value),
  });
  assert.deepEqual(
    result.map((item) => item.slot),
    ["one", "two"],
  );
  assert.deepEqual(steps, [
    { completed: 0, total: 2 },
    { completed: 1, total: 2 },
    { completed: 2, total: 2 },
  ]);
});
test("a failed transfer never advances progress to a completed file", async (context) => {
  context.mock.method(globalThis, "fetch", async (url: string) =>
    url.includes("/bundle")
      ? Response.json({ items })
      : url.endsWith("one")
        ? image()
        : new Response(null, { status: 503 }),
  );
  const steps: unknown[] = [];
  await assert.rejects(
    loadSignedImages("fixture", expected, { onProgress: (value) => steps.push(value) }),
    /Image download failed/,
  );
  assert.deepEqual(steps, [
    { completed: 0, total: 2 },
    { completed: 1, total: 2 },
  ]);
});
test("aborted transfers do not emit a successful progress update", async (context) => {
  const abort = new AbortController();
  context.mock.method(globalThis, "fetch", async (url: string) => {
    if (url.includes("/bundle")) return Response.json({ items });
    abort.abort();
    return image();
  });
  const steps: unknown[] = [];
  await assert.rejects(
    loadSignedImages("fixture", expected, {
      signal: abort.signal,
      onProgress: (value) => steps.push(value),
    }),
    { name: "AbortError" },
  );
  assert.deepEqual(steps, [{ completed: 0, total: 2 }]);
});
test("over-budget transfers and malformed signed identities are not counted as completed", async (context) => {
  const steps: unknown[] = [];
  const mock = context.mock.method(globalThis, "fetch", async (url: string) =>
    url.includes("/bundle") ? Response.json({ items }) : image(),
  );
  await assert.rejects(
    loadSignedImages("fixture", expected, {
      maxBytes: 2,
      onProgress: (value) => steps.push(value),
    }),
    /smaller export/,
  );
  assert.deepEqual(steps, [{ completed: 0, total: 2 }]);
  steps.length = 0;
  mock.mock.mockImplementation(async () => Response.json({ items: [items[0], items[0]] }));
  await assert.rejects(
    loadSignedImages("fixture", expected, { onProgress: (value) => steps.push(value) }),
    /Invalid signed bundle/,
  );
  assert.deepEqual(steps, []);
});
test("a cast pack aggregates real files across actor bundles without resetting its count", async (context) => {
  context.mock.method(globalThis, "fetch", async (url: string) =>
    url.includes("/bundle") ? Response.json({ items }) : image(),
  );
  const actor = {
    slug: "one",
    nameEn: "Fixture",
    nameCn: "夹具",
    promptSeed: null,
    slots: ["one", "two"],
  };
  const steps: { completed: number; total: number }[] = [];
  const result = await starterPack([actor, { ...actor, slug: "two" }], undefined, (value) =>
    steps.push(value),
  );
  assert.equal(result.filename, "swimmer-party-cast.zip");
  assert.deepEqual(
    steps.map((value) => value.completed),
    [0, 1, 2, 2, 3, 4],
  );
  assert.ok(steps.every((value) => value.total === 4));
});
