import test from "node:test";
import assert from "node:assert/strict";
import { WriteSession, COMPOSER_WRITE_SCOPE } from "../../src/features/community/api.ts";
import { CommunityError } from "../../src/features/community/errors.ts";
import type { CommunityCall } from "../../src/contracts/community-operations.ts";
import { OP_ID, POST_ID, USER_ID, authorFixture } from "./fixtures/community-v3.ts";
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}
test("lost write response survives remount and retries only the same operation ID/input", async () => {
  const saved = storage(),
    ids: string[] = [];
  let lost = true;
  const call: CommunityCall = async (operation, input) => {
    if (operation === "get_operation") throw new CommunityError("OPERATION_UNAVAILABLE");
    const id = (input as { operationId: string }).operationId;
    ids.push(id);
    if (lost) {
      lost = false;
      throw new CommunityError("COMMUNITY_UNAVAILABLE", { uncertain: true });
    }
    return { post: authorFixture(), operationId: id } as never;
  };
  const first = new WriteSession(USER_ID, "draft", saved);
  await assert.rejects(
    first.execute("create_draft", { content: { kind: "image", title: "Do not duplicate" } }, call),
  );
  const next = new WriteSession(USER_ID, "draft", saved);
  assert(next.snapshot());
  await assert.rejects(
    next.execute("create_draft", { content: { kind: "video" } }, call),
    (e: CommunityError) => e.code === "INVALID_STATE",
  );
  await next.retry(call);
  assert.equal(ids.length, 2);
  assert.equal(ids[0], ids[1]);
  assert.equal(next.snapshot(), null);
  assert.equal(new WriteSession("other-user", "draft", saved).snapshot(), null);
});
test("revision conflict is explicit and never silently replays against a fresh revision", async () => {
  const journal = new WriteSession(USER_ID, "update");
  let writes = 0;
  const call: CommunityCall = async (operation) => {
    if (operation === "get_operation") throw new CommunityError("OPERATION_UNAVAILABLE");
    writes++;
    throw new CommunityError("REVISION_CONFLICT");
  };
  await assert.rejects(
    journal.execute(
      "update_draft",
      { postId: POST_ID, expectedRevision: 3, content: { kind: "image" } },
      call,
    ),
    (e: CommunityError) => e.code === "REVISION_CONFLICT",
  );
  assert.equal(writes, 1);
  assert.equal(journal.snapshot(), null);
});
test("a successful reconciliation is not treated as permission to invent a second request", async () => {
  const saved = storage();
  saved.setItem(
    `sp-community-v3:${USER_ID}:like`,
    JSON.stringify({
      operation: "set_like",
      operationId: OP_ID,
      input: { operationId: OP_ID, postId: POST_ID, liked: true },
    }),
  );
  const calls: string[] = [];
  const call: CommunityCall = async (operation) => {
    calls.push(operation);
    return (
      operation === "get_operation"
        ? { operationId: OP_ID, status: "succeeded", resourceId: POST_ID, resultCode: null }
        : { count: 1, liked: true }
    ) as never;
  };
  await new WriteSession(USER_ID, "like", saved).retry(call);
  assert.deepEqual(calls, ["get_operation", "set_like"]);
});

test("the composer journal survives receiving a draft ID and blocks a different draft until reconciled", async () => {
  const saved = storage(),
    attempts: unknown[] = [];
  const input = {
    postId: POST_ID,
    expectedRevision: 1,
    file: { mime: "image/png" as const, bytes: 123, sortOrder: 0 },
  };
  let lost = true;
  const call: CommunityCall = async (name, body) => {
    assert.equal(name, "create_upload");
    attempts.push(body);
    if (lost) {
      lost = false;
      throw new CommunityError("COMMUNITY_UNAVAILABLE", { uncertain: true });
    }
    return {
      uploadId: OP_ID,
      mediaId: POST_ID,
      status: "issued",
      processingStatus: "reserved",
      expiresAt: "2026-10-14T10:00:00Z",
    } as never;
  };
  await assert.rejects(
    new WriteSession(USER_ID, COMPOSER_WRITE_SCOPE, saved).execute("create_upload", input, call),
    (error: CommunityError) => error.code === "COMMUNITY_UNAVAILABLE" && error.uncertain,
  );
  const refreshed = new WriteSession(USER_ID, COMPOSER_WRITE_SCOPE, saved);
  assert(refreshed.snapshot());
  assert.equal(refreshed.snapshot()?.resourceId, POST_ID);
  await assert.rejects(
    refreshed.execute("create_upload", { ...input, postId: OP_ID }, call),
    (error: CommunityError) => error.code === "INVALID_STATE",
  );
  await refreshed.retry(call);
  assert.equal(attempts.length, 2);
  assert.deepEqual(attempts[0], attempts[1]);
  assert.equal(refreshed.snapshot(), null);
  assert.equal(new WriteSession("another-user", COMPOSER_WRITE_SCOPE, saved).snapshot(), null);
});
