import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import AxeBuilder from "@axe-core/playwright";
import { messages } from "../src/i18n/messages.source";
import { ACTORS } from "../src/content/actors";
import { installCommunityFixture } from "./fixtures/community-v3";
import { authorFixture, USER_ID, WHEN } from "../tools/test/fixtures/community-v3";
import { syntheticWav } from "../tools/test/fixtures/audio";
const text = (key: keyof typeof messages, locale: "en" | "zh" = "en") => messages[key][locale];
const root = ".devspace-reports/next-stage/c3";
async function shot(page: Page, name: string) {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    return document.fonts.ready;
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await mkdir(root, { recursive: true });
  await page.screenshot({ path: `${root}/${name}.png`, fullPage: true, animations: "disabled" });
}
async function tick(page: Page, key: keyof typeof messages) {
  const box = page.getByRole("checkbox", { name: text(key), exact: true });
  await page.locator("label").filter({ has: box }).click();
  await expect(box).toBeChecked();
}
async function basics(page: Page, title: string) {
  await page.getByRole("textbox", { name: text("community.titleLabel"), exact: true }).fill(title);
  await page.getByLabel(text("c.actorSearch")).fill("jiang");
  const box = page.getByRole("checkbox", { name: /Jiang Yifan/ });
  await page.locator("label").filter({ has: box }).click();
}
function posts() {
  return Array.from({ length: 23 }, (_, i) =>
    authorFixture({
      id: `33333333-3333-4333-8333-${String(i).padStart(12, "0")}`,
      status: "published",
      publishedAt: WHEN,
      title: `Fixture work ${i}`,
      kind: i % 2 ? "audio" : "image",
      official: i === 0,
      featuredAt: i < 3 ? WHEN : null,
      actors: [{ slug: i < 5 ? "jiang-yifan" : "fan-yiming", assetVersion: "1.0.0" }],
    }),
  );
}
test("C3 real HTTP on-mode access exists without a browser fixture or memory fallback", async ({
  request,
}) => {
  const access = await request.get("/api/community/access", { maxRedirects: 0 });
  expect(access.status()).toBe(200);
  expect(await access.json()).toEqual({ mode: "on", allowed: true, owner: false });
  const result = await request.get("/api/community/v3/get_limits", { maxRedirects: 0 });
  expect(result.status()).toBe(503);
  expect((await result.json()).error.code).toBe("COMMUNITY_UNAVAILABLE");
});

for (const locale of ["en", "zh"] as const)
  for (const width of [390, 1440])
    test(`C3 public feed filters and source labels ${locale} ${width}`, async ({ page }) => {
      const state = await installCommunityFixture(page, { member: false, posts: posts() });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/community`);
      await expect(page.locator("[data-community-card]")).toHaveCount(20);
      await page.getByRole("button", { name: text("c.loadMore", locale), exact: true }).click();
      await expect(page.locator("[data-community-card]")).toHaveCount(23);
      await page
        .getByRole("combobox", { name: text("c3.sort", locale), exact: true })
        .selectOption("featured");
      await expect(page.locator("[data-community-card]")).toHaveCount(3);
      await expect(
        page
          .locator("[data-community-card]")
          .getByText(text("c3.official", locale), { exact: true }),
      ).toHaveCount(1);
      await expect(
        page
          .locator("[data-community-card]")
          .getByText(text("c3.creator", locale), { exact: true }),
      ).toHaveCount(2);
      await page
        .getByRole("combobox", { name: text("c3.kind", locale), exact: true })
        .selectOption("image");
      await expect(page.locator("[data-community-card]")).toHaveCount(2);
      await page
        .getByRole("combobox", { name: text("c3.actor", locale), exact: true })
        .selectOption("fan-yiming");
      await expect(page.getByText(text("c.noPosts", locale))).toBeVisible();
      await page
        .getByRole("combobox", { name: text("c3.actor", locale), exact: true })
        .selectOption("jiang-yifan");
      await expect(page.locator("[data-community-card]")).toHaveCount(2);
      const last = state.calls.filter((call) => call.operation === "list_posts").at(-1)!;
      expect(last.input).toMatchObject({
        cursor: null,
        filter: { kind: "image", sort: "featured", actorSlug: "jiang-yifan" },
      });
      await shot(page, `feed-${locale}-${width}`);
      if (width === 390)
        await page.getByRole("button", { name: text("common.menu", locale), exact: true }).click();
      await expect(
        page
          .getByRole("navigation", { name: text("common.mainNav", locale) })
          .filter({ visible: true })
          .getByRole("link", { name: text("nav.community", locale), exact: true }),
      ).toBeVisible();
    });
for (const kind of ["image", "audio", "video"] as const)
  test(`C3 ${kind} submits reviews publishes and deletes using the final fixture contract`, async ({
    page,
  }) => {
    const state = await installCommunityFixture(page, { owner: true, posts: [] });
    state.readyMedia = true;
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/en/community/new");
    await page.getByRole("button", { name: text(`community.kind.${kind}`), exact: true }).click();
    await page.getByRole("button", { name: text("c.next"), exact: true }).click();
    await basics(page, `C3 ${kind} workflow`);
    if (kind === "video")
      await page
        .getByRole("textbox", { name: new RegExp(text("c.videoLink")) })
        .fill("https://youtu.be/AbCdEf123_-");
    else {
      const buffer =
        kind === "image"
          ? await sharp({ create: { width: 48, height: 64, channels: 3, background: "white" } })
              .withMetadata()
              .png()
              .toBuffer()
          : syntheticWav();
      if (kind === "audio")
        await page
          .getByRole("textbox", { name: text("c.transcript"), exact: true })
          .fill("Test-only silence with creator description.");
      await page.getByLabel(text("c.files")).setInputFiles({
        name: kind === "image" ? "test.png" : "test.wav",
        mimeType: kind === "image" ? "image/png" : "audio/wav",
        buffer,
      });
      await page.getByRole("button", { name: text("c.upload"), exact: true }).click();
      await expect(page.locator('[data-community-upload="ready"]')).toBeVisible();
      const declaration = state.calls.find((call) => call.operation === "create_upload")!.input
        .file as { bytes: number; mime: string };
      expect(declaration.bytes).toBe(state.uploaded[0].length);
      expect(declaration.mime).toBe(kind === "image" ? "image/png" : "audio/wav");
      if (kind === "image")
        expect((await sharp(state.uploaded[0]).metadata()).exif).toBeUndefined();
    }
    await page.getByRole("button", { name: text("c.next"), exact: true }).click();
    await tick(page, "community.creditConfirmation");
    await tick(page, "community.rightsConfirmation");
    await page.getByRole("button", { name: text("c.publish"), exact: true }).click();
    await expect(page.locator('[data-my-status="pending"]')).toBeVisible();
    const post = state.posts.find((item) => item.title === `C3 ${kind} workflow`)!;
    expect(post.author.id).toBe(USER_ID);
    await page.goto("/en/admin/review");
    await page.getByRole("button", { name: text("c2.inspect"), exact: true }).click();
    await page.getByRole("button", { name: text("c2.apply"), exact: true }).click();
    await expect(page.getByText(text("c2.saved"), { exact: true })).toBeVisible();
    expect(post.status).toBe("published");
    await page.goto(`/en/works/p/${post.id}`);
    await expect(
      page.getByRole("heading", { name: `C3 ${kind} workflow`, exact: true }),
    ).toBeVisible();
    if (kind === "video") {
      await expect(page.locator("iframe")).toHaveCount(0);
      await page.getByRole("button", { name: text("c.openVideo"), exact: true }).click();
      await expect(page.locator("iframe")).toHaveAttribute(
        "src",
        /^https:\/\/www.youtube-nocookie.com\/embed\//,
      );
    } else {
      await page.getByRole("button", { name: text("c.openMedia"), exact: true }).click();
      if (kind === "image")
        await expect
          .poll(() =>
            page
              .locator("[data-community-media] img")
              .evaluate((img: HTMLImageElement) => img.naturalWidth),
          )
          .toBeGreaterThan(0);
      else {
        const audio = page.locator("audio");
        await audio.evaluate((node: HTMLAudioElement) => node.play());
        await expect
          .poll(() => audio.evaluate((node: HTMLAudioElement) => node.currentTime))
          .toBeGreaterThan(0);
      }
      expect(state.mediaRequests.every((request) => request.mode === "read")).toBe(true);
    }
    await shot(page, `published-${kind}-390`);
    await page.goto("/en/community/mine");
    await page
      .getByRole("combobox", { name: text("c.mine"), exact: true })
      .selectOption("published");
    const card = page.locator(`[data-my-post="${post.id}"]`);
    await card.getByRole("button", { name: text("community.delete"), exact: true }).click();
    await card.getByRole("button", { name: text("community.delete"), exact: true }).click();
    await expect(page.getByText(text("c.deleted"), { exact: true })).toBeVisible();
    expect(post.status).toBe("deleted");
    await page.goto(`/en/works/p/${post.id}`);
    await expect(page.locator('[data-community-error="POST_UNAVAILABLE"]')).toBeVisible();
    expect(state.calls.some((call) => call.operation === "finalize_upload")).toBe(false);
  });
test("C3 expired signing explicitly creates a new upload; lost completion retains one upload and operation", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, { posts: [] });
  state.readyMedia = true;
  state.expireTargetOnce = true;
  await page.goto("/en/community/new");
  await page.getByRole("button", { name: text("c.next"), exact: true }).click();
  await basics(page, "Recovery fixture");
  const buffer = await sharp({
    create: { width: 24, height: 32, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel(text("c.files"))
    .setInputFiles({ name: "test.png", mimeType: "image/png", buffer });
  await page.getByRole("button", { name: text("c.upload"), exact: true }).click();
  await expect(page.locator('[data-community-error="UPLOAD_EXPIRED"]')).toBeVisible();
  expect(state.uploads.size).toBe(1);
  state.loseWriteOnce = "complete_upload";
  await page.getByRole("button", { name: text("c3.restartUpload"), exact: true }).click();
  await expect(page.locator('[data-community-error="COMMUNITY_UNAVAILABLE"]')).toBeVisible();
  expect(state.uploads.size).toBe(2);
  await page.getByRole("button", { name: text("c.retryWrite"), exact: true }).click();
  await expect(page.locator('[data-community-upload="ready"]')).toBeVisible();
  const writes = state.calls.filter((call) => call.operation === "complete_upload");
  expect(writes).toHaveLength(2);
  expect(writes[0].input).toEqual(writes[1].input);
  expect(state.uploaded).toHaveLength(1);
  const intents = state.calls.filter((call) => call.operation === "create_upload");
  expect(intents).toHaveLength(2);
  expect(intents[0].input.operationId).not.toBe(intents[1].input.operationId);
});
test("C3 actor works use a fixed actor filter", async ({ page }) => {
  await installCommunityFixture(page, { posts: posts() });
  await page.goto("/en/actors/jiang-yifan");
  const works = page.locator('[data-actor-community="jiang-yifan"]');
  await expect(works.locator("[data-community-card]")).toHaveCount(5);
  await expect(works.getByRole("combobox", { name: text("c3.actor"), exact: true })).toBeDisabled();
});
test("C3 public actor votes persist across refresh", async ({ page }) => {
  await installCommunityFixture(page);
  const face = ACTORS.find((actor) => actor.status === "new-face")!;
  await page.goto(`/en/actors/${face.slug}`);
  const vote = page.getByRole("button", {
    name: new RegExp(text("community.voteLabel").replace("{name}", face.nameEn)),
  });
  await vote.click();
  await expect(vote).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(vote).toHaveAttribute("aria-pressed", "true");
});
// These are correctness checks after an actual response, not a five-second hydration benchmark.
function publicCountsResponse(page: Page) {
  return page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/community/v3/list_actor_votes" &&
      response.status() === 200,
  );
}
test("C3 home public counts show honest ties", async ({ page }) => {
  const state = await installCommunityFixture(page, { member: false });
  const faces = ACTORS.filter((actor) => actor.status === "new-face").slice(0, 2);
  expect(faces).toHaveLength(2);
  for (const face of faces) state.actorVotes.set(face.slug, { count: 1, voted: false });
  await page.setViewportSize({ width: 1440, height: 900 });
  const counts = publicCountsResponse(page);
  await page.goto("/en");
  await counts;
  await expect(page.locator("[data-vote-leader]")).toHaveCount(2);
  await expect(page.getByText(text("c3.tied"), { exact: true })).toHaveCount(2);
  await shot(page, "next-graduation-1440");
});
test("C3 home public counts clear stale leaders after a zero-vote reload", async ({ page }) => {
  const state = await installCommunityFixture(page, { member: false });
  const face = ACTORS.find((actor) => actor.status === "new-face")!;
  state.actorVotes.set(face.slug, { count: 1, voted: false });
  let counts = publicCountsResponse(page);
  await page.goto("/en");
  await counts;
  await expect(page.locator(`[data-vote-leader="${face.slug}"]`)).toBeVisible();
  state.actorVotes.clear();
  counts = publicCountsResponse(page);
  await page.reload();
  await counts;
  await expect(page.getByText(text("c3.noVotes"), { exact: true })).toBeVisible();
  await expect(page.locator("[data-vote-leader]")).toHaveCount(0);
});
test("C3 dark phone feed and five-item navigation fit and have no serious accessibility errors", async ({
  page,
}) => {
  await installCommunityFixture(page, { member: false, posts: posts().slice(0, 2) });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/en/community");
  await expect(page.locator("[data-community-card]")).toHaveCount(2);
  const audit = await new AxeBuilder({ page }).include("main").analyze();
  expect(
    audit.violations.filter((issue) => ["serious", "critical"].includes(issue.impact ?? "")),
  ).toEqual([]);
  await shot(page, "feed-dark-390");
  await page.setViewportSize({ width: 1024, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

// Public counts have no viewer-specific fields; an unfinished account lookup must not hold them hostage.
test("C3 public leaderboard renders while the optional account lookup is still pending", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, { member: false });
  const face = ACTORS.find((actor) => actor.status === "new-face")!;
  state.actorVotes.set(face.slug, { count: 2, voted: false });
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/auth/session", async (route) => {
    await held;
    await route.fulfill({ json: { mode: "mock", user: null } });
  });
  try {
    const counts = publicCountsResponse(page);
    await page.goto("/en");
    await counts;
    await expect(page.locator(`[data-vote-leader="${face.slug}"]`)).toBeVisible();
  } finally {
    release();
  }
});
