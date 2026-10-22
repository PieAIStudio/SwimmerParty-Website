import { test, expect } from "@playwright/test";
import en from "../messages/en/messages.json";
test("home and legal pages render", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(en["home.heroLines.0"]);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(en["home.heroLines.1"]);
  await expect(page.getByText(en["home.heroBody"], { exact: true })).toBeVisible();
  await expect(page.locator('[data-home-section="hero"] a[href="/en/actors"]')).toHaveText(
    "Choose an actor",
  );
  await expect(page.locator("main")).not.toContainText(
    "each with images, a voice and a character prompt",
  );
  await expect(page.locator("body")).not.toContainText("Free. Just credit Swim In AI.");
  await page.goto("/en/license");
  await expect(
    page.getByRole("heading", { level: 1, name: /Free for personal and commercial projects\./ }),
  ).toBeVisible();
  await page.goto("/en/privacy");
  await expect(page.getByRole("heading", { name: "Privacy" })).toBeVisible();
  await page.goto("/en/terms");
  await expect(page.getByRole("heading", { name: "Terms of Use" })).toBeVisible();
});
test("legacy casting and pact routes redirect", async ({ page }) => {
  await page.goto("/en/casting");
  await expect(page).toHaveURL(/\/en\/studio#work-with-us/);
  await page.goto("/en/pact");
  await expect(page).toHaveURL(/\/en\/license#promises/);
});
