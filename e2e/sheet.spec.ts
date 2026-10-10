import { test, expect } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";
import { downloadFrom, localMember } from "./fixtures/download";

const sheet = "/en/actors/tang-yunqiu/sheet";
const ready = 'canvas[data-preview-ready="true"]';

test("the sheet page previews the recommended picks and switches presets", async ({ page }) => {
  await page.goto(sheet);
  await expect(page.getByRole("heading", { level: 1, name: /Tang Yunqiu/ })).toBeVisible();
  await expect(page.locator(ready)).toHaveCount(1, { timeout: 15_000 });
  await expect(page.getByText("10 selected, up to 16")).toBeVisible();
  await expect(page.getByRole("button", { name: "Recommended", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Expressions", exact: true }).click();
  await expect(page.getByText("12 selected, up to 16")).toBeVisible();
  await expect(page).toHaveURL(/preset=expressions$/);
  await expect(page.locator(ready)).toHaveCount(1, { timeout: 15_000 });
});

test("ticking a thumb switches to custom, updates the address and stops at the limit", async ({
  page,
}) => {
  await page.goto(`${sheet}?preset=expressions`);
  await expect(page.locator(ready)).toHaveCount(1, { timeout: 15_000 });
  await page.locator('[data-asset-slot="face.three-quarter"] input').first().check({ force: true });
  await expect(page.getByRole("button", { name: "Custom", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page).toHaveURL(/preset=custom&slots=.*face\.three-quarter/);
  await expect(page.getByText("13 selected, up to 16")).toBeVisible();
  for (const slot of ["face.side", "face.three-quarter-left", "face.side-right"])
    await page.locator(`[data-asset-slot="${slot}"] input`).first().check({ force: true });
  await expect(page.getByText("16 selected, up to 16")).toBeVisible();
  // At the limit the tick is refused: the box stays unticked and the count does not move.
  await page.locator('[data-asset-slot="face.up"] input').first().click({ force: true });
  await expect(page.getByText("16 selected, up to 16")).toBeVisible();
  await expect(
    page.getByText("One sheet holds up to 16 images, at most 8 of them full-body."),
  ).toBeVisible();
  await expect(page.locator('[data-asset-slot="face.up"] input').first()).not.toBeChecked();
});

test("a link with picks opens with exactly those images ticked", async ({ page }) => {
  await page.goto(`${sheet}?preset=custom&slots=turnaround.front,face.front,expression.smile`);
  await expect(page.getByText("3 selected, up to 16")).toBeVisible();
  await expect(page.locator('[data-asset-slot="turnaround.front"] input').first()).toBeChecked();
  await expect(page.locator('[data-asset-slot="face.front"] input').first()).toBeChecked();
  await expect(page.locator('[data-asset-slot="expression.smile"] input').first()).toBeChecked();
  await expect(page.locator('[data-asset-slot="face.side"] input').first()).not.toBeChecked();
});

test("a signed-out download starts sign-in and the picks survive the round trip", async ({
  page,
}) => {
  await page.goto(`${sheet}?preset=custom&slots=turnaround.front,face.front`);
  const download = page.getByRole("button", { name: "Download sheet", exact: true });
  await expect(download).not.toHaveAttribute("aria-busy", "true", { timeout: 15_000 });
  await download.click();
  await expect(page.locator("[data-account-menu]").first()).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/preset=custom&slots=turnaround\.front,face\.front$/);
  await expect(page.getByText("2 selected, up to 16")).toBeVisible();
});

test("a signed-in member downloads the sheet as a PNG", async ({ page, context }) => {
  await localMember(context);
  await page.goto(`${sheet}?preset=custom&slots=turnaround.front,face.front`);
  await expect(page.locator(ready)).toHaveCount(1, { timeout: 15_000 });
  const download = page.getByRole("button", { name: "Download sheet", exact: true });
  await expect(download).not.toHaveAttribute("aria-busy", "true", { timeout: 15_000 });
  const result = await downloadFrom(page, download);
  expect(result.name).toBe("tang-yunqiu_sheet.png");
  expect(result.bytes.subarray(1, 4).toString()).toBe("PNG");
});

test("ticking voice and prompt adds a ZIP with the clips under voice/ and the prompt files", async ({
  page,
  context,
}) => {
  await localMember(context);
  await page.goto(`${sheet}?preset=custom&slots=turnaround.front,face.front&voice=1&prompt=1`);
  await expect(page.locator(ready)).toHaveCount(1, { timeout: 15_000 });
  const download = page.getByRole("button", { name: "Download sheet and files", exact: true });
  await expect(download).not.toHaveAttribute("aria-busy", "true", { timeout: 15_000 });
  const result = await downloadFrom(page, download);
  expect(result.name).toBe("tang-yunqiu_sheet.zip");
  const files = unzipSync(result.bytes);
  const names = Object.keys(files).sort();
  expect(names.filter((name) => name.startsWith("voice/"))).toHaveLength(7);
  expect(names).toEqual(
    expect.arrayContaining([
      "tang-yunqiu_sheet.png",
      "prompt.txt",
      "character.json",
      "LICENSE.txt",
      "README.txt",
    ]),
  );
  expect(strFromU8(files["README.txt"])).toContain("Credit: Tang Yunqiu · Swim In AI");
});

test("the sheet page keeps its controls reachable on a phone without sideways scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(sheet);
  await expect(page.locator(ready)).toHaveCount(1, { timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Download sheet", exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});
