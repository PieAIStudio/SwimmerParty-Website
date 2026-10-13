import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { uploadMasters } from "../assets-upload.ts";
const sha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");
const object = "fixture/0011223344556677/fixture__face__front__v1.png";
async function fixture(t: { after: (f: () => Promise<void>) => void }) {
  const root = await mkdtemp(path.join(tmpdir(), "swimmer-upload-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bytes = Buffer.from("synthetic non-production transport fixture"),
    item = { object, bytes: bytes.length, sha256: sha(bytes) };
  const local = path.join(root, ".assets-local", object);
  await mkdir(path.dirname(local), { recursive: true });
  await writeFile(local, bytes);
  const stored = new Map<string, number>(),
    putCalls: string[] = [],
    listed: (string | undefined)[] = [];
  const client = {
    list: async (cursor?: string) => {
      listed.push(cursor);
      return { blobs: [...stored].map(([pathname, size]) => ({ pathname, size })) };
    },
    putNew: async (key: string, data: Uint8Array, type: string) => {
      assert.equal(type, "image/png");
      assert.ok(!stored.has(key));
      putCalls.push(key);
      stored.set(key, data.length);
    },
    exists: async (key: string) => stored.get(key) ?? null,
  };
  return { root, bytes, item, local, stored, putCalls, listed, client };
}
test("Blob dry-run reports pending byte totals exactly and makes no upload calls", async (t) => {
  const f = await fixture(t);
  const result = await uploadMasters({
    root: f.root,
    items: [f.item, f.item],
    client: f.client,
    dryRun: true,
  });
  assert.equal(result.masters, 1);
  assert.equal(result.pendingFiles, 1);
  assert.equal(result.pendingBytes, f.bytes.length);
  assert.equal(result.totalBytes, f.bytes.length);
  assert.equal(result.uploadedFiles, 0);
  assert.deepEqual(f.putCalls, []);
});
test("existing masters do not require missing local originals, but stored size mismatch blocks", async (t) => {
  const f = await fixture(t);
  f.stored.set(object, f.item.bytes);
  await rm(f.local);
  const result = await uploadMasters({
    root: f.root,
    items: [f.item],
    client: f.client,
    dryRun: true,
  });
  assert.equal(result.pendingFiles, 0);
  assert.equal(result.alreadyStored, 1);
  f.stored.set(object, f.item.bytes + 1);
  await assert.rejects(
    uploadMasters({ root: f.root, items: [f.item], client: f.client, dryRun: false }),
    /differs in size/,
  );
  assert.deepEqual(f.putCalls, []);
});
test("every uploaded original is head-checked then independently listed with total count and bytes", async (t) => {
  const f = await fixture(t);
  const result = await uploadMasters({
    root: f.root,
    items: [f.item],
    client: f.client,
    dryRun: false,
  });
  assert.equal(result.uploadedFiles, 1);
  assert.equal(result.uploadedBytes, f.item.bytes);
  assert.equal(result.verifiedFiles, 1);
  assert.equal(result.verifiedBytes, f.item.bytes);
  assert.equal(f.listed.length, 2);
  assert.deepEqual(f.putCalls, [object]);
  assert.equal(result.remoteBeforeFiles, 0);
  assert.equal(result.remoteAfterFiles, 1);
  assert.equal(result.remoteAfterBytes, f.item.bytes);
  assert.equal(result.previousObjectsRetained, true);
  const again = await uploadMasters({
    root: f.root,
    items: [f.item],
    client: f.client,
    dryRun: false,
  });
  assert.equal(again.uploadedFiles, 0);
  assert.deepEqual(f.putCalls, [object]);
});
test("tampered, missing and duplicate-conflicting originals stop before cloud mutation", async (t) => {
  const f = await fixture(t);
  await writeFile(f.local, Buffer.from("wrong"));
  await assert.rejects(
    uploadMasters({ root: f.root, items: [f.item], client: f.client, dryRun: false }),
    /Local master differs/,
  );
  await rm(f.local);
  await assert.rejects(
    uploadMasters({ root: f.root, items: [f.item], client: f.client, dryRun: false }),
    /no matching local source/,
  );
  await assert.rejects(
    uploadMasters({
      root: f.root,
      items: [f.item, { ...f.item, sha256: "0".repeat(64) }],
      client: f.client,
      dryRun: false,
    }),
    /Conflicting master/,
  );
  assert.deepEqual(f.putCalls, []);
});
test("the same-name key is never accepted merely because put succeeded", async (t) => {
  const f = await fixture(t);
  f.client.exists = async () => 0;
  await assert.rejects(
    uploadMasters({ root: f.root, items: [f.item], client: f.client, dryRun: false }),
    /Upload did not verify/,
  );
});
test("explicit source roots match pending originals by hash without changing them", async (t) => {
  const f = await fixture(t);
  await rm(f.local);
  const folder = path.join(f.root, "read-only-delivery");
  await mkdir(folder);
  await writeFile(path.join(folder, "renamed-original.png"), f.bytes);
  const result = await uploadMasters({
    root: f.root,
    items: [f.item],
    client: f.client,
    dryRun: true,
    sourceRoots: [folder],
  });
  assert.equal(result.pendingFiles, 1);
  assert.equal(result.pendingBytes, f.bytes.length);
  assert.deepEqual(f.putCalls, []);
});
test("readback refuses to claim success when a pre-existing object disappeared", async (t) => {
  const f = await fixture(t);
  const previous = "older/0011223344556677/older__face__front__v1.png";
  f.stored.set(previous, 90);
  const original = f.client.putNew;
  f.client.putNew = async (...args) => {
    await original(...args);
    f.stored.delete(previous);
  };
  await assert.rejects(
    uploadMasters({ root: f.root, items: [f.item], client: f.client, dryRun: false }),
    /Existing Blob object changed/,
  );
});
test("pagination is fully read and a repeated cursor fails closed", async (t) => {
  const f = await fixture(t);
  let calls = 0;
  const client = {
    ...f.client,
    list: async (cursor?: string) => {
      calls++;
      return cursor
        ? { blobs: [{ pathname: object, size: f.item.bytes }] }
        : { blobs: [], cursor: "next" };
    },
  };
  assert.equal(
    (await uploadMasters({ root: f.root, items: [f.item], client, dryRun: true })).pendingFiles,
    0,
  );
  assert.equal(calls, 2);
  await assert.rejects(
    uploadMasters({
      root: f.root,
      items: [f.item],
      client: { ...f.client, list: async () => ({ blobs: [], cursor: "loop" }) },
      dryRun: true,
    }),
    /cursor did not advance/,
  );
});
