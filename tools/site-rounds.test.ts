import test from "node:test";
import assert from "node:assert/strict";
import { ACTORS } from "../src/content/actors/index.ts";
import { WORKS } from "../src/content/works.ts";

test("round six roster has five active actors and all 94 new faces", () => {
  assert.equal(ACTORS.length, 99);
  assert.deepEqual(
    ACTORS.slice(0, 5).map((actor) => actor.slug),
    ["tang-yunqiu", "misha-luo", "zhang-qiang", "chen-wei", "yan-lin"],
  );
  assert.equal(ACTORS[4].status, "active");
  assert.equal(ACTORS.slice(5).filter((actor) => actor.status === "new-face").length, 94);
  assert.equal(new Set(ACTORS.map((actor) => actor.slug)).size, ACTORS.length);
  assert.ok(ACTORS.every((actor) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(actor.slug)));
});

test("works use actor slugs", () => {
  assert.ok(
    WORKS.every((work) =>
      work.cast.every((credit) => ACTORS.some((actor) => actor.slug === credit.actor)),
    ),
  );
});

test("every actor has a local asset manifest and new faces have image plus voice source", async () => {
  const { readdir, access } = await import("node:fs/promises");
  const { join } = await import("node:path");
  for (const actor of ACTORS) {
    await access(join(process.cwd(), "src/content/actors", actor.slug, "assets.json"));
  }
  const newFaceDirs = await readdir(join(process.cwd(), "src/content/actors"));
  assert.ok(newFaceDirs.includes("lin-xiaoman"));
  await access(
    join(process.cwd(), "media-pack/library/voice/new-faces/lin-xiaoman/candidate-1.mp3"),
  );
});

test("voice manifests match round six delivery counts", async () => {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  for (const [slug, expected] of [
    ["tang-yunqiu", 7],
    ["misha-luo", 7],
    ["zhang-qiang", 1],
    ["chen-wei", 1],
    ["yan-lin", 6],
  ] as const) {
    const manifest = JSON.parse(
      await readFile(join(process.cwd(), "src/content/actors", slug, "assets.json"), "utf8"),
    );
    assert.equal(
      manifest.items.filter((item: { kind: string }) => item.kind === "voice").length,
      expected,
    );
    if (slug === "yan-lin") {
      const voices = manifest.items.filter((item: { kind: string }) => item.kind === "voice");
      assert.ok(
        voices.every(
          (item: { preview: string; transcript?: { text?: string } }) =>
            item.preview.startsWith("/api/voice/yan-lin/") && item.transcript?.text,
        ),
      );
    }
  }
});
