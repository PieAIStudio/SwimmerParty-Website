import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { messages } from "../../src/i18n/messages.source.ts";

test("public copy does not promise unconditional model consistency", () => {
  assert.doesNotMatch(messages["home.metaTitle"].en, /who stay the same/);
  assert.doesNotMatch(messages["sheet.lead"].en, /knows .* at a glance/);
});
test("community media labels use only the active language", () => {
  for (const kind of ["image", "video", "audio"] as const) {
    assert.doesNotMatch(messages[`community.kind.${kind}`].en, /[\u4e00-\u9fff]/);
    assert.doesNotMatch(messages[`community.kind.${kind}`].zh, /Image|Video|Audio|Game/);
  }
  assert.equal(messages["c.actors"].en, "Actors and asset versions used");
});
test("pack sign-in condition is explicit before a visitor continues", () => {
  assert.match(messages["assets.signInBody"].en, /free Swimmer account/);
  assert.match(messages["assets.signInBody"].zh, /单张图片不用登录/);
});
test("the composer uses a catalog-backed actor selector with asset versions", async () => {
  const source = await readFile(
    new URL("../../src/features/community/ActorPicker.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /<GameCheckbox/);
  assert.match(source, /ACTORS\.filter/);
  assert.match(source, /assetVersion: actor.version/);
});
