import { test, expect } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";
import { localMember, downloadFrom } from "./fixtures/download";

test("A7 starter workflow produces an actual local-fixture ZIP", async ({ page, context }) => {
  await localMember(context);
  await page.goto("/en/guide");
  await page
    .locator('[data-learn-outcome="starter"]')
    .getByRole("link", { name: "Start with one actor" })
    .click();
  const button = page.getByRole("button", { name: "Get the starter pack", exact: true });
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  const result = await downloadFrom(page, button);
  const files = unzipSync(result.bytes);
  expect(files["prompt.txt"]).toBeTruthy();
  expect(strFromU8(files["README.txt"])).toContain("SwimInAI");
});
test("A7 sheet workflow produces an actual local-fixture PNG", async ({ page, context }) => {
  await localMember(context);
  await page.goto("/en/guide");
  await page
    .locator('[data-learn-outcome="sheet"]')
    .getByRole("link", { name: "Make a character sheet" })
    .click();
  const button = page.getByRole("button", { name: "Download sheet", exact: true });
  await expect(button).not.toHaveAttribute("aria-busy", "true", { timeout: 15000 });
  const result = await downloadFrom(page, button);
  expect(result.bytes.subarray(1, 4).toString()).toBe("PNG");
  expect(result.bytes.readUInt32BE(16)).toBe(3840);
  expect(result.bytes.readUInt32BE(20)).toBe(2160);
});
test("A7 cast workflow preserves two chosen actors in the actual local-fixture ZIP", async ({
  page,
  context,
}) => {
  await localMember(context);
  for (const slug of ["tang-yunqiu", "misha-luo"]) {
    await page.goto(`/en/actors/${slug}`);
    await page.getByRole("button", { name: "Add to cast", exact: true }).click();
  }
  await page.goto("/en/guide");
  await page
    .locator('[data-learn-outcome="cast"]')
    .getByRole("link", { name: "Open your cast" })
    .click();
  const button = page.getByRole("button", { name: "Download cast pack", exact: true });
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  const result = await downloadFrom(page, button);
  expect(
    JSON.parse(strFromU8(unzipSync(result.bytes)["cast.json"])).actors.map(
      (actor: { slug: string }) => actor.slug,
    ),
  ).toEqual(["tang-yunqiu", "misha-luo"]);
});
