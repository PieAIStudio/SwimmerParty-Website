import test from "node:test";
import assert from "node:assert/strict";
import { analyzeBoundaries } from "../site/boundary-analysis.ts";
const check = (files: Record<string, string>) => analyzeBoundaries(new Map(Object.entries(files)));

test("public composition and type-only server dependencies are legal", () => {
  assert.deepEqual(
    check({
      "src/app/page.tsx": 'import { View } from "@/features/a"; export default View;',
      "src/features/a/index.ts": 'export { View } from "./View";',
      "src/features/a/View.tsx":
        'import type { Mode } from "../b/server"; export function View(){ return null; }',
      "src/features/b/server.ts": 'import fs from "node:fs"; export type Mode = "local";',
    }),
    [],
  );
});
test("private sibling imports are rejected for aliases and relative paths", () => {
  for (const spec of ["@/features/b/private", "../b/private"]) {
    const result = check({
      "src/features/a/index.ts": `export { value } from "${spec}";`,
      "src/features/b/private.ts": "export const value = 1;",
    });
    assert.ok(result.some((item) => /Private feature import/.test(item.message)));
  }
});
test("dynamic loading and re-exports cannot hide a browser-to-Node dependency", () => {
  for (const loader of ['import("./private")', 'require("./private")']) {
    const result = check({
      "src/features/a/View.tsx": '"use client"; import { load } from "./client"; load();',
      "src/features/a/client.ts": `export const load = () => ${loader};`,
      "src/features/a/private.ts":
        'import { readFile } from "node:fs/promises"; export { readFile };',
    });
    assert.ok(
      result.some(
        (item) =>
          /Browser imports server capability/.test(item.message) &&
          item.message.includes("client.ts -> src/features/a/private.ts"),
      ),
    );
  }
});
test("cycles, behavior in content and business-specific shared utilities are rejected", () => {
  const result = check({
    "src/features/a/index.ts": 'export { b } from "../b";',
    "src/features/b/index.ts": 'export { a } from "../a";',
    "src/content/site.ts": "export const SITE = {}; export function lookup(){ return SITE; }",
    "src/lib/client.ts": 'import { SITE } from "../content/site"; export { SITE };',
  });
  for (const pattern of [
    /Import cycle/,
    /Content contains behavior/,
    /Generic utilities cannot depend/,
  ])
    assert.ok(result.some((item) => pattern.test(item.message)));
});
test("API routes and generic chrome accept composition, not business implementation", () => {
  assert.ok(
    check({ "src/pages/api/bad.ts": "export default function handler(){ return null; }" }).some(
      (item) => /API routes/.test(item.message),
    ),
  );
  assert.ok(
    check({
      "src/site/Header.tsx": 'import { Menu } from "@/features/account";',
      "src/features/account/index.ts": "export const Menu = 1;",
    }).some((item) => /Visual primitives/.test(item.message)),
  );
  assert.deepEqual(
    check({
      "src/pages/api/good.ts":
        'export { handler as default } from "@/features/a/server"; export const config = { api: { bodyParser: false } };',
      "src/features/a/server.ts": "export function handler(){}",
    }),
    [],
  );
});
