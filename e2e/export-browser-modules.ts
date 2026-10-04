import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import type { Page } from "@playwright/test";

/** Browser-only test harness: intercepted requests, no production test route or fake actor data.
 * Existing TypeScript transpiles the actual export modules; no extra bundler dependency.
 */
export async function installExportBrowserModules(page: Page) {
  const require = createRequire(path.join(process.cwd(), "package.json"));
  const fflate = path.resolve(path.dirname(require.resolve("fflate")), "../esm/browser.js");
  await page.route("**/__export_modules/**", async (route) => {
    const relative = new URL(route.request().url()).pathname.split("/__export_modules/")[1];
    if (relative === "fflate.js") {
      await route.fulfill({ contentType: "text/javascript", body: await readFile(fflate, "utf8") });
      return;
    }
    const safe = path.posix.normalize(relative);
    if (!/^(src\/lib|src\/content|src\/features\/assets)\/[a-z0-9-]+\.(ts|json)$/.test(safe))
      throw new Error(`Unexpected browser test import: ${safe}`);
    const source = await readFile(path.resolve(safe), "utf8");
    if (safe.endsWith(".json")) {
      await route.fulfill({ contentType: "application/json", body: source });
      return;
    }
    const compiled = ts.transpileModule(source, {
      fileName: safe,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        verbatimModuleSyntax: true,
      },
    }).outputText;
    await route.fulfill({
      contentType: "text/javascript",
      body: compiled.replace('from "fflate"', 'from "/__export_modules/fflate.js"'),
    });
  });
}
