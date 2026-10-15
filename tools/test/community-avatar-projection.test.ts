import test from "node:test";
import assert from "node:assert/strict";
import {
  authorPostSchema,
  ownerPostSchema,
  publicPostSchema,
} from "../../src/contracts/community.ts";
import { createRemoteCommunity } from "../../src/features/community/server/remote.ts";
import {
  authorFixture,
  ownerFixture,
  publicFixture,
  OP_ID,
  POST_ID,
  USER_ID,
} from "./fixtures/community-v3.ts";

// Synthetic account avatar only. No production profile, post or user identifiers enter fixtures.
const inlineAvatar =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="gray"/></svg>',
  );
const author = { id: USER_ID, displayName: "Synthetic avatar author", avatarUrl: inlineAvatar };
const draft = () => authorFixture({ author, media: [] });

for (const [name, schema, fixture] of [
  ["author", authorPostSchema, () => draft()],
  ["review", ownerPostSchema, () => ownerFixture({ author })],
  ["public", publicPostSchema, () => publicFixture({ author })],
] as const) {
  test(`an inline account avatar cannot invalidate the ${name} work projection`, () => {
    const input = fixture();
    const parsed = schema.parse(input);
    assert.equal(parsed.author.avatarUrl, null);
    assert.equal(input.author.avatarUrl, inlineAvatar, "never mutate the upstream profile");
    assert.equal(parsed.author.id, USER_ID);
    assert.equal(parsed.author.displayName, author.displayName);
    assert.deepEqual(schema.parse(parsed), parsed, "normalization is idempotent");
  });
}

test("unsupported avatar strings are omitted, never made into renderable URLs", () => {
  for (const avatarUrl of [
    inlineAvatar,
    "data:text/html,<script>alert(1)</script>",
    "javascript:alert(1)",
    "http://example.test/avatar.png",
    "//example.test/avatar.png",
    "file:///tmp/avatar.svg",
    "blob:https://example.test/avatar",
    "https://user:password@example.test/avatar.png",
    "",
    "not a URL",
  ]) {
    assert.equal(
      authorPostSchema.parse(authorFixture({ author: { ...author, avatarUrl } })).author.avatarUrl,
      null,
    );
  }
  for (const avatarUrl of [null, "https://example.test/avatar.png"]) {
    assert.equal(
      authorPostSchema.parse(authorFixture({ author: { ...author, avatarUrl } })).author.avatarUrl,
      avatarUrl,
    );
  }
});

test("avatar compatibility does not accept wrong types, identity changes or unexpected fields", () => {
  for (const avatarUrl of [undefined, 1, true, {}, []]) {
    assert.equal(
      authorPostSchema.safeParse({ ...draft(), author: { ...author, avatarUrl } }).success,
      false,
    );
  }
  for (const changed of [
    { ...draft(), author: { ...author, id: "not-a-uuid" } },
    { ...draft(), author: { ...author, displayName: 7 } },
    { ...draft(), author: { ...author, privateToken: "synthetic" } },
    { ...draft(), privateStorageKey: "must-not-cross-the-boundary" },
    {
      ...draft(),
      media: [
        { id: POST_ID, kind: "image", sortOrder: 0, altText: null, object: "private/secret" },
      ],
    },
    {
      ...draft(),
      video: { platform: "youtube", externalId: "abcdefghijk", canonicalUrl: inlineAvatar },
    },
  ])
    assert.equal(authorPostSchema.safeParse(changed).success, false);
});

test("backend-successful create_draft keeps its post and operation IDs instead of becoming 503", async () => {
  const calls: string[] = [];
  const remote = createRemoteCommunity(
    async (name) => {
      calls.push(name);
      return { data: { post: draft(), operationId: OP_ID }, error: null };
    },
    USER_ID,
    "synthetic-request-id",
  );
  const result = await remote("create_draft", {
    operationId: OP_ID,
    content: {
      kind: "image",
      title: "Synthetic draft",
      actors: [{ slug: "zhang-qiang", assetVersion: "1.0.0" }],
    },
  });
  assert.equal(result.operationId, OP_ID);
  assert.equal(result.post.id, POST_ID);
  assert.equal(result.post.author.avatarUrl, null);
  assert.deepEqual(calls, ["create_draft"]);
});

test("one inline avatar cannot break my-posts lists or an existing draft read", async () => {
  const remote = createRemoteCommunity(
    async (name) => ({
      data:
        name === "get_my_post"
          ? { post: draft() }
          : { posts: [draft()], nextCursor: null, hasMore: false },
      error: null,
    }),
    USER_ID,
    "synthetic-request-id",
  );
  assert.equal((await remote("list_my_posts", {})).posts[0].id, POST_ID);
  assert.equal((await remote("get_my_post", { postId: POST_ID })).post.author.avatarUrl, null);
});

test("review-queue projection remains usable without accepting arbitrary inline SVG", async () => {
  const remote = createRemoteCommunity(
    async () => ({
      data: { posts: [ownerFixture({ author })], nextCursor: null, hasMore: false },
      error: null,
    }),
    USER_ID,
    "synthetic-request-id",
  );
  assert.equal((await remote("list_review_queue", {})).posts[0].author.avatarUrl, null);
});

test("public reads sanitize display avatars but member and Owner authorization stay enforced", async () => {
  const publicRead = createRemoteCommunity(
    async () => ({
      data: { posts: [publicFixture({ author })], nextCursor: null, hasMore: false },
      error: null,
    }),
    null,
    "synthetic-request-id",
  );
  assert.equal((await publicRead("list_posts", {})).posts[0].author.avatarUrl, null);
  await assert.rejects(publicRead("list_my_posts", {}), { code: "AUTH_REQUIRED" });
  const denied = createRemoteCommunity(
    async () => ({ data: null, error: { code: "PT403", message: "OWNER_REQUIRED" } }),
    USER_ID,
    "synthetic-request-id",
  );
  await assert.rejects(denied("list_review_queue", {}), { code: "OWNER_REQUIRED" });
});
