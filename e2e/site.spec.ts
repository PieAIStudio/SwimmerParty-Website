import { glob, readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";

for (const colorScheme of ["light", "dark"] as const) {
  test(`system theme, persistence and not-found: ${colorScheme}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ colorScheme });
    await page.goto("/zh");
    await expect(page.locator("html")).toHaveAttribute("data-game-ui-style", "grey");
    await expect(page.locator("html")).toHaveAttribute("data-game-ui-theme", colorScheme);
    await expect(page.locator("[data-clay-stage]")).toHaveCSS("border-radius", "0px");
    await expect(page.locator(".sp-panel.sp-sweep").first()).toHaveCSS("border-radius", "26px");
    const next = colorScheme === "light" ? "dark" : "light";
    await page.getByRole("button", { name: "切换明暗" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-game-ui-theme", next);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-game-ui-theme", next);
    await page.goto("/zh/actors/not-an-actor");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("不在");
    await expect(page.locator("html")).toHaveAttribute("data-game-ui-theme", next);
    expect(errors).toEqual([]);
  });
}

test("not-found follows a dark system without stored preference", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/zh/actors/not-an-actor");
  await expect(page.locator("html")).toHaveAttribute("data-game-ui-theme", "dark");
});

test("mobile menu restores focus and releases scroll lock", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/actors");
  const menu = page.getByRole("button", { name: "菜单", exact: true });
  await menu.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(menu).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
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
      if (resolved.startsWith(path.join(root, "src/content/actors/tang-yunqiu") + path.sep))
        includesAssetMetadata = true;
    }
  }
  expect(manifests).toBeGreaterThanOrEqual(4);
  expect(includesAssetMetadata).toBe(true);
});

for (const [route, label, target] of [
  ["/en", "Get free actor assets", "/en/kit"],
  ["/en/actors/tang-yunqiu", "Open asset library", "/en/kit/tang-yunqiu"],
]) {
  test(`one linked primary CTA on ${route}`, async ({ page }) => {
    await page.goto(route);
    const primary = page.locator(".game-ui-button--primary:visible");
    await expect(primary).toHaveCount(1);
    await expect(primary).toHaveAccessibleName(label);
    await primary.click();
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    await expect(page.locator(".sp-pill")).toHaveCount(0);
  });
}
