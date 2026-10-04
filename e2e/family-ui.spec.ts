import { expect, test } from "@playwright/test";

test("English phone roster keeps codes and status pills on one line", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/actors");
  await page.evaluate(() => document.fonts.ready);
  const cards = await page.locator("[data-actor-card]").evaluateAll((nodes) =>
    nodes.map((node) => {
      const code = node.querySelector(".sp-code")!.getBoundingClientRect();
      const pills = node.querySelectorAll(".game-ui-badge");
      const pill = pills[pills.length - 1]!.getBoundingClientRect();
      return {
        codeHeight: code.height,
        pillHeight: pill.height,
        sameRow: Math.abs(code.top + code.height / 2 - (pill.top + pill.height / 2)) < 2,
      };
    }),
  );
  expect(cards.length).toBeGreaterThanOrEqual(12);
  for (const card of cards) {
    expect(card.codeHeight).toBeLessThan(20);
    expect(card.pillHeight).toBe(24);
    expect(card.sameRow).toBe(true);
  }
});

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
