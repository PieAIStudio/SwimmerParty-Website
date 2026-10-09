import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { messages } from "../src/i18n/messages.source.ts";

test("message catalogs are regenerated from messages.source.ts", () => {
  for (const [language, directory] of [["en", "en"], ["zh", "zh-CN"]] as const) {
    const catalog = JSON.parse(readFileSync(`messages/${directory}/messages.json`, "utf8"));
    const expected = Object.fromEntries(
      Object.entries(messages).map(([key, pair]) => [key, pair[language]]),
    );
    assert.deepEqual(catalog, expected, `run pnpm messages:generate (${directory})`);
  }
});
