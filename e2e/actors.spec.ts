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
