import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { AsyncLocalStorage } from "node:async_hooks";
import ts from "typescript";

// Next's standalone matcher utility expects the same platform primitive its server bootstrap installs.
Object.defineProperty(globalThis, "AsyncLocalStorage", {
  value: AsyncLocalStorage,
  configurable: true,
});
const { unstable_doesMiddlewareMatch } = createRequire(import.meta.url)(
  "next/experimental/testing/server",
) as {
  unstable_doesMiddlewareMatch(input: {
    config: { matcher: string[] };
    nextConfig: Record<string, never>;
    url: string;
  }): boolean;
};
function actualMatchers() {
  const source = readFileSync(new URL("../../src/proxy.ts", import.meta.url), "utf8");
  const file = ts.createSourceFile(
    "proxy.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== "config" ||
        !declaration.initializer ||
        !ts.isObjectLiteralExpression(declaration.initializer)
      )
        continue;
      for (const property of declaration.initializer.properties) {
        if (
          !ts.isPropertyAssignment(property) ||
          property.name.getText(file) !== "matcher" ||
          !ts.isArrayLiteralExpression(property.initializer)
        )
          continue;
        return property.initializer.elements.map((element) => {
          assert(
            ts.isStringLiteral(element),
            "Matcher entries must remain statically analyzable constants",
          );
          return element.text;
        });
      }
    }
  }
  throw new Error("Proxy matcher configuration was not found");
}
function matches(url: string) {
  return unstable_doesMiddlewareMatch({
    config: { matcher: actualMatchers() },
    nextConfig: {},
    url,
  });
}
test("community Proxy matcher never locale-prefixes native API or static asset paths", () => {
  for (const path of [
    "/api/community/access",
    "/api/community/v3/get_limits",
    "/api/community/transfer/id",
    "/api/community/media/id",
    "/api/auth/session",
    "/_next/static/chunks/test.js",
    "/media/assets/test.webp",
  ])
    assert.equal(matches(path), false, path);
});
test("community Proxy matcher covers page, RSC, prefetch and segment variants for both authored locales", () => {
  for (const locale of ["en", "zh"])
    for (const path of [
      "community",
      "community/new",
      "community/mine",
      "community.rsc",
      "community.prefetch.rsc",
      "community.segments/_tree.segment.rsc",
      "community/new.prefetch.rsc",
      "admin/review",
      "admin/review.rsc",
      "admin/review.prefetch.rsc",
      "admin/review.segments/_tree.segment.rsc",
      "works/p/id.prefetch.rsc",
    ])
      assert.equal(matches(`/${locale}/${path}`), true, `${locale}/${path}`);
});
