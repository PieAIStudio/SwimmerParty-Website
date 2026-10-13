import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("manual doc gate has bounded package read access and no deployment or push trigger", async () => {
  const text = await readFile(
    new URL("../../.github/workflows/docs-check.yml", import.meta.url),
    "utf8",
  );
  assert.match(text, /on:\s*\n  workflow_dispatch:/);
  assert.doesNotMatch(text, /^  (?:push|pull_request|schedule):/m);
  assert.match(text, /contents: read/);
  assert.match(text, /packages: read/);
  assert.match(text, /registry-url: https:\/\/npm\.pkg\.github\.com/);
  assert.match(text, /NODE_AUTH_TOKEN: \$\{\{ github\.token \}\}/);
  assert.doesNotMatch(
    text,
    /write-all|packages: write|vercel deploy|vercel promote|continue-on-error/,
  );
  for (const gate of ["router-check", "check", "scan --check", "links", "audit"])
    assert.ok(text.includes(`pnpm doc-gov ${gate}`));
});
