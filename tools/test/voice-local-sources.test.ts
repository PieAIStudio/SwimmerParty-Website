import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import voice from "../../src/features/assets/server/voice.ts";
import { getActorAssets } from "../../src/features/assets/assets.ts";
import { apiRequest, apiResponse, withEnvironment } from "./fixtures/api.ts";
import { syntheticWav } from "./fixtures/audio.ts";

async function fixture(t: { after: (fn: () => Promise<void>) => void }) {
  const root = await mkdtemp(path.join(tmpdir(), "swimmer-local-voice-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const manifest = getActorAssets("bao-man");
  const item = manifest.items.find((item) => item.slot === "voice.intro")!;
  const target = path.join(root, ".assets-local", item.object);
  await mkdir(path.dirname(target), { recursive: true });
  const bytes = syntheticWav();
  await writeFile(target, bytes);
  const file = path.join(root, "src/content/actors/bao-man/assets.json");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(manifest));
  return { root, bytes };
}

test("default local voice route reads the imported private-master directory", async (t) => {
  const { root, bytes } = await fixture(t);
  const cwd = process.cwd();
  try {
    process.chdir(root);
    await withEnvironment(
      {
        VERCEL_ENV: undefined,
        ASSET_STORE: "local",
        ACCOUNT_MODE: "mock",
        GUEST_LIMITER: "memory",
        ASSET_LOCAL_ROOT: undefined,
      },
      async () => {
        const response = apiResponse();
        await voice(apiRequest({ query: { slug: "bao-man", slot: "intro" } }), response.res);
        assert.equal(response.value.code, 200);
        assert.deepEqual(response.value.body, bytes);
        assert.equal(response.headers.get("content-type"), "audio/wav");
      },
    );
  } finally {
    process.chdir(cwd);
  }
});

test("an explicit isolated voice root never falls back to other local originals", async (t) => {
  const { root } = await fixture(t);
  const cwd = process.cwd();
  try {
    process.chdir(root);
    await withEnvironment(
      {
        VERCEL_ENV: undefined,
        ASSET_STORE: "local",
        ACCOUNT_MODE: "mock",
        GUEST_LIMITER: "memory",
        ASSET_LOCAL_ROOT: path.join(root, "empty-isolated"),
      },
      async () => {
        const response = apiResponse();
        await voice(apiRequest({ query: { slug: "bao-man", slot: "intro" } }), response.res);
        assert.equal(response.value.code, 404);
      },
    );
  } finally {
    process.chdir(cwd);
  }
});
