import { test, expect } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";
import { downloadFrom, localMember } from "./fixtures/download";

test("selection survives local sign-in and downloads a member ZIP", async ({ page }) => {
  await page.goto("/en/actors/tang-yunqiu");
  const checkbox = page.locator('[data-asset-slot="face.front"] input').first();
  await checkbox.check({ force: true });
  const downloadSelected = page.getByRole("button", { name: /download selected/i });
  // aria-busy turns "false" once the page is interactive and the session is known.
  await expect(downloadSelected).toHaveAttribute("aria-busy", "false", { timeout: 15_000 });
  await downloadSelected.click();
  await page.getByRole("dialog").getByRole("button", { name: "Sign in with Swimmer" }).click();
  await expect(page.locator("[data-account-menu]").first()).toBeVisible();
  await expect(checkbox).toBeChecked();
  await expect(downloadSelected).toHaveAttribute("aria-busy", "false", { timeout: 15_000 });
  await downloadSelected.click();
  const result = await downloadFrom(
    page,
    page.getByRole("dialog").getByRole("button", { name: "Start download" }),
  );
  expect(result.name).toMatch(/^tang-yunqiu_assets_\d{8}\.zip$/);
  const files = unzipSync(result.bytes);
  expect(Object.keys(files).sort()).toEqual(
    ["LICENSE.txt", "README-for-AI.txt", "character.json", "tang-yunqiu__face__front.png"].sort(),
  );
  expect(JSON.parse(strFromU8(files["character.json"]))).toBeTruthy();
});

test("starter and shared cast ZIPs contain the selected actors", async ({ page, context }) => {
  await localMember(context);
  await page.goto("/en/actors/tang-yunqiu");
  await expect(page.locator("[data-account-menu]").first()).toBeVisible();
  const starter = await downloadFrom(
    page,
    page.getByRole("button", { name: "Get the starter pack", exact: true }),
  );
  expect(starter.name).toBe("tang-yunqiu_starter.zip");
  const files = unzipSync(starter.bytes);
  expect(Object.keys(files).sort()).toEqual(
    [
      "README.txt",
      "prompt.txt",
      "tang-yunqiu__face__front.png",
      "tang-yunqiu__turnaround__front.png",
    ].sort(),
  );
  expect(strFromU8(files["README.txt"])).toContain("Swim In AI");
  await page.goto("/en/cast?a=tang-yunqiu,misha-luo");
  const cast = await downloadFrom(page, page.getByRole("button", { name: "Download cast pack" }));
  expect(cast.name).toBe("swimmer-party-cast.zip");
  const packed = unzipSync(cast.bytes);
  expect(
    JSON.parse(strFromU8(packed["cast.json"])).actors.map((actor: { slug: string }) => actor.slug),
  ).toEqual(["tang-yunqiu", "misha-luo"]);
  expect(packed["tang-yunqiu/prompt.txt"]).toBeTruthy();
  expect(packed["misha-luo/prompt.txt"]).toBeTruthy();
});
