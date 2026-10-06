import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("localized alternates build an absolute canonical from the current locale", async () => {
  const source = await readFile(new URL("../src/i18n/metadata.ts", import.meta.url), "utf8");
  assert.match(source, /const suffix = path === "\/" \? "" : path;/);
  assert.match(source, /canonical = `\$\{SITE\.url\}\/\$\{locale\}\$\{suffix\}`/);
  assert.match(source, /canonical,\s*languages:/);
  assert.match(source, /`\$\{SITE\.url\}\/\$\{alternateLocale\}\$\{suffix\}`/);
  assert.match(source, /`\$\{SITE\.url\}\/en\$\{suffix\}`/);
});

test("sitemap emits the same locale-prefixed path used by canonical metadata", async () => {
  const source = await readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
  assert.match(source, /url: `\$\{SITE\.url\}\/\$\{locale\}\$\{path\}`/);
  assert.match(source, /\[\"x-default\", `\$\{SITE\.url\}\/en\$\{path\}`\]/);
});
