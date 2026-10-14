import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { messages } from "../src/i18n/messages.source";
import { installCommunityFixture } from "./fixtures/community-v3";
import { ownerFixture, USER_ID } from "../tools/test/fixtures/community-v3";
const text = (key: keyof typeof messages, locale: "en" | "zh" = "en") => messages[key][locale];
const root = ".devspace-reports/next-stage/c2";
async function shot(page: Page, file: string) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await mkdir(root, { recursive: true });
  await page.screenshot({ path: `${root}/${file}.png`, fullPage: true, animations: "disabled" });
}
async function selectPost(page: Page, locale: "en" | "zh", status = "pending") {
  await page
    .getByRole("combobox", { name: text("c2.queueStatus", locale), exact: true })
    .selectOption(status);
  await page
    .getByRole("button", { name: text("c2.inspect", locale), exact: true })
    .first()
    .click();
  await expect(page.locator("[data-review-detail]")).toBeVisible();
}
for (const locale of ["en", "zh"] as const)
  for (const width of [390, 1440])
    test(`C2 private review media reports history ${locale} ${width}`, async ({ page }) => {
      const state = await installCommunityFixture(page, {
        owner: true,
        posts: [ownerFixture({ status: "hidden", title: "Fixture hidden work" })],
      });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/admin/review`);
      await selectPost(page, locale, "hidden");
      await expect(
        page.getByText(text("c.reason.not_site_actors", locale), { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: text("c2.history", locale), exact: true }),
      ).toBeVisible();
      await expect(page.getByText("Please check actor reference.", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: text("c.openMedia", locale), exact: true }).click();
      const image = page.locator("[data-community-media] img");
      await expect(image).toBeVisible();
      await expect
        .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
        .toBeGreaterThan(0);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .map((node) => ({
            tag: node.tagName,
            className: node.className,
            text: node.textContent?.slice(0, 130),
            left: node.getBoundingClientRect().left,
            right: node.getBoundingClientRect().right,
          }))
          .filter((item) => item.right > innerWidth + 1 || item.left < -1)
          .slice(0, 16),
      );
      if (overflow.length) {
        await mkdir(root, { recursive: true });
        await writeFile(
          `${root}/overflow-${locale}-${width}.json`,
          JSON.stringify(overflow, null, 2),
        );
      }

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(state.mediaRequests.every((request) => request.mode === "review")).toBe(true);
      await expect(page.locator("[data-review-confirmations]")).toBeVisible();
      await shot(page, `review-${locale}-${width}`);
    });

test("C2 return requires a reason, records it, and submits only the reviewed revision", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  await page.goto("/en/admin/review");
  await selectPost(page, "en");
  await page.getByRole("combobox", { name: text("c2.action"), exact: true }).selectOption("return");
  const apply = page.getByRole("button", { name: text("c2.apply"), exact: true });
  await expect(apply).toBeDisabled();
  await page
    .getByRole("textbox", { name: text("c2.reason"), exact: true })
    .fill("Please add a readable credit line.");
  await apply.click();
  await expect(page.getByText(text("c2.saved"), { exact: true })).toBeVisible();
  expect(state.posts[0].status).toBe("returned");
  expect(state.posts[0].returnedReason).toBe("Please add a readable credit line.");
  expect(state.calls.find((call) => call.operation === "review_post")?.input).toMatchObject({
    expectedRevision: 1,
    action: "return",
    reason: "Please add a readable credit line.",
  });
  await selectPost(page, "en", "returned");
  await expect(page.getByText("Please add a readable credit line.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: text("c2.apply"), exact: true })).toBeDisabled();
});

test("C2 approve does not grant trust and revoke never silently hides published work", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  await page.goto("/en/admin/review");
  await selectPost(page, "en");
  await page.getByRole("button", { name: text("c2.apply"), exact: true }).click();
  await expect(page.getByText(text("c2.saved"), { exact: true })).toBeVisible();
  expect(state.calls.some((call) => call.operation === "set_author_trust")).toBe(false);
  expect(state.posts[0].status).toBe("published");
  await selectPost(page, "en", "published");
  const revoke = page.getByRole("button", { name: text("c2.revoke"), exact: true });
  await expect(revoke).toBeDisabled();
  await page
    .getByRole("textbox", { name: text("c2.revokeReason"), exact: true })
    .fill("Future submissions need review.");
  await revoke.click();
  await expect(page.getByText(text("c2.notTrusted"), { exact: true })).toBeVisible();
  expect(state.calls.find((call) => call.operation === "set_author_trust")?.input).toMatchObject({
    userId: USER_ID,
    trusted: false,
    reason: "Future submissions need review.",
  });
  expect(state.posts[0].status).toBe("published");
});

test("C2 pause is explicit and does not block existing review reads", async ({ page }) => {
  const state = await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  await page.goto("/en/admin/review");
  const pause = page.getByRole("button", { name: text("c2.pause"), exact: true });
  await expect(pause).toBeDisabled();
  await page
    .getByRole("textbox", { name: text("c2.pauseReason"), exact: true })
    .fill("Review queue is temporarily full.");
  await pause.click();
  expect(state.paused).toBe(false);
  await page.getByRole("button", { name: text("c2.confirm"), exact: true }).click();
  await expect(page.getByText(text("c2.paused"), { exact: true })).toBeVisible();
  expect(state.paused).toBe(true);
  await selectPost(page, "en");
  await expect(page.locator("[data-review-detail]")).toBeVisible();
  await page.goto("/en/community/new");
  await expect(page.locator('[data-community-error="SUBMISSIONS_PAUSED"]')).toBeVisible();
  await page.goto("/en/admin/review");
  await page
    .getByRole("textbox", { name: text("c2.pauseReason"), exact: true })
    .fill("Review capacity has recovered.");
  await page.getByRole("button", { name: text("c2.resume"), exact: true }).click();
  await page.getByRole("button", { name: text("c2.confirm"), exact: true }).click();
  await expect(page.getByText(text("c2.open"), { exact: true })).toBeVisible();
  expect(state.paused).toBe(false);
});

test("C2 a lost pause acknowledgement retries the same intent and clears the obsolete confirmation", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  state.loseWriteOnce = "set_submission_paused";
  await page.goto("/en/admin/review");
  await page
    .getByRole("textbox", { name: text("c2.pauseReason"), exact: true })
    .fill("Temporary review pause.");
  await page.getByRole("button", { name: text("c2.pause"), exact: true }).click();
  await page.getByRole("button", { name: text("c2.confirm"), exact: true }).click();
  await expect(page.locator('[data-community-error="COMMUNITY_UNAVAILABLE"]')).toBeVisible();
  expect(state.paused).toBe(true);
  await page.getByRole("button", { name: text("c.retryWrite"), exact: true }).click();
  await expect(page.getByText(text("c2.paused"), { exact: true })).toBeVisible();
  await expect(page.locator("[data-confirm-pause]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: text("c2.resume"), exact: true })).toBeVisible();
  const attempts = state.calls.filter((call) => call.operation === "set_submission_paused");
  expect(attempts).toHaveLength(2);
  expect(attempts[0].input).toEqual(attempts[1].input);
  expect(state.paused).toBe(true);
});

test("C2 privilege revoked during a write immediately clears private data and does not report success", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  await page.goto("/en/admin/review");
  await selectPost(page, "en");
  state.owner = false;
  await page.getByRole("button", { name: text("c2.apply"), exact: true }).click();
  await expect(page.locator('[data-community-error="OWNER_REQUIRED"]')).toBeVisible();
  await expect(page.locator("[data-review-desk]")).toHaveCount(0);
  await expect(page.getByText("Private test submission", { exact: true })).toHaveCount(0);
  expect(state.posts[0].status).toBe("pending");
  await expect(page.getByText(text("c2.saved"), { exact: true })).toHaveCount(0);
});

test("C2 an Owner media access refusal also clears the private review view", async ({ page }) => {
  const state = await installCommunityFixture(page, {
    owner: true,
    posts: [ownerFixture({ status: "hidden" })],
  });
  await page.goto("/en/admin/review");
  await selectPost(page, "en", "hidden");
  state.owner = false;
  await page.getByRole("button", { name: text("c.openMedia"), exact: true }).click();
  await expect(page.locator('[data-community-error="OWNER_REQUIRED"]')).toBeVisible();
  await expect(page.locator("[data-review-desk]")).toHaveCount(0);
  await expect(page.getByText("Private test submission", { exact: true })).toHaveCount(0);
});

test("C2 stale revision requires explicit refresh, never silent overwrite", async ({ page }) => {
  const state = await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  await page.goto("/en/admin/review");
  await selectPost(page, "en");
  state.posts[0].revision = 2;
  await page.getByRole("button", { name: text("c2.apply"), exact: true }).click();
  await expect(page.locator('[data-community-error="REVISION_CONFLICT"]')).toBeVisible();
  expect(state.calls.filter((call) => call.operation === "review_post")).toHaveLength(1);
  expect(state.posts[0].status).toBe("pending");
  await page.getByRole("button", { name: text("c.retry"), exact: true }).click();
  await expect(page.getByText("Revision 2", { exact: false })).toBeVisible();
});

test("C2 a failed later action cannot keep showing an earlier success notice", async ({ page }) => {
  const state = await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  await page.goto("/en/admin/review");
  await selectPost(page, "en");
  await page.getByRole("button", { name: text("c2.apply"), exact: true }).click();
  await expect(page.getByText(text("c2.saved"), { exact: true })).toBeVisible();
  await page
    .getByRole("textbox", { name: text("c2.revokeReason"), exact: true })
    .fill("Synthetic review reason.");
  state.failCode = "COMMUNITY_UNAVAILABLE";
  await page.getByRole("button", { name: text("c2.revoke"), exact: true }).click();
  await expect(page.locator('[data-community-error="COMMUNITY_UNAVAILABLE"]')).toBeVisible();
  await expect(page.getByText(text("c2.saved"), { exact: true })).toHaveCount(0);
  expect(state.posts[0].status).toBe("published");
});

test("C2 lost review response replays only the original decision ID", async ({ page }) => {
  const state = await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  state.loseWriteOnce = "review_post";
  await page.goto("/en/admin/review");
  await selectPost(page, "en");
  await page.getByRole("button", { name: text("c2.apply"), exact: true }).click();
  await expect(page.locator('[data-community-error="COMMUNITY_UNAVAILABLE"]')).toBeVisible();
  await page.getByRole("button", { name: text("c.retryWrite"), exact: true }).click();
  await expect(page.getByText(text("c2.saved"), { exact: true })).toBeVisible();
  const calls = state.calls.filter((call) => call.operation === "review_post");
  expect(calls).toHaveLength(2);
  expect(calls[0].input).toEqual(calls[1].input);
});

test("C2 hide and restore keep content revision, explain the decision and begin a new report round", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, {
    owner: true,
    posts: [ownerFixture({ status: "published" })],
  });
  await page.goto("/en/admin/review");
  await selectPost(page, "en", "published");
  await page
    .getByRole("textbox", { name: text("c2.reason"), exact: true })
    .fill("Check reported rights.");
  await page.getByRole("button", { name: text("c2.apply"), exact: true }).click();
  await expect(page.getByText(text("c2.saved"), { exact: true })).toBeVisible();
  expect(state.posts[0].status).toBe("hidden");
  expect(state.posts[0].revision).toBe(1);
  await selectPost(page, "en", "hidden");
  await page
    .getByRole("textbox", { name: text("c2.reason"), exact: true })
    .fill("Rights verified; restore this work.");
  await page.getByRole("button", { name: text("c2.apply"), exact: true }).click();
  await expect.poll(() => state.posts[0].status).toBe("published");
  expect(state.posts[0].revision).toBe(1);
  expect(state.reviewRecords.get(state.posts[0].id)?.reportRound).toBe(2);
  expect(
    state.calls.filter((call) => call.operation === "review_post").map((call) => call.input.action),
  ).toEqual(["hide", "restore"]);
});

test("C2 dark mobile Owner desk is accessible and keyboard-operable", async ({ page }) => {
  await installCommunityFixture(page, { owner: true, posts: [ownerFixture()] });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/en/admin/review");
  await selectPost(page, "en");
  const issues = await new AxeBuilder({ page }).include("[data-review-desk]").analyze();
  expect(
    issues.violations.filter((issue) => ["critical", "serious"].includes(issue.impact ?? "")),
  ).toEqual([]);
  const reason = page.getByRole("textbox", { name: text("c2.reason"), exact: true });
  await reason.focus();
  await page.keyboard.type("Keyboard review reason.");
  await expect(reason).toHaveValue("Keyboard review reason.");
  await shot(page, "review-dark-390");
});
