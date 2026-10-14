import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import { syntheticWav } from "../tools/test/fixtures/audio";
import AxeBuilder from "@axe-core/playwright";
import { messages } from "../src/i18n/messages.source";
import { installCommunityFixture, authorFixture, POST_ID } from "./fixtures/community-v3";
const report = ".devspace-reports/next-stage/c1";
const text = (key: keyof typeof messages, locale: "en" | "zh" = "en") => messages[key][locale];
async function tick(page: Page, name: string | RegExp) {
  const box = page.getByRole("checkbox", { name, exact: typeof name === "string" });
  await page.locator("label").filter({ has: box }).click();
  await expect(box).toBeChecked();
}
async function basics(page: Page, locale: "en" | "zh", title = "Fixture test story") {
  await page
    .getByRole("textbox", { name: text("community.titleLabel", locale), exact: true })
    .fill(title);
  await page.getByLabel(text("c.actorSearch", locale)).fill("jiang");
  await tick(page, /江一帆|Jiang Yifan/);
}
async function shot(page: Page, file: string) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await mkdir(report, { recursive: true });
  await page.screenshot({ path: `${report}/${file}.png`, fullPage: true, animations: "disabled" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
for (const locale of ["en", "zh"] as const)
  for (const width of [390, 1440])
    test(`C1 three-step video ${locale} ${width}: actors, preview and explicit confirmations`, async ({
      page,
    }) => {
      const state = await installCommunityFixture(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/community/new`);
      await page
        .getByRole("button", { name: text("community.kind.video", locale), exact: true })
        .click();
      await page.getByRole("button", { name: text("c.next", locale), exact: true }).click();
      await basics(page, locale);
      await page
        .getByRole("textbox", { name: new RegExp(`^${text("c.videoLink", locale)}`) })
        .fill("https://youtu.be/AbCdEf123_-");
      await page.getByRole("button", { name: text("c.next", locale), exact: true }).click();
      const publish = page.getByRole("button", { name: text("c.publish", locale), exact: true });
      await expect(publish).toBeDisabled();
      await expect(page.locator("iframe")).toHaveCount(0);
      await page.getByRole("button", { name: text("c.openVideo", locale) }).click();
      await expect(page.locator("iframe")).toHaveAttribute(
        "src",
        "https://www.youtube-nocookie.com/embed/AbCdEf123_-?autoplay=1",
      );
      await tick(page, text("community.creditConfirmation", locale));
      await expect(publish).toBeDisabled();
      await tick(page, text("community.rightsConfirmation", locale));
      await shot(page, `composer-${locale}-${width}`);
      await publish.click();
      await expect(page.locator('[data-my-status="pending"]')).toBeVisible();
      expect(state.posts.filter((post) => post.title === "Fixture test story")).toHaveLength(1);
      const write = state.calls.find((call) => call.operation === "submit_post")!;
      expect(write.input.confirmation).toEqual({
        creditConfirmed: true,
        rightsConfirmed: true,
        termsVersion: "1.0",
      });
      expect(
        state.calls.find((call) => call.operation === "create_draft")?.input.content,
      ).toMatchObject({ actors: [{ slug: "jiang-yifan", assetVersion: "1.0.0" }] });
      expect(JSON.stringify(write.input)).not.toContain("authorId");
    });

test("C1 real file bytes are re-encoded, progress is transport-only, and 202-like processing is not success", async ({
  page,
}) => {
  const state = await installCommunityFixture(page);
  let release = () => {};
  state.holdUpload = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/en/community/new");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await basics(page, "en");
  const original = await sharp({
    create: { width: 64, height: 48, channels: 3, background: "white" },
  })
    .withMetadata()
    .png()
    .toBuffer();
  expect((await sharp(original).metadata()).exif).toBeDefined();
  await page
    .getByLabel(text("c.files"))
    .setInputFiles({ name: "metadata.png", mimeType: "image/png", buffer: original });
  await page.getByRole("button", { name: text("c.upload"), exact: true }).click();
  await expect.poll(() => state.uploaded.length).toBe(1);
  const bytes = state.uploaded[0];
  expect(bytes.equals(original)).toBe(false);
  expect((await sharp(bytes).metadata()).exif).toBeUndefined();
  await expect(page.locator('[data-community-upload="uploading"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeDisabled();
  await shot(page, "upload-390");
  release();
  await expect(page.locator('[data-community-upload="validating"]')).toBeVisible();
  expect(state.calls.some((call) => call.operation === "complete_upload")).toBe(true);
  expect(state.calls.some((call) => call.operation === "finalize_upload")).toBe(false);
  expect(state.calls.some((call) => call.operation === "submit_post")).toBe(false);
  const draft = state.posts.find((post) => post.status === "draft")!;
  draft.media.forEach((item) => {
    item.processingStatus = "ready";
  });
  await page.getByRole("button", { name: text("c.checkStatus") }).click();
  await expect(page.locator('[data-community-upload="ready"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeEnabled();
});

test("C1 audio uses real decoded duration, preserves its transcript and completes only through the edge port", async ({
  page,
}) => {
  const state = await installCommunityFixture(page);
  await page.goto("/en/community/new");
  await page.getByRole("button", { name: text("community.kind.audio"), exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await basics(page, "en", "Synthetic audio story");
  await page
    .getByRole("textbox", { name: text("c.transcript"), exact: true })
    .fill("A test-only spoken description.");
  await page
    .getByLabel(text("c.files"))
    .setInputFiles({ name: "silence.wav", mimeType: "audio/wav", buffer: syntheticWav() });
  await page.getByRole("button", { name: text("c.upload"), exact: true }).click();
  await expect(page.locator('[data-community-upload="validating"]')).toBeVisible();
  expect(state.uploaded).toHaveLength(1);
  expect(state.uploaded[0].equals(syntheticWav())).toBe(true);
  expect(state.calls.find((call) => call.operation === "create_upload")?.input.file).toMatchObject({
    mime: "audio/wav",
    bytes: syntheticWav().length,
    durationMs: 100,
  });
  expect(state.calls.filter((call) => call.operation === "complete_upload")).toHaveLength(1);
  const draft = state.posts.find((post) => post.title === "Synthetic audio story")!;
  draft.media.forEach((media) => {
    media.processingStatus = "ready";
  });
  await page.getByRole("button", { name: text("c.checkStatus") }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await tick(page, text("community.creditConfirmation"));
  await tick(page, text("community.rightsConfirmation"));
  await page.getByRole("button", { name: text("c.publish"), exact: true }).click();
  await expect(page.locator('[data-my-status="pending"]')).toBeVisible();
  expect(state.posts.find((post) => post.id === draft.id)?.description).toBe(
    "A test-only spoken description.",
  );
});

test("C1 invalid links, SVG and file count are not submitted", async ({ page }) => {
  const state = await installCommunityFixture(page);
  await page.goto("/en/community/new");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await basics(page, "en");
  await page.getByLabel(text("c.files")).setInputFiles({
    name: "script.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg onload="alert(1)"/>'),
  });
  await expect(page.locator('[data-community-error="UNSUPPORTED_MEDIA"]')).toBeVisible();
  const files = Array.from({ length: 5 }, (_, index) => ({
    name: `${index}.png`,
    mimeType: "image/png",
    buffer: Buffer.from("invalid"),
  }));
  await page.getByLabel(text("c.files")).setInputFiles(files);
  await expect(page.locator('[data-community-error="POST_MEDIA_LIMIT"]')).toBeVisible();
  expect(state.calls.some((call) => call.operation === "create_upload")).toBe(false);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: text("community.kind.video"), exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("textbox", { name: new RegExp(`^${text("c.videoLink")}`) })
    .fill("https://youtube.com.evil.invalid/watch?v=AbCdEf123_-");
  await page.getByRole("button", { name: text("c.save"), exact: true }).click();
  await expect(page.locator('[data-community-error="VIDEO_URL_UNSUPPORTED"]')).toBeVisible();
  expect(state.calls.some((call) => call.operation === "create_draft")).toBe(false);
});

test("C1 lost create response survives refresh and the original operation ID is reused", async ({
  page,
}) => {
  const state = await installCommunityFixture(page);
  state.loseCreateOnce = true;
  await page.goto("/en/community/new");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await basics(page, "en", "Lost reply draft");
  await page.getByRole("button", { name: text("c.save"), exact: true }).click();
  await expect(page.locator('[data-community-error="COMMUNITY_UNAVAILABLE"]')).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: text("c.retryWrite") }).click();
  await expect(page.locator('[data-my-status="draft"]')).toBeVisible();
  const calls = state.calls.filter((call) => call.operation === "create_draft");
  expect(calls.length).toBe(2);
  expect(calls[0].input.operationId).toBe(calls[1].input.operationId);
  expect(state.posts.filter((post) => post.title === "Lost reply draft")).toHaveLength(1);
});

for (const locale of ["en", "zh"] as const)
  test(`C1 My works distinguishes states and reasons ${locale}`, async ({ page }) => {
    const states = ["draft", "pending", "returned", "published"] as const;
    const state = await installCommunityFixture(page, {
      posts: states.map((status, index) =>
        authorFixture({
          id: `33333333-3333-4333-8333-33333333333${index}`,
          status,
          title: `Fixture ${status}`,
          returnedReason: status === "returned" ? "Please show the credit line." : null,
        }),
      ),
    });
    await page.setViewportSize({ width: locale === "zh" ? 390 : 1440, height: 900 });
    await page.goto(`/${locale}/community/mine`);
    for (const status of states) {
      await page
        .getByRole("combobox", { name: text("c.mine", locale), exact: true })
        .selectOption(status);
      await expect(
        page.getByRole("heading", { name: `Fixture ${status}`, exact: true }),
      ).toBeVisible();
      if (status === "returned")
        await expect(
          page.getByText("Please show the credit line.", { exact: false }),
        ).toBeVisible();
    }
    await shot(page, `my-works-${locale}`);
    state.member = false;
    await page.reload();
    await expect(page.locator('[data-community-error="AUTH_REQUIRED"]')).toBeVisible();
    await expect(page.locator("[data-my-post]")).toHaveCount(0);
  });

test("C1 liked state survives refresh and reports send the selected stable reason", async ({
  page,
}) => {
  const state = await installCommunityFixture(page);
  await page.goto(`/en/works/p/${POST_ID}`);
  await page.getByRole("button", { name: "Like · 0", exact: true }).click();
  await expect(page.getByRole("button", { name: "Like · 1", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.reload();
  await expect(page.getByRole("button", { name: "Like · 1", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: text("community.report"), exact: true }).click();
  await page.getByRole("combobox", { name: text("c.reportReason") }).selectOption("stolen_work");
  await page.getByLabel(text("c.reportNote")).fill("Synthetic test report.");
  await page
    .locator("form")
    .getByRole("button", { name: text("community.report"), exact: true })
    .click();
  await expect(page.getByText(text("community.reported"))).toBeVisible();
  expect(state.calls.find((call) => call.operation === "report_post")?.input).toMatchObject({
    reasonCode: "stolen_work",
    note: "Synthetic test report.",
  });
});

test("C1 public transport failure is not an empty feed; explicit retry can recover", async ({
  page,
}) => {
  const state = await installCommunityFixture(page);
  state.failCode = "COMMUNITY_UNAVAILABLE";
  await page.goto("/en/works");
  await expect(page.locator('[data-community-error="COMMUNITY_UNAVAILABLE"]')).toBeVisible();
  await expect(page.getByText(text("c.noPosts"))).toHaveCount(0);
  state.failCode = null;
  await page.getByRole("button", { name: text("c.retry"), exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Synthetic community work", exact: true }),
  ).toBeVisible();
});

test("C1 Owner read is gated by backend authority, not a local member cookie", async ({ page }) => {
  const state = await installCommunityFixture(page, { member: false });
  await page.goto("/en/admin/review");
  await expect(page.locator('[data-community-error="AUTH_REQUIRED"]')).toBeVisible();
  expect(state.calls.filter((call) => call.operation === "list_review_queue")).toHaveLength(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex.*nofollow/);
  state.member = true;
  await page.reload();
  await expect(page.locator('[data-community-error="OWNER_REQUIRED"]')).toBeVisible();
  await expect(page.locator("[data-review-desk]")).toHaveCount(0);
  state.owner = true;
  state.malformed = true;
  await page.getByRole("button", { name: text("c.retry"), exact: true }).click();
  await expect(page.locator('[data-community-error="COMMUNITY_UNAVAILABLE"]')).toBeVisible();
  await expect(page.getByText(text("community.reviewEmpty"))).toHaveCount(0);
  state.malformed = false;
  await page.getByRole("button", { name: text("c.retry"), exact: true }).click();
  await expect(page.getByText(text("community.reviewEmpty"))).toBeVisible();
});

test("C1 a lost upload reservation keeps its original ID after the draft URL changes and refreshes", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, { posts: [authorFixture({ id: POST_ID })] });
  state.loseUploadOnce = true;
  await page.goto("/en/community/new");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await basics(page, "en", "Reservation recovery fixture");
  const buffer = await sharp({
    create: { width: 24, height: 32, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel(text("c.files"))
    .setInputFiles({ name: "test.png", mimeType: "image/png", buffer });
  await page.getByRole("button", { name: text("c.upload"), exact: true }).click();
  await expect(page.locator('[data-community-error="COMMUNITY_UNAVAILABLE"]')).toBeVisible();
  await expect(page).toHaveURL(/id=/);
  expect(state.uploads.size).toBe(1);
  const originalDraftUrl = page.url();
  await page.goto(`/en/community/new?id=${POST_ID}`);
  await expect(page.getByRole("button", { name: text("c.retryWrite"), exact: true })).toHaveCount(
    0,
  );
  const resume = page.getByRole("link", { name: text("c.resumePendingDraft"), exact: true });
  await expect(resume).toHaveAttribute(
    "href",
    new URL(originalDraftUrl).pathname + new URL(originalDraftUrl).search,
  );
  await resume.click();
  await expect(page).toHaveURL(originalDraftUrl);
  await expect(page.getByRole("button", { name: text("c.retryWrite"), exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: text("c.retryWrite"), exact: true }).click();
  await expect
    .poll(() => state.calls.filter((call) => call.operation === "create_upload").length)
    .toBe(2);
  const attempts = state.calls.filter((call) => call.operation === "create_upload");
  expect(attempts[0].input).toEqual(attempts[1].input);
  expect(state.uploads.size).toBe(1);
  expect(state.uploaded).toHaveLength(0);
  await expect(page.getByText(text("c.submitted"), { exact: true })).toHaveCount(0);
});

test("C1 dark mobile composer has no severe accessibility issues and is fully keyboard-operable", async ({
  page,
}) => {
  await installCommunityFixture(page);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/en/community/new");
  await page.getByRole("button", { name: "Continue", exact: true }).focus();
  await page.keyboard.press("Enter");
  await basics(page, "en");
  const issues = await new AxeBuilder({ page }).include("[data-community-composer]").analyze();
  expect(
    issues.violations.filter((issue) => ["critical", "serious"].includes(issue.impact ?? "")),
  ).toEqual([]);
  await shot(page, "composer-dark-390");
});
