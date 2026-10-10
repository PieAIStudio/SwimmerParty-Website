import { test, expect } from "@playwright/test";

test("the guide explains the three ways to get an actor", async ({ page }) => {
  await page.goto("/en/guide");
  await expect(
    page.getByRole("heading", { level: 1, name: "Three ways to get an actor" }),
  ).toBeVisible();
  for (const title of [
    "Starter pack · fastest start",
    "Character sheet · one image says it all",
    "Cast · several actors, one story",
  ])
    await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
  await expect(page.getByRole("link", { name: "How to credit", exact: true })).toHaveAttribute(
    "href",
    "/en/license#credit",
  );
  await expect(page.getByRole("link", { name: "Browse actors", exact: true })).toHaveAttribute(
    "href",
    "/en/actors",
  );
});

test("the footer links to the guide from every page", async ({ page }) => {
  await page.goto("/en/actors");
  await page.locator("footer").getByRole("link", { name: "How it works", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/guide$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Three ways to get an actor");
});

test("the guide fits a phone without sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/guide");
  await expect(page.getByRole("heading", { level: 1, name: "三种拿法，挑一种就行" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});
