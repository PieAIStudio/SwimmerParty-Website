import test from "node:test";
import assert from "node:assert/strict";
import {
  addPost,
  listPosts,
  listReviewQueue,
  reviewPost,
  setPostLike,
  deletePost,
} from "../src/features/community/mock-store.ts";
import { reportPost } from "../src/features/community/moderation.ts";
test("approval trusts an author; idempotent likes, distinct reports and owner deletion affect the public feed", () => {
  const input = {
    kind: "image" as const,
    title: "Fixture",
    author: "A",
    authorId: crypto.randomUUID(),
    actorSlugs: ["tang-yunqiu"],
  };
  const first = addPost(input);
  assert.equal(first.status, "pending");
  reviewPost(first.id, "approve");
  const second = addPost(input);
  assert.equal(second.status, "published");
  assert.equal(setPostLike(second.id, "u1", true)?.count, 1);
  assert.equal(setPostLike(second.id, "u1", true)?.count, 1);
  assert.equal(setPostLike(second.id, "u1", false)?.count, 0);
  assert.equal(reportPost(second.id, "u1", "reason")?.count, 1);
  assert.equal(reportPost(second.id, "u1", "reason")?.count, 1);
  assert.equal(reportPost(second.id, "u2", "reason")?.hidden, false);
  assert.equal(reportPost(second.id, "u3", "reason")?.hidden, true);
  assert.equal(
    listPosts().some((p) => p.id === second.id),
    false,
  );
  assert.equal(
    listReviewQueue().some((p) => p.id === second.id),
    true,
  );
  reviewPost(second.id, "approve");
  assert.equal(
    listPosts().some((p) => p.id === second.id),
    true,
  );
  assert.equal(deletePost(second.id, "wrong-owner"), false);
  assert.equal(deletePost(second.id, input.authorId), true);
});
