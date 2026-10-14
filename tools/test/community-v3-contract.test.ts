import test from "node:test";
import assert from "node:assert/strict";
import {
  publicPostSchema,
  authorPostSchema,
  ownerPostSchema,
  limitsSchema,
  errorStatus,
  reportReasonSchema,
} from "../../src/contracts/community.ts";
import { communityOperations } from "../../src/contracts/community-operations.ts";
import { createRemoteCommunity, rpcArguments } from "../../src/features/community/server/remote.ts";
import { CommunityError, rpcError, responseError } from "../../src/features/community/errors.ts";
import { parseCommunityVideo, communityEmbed } from "../../src/features/community/video.ts";
import {
  publicFixture,
  authorFixture,
  ownerFixture,
  v3Limits,
  POST_ID,
  OP_ID,
  USER_ID,
} from "./fixtures/community-v3.ts";

test("v3 public, author and Owner projections are separate strict scopes", () => {
  assert(publicPostSchema.safeParse(publicFixture()).success);
  assert(authorPostSchema.safeParse(authorFixture()).success);
  assert(ownerPostSchema.safeParse(ownerFixture()).success);
  assert(limitsSchema.safeParse(v3Limits).success);
  assert(!publicPostSchema.safeParse(ownerFixture({ status: "published" })).success);
  for (const key of ["storagePath", "objectKey", "email", "reports", "authorId", "token"])
    assert(!publicPostSchema.safeParse({ ...publicFixture(), [key]: "secret" }).success);
  assert(!publicPostSchema.safeParse({ ...publicFixture(), actors: [] }).success);
  assert(
    !publicPostSchema.safeParse({
      ...publicFixture(),
      media: [{ ...publicFixture().media[0], url: "https://private.invalid/a" }],
    }).success,
  );
});
for (const [code, status] of Object.entries(errorStatus))
  test(`stable error ${code} maps to ${status} without exposing SQL text`, () => {
    const error = rpcError(
      { code: `PT${status}`, message: code, details: "private table, token, user" },
      true,
      false,
      "safe-request",
    );
    assert.equal(error.code, code);
    assert.equal(error.status, status);
    assert(!error.message.includes("private"));
  });
test("unknown SQL/transport errors and denied execute never become success", async () => {
  assert.equal(
    rpcError({ code: "42501", message: "table details" }, false, false, "test").code,
    "AUTH_REQUIRED",
  );
  assert.equal(rpcError({ code: "42501" }, true, true, "test").code, "OWNER_REQUIRED");
  assert.equal(
    rpcError({ message: "password or storage key" }, true, false, "test").code,
    "COMMUNITY_UNAVAILABLE",
  );
  assert.equal(responseError({ error: "raw secret" }, 503).code, "COMMUNITY_UNAVAILABLE");
  let calls = 0;
  const remote = createRemoteCommunity(
    async () => {
      calls++;
      return { data: ownerFixture(), error: null };
    },
    null,
    "test",
  );
  await assert.rejects(
    remote("list_review_queue", {}),
    (e: CommunityError) => e.code === "AUTH_REQUIRED",
  );
  assert.equal(calls, 0);
  await assert.rejects(
    remote("get_post", { postId: POST_ID }),
    (e: CommunityError) => e.code === "COMMUNITY_UNAVAILABLE",
  );
});
test("RPC names/parameters are fixed and preserve revisions, operation IDs and explicit reaction values", async () => {
  const received: unknown[] = [];
  const remote = createRemoteCommunity(
    async (name, args) => {
      received.push({ name, args });
      return { data: { count: 3, liked: true }, error: null };
    },
    USER_ID,
    "test",
  );
  assert.deepEqual(await remote("set_like", { postId: POST_ID, operationId: OP_ID, liked: true }), {
    count: 3,
    liked: true,
  });
  assert.deepEqual(received, [
    { name: "set_like", args: { p_operation_id: OP_ID, p_post_id: POST_ID, p_liked: true } },
  ]);
  assert.deepEqual(
    rpcArguments("update_draft", {
      operationId: OP_ID,
      postId: POST_ID,
      expectedRevision: 7,
      content: { kind: "image" },
    }),
    {
      p_operation_id: OP_ID,
      p_post_id: POST_ID,
      p_expected_revision: 7,
      p_input: { kind: "image" },
    },
  );
  assert.deepEqual(rpcArguments("list_posts", { filter: { sort: "likes" }, cursor: "opaque" }), {
    p_filter: { sort: "likes" },
    p_cursor: "opaque",
    p_page_size: 20,
  });
  assert.equal(
    Object.keys(communityOperations).some((name) => name.startsWith("service_")),
    false,
  );
});
test("upload completion is an edge capability, never a direct finalize or service RPC", async () => {
  assert.equal(Object.hasOwn(communityOperations, "finalize_upload"), false);
  let calls = 0;
  const remote = createRemoteCommunity(
    async () => {
      calls++;
      throw Error("No RPC allowed");
    },
    USER_ID,
    "fixture-request",
  );
  await assert.rejects(
    remote("complete_upload", { operationId: OP_ID, uploadId: POST_ID }),
    (error: CommunityError) => error.code === "PROCESSING_UNAVAILABLE",
  );
  assert.equal(calls, 0);
});
test("v3 confirmation, duplicate actors, arbitrary claims and report reasons fail before RPC", () => {
  assert.equal(reportReasonSchema.options.length, 6);
  assert(
    !communityOperations.create_draft.input.safeParse({
      operationId: OP_ID,
      content: { kind: "game" },
    }).success,
  );
  assert(
    !communityOperations.create_draft.input.safeParse({
      operationId: OP_ID,
      content: { kind: "image", authorId: USER_ID },
    }).success,
  );
  const actor = { slug: "jiang-yifan", assetVersion: "1.0.0" };
  assert(
    !communityOperations.create_draft.input.safeParse({
      operationId: OP_ID,
      content: { kind: "image", actors: [actor, actor] },
    }).success,
  );
  assert(
    !communityOperations.submit_post.input.safeParse({
      operationId: OP_ID,
      postId: POST_ID,
      expectedRevision: 1,
      confirmation: { creditConfirmed: true, rightsConfirmed: false, termsVersion: "1.0" },
    }).success,
  );
  assert(
    !communityOperations.review_post.input.safeParse({
      operationId: OP_ID,
      postId: POST_ID,
      expectedRevision: 1,
      action: "return",
      reason: null,
    }).success,
  );
});
test("YouTube watch/short links are canonicalized and only create no-cookie embeds", () => {
  for (const link of [
    "https://www.youtube.com/watch?v=AbCdEf123_-",
    "https://youtu.be/AbCdEf123_-?t=10",
    "https://m.youtube.com/shorts/AbCdEf123_-/",
  ])
    assert.equal(
      communityEmbed(parseCommunityVideo(link)),
      "https://www.youtube-nocookie.com/embed/AbCdEf123_-?autoplay=1",
    );
  assert.equal(
    parseCommunityVideo("https://www.bilibili.com/video/BV1234567890/").platform,
    "bilibili",
  );
  assert.equal(
    parseCommunityVideo("https://player.vimeo.com/video/12345").canonicalUrl,
    "https://vimeo.com/12345",
  );
});
test("unsupported, credentialed, disguised and injected video addresses fail closed", () => {
  for (const value of [
    "http://youtube.com/watch?v=AbCdEf123_-",
    "https://youtube.com.evil.invalid/watch?v=AbCdEf123_-",
    "https://evil@youtube.com/watch?v=AbCdEf123_-",
    "https://www.youtube.com:443/watch?v=AbCdEf123_-",
    "https://youtu.be/AbCdEf123_-?x=1",
    "https://www.youtube.com/embed/AbCdEf123_-",
    "https://youtu.be/%41bCdEf123_-",
    '<iframe src="https://youtube.com"></iframe>',
    "javascript:alert(1)",
    "https://vimeo.com/0",
  ])
    assert.throws(() => parseCommunityVideo(value), CommunityError);
  assert.throws(
    () =>
      communityEmbed({
        platform: "youtube",
        canonicalUrl: "https://vimeo.com/123",
        externalId: "AbCdEf123_-",
      }),
    CommunityError,
  );
});
