import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { localMember, downloadFrom } from "./fixtures/download";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

async function announce(page: Page, kind: string) {
  await page.evaluate(
    (value) => window.dispatchEvent(new CustomEvent("sp-first-use", { detail: { kind: value } })),
    kind,
  );
}
const notice = (page: Page) => page.locator("[data-first-use]");

test("A8 no arrival pop-up; an actual first cast action offers dismissible help once", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/actors/tang-yunqiu");
  await expect(notice(page)).toHaveCount(0);
  const add = page.getByRole("button", { name: en["cast.add"], exact: true });
  await add.click();
  await expect(notice(page)).toHaveAttribute("data-first-use", "cast");
  const trigger = notice(page).getByRole("button", {
    name: en["firstUse.cast.title"],
    exact: true,
  });
  await trigger.focus();
  const card = page.getByRole("dialog", { name: en["firstUse.cast.title"], exact: true });
  await expect(card).toBeVisible();
  await expect(card.getByRole("link", { name: en["help.fullGuide"] })).toHaveAttribute(
    "href",
    "/en/guide",
  );
  await expect(page.locator("[data-download-account]").first()).toBeVisible();
  await mkdir(".devspace-reports/next-stage/a8", { recursive: true });
  await page.screenshot({ path: ".devspace-reports/next-stage/a8/first-cast-desktop.png" });
  await page.keyboard.press("Escape");
  await expect(card).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await notice(page).getByRole("button", { name: en["firstUse.dismiss"] }).click();
  await expect(notice(page)).toHaveCount(0);
  await page.reload();
  await expect(page).toHaveURL(/\/en\/actors\/tang-yunqiu$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tang Yunqiu");
  await announce(page, "cast");
  await expect(notice(page)).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("sp-first-use-v1:cast"))).toBe("seen");
});

test("A8 four controller events queue without consuming topics that have not appeared", async ({
  page,
}) => {
  await page.goto("/en/guide");
  await page.getByRole("heading", { level: 1 }).waitFor();
  for (const kind of ["download", "cast", "post", "vote", "download", "not-a-kind"])
    await announce(page, kind);
  await expect(notice(page)).toHaveAttribute("data-first-use", "download");
  expect(await page.evaluate(() => localStorage.getItem("sp-first-use-v1:vote"))).toBeNull();
  for (const kind of ["download", "cast", "post", "vote"]) {
    await expect(notice(page)).toHaveAttribute("data-first-use", kind);
    await notice(page).getByRole("button", { name: en["firstUse.dismiss"] }).click();
  }
  await expect(notice(page)).toHaveCount(0);
  for (const kind of ["download", "cast", "post", "vote"]) await announce(page, kind);
  await expect(notice(page)).toHaveCount(0);
});

test("A8 denied storage still suppresses repeat notices in the same session", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    }),
  );
  await page.goto("/en/guide");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await announce(page, "download");
  await notice(page).getByRole("button", { name: en["firstUse.dismiss"] }).click();
  await announce(page, "download");
  await expect(notice(page)).toHaveCount(0);
});

test("A8 mobile help uses the kit, stays in bounds and respects reduced motion", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    colorScheme: "dark",
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/guide");
    await page.getByRole("heading", { level: 1 }).waitFor();
    await announce(page, "download");
    await notice(page).getByRole("button", { name: en["firstUse.download.title"] }).tap();
    const card = page.getByRole("dialog", { name: en["firstUse.download.title"] });
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(391);
    expect(
      await card.locator("video").evaluate((element: HTMLVideoElement) => element.paused),
    ).toBe(true);
    const result = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(
      result.violations.filter((issue) => ["critical", "serious"].includes(issue.impact ?? "")),
    ).toEqual([]);
    await page.screenshot({ path: ".devspace-reports/next-stage/a8/first-download-mobile.png" });
    await page.keyboard.press("Escape");
    await expect(card).toHaveCount(0);
    await notice(page).getByRole("button", { name: en["firstUse.dismiss"] }).tap();
    await expect(page.locator("[data-first-use] video")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("A8 Chinese first-use help is localized and dismissible on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/zh/guide");
  await page.getByRole("heading", { level: 1 }).waitFor();
  await announce(page, "post");
  await notice(page).getByRole("button", { name: zh["firstUse.post.title"] }).click();
  const card = page.getByRole("dialog", { name: zh["firstUse.post.title"] });
  await expect(card).toBeVisible();
  await expect(card.getByRole("link", { name: zh["help.fullGuide"] })).toHaveAttribute(
    "href",
    "/zh/guide",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: ".devspace-reports/next-stage/a8/first-post-zh-390.png" });
  await page.keyboard.press("Escape");
  await notice(page).getByRole("button", { name: zh["firstUse.dismiss"] }).click();
  await announce(page, "post");
  await expect(notice(page)).toHaveCount(0);
});

test("A8 delayed transport reports 1/2 actual files, cancels and can retry a real ZIP", async ({
  page,
  context,
}) => {
  await localMember(context);
  await page.setViewportSize({ width: 390, height: 844 });
  let release = () => {};
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  let files = 0;
  await page.route("**/api/dev-assets/**", async (route) => {
    files += 1;
    if (files === 2) await blocked;
    await route.continue().catch(() => undefined);
  });
  await page.goto("/en/actors/tang-yunqiu");
  const button = page.getByRole("button", { name: en["actor.openLibrary"], exact: true });
  await expect(button).not.toHaveAttribute("aria-busy", "true");
  const downloaded: string[] = [];
  page.on("download", (download) => downloaded.push(download.suggestedFilename()));
  await button.click();
  const progress = page.locator("[data-starter-progress]");
  await expect(progress.getByText("1 / 2 files", { exact: true })).toBeVisible();
  await expect(progress.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  expect(downloaded).toEqual([]);
  await page.screenshot({ path: ".devspace-reports/next-stage/a8/real-download-progress.png" });
  await progress.getByRole("button", { name: en["assets.cancel"], exact: true }).click();
  await expect(progress).toHaveCount(0);
  release();
  expect(downloaded).toEqual([]);
  const result = await downloadFrom(page, button);
  expect(result.name).toBe("tang-yunqiu_starter.zip");
  expect(result.bytes.subarray(0, 2).toString()).toBe("PK");
  await expect(notice(page)).toHaveAttribute("data-first-use", "download");
});
