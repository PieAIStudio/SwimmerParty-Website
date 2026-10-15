import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import { syntheticWav } from "../tools/test/fixtures/audio";
import { installCommunityFixture } from "./fixtures/community-v3";
import { messages } from "../src/i18n/messages.source";
import { communityOperations } from "../src/contracts/community-operations";
const text = (key: keyof typeof messages, locale: "en" | "zh") => messages[key][locale];
const requestId = "77777777-7777-4777-8777-777777777777";
const out = ".devspace-reports/next-stage/actor-catalog-sync";
for (const locale of ["en", "zh"] as const)
  for (const width of [390, 1440])
    for (const kind of ["image", "audio"] as const)
      test(`catalog rejection retains ${kind} input and gives a conditional actionable hint ${locale} ${width}`, async ({
        page,
      }) => {
        const state = await installCommunityFixture(page, { posts: [] });
        const creates: unknown[] = [];
        await page.route("**/api/community/v3/create_draft", async (route) => {
          const input = route.request().postDataJSON();
          expect(communityOperations.create_draft.input.safeParse(input).success).toBe(true);
          creates.push(input);
          await route.fulfill({
            status: 400,
            json: { error: { code: "INVALID_INPUT", retryable: false, requestId } },
          });
        });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}/community/new`);
        if (kind === "audio")
          await page
            .getByRole("button", { name: text("community.kind.audio", locale), exact: true })
            .click();
        await page.getByRole("button", { name: text("c.next", locale), exact: true }).click();
        const title = page.getByRole("textbox", {
          name: text("community.titleLabel", locale),
          exact: true,
        });
        await title.fill("Catalog test");
        await page.getByLabel(text("c.actorSearch", locale)).fill("zhang");
        const actor = page.getByRole("checkbox", { name: /张强|Zhang Qiang/ });
        await page.locator("label").filter({ has: actor }).click();
        const file =
          kind === "image"
            ? {
                name: "catalog-test.png",
                mimeType: "image/png",
                buffer: await sharp({
                  create: { width: 40, height: 32, channels: 3, background: "white" },
                })
                  .png()
                  .toBuffer(),
              }
            : { name: "catalog-test.wav", mimeType: "audio/wav", buffer: syntheticWav() };
        await page.getByLabel(text("c.files", locale)).setInputFiles(file);
        await page.getByRole("button", { name: text("c.upload", locale), exact: true }).click();
        const error = page.locator('[data-community-error="INVALID_INPUT"]');
        await expect(error).toBeVisible();
        await expect(error.locator("[data-community-draft-invalid]")).toHaveText(
          text("c.draftInvalidHint", locale),
        );
        await expect(error.locator("[data-community-request-id]")).toContainText(requestId);
        await expect(title).toHaveValue("Catalog test");
        await expect(actor).toBeChecked();
        const preparedName = kind === "image" ? "image.png" : file.name;
        await expect(page.locator("figcaption").filter({ hasText: preparedName })).toBeVisible();
        expect(creates).toHaveLength(1);
        expect(creates[0]).toMatchObject({
          content: { kind, actors: [{ slug: "zhang-qiang", assetVersion: "1.0.0" }] },
        });
        expect(state.posts).toHaveLength(0);
        expect(state.uploaded).toHaveLength(0);
        expect(
          state.calls.some((call) =>
            ["create_upload", "finalize_upload", "service_sync_site_actor"].includes(
              call.operation,
            ),
          ),
        ).toBe(false);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await page.evaluate(() => {
          window.scrollTo({ top: 0, behavior: "instant" });
          return document.fonts.ready;
        });
        await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
        await mkdir(out, { recursive: true });
        await page.screenshot({
          path: `${out}/invalid-${kind}-${locale}-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
      });

test("INVALID_INPUT outside a draft write does not claim an actor directory failure", async ({
  page,
}) => {
  const state = await installCommunityFixture(page);
  state.failCode = "INVALID_INPUT";
  await page.goto("/en/community/new");
  await expect(page.locator('[data-community-error="INVALID_INPUT"]')).toBeVisible();
  await expect(page.locator("[data-community-draft-invalid]")).toHaveCount(0);
});
