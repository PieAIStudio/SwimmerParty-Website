import test from "node:test";
import assert from "node:assert/strict";
import { gateway, createCommunityGateway } from "../../src/features/community/server/gateway.ts";
import { unavailableCapability } from "../../src/features/community/server/capabilities.ts";
import { remoteContext } from "../../src/features/community/server/context.ts";
import { retiredCommunityRoute } from "../../src/features/community/server/retired.ts";
import { CommunityError } from "../../src/features/community/errors.ts";
import { apiRequest, apiResponse, withEnvironment } from "./fixtures/api.ts";
import { communityErrorSchema } from "../../src/contracts/community.ts";
import { USER_ID, POST_ID, OP_ID, publicFixture } from "./fixtures/community-v3.ts";
const local = {
  NEXT_PUBLIC_COMMUNITY_ENABLED: "1",
  VERCEL_ENV: undefined,
  ASSET_STORE: "local",
  ACCOUNT_MODE: "mock",
  GUEST_LIMITER: "memory",
  SWIMMER_ORIGIN: undefined,
};
const headers = {
  host: "127.0.0.1:3399",
  origin: "http://127.0.0.1:3399",
  cookie: "sp_mock_member=1",
};

test("closed community rejects every route/method before resolving identity or adapter", async () => {
  for (const hosted of [undefined, "production", "preview", ""])
    await withEnvironment(
      { ...local, VERCEL_ENV: hosted, NEXT_PUBLIC_COMMUNITY_ENABLED: undefined },
      async () => {
        let called = false;
        const custom = createCommunityGateway(async () => {
          called = true;
          throw Error();
        });
        for (const handler of [custom, gateway, retiredCommunityRoute, unavailableCapability])
          for (const method of ["GET", "POST", "DELETE", "OPTIONS"]) {
            const output = apiResponse();
            await handler(
              apiRequest({ method, headers, query: { operation: "get_limits" } }),
              output.res,
            );
            assert.equal(output.value.code, 503);
            assert.equal(output.headers.get("cache-control"), "private, no-store");
            assert.equal(
              communityErrorSchema.parse(output.value.body).error.code,
              "COMMUNITY_UNAVAILABLE",
            );
          }
        assert.equal(called, false);
      },
    );
});
test("enabled mock or unconfigured hosted environment never instantiates a memory backend", async () => {
  for (const hosted of [undefined, "production", "preview", ""])
    await withEnvironment(
      {
        ...local,
        VERCEL_ENV: hosted,
        SWIMMER_BACKEND_URL: undefined,
        SWIMMER_PUBLISHABLE_KEY: undefined,
      },
      async () => {
        await assert.rejects(remoteContext(apiRequest({ headers }), apiResponse().res, "test"));
      },
    );
});
test("gateway validates JSON, actor claims, write method and same origin before mutation", async () => {
  await withEnvironment(local, async () => {
    let calls = 0;
    const route = createCommunityGateway(async () => ({
      userId: USER_ID,
      call: async () => {
        calls++;
        return { count: 1, liked: true } as never;
      },
    }));
    const input = { postId: POST_ID, operationId: OP_ID, liked: true };
    const output = apiResponse();
    await route(
      apiRequest({ method: "POST", body: input, headers, query: { operation: "set_like" } }),
      output.res,
    );
    assert.equal(output.value.code, 200);
    assert.equal(calls, 1);
    for (const req of [
      apiRequest({
        method: "POST",
        body: { ...input, userId: USER_ID },
        headers,
        query: { operation: "set_like" },
      }),
      apiRequest({
        method: "POST",
        body: input,
        headers: { ...headers, origin: "https://untrusted.invalid" },
        query: { operation: "set_like" },
      }),
      apiRequest({
        method: "GET",
        headers,
        query: { operation: "set_like", input: JSON.stringify(input) },
      }),
      apiRequest({
        method: "POST",
        headers,
        query: { operation: "service_set_owner" },
        body: { userId: USER_ID },
      }),
    ]) {
      const result = apiResponse();
      await route(req, result.res);
      assert(result.value.code >= 400);
    }
    assert.equal(calls, 1);
  });
});
test("guest private reads and forged Owner IDs fail; malformed private projections never leak", async () => {
  await withEnvironment({ ...local, OWNER_ACCOUNT_IDS: USER_ID }, async () => {
    const denied = createCommunityGateway(async () => ({
      userId: null,
      call: async () => {
        throw Error("must not run");
      },
    }));
    const out = apiResponse();
    await denied(apiRequest({ headers, query: { operation: "list_review_queue" } }), out.res);
    assert.equal(out.value.code, 401);
    const ownerDenied = createCommunityGateway(async () => ({
      userId: USER_ID,
      call: async () => {
        throw new CommunityError("OWNER_REQUIRED");
      },
    }));
    const forbidden = apiResponse();
    await ownerDenied(
      apiRequest({ headers, query: { operation: "list_review_queue" } }),
      forbidden.res,
    );
    assert.equal(forbidden.value.code, 403);
    const bad = createCommunityGateway(async () => ({
      userId: USER_ID,
      call: async () => ({ post: { ...publicFixture(), storagePath: "secret" } }) as never,
    }));
    const privateResult = apiResponse();
    await bad(
      apiRequest({
        headers,
        query: { operation: "get_post", input: JSON.stringify({ postId: POST_ID }) },
      }),
      privateResult.res,
    );
    assert.equal(privateResult.value.code, 503);
    assert(!JSON.stringify(privateResult.value.body).includes("secret"));
  });
});
test("unwired signing/media ports fail honestly instead of invoking a privileged service RPC", async () => {
  await withEnvironment(local, async () => {
    const output = apiResponse();
    await unavailableCapability(apiRequest({ headers }), output.res);
    assert.equal(output.value.code, 503);
    assert.equal(
      communityErrorSchema.parse(output.value.body).error.code,
      "PROCESSING_UNAVAILABLE",
    );
  });
});
