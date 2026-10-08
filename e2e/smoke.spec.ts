import { test, expect } from "@playwright/test";
test("home and legal pages render", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText(/original animated actors.*even when you get paid\./i)).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Free. Just credit Swim In AI.");
  await page.goto("/en/license");
  await expect(page.getByRole("heading", { name: /Use them anywhere/i })).toBeVisible();
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
