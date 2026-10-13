import assert from "node:assert/strict";
import test from "node:test";
import { accountSession } from "../../src/features/account/session.ts";

const user = { id: "owner-a", email: "a@example.test", is_anonymous: false };
const profile = {
  id: user.id,
  name: "泳者昵称",
  email: user.email,
  avatarUrl: "https://images.example.test/avatar.svg",
};

test("the browser projection uses AuthKit's verified profile, not the stripped identity or raw metadata", () => {
  assert.deepEqual(accountSession({ user, profile }), {
    user: { id: user.id },
    profile,
    mode: "swimmer",
  });
  assert.deepEqual(accountSession({ user: null }), { user: null, profile: null, mode: "swimmer" });
  assert.deepEqual(accountSession({ user: null, profile: null }), {
    user: null,
    profile: null,
    mode: "swimmer",
  });
});

test("mock and old deployed session shapes retain the current UI contract during rollout", () => {
  for (const mode of ["mock", "swimmer"] as const) {
    assert.deepEqual(accountSession({ mode, user: profile }), {
      user: { id: user.id },
      profile,
      mode,
    });
    assert.deepEqual(accountSession({ mode, user: null }), { user: null, profile: null, mode });
  }
});

test("missing, wrong-owner, anonymous and malformed profiles cannot become a signed-in menu", () => {
  for (const value of [
    null,
    {},
    [],
    { user },
    { user, profile: null },
    { user, profile: { ...profile, id: "owner-b" } },
    { user: null, profile },
    { user: { ...user, is_anonymous: true }, profile },
    { user: { ...user, is_anonymous: null }, profile },
    { user, profile: { ...profile, name: 1 } },
    { mode: "unknown", user: profile },
    { user: { ...user, user_metadata: { display_name: "unverified" } } },
  ])
    assert.throws(() => accountSession(value));
});
