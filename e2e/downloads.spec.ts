import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
import sharp from "sharp";
import { KIT_RULES } from "../src/content/kit";

const library = "/en/kit/hu-qian";
const endpoint = "/api/assets/hu-qian/turnaround.front/download";

test("guest downloads a named original, then receives private 429 and a live cooldown invitation", async ({
  page,
}) => {
  await page.goto(library);
  await expect(page.getByRole("button", { name: "Download this image" }).first()).toBeEnabled();
  const responseEvent = page.waitForResponse(
    (response) => new URL(response.url()).pathname === endpoint,
  );
  const fileEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download this image" }).first().click();
  const response = await responseEvent;
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("private, no-store");
  const { url, filename, cooldown } = await response.json();
  expect(filename).toBe("SP-01_turnaround-front.webp");
  expect(cooldown).toBe(30);
  const original = await fileEvent;
  expect(original.suggestedFilename()).toBe(filename);
  expect(await readFile((await original.path())!)).toEqual(
    await readFile("e2e/fixtures/assets-store/synthetic.webp"),
  );
  const blocked = await page.request.get(endpoint, {
    headers: { "x-forwarded-for": "192.0.2.222" },
  });
  expect(blocked.status()).toBe(429);
  expect(Number(blocked.headers()["retry-after"])).toBeGreaterThan(0);
  expect(Number(blocked.headers()["retry-after"])).toBeLessThanOrEqual(30);
  expect(blocked.headers()["cache-control"]).toBe("private, no-store");
  await expect(page.locator("[data-asset-notice='cooldown']")).toContainText("30 seconds");
  for (const button of await page.getByRole("button", { name: "Download this image" }).all())
    await expect(button).toBeDisabled();
  await expect(page.locator("[data-cooldown]")).toHaveCount(3);
  const signed = new URL(url, "http://127.0.0.1:3399");
  signed.searchParams.set("sig", "0".repeat(64));
  expect((await page.request.get(signed.href)).status()).toBe(403);
  await page
    .locator("[data-asset-notice='cooldown']")
    .getByRole("button", { name: "Sign in with Swimmer" })
    .click();
  await expect(page.getByText("University", { exact: true })).toBeVisible();
  await expect(page.getByText("Directing", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Take the whole set with a Swimmer account");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("[data-download-selected]:visible")).toBeFocused();
});

test("mock sign-in preserves selection and produces a real ZIP with originals, bilingual profile, AI notes and the full licence", async ({
  page,
}) => {
  await page.goto(library);
  await page.getByRole("button", { name: "Select all", exact: true }).click();
  await page.getByRole("button", { name: "Download selected", exact: true }).click();
  await expect(page.getByText("University", { exact: true })).toBeVisible();
  await expect(page.getByText("Directing", { exact: true })).toBeVisible();
  const signInRequest = page.waitForRequest((request) =>
    request.url().endsWith("/api/auth/mock/sign-in"),
  );
  await Promise.all([
    page.waitForEvent("load"),
    page.getByRole("dialog").getByRole("button", { name: "Sign in with Swimmer" }).click(),
  ]);
  expect((await signInRequest).postDataJSON()).toEqual({ redirectPath: library });
  await expect(page.locator("[data-account-menu]").first()).toContainText("Signed in");
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  const cookie = (await page.context().cookies()).find((item) => item.name === "sp_mock_member");
  expect(cookie?.httpOnly).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("sp_mock_member");
  await page.getByRole("button", { name: "Download selected", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("older WebP");
  const apiEvent = page.waitForResponse((response) =>
    new URL(response.url()).pathname.endsWith("/hu-qian/bundle"),
  );
  const fileEvent = page.waitForEvent("download");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start download", exact: true })
    .click();
  const api = await apiEvent;
  expect(api.status()).toBe(200);
  expect((await api.json()).items).toHaveLength(3);
  const file = await fileEvent;
  expect(file.suggestedFilename()).toMatch(/^SP-01_assets_\d{8}\.zip$/);
  const files = unzipSync(await readFile((await file.path())!));
  expect(Object.keys(files).filter((name) => name.endsWith(".webp"))).toHaveLength(3);
  expect(files["SP-01_turnaround-front.webp"]).toEqual(
    new Uint8Array(await readFile("e2e/fixtures/assets-store/synthetic.webp")),
  );
  expect(JSON.parse(strFromU8(files["character.json"])).name).toEqual({
    en: "HU QIAN",
    zh: "胡谦",
  });
  expect(strFromU8(files["README-for-AI.txt"])).toMatch(/Image 1 \(SP-01_turnaround-front.webp\):/);
  for (const rule of KIT_RULES) expect(strFromU8(files["LICENSE.txt"])).toContain(rule.body.en);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("[data-asset-notice='started']")).toBeVisible();
  // The member bypasses the guest window even if another guest is cooling down.
  const one = await page.request.get(endpoint);
  expect(one.status()).toBe(200);
  expect(await one.json()).not.toHaveProperty("cooldown");
});

test("member sheet has a live preview and exports a 3840×2160 PNG without drawing any text", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as Window & { sheetTextCalls?: number };
    state.sheetTextCalls = 0;
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (...args: Parameters<typeof original>) {
      if ([960, 3840].includes(this.canvas.width)) state.sheetTextCalls!++;
      return original.apply(this, args);
    };
  });
  await page.request.post("/api/auth/mock/sign-in");
  await page.goto(library);
  await page.getByRole("button", { name: "Select all", exact: true }).click();
  await page.getByRole("button", { name: "Download selected", exact: true }).click();
  await page.getByRole("button", { name: "One sheet", exact: true }).click();
  await expect(page.locator("canvas[data-preview-ready='true']")).toBeVisible();
  const preview = page.locator("canvas[data-preview-ready]");
  const before = await preview.evaluate((node) => (node as HTMLCanvasElement).toDataURL());
  await page
    .getByRole("group", { name: "Background", exact: true })
    .getByRole("button", { name: "Dark grey", exact: true })
    .click();
  await expect
    .poll(() => preview.evaluate((node) => (node as HTMLCanvasElement).toDataURL()))
    .not.toBe(before);
  const fileEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Start download", exact: true }).click();
  const file = await fileEvent;
  expect(file.suggestedFilename()).toBe("SP-01_sheet.png");
  const metadata = await sharp(await readFile((await file.path())!)).metadata();
  expect([metadata.width, metadata.height, metadata.format]).toEqual([3840, 2160, "png"]);
  expect(
    await page.evaluate(() => (window as Window & { sheetTextCalls?: number }).sheetTextCalls),
  ).toBe(0);
});

test("cancelled exports do not download or discard the selected images", async ({ page }) => {
  await page.request.post("/api/auth/mock/sign-in");
  await page.goto(library);
  await page.getByRole("button", { name: "Select all", exact: true }).click();
  let downloads = 0;
  page.on("download", () => downloads++);
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/assets/hu-qian/bundle", async (route) => {
    await held;
    await route.abort();
  });
  await page.getByRole("button", { name: "Download selected", exact: true }).click();
  await page.getByRole("button", { name: "Start download", exact: true }).click();
  await expect(page.getByRole("button", { name: "Preparing…", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  release!();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  for (const check of await page.getByRole("checkbox").all()) await expect(check).toBeChecked();
  expect(downloads).toBe(0);
});

for (const width of [390, 1440])
  for (const theme of ["light", "dark"] as const) {
    test(`member controls are usable without overflow ${width} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.request.post("/api/auth/mock/sign-in");
      await page.goto("/zh/kit/hu-qian");
      await page.getByRole("button", { name: "全选本组", exact: true }).click();
      await page.getByRole("button", { name: "下载所选", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await page.getByRole("button", { name: "按模型打包", exact: true }).click();
      await page.getByLabel("模型", { exact: true }).selectOption("veo");
      await expect(page.getByRole("button", { name: "开始下载", exact: true })).toBeDisabled();
      await expect(dialog).toContainText("表情尚未交付");
      expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (process.env.CAPTURE_ASSETS === "1")
        await page.screenshot({
          path: `.devspace-reports/swimmer-family-rebuild/step5/member-${theme}-${width}.png`,
        });
      await page.keyboard.press("Escape");
      if (width < 1024) await page.getByRole("button", { name: "菜单", exact: true }).click();
      await page.locator("[data-account-menu]:visible summary").click();
      await expect(
        page.locator("[data-account-menu]:visible").getByText("本地模拟账号", { exact: true }),
      ).toBeVisible();
      await Promise.all([
        page.waitForEvent("load"),
        page.getByRole("button", { name: "退出", exact: true }).click(),
      ]);
      await expect(page.locator("[data-account-menu]")).toHaveCount(0);
    });
  }

test("local production build sends no analytics, cloud storage or account-provider requests", async ({
  page,
}) => {
  const external: string[] = [];
  const telemetry: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") external.push(url.href);
    if (url.pathname.includes("/insights") || url.pathname.includes("/analytics"))
      telemetry.push(url.href);
  });
  await page.goto(library);
  await expect(page.getByRole("button", { name: "Download this image" }).first()).toBeEnabled();
  await page.getByRole("button", { name: "Select all", exact: true }).click();
  await page.getByRole("button", { name: "Download selected", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(external).toEqual([]);
  expect(telemetry).toEqual([]);
});

test("bad JSON and oversized member bodies return private errors without severing the connection", async ({
  request,
}) => {
  await request.post("/api/auth/mock/sign-in");
  for (const [data, status] of [
    ["{", 400],
    [JSON.stringify({ slots: ["x".repeat(17_000)] }), 413],
  ] as const) {
    const response = await request.post("/api/assets/hu-qian/bundle", {
      headers: { "Content-Type": "application/json" },
      data,
    });
    expect(response.status()).toBe(status);
    expect(response.headers()["cache-control"]).toBe("private, no-store");
    expect((await response.json()).error).toBeTruthy();
  }
});
