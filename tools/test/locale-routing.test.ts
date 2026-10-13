import assert from "node:assert/strict";
import test from "node:test";
import { MACHINE_LOCALES, machineTranslateUrl, routing } from "../../src/i18n/routing.ts";

test("visitors without a supported language fall back to English", () => {
  assert.equal(routing.defaultLocale, "en");
});

for (const { code } of MACHINE_LOCALES) {
  test(`machine translation preserves the English path and query: ${code}`, () => {
    const url = new URL(
      machineTranslateUrl(
        "https://swimmerparty.swiminai.com",
        "/en/cast?a=tang-yunqiu&ref=language#cast",
        code,
      ),
    );
    assert.equal(url.hostname, "swimmerparty-swiminai-com.translate.goog");
    assert.equal(url.pathname, "/en/cast");
    assert.equal(url.searchParams.get("a"), "tang-yunqiu");
    assert.equal(url.searchParams.get("ref"), "language");
    assert.equal(url.searchParams.get("_x_tr_sl"), "en");
    assert.equal(url.searchParams.get("_x_tr_tl"), code);
    assert.equal(url.hash, "#cast");
  });
}

test("translation control parameters cannot override the chosen language", () => {
  const url = new URL(
    machineTranslateUrl("https://swimmerparty.swiminai.com", "/en?_x_tr_sl=zh&_x_tr_tl=ru", "ja"),
  );
  assert.deepEqual(url.searchParams.getAll("_x_tr_sl"), ["en"]);
  assert.deepEqual(url.searchParams.getAll("_x_tr_tl"), ["ja"]);
});
