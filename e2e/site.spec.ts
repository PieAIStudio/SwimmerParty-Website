import { test, expect } from "@playwright/test";
import { downloadFrom, localMember } from "./fixtures/download";

test("navigation leads to the license and its credit mark downloads", async ({ page, context }) => {
  await localMember(context);
  await page.goto("/en");
  for (const name of ["Actors", "Works", "Free License", "Studio"])
    await expect(page.getByRole("link", { name, exact: true }).first()).toBeVisible();
  await page.getByRole("link", { name: "Free License", exact: true }).first().click();
  await expect(page).toHaveURL(/\/en\/license$/);
  const mark = await downloadFrom(page, page.getByText("Download black", { exact: true }));
  expect(mark.name).toBe("swim-in-ai-black.png");
  expect(mark.bytes.subarray(1, 4).toString()).toBe("PNG");
});
