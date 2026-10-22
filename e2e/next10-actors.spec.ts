import { test, expect } from "@playwright/test";
import { ACTORS } from "../src/content/actors";

const migrations = {
  "liu-dan": "lin-xiaoman",
  "xu-li": "liu-manqing",
  "shen-xiuying": "qian-sumei",
  "ma-hong": "niu-fengying",
  "sun-hao": "lu-xingye",
  "yang-fan": "bai-yunchuan",
  "wang-yong": "zhu-youfu",
  "kate-murray": "sasha-kerr",
  "peter-hale": "ambrose-lacey",
  "grace-boateng": "ama-mensah",
};
for (const [locale, width] of [
  ["zh", 390],
  ["en", 1440],
] as const) {
  test(`next ten approved deliveries, placeholder disclosure and CC redirects: ${locale}`, async ({
    page,
    request,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    for (const [slug, oldSlug] of Object.entries(migrations)) {
      const actor = ACTORS.find((entry) => entry.slug === slug)!;
      expect(ACTORS.some((entry) => entry.slug === oldSlug)).toBe(false);
      const redirect = await request.get(`/${locale}/actors/${oldSlug}/sheet?from=casting`, {
        maxRedirects: 0,
      });
      expect(redirect.status()).toBe(308);
      expect(redirect.headers().location).toContain(`/${locale}/actors/${slug}/sheet?from=casting`);
      await page.goto(`/${locale}/actors/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        locale === "zh" ? actor.nameCn : actor.nameEn,
      );
      await expect(page.locator('[data-asset-slot][data-delivered="true"]')).toHaveCount(55);
      await expect(page.locator("[data-voice-slot]")).toHaveCount(6);
      await expect(
        page.getByText(locale === "zh" ? "占位声音" : "Placeholder voice", { exact: true }),
      ).toHaveCount(6);
      const clips = page.locator("[data-actor-sample] [data-sample-id]");
      await expect(clips).toHaveCount(4);
      await expect(clips.locator('[data-sample-tools="Grok"]')).toHaveCount(3);
      await expect(clips.locator('[data-sample-tools="Google Vids"]')).toHaveCount(1);
      expect(
        await clips.locator("video").evaluateAll((videos) =>
          videos.every((video) => {
            const media = video as HTMLVideoElement;
            return (
              media.muted &&
              !media.autoplay &&
              media.preload === "none" &&
              !media.getAttribute("src")
            );
          }),
        ),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}
