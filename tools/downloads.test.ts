import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { runtimeModes, HttpError } from "../src/lib/server/runtime-mode.ts";
import {
  signLocalObject,
  verifyLocalObject,
  readLocalObject,
} from "../src/features/assets/server/local-downloads.ts";
import {
  memoryGuestLimiter,
  vercelGuestLimiter,
} from "../src/features/assets/server/guest-limiter.ts";
import {
  blobAssetStore,
  privateObjectType,
  type BlobSdk,
} from "../src/features/assets/server/blob-store.ts";
import { starterSlots } from "../src/features/assets/starter-pack.ts";
import { accountUser, swimmerAccountConfig } from "../src/features/account/server/account.ts";
import { requireSameOrigin } from "../src/lib/server/api.ts";
import download from "../src/features/assets/server/download.ts";
import bundle from "../src/features/assets/server/bundle.ts";
import auth from "../src/features/account/server/handler.ts";
import voice from "../src/features/assets/server/voice.ts";
import { getActorAssets } from "../src/features/assets/assets.ts";
import { syntheticWav } from "./fixtures/audio.ts";

const object = "hu-qian/v0/SP-01__turnaround__front__v0.webp";
const epoch = 1_791_000_000_000;
const key = "synthetic-signing-key-for-tests-only";
function response() {
  const headers = new Map<string, unknown>();
  const value = {
    code: 0,
    body: undefined as unknown,
    writableEnded: false,
    setHeader(name: string, v: unknown) {
      headers.set(name.toLowerCase(), v);
      return this;
    },
    status(code: number) {
      this.code = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      this.writableEnded = true;
    },
    send(body: unknown) {
      this.body = body;
      this.writableEnded = true;
    },
  };
  return { value, headers, res: value as unknown as NextApiResponse };
}
function request(options: Partial<NextApiRequest> = {}): NextApiRequest {
  return {
    method: "GET",
    query: {},
    headers: { host: "127.0.0.1:3399" },
    socket: { remoteAddress: "test-ip" },
    ...options,
  } as NextApiRequest;
}
async function withModes(env: Record<string, string | undefined>, run: () => Promise<void>) {
  const names = ["VERCEL_ENV", "ASSET_STORE", "ACCOUNT_MODE", "GUEST_LIMITER", "ASSET_LOCAL_ROOT"];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) {
      const value = env[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await run();
  } finally {
    for (const name of names) {
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    }
  }
}

test("deployment mode guard rejects every local adapter, even an empty VERCEL_ENV", () => {
  assert.deepEqual(runtimeModes({}), { store: "local", account: "mock", limiter: "memory" });
  for (const name of ["preview", "production", ""]) {
    for (const local of [
      { ASSET_STORE: "local" },
      { ACCOUNT_MODE: "mock" },
      { GUEST_LIMITER: "memory" },
    ]) {
      assert.throws(
        () =>
          runtimeModes({
            VERCEL_ENV: name,
            ASSET_STORE: "blob",
            ACCOUNT_MODE: "swimmer",
            GUEST_LIMITER: "vercel",
            ...local,
          }),
        (error: unknown) => error instanceof HttpError && error.status === 503,
      );
    }
  }
  assert.deepEqual(
    runtimeModes({
      VERCEL_ENV: "preview",
      ASSET_STORE: "blob",
      ACCOUNT_MODE: "swimmer",
      GUEST_LIMITER: "vercel",
    }),
    { store: "blob", account: "swimmer", limiter: "vercel" },
  );
  assert.throws(() => runtimeModes({ ASSET_STORE: "typo" }), /invalid-runtime-mode/);
});

test("download API returns private 503 before touching auth or storage on Vercel", async () => {
  await withModes({ VERCEL_ENV: "preview", ACCOUNT_MODE: "mock" }, async () => {
    const out = response();
    await download(request({ query: { slug: "tang-yunqiu", slot: "turnaround.front" } }), out.res);
    assert.equal(out.value.code, 503);
    assert.equal(out.headers.get("cache-control"), "private, no-store");
  });
});

test("local voice uses the isolated asset root and never falls back to real recordings", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "swimmer-voice-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const item = getActorAssets("tang-yunqiu").items.find((item) => item.slot === "voice.intro");
  assert.ok(item);
  const target = path.join(root, item.object);
  await mkdir(path.dirname(target), { recursive: true });
  const bytes = syntheticWav();
  await writeFile(target, bytes);
  await withModes({ ASSET_LOCAL_ROOT: root }, async () => {
    const out = response();
    await voice(request({ query: { slug: "tang-yunqiu", slot: "intro" } }), out.res);
    assert.equal(out.value.code, 200);
    assert.equal(out.headers.get("content-type"), "audio/wav");
    assert.deepEqual(out.value.body, bytes);
    await rm(target);
    const missing = response();
    await voice(request({ query: { slug: "tang-yunqiu", slot: "intro" } }), missing.res);
    assert.equal(missing.value.code, 404);
  });
});

test("local signatures bind the object and expiry; malformed, stale and tampered URLs fail", () => {
  const url = new URL(signLocalObject(object, epoch, key), "http://localhost");
  const exp = url.searchParams.get("exp");
  const sig = url.searchParams.get("sig");
  verifyLocalObject(object, exp, sig, epoch + 119_000, key);
  assert.equal(Number(exp) * 1000 - epoch, 120_000);
  assert.throws(
    () => verifyLocalObject(object, exp, sig, epoch + 120_000, key),
    /invalid-asset-signature/,
  );
  assert.throws(() => verifyLocalObject(object, exp, "0".repeat(64), epoch, key));
  assert.throws(() => verifyLocalObject(object.replace("front", "side"), exp, sig, epoch, key));
  assert.throws(() => verifyLocalObject(object, [exp], sig, epoch, key));
  assert.throws(() => verifyLocalObject(object, "Infinity", sig, epoch, key));
  assert.throws(() => signLocalObject("../../secret.png", epoch, key));
});

test("local master reads reject symlinks, directories and missing files", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "sp-signed-"));
  const target = path.join(root, object);
  try {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, "synthetic file");
    assert.equal((await readLocalObject(root, object)).toString(), "synthetic file");
    await rm(target);
    await writeFile(path.join(root, "other"), "not a master");
    await symlink(path.join(root, "other"), target);
    await assert.rejects(readLocalObject(root, object), /asset-not-found/);
    await rm(target);
    await assert.rejects(readLocalObject(root, object), /asset-not-found/);
    await mkdir(target);
    await assert.rejects(readLocalObject(root, object), /asset-not-found/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("guest window is atomic per IP and expires exactly at thirty seconds", () => {
  let time = epoch;
  const limit = memoryGuestLimiter(() => time);
  assert.equal(limit("a"), 0);
  assert.equal(limit("a"), 30);
  assert.equal(limit("b"), 0);
  time += 29_200;
  assert.equal(limit("a"), 1);
  time += 800;
  assert.equal(limit("a"), 0);
});

test("Vercel limiter forwards request headers and fails closed on missing rules", async () => {
  const calls: unknown[] = [];
  const check = async (...args: unknown[]) => {
    calls.push(args);
    return { rateLimited: true };
  };
  assert.equal(
    await vercelGuestLimiter(check, {
      headers: { host: "site.example", "x-forwarded-for": "192.0.2.1" },
    }),
    30,
  );
  assert.deepEqual(calls, [
    ["guest-asset-download", { headers: { host: "site.example", "x-forwarded-for": "192.0.2.1" } }],
  ]);
  await assert.rejects(
    vercelGuestLimiter(async () => ({ rateLimited: false, error: "not-found" }), { headers: {} }),
    /guest-limiter-unavailable/,
  );
  await assert.rejects(
    vercelGuestLimiter(async () => ({ rateLimited: false, error: "blocked" }), { headers: {} }),
  );
});

test("private Blob uses object-scoped cached tokens, 120s GET URLs and private uploads", async () => {
  let time = epoch;
  const issues: unknown[] = [],
    signs: unknown[][] = [],
    puts: unknown[][] = [];
  const sdk = {
    issueSignedToken: async (options: unknown) => {
      issues.push(options);
      return {
        delegationToken: "delegation",
        clientSigningToken: "private",
        validUntil: time + 900_000,
      };
    },
    presignUrl: async (...args: unknown[]) => {
      signs.push(args);
      return { presignedUrl: "https://example.invalid/signed-only" };
    },
    put: async (...args: unknown[]) => {
      puts.push(args);
      return {};
    },
  } as unknown as BlobSdk;
  const store = blobAssetStore(sdk, () => time);
  assert.deepEqual(await Promise.all([store.sign(object), store.sign(object)]), [
    "https://example.invalid/signed-only",
    "https://example.invalid/signed-only",
  ]);
  assert.equal(issues.length, 1);
  assert.deepEqual(issues[0], {
    pathname: object,
    operations: ["get"],
    validUntil: epoch + 900_000,
  });
  assert.deepEqual(signs[0][1], {
    operation: "get",
    pathname: object,
    access: "private",
    validUntil: epoch + 120_000,
  });
  await store.put(object, new Uint8Array([1, 2]));
  assert.deepEqual(puts[0][2], {
    access: "private",
    contentType: "image/webp",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  time += 780_000;
  await store.sign(object);
  assert.equal(issues.length, 2);
  await assert.rejects(store.sign("../private"));
});

test("mock cookie is exact, sign-in is same-origin, and sign-out removes it", async () => {
  await withModes({}, async () => {
    assert.equal(
      await accountUser(
        request({ headers: { cookie: "sp_mock_member=10" } }),
        response().res,
        "mock",
      ),
      null,
    );
    assert.deepEqual(
      await accountUser(
        request({ headers: { cookie: "x=1; sp_mock_member=1; y=2" } }),
        response().res,
        "mock",
      ),
      { id: "local-mock-member" },
    );
    const out = response();
    await auth(request({ method: "POST", query: { action: ["mock", "sign-in"] } }), out.res);
    assert.equal(out.value.code, 200);
    assert.match(String(out.headers.get("set-cookie")), /HttpOnly; SameSite=Lax/);
    const signedOut = response();
    await auth(request({ method: "POST", query: { action: ["mock", "sign-out"] } }), signedOut.res);
    assert.match(String(signedOut.headers.get("set-cookie")), /Max-Age=0/);
    assert.throws(
      () =>
        requireSameOrigin(
          request({ headers: { host: "127.0.0.1:3399", origin: "https://evil.example" } }),
          "mock",
        ),
      /cross-site/,
    );
  });
});

test("API validates method, actor, slots, duplicates and guest bundles", async () => {
  await withModes({}, async () => {
    const unknown = response();
    await download(request({ query: { slug: "unknown", slot: "turnaround.front" } }), unknown.res);
    assert.equal(unknown.value.code, 404);
    const wrongMethod = response();
    await download(request({ method: "POST" }), wrongMethod.res);
    assert.equal(wrongMethod.value.code, 405);
    assert.equal(wrongMethod.headers.get("allow"), "GET");
    const guest = response();
    await bundle(
      request({
        method: "POST",
        query: { slug: "tang-yunqiu" },
        body: { slots: ["turnaround.front"] },
      }),
      guest.res,
    );
    assert.equal(guest.value.code, 401);
    assert.deepEqual(guest.value.body, { signIn: true });
    for (const slots of [
      [],
      Array(65).fill("turnaround.front"),
      ["turnaround.front", "turnaround.front"],
      [4],
      "front",
    ]) {
      const out = response();
      await bundle(
        request({
          method: "POST",
          query: { slug: "tang-yunqiu" },
          headers: { cookie: "sp_mock_member=1" },
          body: { slots },
        }),
        out.res,
      );
      assert.equal(out.value.code, 400);
    }
  });
});

test("public credit marks use the same guest download window", async () => {
  await withModes({}, async () => {
    const first = response();
    await download(
      request({
        query: { slug: "public", slot: "swim-in-ai-white" },
        headers: { host: "example.test" },
        socket: { remoteAddress: "credit-test-ip" } as NextApiRequest["socket"],
      }),
      first.res,
    );
    assert.equal(first.value.code, 200);
    assert.deepEqual(first.value.body, {
      url: "http://example.test/downloads/swim-in-ai-white.png",
      filename: "swim-in-ai-white.png",
      cooldown: 30,
    });
    const second = response();
    await download(
      request({
        query: { slug: "public", slot: "swim-in-ai-black" },
        headers: { host: "example.test" },
        socket: { remoteAddress: "credit-test-ip" } as NextApiRequest["socket"],
      }),
      second.res,
    );
    assert.equal(second.value.code, 429);
    assert.equal(second.headers.get("retry-after"), 30);
  });
});

test("Swimmer config uses the maintained SSO contract and never a browser-supplied issuer", () => {
  const config = swimmerAccountConfig({
    NODE_ENV: "production",
    SWIMMER_COOKIE_PASSWORD: "x".repeat(32),
    SWIMMER_BACKEND_URL: "https://backend.example",
    SWIMMER_PUBLISHABLE_KEY: "fixture-public-key",
    SWIMMER_OAUTH_CLIENT_ID: "public-fixture-client",
    SWIMMER_ACCOUNT_URL: "https://account.example",
  });
  assert.equal(config.origin, "https://swimmerparty.swiminai.com");
  assert.equal(config.cookieName, "__Host-swimmerparty-session");
  assert.equal(config.sso?.clientId, "public-fixture-client");
  assert.equal(config.basePath, "/api/auth");
  assert.throws(() => swimmerAccountConfig({}), /account-not-configured/);
});

test("private keys cover casting photos and voices; starter slots follow the manifest", () => {
  assert.equal(privateObjectType("agnes-lefevre/CC-073.png"), "image/png");
  assert.equal(privateObjectType("voice/agnes-lefevre/candidate-1.mp3"), "audio/mpeg");
  assert.equal(
    privateObjectType("voice/tang-yunqiu/tang-yunqiu__voice__intro__v1.wav"),
    "audio/wav",
  );
  for (const bad of [
    "voice/../secret.mp3",
    "voice/a/b/c.mp3",
    "agnes-lefevre/CC-73.png",
    "agnes-lefevre/CC-073.webp",
  ])
    assert.throws(() => privateObjectType(bad), /Invalid/);
  assert.deepEqual(
    starterSlots([{ slot: "face.front" }, { slot: "voice.intro" }, { slot: "turnaround.front" }]),
    ["turnaround.front", "face.front"],
  );
  assert.deepEqual(starterSlots([{ slot: "turnaround.front" }]), ["turnaround.front"]);
});
