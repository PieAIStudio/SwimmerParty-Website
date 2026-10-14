import test from "node:test";
import assert from "node:assert/strict";
import { communityOperations } from "../../src/contracts/community-operations.ts";
import { createRemoteCommunity, rpcArguments } from "../../src/features/community/server/remote.ts";
import { OP_ID, POST_ID, USER_ID, ownerFixture } from "./fixtures/community-v3.ts";

test("v3 approval never implies author trust; every Owner write has its own explicit operation", async () => {
  const calls: string[] = [];
  const remote = createRemoteCommunity(
    async (name) => {
      calls.push(name);
      return {
        data: { operationId: OP_ID, post: ownerFixture({ status: "published" }) },
        error: null,
      };
    },
    USER_ID,
    "test",
  );
  await remote("review_post", {
    operationId: OP_ID,
    postId: POST_ID,
    expectedRevision: 1,
    action: "approve",
    reason: null,
  });
  assert.deepEqual(calls, ["review_post"]);
  assert.equal(communityOperations.set_author_trust.access, "owner");
  assert.deepEqual(
    rpcArguments("set_author_trust", {
      operationId: OP_ID,
      userId: USER_ID,
      trusted: false,
      reason: "Review needed",
    }),
    { p_operation_id: OP_ID, p_user_id: USER_ID, p_trusted: false, p_reason: "Review needed" },
  );
});
test("return/hide/restore, trust revocation and submission pause require a recorded reason", () => {
  for (const action of ["return", "hide", "restore"] as const) {
    assert(
      !communityOperations.review_post.input.safeParse({
        operationId: OP_ID,
        postId: POST_ID,
        expectedRevision: 1,
        action,
        reason: null,
      }).success,
    );
    assert(
      !communityOperations.review_post.input.safeParse({
        operationId: OP_ID,
        postId: POST_ID,
        expectedRevision: 1,
        action,
        reason: " ",
      }).success,
    );
  }
  assert(
    !communityOperations.set_author_trust.input.safeParse({
      operationId: OP_ID,
      userId: USER_ID,
      trusted: false,
      reason: "",
    }).success,
  );
  assert(
    !communityOperations.set_submission_paused.input.safeParse({
      operationId: OP_ID,
      paused: true,
      reason: "",
    }).success,
  );
  assert.deepEqual(
    rpcArguments("set_submission_paused", {
      operationId: OP_ID,
      paused: true,
      reason: "Review capacity",
    }),
    { p_operation_id: OP_ID, p_paused: true, p_reason: "Review capacity" },
  );
});
