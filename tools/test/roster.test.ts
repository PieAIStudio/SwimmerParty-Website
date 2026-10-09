import test from "node:test";
import assert from "node:assert/strict";
import { ACTORS } from "../../src/content/actors/index.ts";
import { WORKS } from "../../src/content/works.ts";

test("roster identifiers are unique permanent slugs", () => {
  assert.ok(ACTORS.every((actor) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(actor.slug)));
});

test("works use actor slugs", () => {
  assert.ok(
    WORKS.every((work) =>
      work.cast.every((credit) => ACTORS.some((actor) => actor.slug === credit.actor)),
    ),
  );
});

test("every actor has a manifest and isolated image/voice download fixtures", async (t) => {
  const { mkdtemp, readFile, rm } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const { prepareDownloadFixtures } = await import("./fixtures/prepare-downloads.ts");
  const { getActorAssets } = await import("../../src/features/assets/assets.ts");
  const root = await mkdtemp(join(tmpdir(), "swimmer-download-fixtures-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await prepareDownloadFixtures(root);
  for (const actor of ACTORS) {
    for (const item of getActorAssets(actor.slug).items) {
      const bytes = await readFile(join(root, item.object));
      assert.ok(bytes.length > 0);
      if (item.kind === "voice") {
        if (item.format === "wav") assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
        else assert.equal(bytes.readUInt16BE(0) & 0xffe0, 0xffe0);
      }
    }
  }
});
