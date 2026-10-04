import assert from "node:assert/strict";
import test from "node:test";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { createNodeAuth, NodeAuthConfig } from "@pieaistudio/swimmer-auth-kit/server";
import { accountUser, swimmerAccountConfig } from "../src/features/account/server/account.ts";
const env = {
  NODE_ENV: "production", SWIMMER_COOKIE_PASSWORD: "fixture-password".repeat(3),
  SWIMMER_BACKEND_URL: "https://backend.example", SWIMMER_PUBLISHABLE_KEY: "fixture-public",
  SWIMMER_OAUTH_CLIENT_ID: "fixture-client", SWIMMER_ACCOUNT_URL: "https://account.example",
};
test("each protected request constructs and verifies an independent account adapter", async () => {
  let created = 0, verified = 0;
  const requests: IncomingMessage[] = [];
  const factory = ((config: NodeAuthConfig) => {
    created++;
    assert.equal(config.origin, "https://swimmerparty.swiminai.com");
    assert.equal(config.cookieName, "__Host-swimmerparty-session");
    assert.equal(config.basePath, "/api/auth");
    assert.equal(typeof config.createAuthClient, "function");
    return (request: IncomingMessage) => {
      requests.push(request);
      return { verifiedUser: async () => { verified++; return { id: `user-${created}`, is_anonymous: created === 2 }; } };
    };
  }) as unknown as typeof createNodeAuth;
  const response = {} as ServerResponse;
  const first = { headers: {} } as IncomingMessage;
  const second = { headers: {} } as IncomingMessage;
  assert.deepEqual(await accountUser(first, response, "swimmer", { env, createNodeAuth: factory }), { id: "user-1" });
  assert.equal(await accountUser(second, response, "swimmer", { env, createNodeAuth: factory }), null);
  assert.equal(created, 2); assert.equal(verified, 2);
  assert.deepEqual(requests, [first, second]);
});
test("local origin is explicit and does not alter the secure cookie contract", () => {
  assert.equal(swimmerAccountConfig({ ...env, NODE_ENV: "development" }).origin, "http://localhost:3000");
  assert.equal(swimmerAccountConfig({ ...env, SWIMMER_ORIGIN: "https://localhost:3000" }).origin, "https://localhost:3000");
});

test("the same-origin guard follows the explicitly registered preview origin", async () => {
  const { requireSameOrigin } = await import("../src/lib/server/api.ts");
  const request = { headers: { origin: "https://preview.example" } } as import("next").NextApiRequest;
  assert.doesNotThrow(() => requireSameOrigin(request, "swimmer", "https://preview.example"));
  assert.throws(() => requireSameOrigin(request, "swimmer", "https://swimmerparty.swiminai.com"), /cross-site/);
});
