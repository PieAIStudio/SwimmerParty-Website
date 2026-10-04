import { expect, test } from "@playwright/test";
import { glob, readFile } from "node:fs/promises";
import path from "node:path";

for (const coarse of [false, true]) {
  test(`high-density clay rendering has an explicit ${coarse ? "coarse-pointer" : "desktop"} pixel budget`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: coarse ? 390 : 1440, height: 900 },
      deviceScaleFactor: 3,
      hasTouch: coarse,
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      await page.goto("http://127.0.0.1:3399/en");
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(coarse);
      const canvas = page.locator("[data-clay-stage] canvas");
      await expect(canvas).toBeVisible();
      const limit = coarse ? 1.35 : 1.5;
      await expect
        .poll(async () =>
          Math.abs(
            (await canvas.evaluate(
              (node) => (node as HTMLCanvasElement).width / node.clientWidth,
            )) - limit,
          ),
        )
        .toBeLessThan(0.015);
      expect(await page.locator("canvas").count()).toBe(1);
    } finally {
      await context.close();
    }
  });
}

test("bad JSON and oversized member bodies return private errors without severing the connection", async ({
  request,
}) => {
  await request.post("/api/auth/mock/sign-in");
  for (const [data, status] of [
    ["{", 400],
    [JSON.stringify({ slots: ["x".repeat(17_000)] }), 413],
  ] as const) {
    const response = await request.post("/api/assets/hu-qian/bundle", {
      headers: { "Content-Type": "application/json" },
      data,
    });
    expect(response.status()).toBe(status);
    expect(response.headers()["cache-control"]).toBe("private, no-store");
    expect((await response.json()).error).toBeTruthy();
  }
});

test("production file traces contain manifests but no local originals, inbox, evidence or credentials", async () => {
  const root = process.cwd();
  const prohibited = [".assets-local", "assets-inbox", ".devspace-reports", "e2e", "tools"].map(
    (name) => path.join(root, name) + path.sep,
  );
  let manifests = 0;
  let includesAssetMetadata = false;
  for await (const filename of glob(".next/server/pages/api/**/*.nft.json")) {
    manifests++;
    const trace = JSON.parse(await readFile(filename, "utf8")) as { files: string[] };
    for (const file of trace.files) {
      const resolved = path.resolve(path.dirname(filename), file);
      expect(
        prohibited.some((prefix) => resolved.startsWith(prefix)),
        resolved,
      ).toBe(false);
      expect(resolved.startsWith(root + path.sep + ".env"), resolved).toBe(false);
      if (resolved.startsWith(path.join(root, "src/content/actors/hu-qian") + path.sep))
        includesAssetMetadata = true;
    }
  }
  expect(manifests).toBeGreaterThanOrEqual(4);
  expect(includesAssetMetadata).toBe(true);
});
