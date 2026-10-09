import test from "node:test";
import assert from "node:assert/strict";
import {
  posts,
  post,
  likes,
  reports,
  review,
  votes,
} from "../../src/features/community/server/index.ts";
import { createMemoryBackend } from "../../src/features/community/server/memory.ts";
import {
  communityPostsResponseSchema,
  communityPostResponseSchema,
  voteResultSchema,
} from "../../src/contracts/community.ts";
import { apiRequest, apiResponse, withEnvironment } from "./fixtures/api.ts";
const local = {
  VERCEL_ENV: undefined,
  ASSET_STORE: "local",
  ACCOUNT_MODE: "mock",
  GUEST_LIMITER: "memory",
  OWNER_ACCOUNT_IDS: "local-mock-member",
};
const headers = {
  host: "127.0.0.1:3399",
  cookie: "sp_mock_member=1",
  origin: "http://127.0.0.1:3399",
};

test("isolated community adapters do not share posts, trust or votes", async () => {
  const a = createMemoryBackend(),
    b = createMemoryBackend();
  const draft = await a.addPost({
    kind: "image",
    title: "Fixture",
    author: "local",
    actorSlugs: ["tang-yunqiu"],
  });
  assert.equal(draft.status, "pending");
  assert.deepEqual(await a.listPosts(), []);
  assert.equal(await b.getPost(draft.id), undefined);
  await a.toggleVote("fixture", "user");
  assert.equal(await b.voteCount("fixture"), 0);
});

test("every community method is private 503 on hosted deployments, even with mock cookies", async () => {
  for (const hosted of ["production", "preview", ""]) {
    await withEnvironment(
      {
        ...local,
        VERCEL_ENV: hosted,
        ASSET_STORE: "blob",
        ACCOUNT_MODE: "swimmer",
        GUEST_LIMITER: "vercel",
      },
      async () => {
        for (const handler of [posts, post, likes, reports, review, votes])
          for (const method of ["GET", "POST", "DELETE", "OPTIONS"]) {
            const output = apiResponse();
            await handler(
              apiRequest({ method, headers, body: {}, query: { slug: "fixture", id: "fixture" } }),
              output.res,
            );
            assert.equal(output.value.code, 503);
            assert.equal(output.headers.get("cache-control"), "private, no-store");
            assert.deepEqual(output.value.body, { error: "community-backend-not-configured" });
          }
      },
    );
  }
});

test("local community API retains approvals, confirmations, membership and response schemas", async () => {
  await withEnvironment(local, async () => {
    const call = async (
      handler: typeof posts,
      method: string,
      body?: unknown,
      query = {},
      member = true,
    ) => {
      const output = apiResponse();
      await handler(
        apiRequest({ method, body, query, headers: member ? headers : { host: headers.host } }),
        output.res,
      );
      assert.equal(output.headers.get("cache-control"), "private, no-store");
      return output.value;
    };
    const input = {
      kind: "image",
      title: " Fixture ",
      actorSlugs: ["tang-yunqiu"],
      creditConfirmed: true,
      rightsConfirmed: true,
    };
    assert.equal((await call(posts, "POST", input, {}, false)).code, 401);
    const unconfirmed = await call(posts, "POST", { ...input, rightsConfirmed: false });
    assert.deepEqual(unconfirmed.body, { error: "confirmations-required" });
    assert.equal((await call(posts, "POST", { ...input, actorSlugs: [123] })).code, 400);
    const created = await call(posts, "POST", input);
    assert.equal(created.code, 201);
    const item = communityPostResponseSchema.parse(created.body).post;
    assert.equal(item.title, "Fixture");
    assert.equal(item.status, "pending");
    const list = communityPostsResponseSchema.parse((await call(posts, "GET")).body);
    assert.equal(
      list.posts.some((post) => post.id === item.id),
      false,
    );
    assert.equal((await call(post, "GET", undefined, { id: item.id }, false)).code, 404);
    assert.equal((await call(review, "GET", undefined, {}, false)).code, 401);
    assert.equal((await call(review, "POST", { id: item.id, action: "approve" })).code, 200);
    assert.equal((await call(post, "GET", undefined, { id: item.id }, false)).code, 200);
    const vote = await call(votes, "POST", { slug: "fixture" });
    assert.equal(vote.code, 200);
    assert.equal(voteResultSchema.parse(vote.body).voted, true);
    assert.equal(
      voteResultSchema.parse((await call(votes, "POST", { slug: "fixture" })).body).voted,
      false,
    );
    const crossSite = apiResponse();
    await votes(
      apiRequest({
        method: "POST",
        body: { slug: "fixture" },
        headers: { ...headers, origin: "https://untrusted.invalid" },
      }),
      crossSite.res,
    );
    assert.equal(crossSite.value.code, 403);
    assert.equal((await call(post, "DELETE", undefined, { id: item.id })).code, 204);
  });
});
