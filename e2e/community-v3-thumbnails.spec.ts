import { test, expect, type Page, type Locator } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import AxeBuilder from "@axe-core/playwright";
import { installCommunityFixture } from "./fixtures/community-v3";
import { authorFixture, WHEN } from "../tools/test/fixtures/community-v3";
import type { AuthorPost } from "../src/contracts/community";
import { messages } from "../src/i18n/messages.source";
const text = (key: keyof typeof messages, locale: "en" | "zh" = "en") => messages[key][locale];
const out = ".devspace-reports/next-stage/community-thumbnails";
function picture(i = 0, count = 1) {
  return authorFixture({
    id: `33333333-3333-4333-8333-${String(i).padStart(12, "0")}`,
    title: `Synthetic image work ${i + 1}`,
    status: "published",
    publishedAt: WHEN,
    actors: [{ slug: i % 2 ? "fan-yiming" : "jiang-yifan", assetVersion: "1.0.0" }],
    media: Array.from({ length: count }, (_, j) => ({
      id: `44444444-4444-4444-8444-${String(i * 10 + j).padStart(12, "0")}`,
      kind: "image" as const,
      sortOrder: j,
      altText: `Synthetic geometric test image ${i + 1}.${j + 1}`,
      processingStatus: "ready" as const,
      reviewStatus: "approved" as const,
    })),
  });
}
async function fixture(page: Page, posts: AuthorPost[] = [picture()]) {
  const state = await installCommunityFixture(page, { member: false, posts });
  const image = await sharp(
    Buffer.from(
      '<svg width="480" height="360" xmlns="http://www.w3.org/2000/svg"><rect width="480" height="360" fill="#e1e8e8"/><rect x="30" y="30" width="190" height="300" fill="#507776"/><circle cx="340" cy="130" r="70" fill="#cfa85b"/><path d="M250 320L350 200L450 320Z" fill="#657a93"/></svg>',
    ),
  )
    .png()
    .toBuffer();
  const requests: { mediaId: string; mode: string }[] = [];
  const control = {
    failure: "",
    ttl: 300,
    holdId: "",
    held: null as Promise<void> | null,
    imageBroken: false,
  };
  await page.route("**/api/community/media/*", async (route) => {
    const input = route.request().postDataJSON();
    expect(input.mode).toBe("read");
    expect(input.mediaId).toBe(new URL(route.request().url()).pathname.split("/").at(-1));
    requests.push(input);
    const order = requests.length;
    if (input.mediaId === control.holdId && control.held) await control.held;
    if (control.failure === "denied")
      return route.fulfill({
        status: 404,
        json: { error: { code: "MEDIA_UNAVAILABLE", retryable: false, requestId: "fixture" } },
      });
    return route.fulfill({
      json: {
        mediaId:
          control.failure === "identity" ? "ffffffff-ffff-4fff-8fff-ffffffffffff" : input.mediaId,
        url: `https://media.fixture.invalid/${input.mediaId}.png?signature=fixture-${order}`,
        mime: control.failure === "mime" ? "audio/wav" : "image/png",
        expiresInSeconds: control.ttl,
      },
    });
  });
  await page.route("https://media.fixture.invalid/**", (route) =>
    control.imageBroken
      ? route.fulfill({ status: 404 })
      : route.fulfill({ contentType: "image/png", body: image }),
  );
  return { state, requests, control };
}
async function decoded(image: Locator) {
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0))
    .toBe(true);
}

test("public feed shows its first image without a preview click", async ({ page }) => {
  const post = picture();
  const f = await fixture(page, [post]);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/en/community");
  const card = page.locator(`[data-community-card="${post.id}"]`);
  await card.scrollIntoViewIfNeeded();
  await decoded(card.locator("img"));
  expect(f.requests).toEqual([{ mediaId: post.media[0].id, mode: "read" }]);
  await expect(card.getByRole("button", { name: text("c.openMedia"), exact: true })).toHaveCount(0);
});
for (const locale of ["en", "zh"] as const)
  for (const width of [390, 1440])
    for (const theme of ["light", "dark"] as const)
      test(`default thumbnail layout ${locale} ${width} ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        const post = picture(0, 4);
        post.media.reverse();
        const f = await fixture(page, [post, picture(1)]);
        await page.goto(`/${locale}/community`);
        const frame = page.locator("[data-community-thumbnail]").first();
        await frame.scrollIntoViewIfNeeded();
        await decoded(frame.locator("img"));
        expect(f.requests[0].mediaId).toBe(post.media.find((item) => item.sortOrder === 0)!.id);
        await expect(frame.locator("img")).toHaveCSS("object-fit", "contain");
        const box = (await frame.boundingBox())!;
        expect(Math.abs(box.width / box.height - 4 / 3)).toBeLessThan(0.02);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await expect(
          page
            .locator("[data-community-card]")
            .first()
            .getByText(locale === "en" ? "4 images" : "4 张图片", { exact: true }),
        ).toBeVisible();
        await expect(frame.getByRole("link")).toHaveAttribute(
          "href",
          `/${locale}/works/p/${post.id}`,
        );
        expect(
          await page.evaluate(() =>
            JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]),
          ),
        ).not.toContain("media.fixture.invalid");
        expect(await frame.locator("img").getAttribute("src")).not.toContain("/_next/image");
        const audit = await new AxeBuilder({ page }).analyze();
        expect(
          audit.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? "")),
        ).toEqual([]);
        await page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
          return document.fonts.ready;
        });
        await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
        await decoded(frame.locator("img"));
        await mkdir(out, { recursive: true });
        await page.screenshot({
          path: `${out}/feed-${locale}-${width}-${theme}.png`,
          fullPage: true,
          animations: "disabled",
        });
      });

test("only the cover is requested near the viewport, not every image or offscreen work", async ({
  page,
}) => {
  const posts = Array.from({ length: 12 }, (_, i) => picture(i, 4));
  const f = await fixture(page, posts);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/en/community");
  await decoded(page.locator("[data-community-thumbnail]").first().locator("img"));
  expect(f.requests.some((r) => r.mediaId === posts[11].media[0].id)).toBe(false);
  expect(f.requests.every((r) => posts.some((p) => p.media[0].id === r.mediaId))).toBe(true);
  const last = page.locator(`[data-community-thumbnail="${posts[11].media[0].id}"]`);
  await last.scrollIntoViewIfNeeded();
  await decoded(last.locator("img"));
  expect(f.requests.some((r) => r.mediaId === posts[11].media[0].id)).toBe(true);
});
for (const failure of ["denied", "mime", "identity", "image"])
  test(`thumbnail ${failure} fails closed and explicit retry recovers`, async ({ page }) => {
    const f = await fixture(page);
    f.control.failure = failure;
    f.control.imageBroken = failure === "image";
    await page.goto("/en/community");
    const frame = page.locator("[data-community-thumbnail]");
    await frame.scrollIntoViewIfNeeded();
    await expect(frame.getByText(text("c.mediaUnavailable"), { exact: true })).toBeVisible();
    await expect(frame.locator("img")).toHaveCount(0);
    expect(f.requests).toHaveLength(1);
    f.control.failure = "";
    f.control.imageBroken = false;
    await frame.getByRole("button", { name: text("c.retry"), exact: true }).click();
    await decoded(frame.locator("img"));
    expect(f.requests).toHaveLength(2);
  });

test("expiry removes the old image; denied renewal cannot retain it or loop", async ({ page }) => {
  await page.clock.install();
  const f = await fixture(page);
  f.control.ttl = 2;
  await page.goto("/en/community");
  const frame = page.locator("[data-community-thumbnail]");
  await frame.scrollIntoViewIfNeeded();
  await decoded(frame.locator("img"));
  f.control.failure = "denied";
  await page.clock.fastForward(2100);
  await expect(frame.getByText(text("c.mediaUnavailable"), { exact: true })).toBeVisible();
  await expect(frame.locator("img")).toHaveCount(0);
  expect(f.requests).toHaveLength(2);
  await page.clock.fastForward(300000);
  expect(f.requests).toHaveLength(2);
});

test("leaving a filter aborts the cover request and its late reply cannot reappear", async ({
  page,
}) => {
  const posts = [picture(), picture(1)];
  const f = await fixture(page, posts);
  let release = () => {};
  f.control.holdId = posts[0].media[0].id;
  f.control.held = new Promise<void>((resolve) => {
    release = resolve;
  });
  try {
    await page.goto("/en/community");
    await expect.poll(() => f.requests.length).toBeGreaterThan(0);
    await page
      .getByRole("combobox", { name: text("c3.actor"), exact: true })
      .selectOption("fan-yiming");
    await expect(page.locator("[data-community-card]")).toHaveCount(1);
    release();
    const image = page.locator("[data-community-thumbnail] img");
    await decoded(image);
    await expect(image).toHaveAttribute("src", new RegExp(posts[1].media[0].id));
    await expect(page.locator(`[data-community-thumbnail="${posts[0].media[0].id}"]`)).toHaveCount(
      0,
    );
  } finally {
    release();
  }
});

test("hidden tab drops its image; returning requests a fresh read grant", async ({ page }) => {
  const f = await fixture(page);
  await page.goto("/en/community");
  const frame = page.locator("[data-community-thumbnail]");
  await decoded(frame.locator("img"));
  const first = await frame.locator("img").getAttribute("src");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(frame.locator("img")).toHaveCount(0);
  expect(f.requests).toHaveLength(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await decoded(frame.locator("img"));
  expect(await frame.locator("img").getAttribute("src")).not.toBe(first);
  expect(f.requests).toHaveLength(2);
});

test("audio and external video still require a click and never invent a thumbnail", async ({
  page,
}) => {
  const audio = picture();
  audio.kind = "audio";
  audio.media[0].kind = "audio";
  const video = picture(1);
  video.kind = "video";
  video.media = [];
  video.video = {
    platform: "youtube",
    externalId: "dQw4w9WgXcQ",
    canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  };
  const state = await installCommunityFixture(page, { member: false, posts: [audio, video] });
  const external: string[] = [];
  page.on("request", (request) => {
    if (/youtube|vimeo|bilibili|media\.fixture/.test(request.url())) external.push(request.url());
  });
  await page.goto("/en/community");
  await expect(page.getByRole("button", { name: text("c.openMedia"), exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: text("c.openVideo"), exact: true })).toBeVisible();
  await expect(page.locator("iframe, [data-community-thumbnail], audio")).toHaveCount(0);
  expect(state.mediaRequests).toHaveLength(0);
  expect(external).toHaveLength(0);
});
