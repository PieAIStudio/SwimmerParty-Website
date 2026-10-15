import assert from "node:assert/strict";
import test from "node:test";
import { localizedSignInUrl } from "../../src/features/account/login-url.ts";

const native =
  "https://backend.example.test/auth/v1/oauth/authorize?state=opaque&nonce=nonce&code_challenge=challenge&redirect_uri=https%3A%2F%2Fproduct.example.test%2Fcallback";
const origin = "https://accounts.example.test";
for (const locale of ["en", "zh"] as const)
  test(`product ${locale} is carried without rewriting the AuthKit request`, () => {
    const url = new URL(localizedSignInUrl(native, origin, locale));
    assert.equal(url.origin, origin);
    assert.equal(url.pathname, "/authorize/start");
    assert.equal(url.searchParams.get("ui_locales"), locale);
    assert.equal(url.searchParams.get("authorization_url"), native);
    assert.equal(url.hash, "");
  });
test("invalid native URLs and untrusted center shapes never become navigation targets", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://backend.example/auth/v1/oauth/authorize",
    "https://backend.example/auth/v1/token",
    native + "#fragment",
    "https://user@backend.example/auth/v1/oauth/authorize",
  ])
    assert.throws(() => localizedSignInUrl(url, origin, "en"));
  for (const center of [
    "http://accounts.example.test",
    origin + "/path",
    origin + "?query",
    "https://user@accounts.example.test",
  ])
    assert.throws(() => localizedSignInUrl(native, center, "en"));
});
