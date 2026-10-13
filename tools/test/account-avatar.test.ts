import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { createServer, request } from "node:http";
import { createRequire } from "node:module";
import type { NextApiRequest, NextApiResponse } from "next";
import auth from "../../src/features/account/server/handler.ts";
import { accountProfile } from "../../src/features/account/profile.ts";

// Exercise the installed AuthKit SSO adapter, not a fabricated verifiedUser().
// Cookie sealing uses AuthKit's declared dependency. Every grant/user/token is
// synthetic; the only provider boundary is an in-memory transport that rejects
// any other destination. No hosted login, account creation or email occurs.
const { sealData } = createRequire(import.meta.resolve("@pieaistudio/swimmer-auth-kit"))(
  "iron-session",
) as { sealData(data: unknown, options: { password: string; ttl: number }): Promise<string> };
const origin = "https://party.example.test";
const backend = "https://backend.example.test";
const issuer = `${backend}/auth/v1`;
const clientId = "00000000-0000-4000-8000-000000000001";
const password = "synthetic-avatar-cookie-password-not-a-secret";
const owner = "00000000-0000-4000-8000-000000000011";
const other = "00000000-0000-4000-8000-000000000012";
const portrait = `${backend}/functions/v1/profile-avatar-portrait/v1/${"a".repeat(64)}.svg`;

async function fixture(t: TestContext) {
  const config = {
    ACCOUNT_MODE: "swimmer",
    ASSET_STORE: "blob",
    GUEST_LIMITER: "vercel",
    SWIMMER_ORIGIN: origin,
    SWIMMER_BACKEND_URL: backend,
    SWIMMER_PUBLISHABLE_KEY: "sb_publishable_synthetic_avatar_test",
    SWIMMER_COOKIE_PASSWORD: password,
    SWIMMER_OAUTH_CLIENT_ID: clientId,
    SWIMMER_ACCOUNT_URL: "https://accounts.example.test",
  };
  const before = Object.fromEntries(Object.keys(config).map((key) => [key, process.env[key]]));
  Object.assign(process.env, config);
  t.after(() => {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const metadata = new Map<string, Record<string, unknown>>([
    [owner, { display_name: "泳者测试", avatar_url: portrait, private_note: "never-return-me" }],
    [other, { display_name: "另一位泳者" }],
  ]);
  const controls = { revoked: false, mfa: false, wrongOwner: false };
  const tokens = new Map<string, string>();
  let verifications = 0;
  t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = new Request(input, init);
    assert.equal(req.url, `${issuer}/user`, "No real provider or non-user endpoint");
    assert.equal(req.method, "GET", "This fixture cannot mutate accounts");
    const id = tokens.get(req.headers.get("authorization") ?? "");
    assert.ok(id, "Only explicitly owned synthetic tokens");
    verifications++;
    if (controls.revoked)
      return Response.json(
        { code: "user_not_found", message: "synthetic revoked" },
        // The SDK reads the modern `code` field only with the native API-version header.
        { status: 401, headers: { "x-supabase-api-version": "2024-01-01" } },
      );
    return Response.json({
      id: controls.wrongOwner ? other : id,
      email: `${id}@example.test`,
      aud: "authenticated",
      role: "authenticated",
      is_anonymous: false,
      user_metadata: metadata.get(id),
      app_metadata: { provider: "email" },
      factors: controls.mfa ? [{ id: other, status: "verified", factor_type: "totp" }] : [],
    });
  });
  const cookieFor = async (id: string) => {
    const sessionId =
      id === owner
        ? "00000000-0000-4000-8000-000000000021"
        : "00000000-0000-4000-8000-000000000022";
    const claims = {
      iss: issuer,
      aud: "authenticated",
      sub: id,
      session_id: sessionId,
      client_id: clientId,
      role: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 3600,
      aal: "aal1",
    };
    const token = `${Buffer.from('{"alg":"ES256"}').toString("base64url")}.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.synthetic-not-signed`;
    tokens.set(`Bearer ${token}`, id);
    const sealed = await sealData(
      {
        grant: {
          version: 1,
          issuer,
          clientId,
          origin,
          userId: id,
          sessionId,
          accessToken: token,
          refreshToken: "synthetic-unused-refresh",
        },
      },
      { password, ttl: 86400 },
    );
    return `__Host-swimmerparty-session-sso=${sealed}`;
  };
  const server = createServer((req, res) => {
    const incoming: NextApiRequest = Object.assign(req, {
      query: { action: ["session"] },
      cookies: {},
      body: undefined,
      env: {},
    });
    const outgoing = Object.assign(res, {
      status(code: number) {
        res.statusCode = code;
        return outgoing;
      },
      json(value: unknown) {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify(value));
        return outgoing;
      },
    }) as unknown as NextApiResponse;
    void auth(incoming, outgoing);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const get = (cookie = "", headers: Record<string, string> = {}) =>
    new Promise<{
      status: number;
      body: Record<string, any>;
      headers: import("node:http").IncomingHttpHeaders;
    }>((resolve, reject) => {
      const req = request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path: "/api/auth/session",
          headers: { host: "party.example.test", cookie, ...headers },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            try {
              resolve({
                status: res.statusCode!,
                body: JSON.parse(Buffer.concat(chunks).toString()),
                headers: res.headers,
              });
            } catch (error) {
              reject(error);
            }
          });
        },
      );
      req.on("error", reject);
      req.end();
    });
  return {
    get,
    cookieFor,
    metadata,
    controls,
    get verifications() {
      return verifications;
    },
  };
}

test("installed SSO session exposes the verified shared profile and refreshes changed metadata without leaking raw data", async (t) => {
  const f = await fixture(t);
  const cookie = await f.cookieFor(owner);
  const first = await f.get(cookie);
  assert.equal(first.status, 200);
  assert.deepEqual(first.body.profile, {
    id: owner,
    name: "泳者测试",
    email: `${owner}@example.test`,
    avatarUrl: portrait,
  });
  assert.deepEqual(Object.keys(first.body.user).sort(), ["email", "id", "is_anonymous"]);
  assert.doesNotMatch(
    JSON.stringify(first.body),
    /private_note|never-return-me|accessToken|refreshToken|user_metadata/,
  );
  assert.match(first.headers["cache-control"] ?? "", /private, no-store/);
  assert.equal(first.headers.vary, "Cookie");
  f.metadata.set(owner, {
    display_name: "新的昵称",
    avatar_url: portrait.replace("a".repeat(64), "b".repeat(64)),
  });
  const next = await f.get(cookie);
  assert.equal(next.body.profile.name, "新的昵称");
  assert.notEqual(next.body.profile.avatarUrl, first.body.profile.avatarUrl);
  const isolated = await f.get(await f.cookieFor(other));
  assert.equal(isolated.body.profile.name, "另一位泳者");
  assert.equal(isolated.body.profile.avatarUrl, null);
  assert.equal(f.verifications, 3, "Each request verifies its own grant once");
});

test("shared profile presentation never bypasses the installed SSO owner, origin, MFA or revocation checks", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.get()).body.user, null);
  const cookie = await f.cookieFor(owner);
  const crossSite = await f.get(cookie, { "sec-fetch-site": "cross-site" });
  assert.notEqual(crossSite.status, 200);
  assert.equal(crossSite.body.profile, undefined);
  f.controls.revoked = true;
  assert.equal((await f.get(cookie)).body.user, null);
  f.controls.revoked = false;
  f.controls.mfa = true;
  const mfa = await f.get(cookie);
  assert.notEqual(mfa.status, 200);
  assert.equal(mfa.body.profile, undefined);
  f.controls.mfa = false;
  f.controls.wrongOwner = true;
  const wrong = await f.get(cookie);
  assert.notEqual(wrong.status, 200);
  assert.equal(wrong.body.profile, undefined);
});

test("the shared profile helper rejects credential-bearing and overlong avatar URLs", () => {
  for (const avatar_url of [
    "https://name:password@example.test/a.svg",
    `https://example.test/${"x".repeat(2048)}`,
  ])
    assert.equal(accountProfile({ id: owner, user_metadata: { avatar_url } }).avatarUrl, null);
});
