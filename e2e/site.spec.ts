import { test, expect } from "@playwright/test";
test("primary navigation has four current routes", async ({ page }) => {
  await page.goto("/en");
  for (const name of ["Actors", "Works", "Free License", "Studio"])
    await expect(page.getByRole("link", { name, exact: true }).first()).toBeVisible();
});
test("cast page loads", async ({ page }) => {
  await page.goto("/en/cast?a=tang-yunqiu,misha-luo");
  await expect(page.getByRole("heading", { name: "My cast" })).toBeVisible();
});
