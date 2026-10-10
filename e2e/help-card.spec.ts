import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ACTOR = "/en/actors/tang-yunqiu";

/** Real pointer travel: jumping straight onto the trigger is not hover intent. */
async function hoverInto(page: Page, trigger: Locator) {
  await trigger.scrollIntoViewIfNeeded();
  const box = await trigger.boundingBox();
  if (!box) throw new Error("The help trigger has no box");
  await page.mouse.move(1, 1);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
}

const helpTrigger = (page: Page) =>
  page.locator("main").getByRole("link", { name: "How it works" });
const helpCard = (page: Page) => page.getByRole("dialog", { name: "How it works" });

test("hovering the ? opens three topics, tabs change the title, and the link goes to the guide", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ACTOR);
  await hoverInto(page, helpTrigger(page));
  const card = helpCard(page);
  await expect(card).toBeVisible();
  await expect(helpTrigger(page)).toHaveAttribute("aria-expanded", "true");
  for (const name of ["Starter pack", "Sheet", "Cast"])
    await expect(card.getByRole("tab", { name: new RegExp(`^${name}`) })).toBeVisible();
  await expect(card.getByText("Two images and a prompt, ready to shoot")).toBeVisible();

  await card.getByRole("tab", { name: /^Sheet/ }).click();
  await expect(card.getByText("Pick a few, combine them into one reference")).toBeVisible();
  await card.getByRole("tab", { name: /^Cast/ }).click();
  await expect(card.getByText("Several actors, one download")).toBeVisible();

  await expect(card.getByRole("link", { name: "Full guide" })).toHaveAttribute("href", "/en/guide");
  const result = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(
    result.violations.filter((item) => ["critical", "serious"].includes(item.impact ?? "")),
  ).toEqual([]);
});

test("the Chinese card shows the Chinese topics and links to the Chinese guide", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/zh/actors/tang-yunqiu");
  await hoverInto(page, page.locator("main").getByRole("link", { name: "怎么用" }));
  const card = page.getByRole("dialog", { name: "怎么用" });
  await expect(card.getByRole("tab", { name: /^懒人包/ })).toBeVisible();
  await expect(card.getByText("两张图加提示词，马上开拍")).toBeVisible();
  await expect(card.getByRole("link", { name: "看完整说明" })).toHaveAttribute("href", "/zh/guide");
});

test("the card's clips are the recorded files for the locale", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ACTOR);
  await hoverInto(page, helpTrigger(page));
  const video = helpCard(page).locator("video");
  await expect(video).toHaveAttribute("poster", "/help/en/starter-poster.webp");
  await expect(video.locator('source[type="video/webm"]')).toHaveAttribute(
    "src",
    "/help/en/starter.webm",
  );
  await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute(
    "src",
    "/help/en/starter.mp4",
  );
  for (const path of ["/help/en/starter.mp4", "/help/zh/cast.webm", "/help/zh/sheet-poster.webp"])
    expect((await page.request.get(path)).status()).toBe(200);
});

test("the ? itself still opens the guide on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ACTOR);
  await helpTrigger(page).click();
  await expect(page).toHaveURL(/\/en\/guide$/, { timeout: 15_000 });
});

test.describe("reduced motion", () => {
  test("the poster shows and the clip does not autoplay", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ACTOR);
    await hoverInto(page, helpTrigger(page));
    const video = helpCard(page).locator("video");
    await expect(video).toHaveAttribute("poster", "/help/en/starter-poster.webp");
    await page.waitForTimeout(600);
    expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test("the first tap opens the card; the second tap follows the link", async ({ page }) => {
    await page.goto(ACTOR);
    const trigger = helpTrigger(page);
    await trigger.scrollIntoViewIfNeeded();
    await trigger.tap();
    await expect(helpCard(page)).toBeVisible();
    await expect(page).toHaveURL(/\/en\/actors\/tang-yunqiu$/);
    await trigger.tap();
    await expect(page).toHaveURL(/\/en\/guide$/, { timeout: 15_000 });
  });
});
