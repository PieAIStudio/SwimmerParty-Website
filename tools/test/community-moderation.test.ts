import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryBackend } from "../../src/features/community/server/memory.ts";

test("approval trusts an author; idempotent likes, distinct reports and owner deletion affect the public feed", async () => {
  const backend = createMemoryBackend();
  const input = {
    kind: "image" as const,
    title: "Fixture",
    author: "A",
    authorId: "fixture-owner",
    actorSlugs: ["tang-yunqiu"],
  };
  const first = await backend.addPost(input);
  assert.equal(first.status, "pending");
  await backend.reviewPost(first.id, "approve");
  const second = await backend.addPost(input);
  assert.equal(second.status, "published");
  assert.equal((await backend.setPostLike(second.id, "u1", true))?.count, 1);
  assert.equal((await backend.setPostLike(second.id, "u1", true))?.count, 1);
  assert.equal((await backend.setPostLike(second.id, "u1", false))?.count, 0);
  assert.equal((await backend.reportPost(second.id, "u1", "Something else"))?.count, 1);
  assert.equal((await backend.reportPost(second.id, "u1", "Something else"))?.count, 1);
  assert.equal((await backend.reportPost(second.id, "u2", "Something else"))?.hidden, false);
  assert.equal((await backend.reportPost(second.id, "u3", "Something else"))?.hidden, true);
  assert.equal(
    (await backend.listPosts()).some((p) => p.id === second.id),
    false,
  );
  assert.equal(
    (await backend.listReviewQueue()).some((p) => p.id === second.id),
    true,
  );
  await backend.reviewPost(second.id, "approve");
  assert.equal(
    (await backend.listPosts()).some((p) => p.id === second.id),
    true,
  );
  assert.equal(await backend.deletePost(second.id, "wrong-owner"), false);
  assert.equal(await backend.deletePost(second.id, input.authorId), true);
});
