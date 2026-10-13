import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { OFFICIAL_SAMPLES } from "../src/content/official-samples.generated";

for (const locale of ["en", "zh"] as const)
  for (const width of [390, 1440]) {
    test(`A6 compact shared samples ${locale} ${width}`, async ({ page }) => {
      const requests: string[] = [];
      page.on("request", (r) => {
        if (/\.mp4(?:\?|$)/.test(r.url())) requests.push(r.url());
      });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/actors/tang-yunqiu`);
      const row = page.locator("[data-actor-sample] [data-sample-row]");
      await row.scrollIntoViewIfNeeded();
      const expected = OFFICIAL_SAMPLES.filter((s) => s.actorSlugs.includes("tang-yunqiu"));
      expect(expected).toHaveLength(4);
      await expect(row.locator("[data-sample-id]")).toHaveCount(4);
      for (const sample of expected) {
        const video = row.locator(`[data-sample-id="${sample.sampleId}"] video`);
        await expect(video).toHaveAttribute("preload", "none");
        await expect(video).not.toHaveAttribute("src");
        await expect(video).toHaveAttribute("poster", sample.poster);
      }
      expect(requests).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width === 390)
        expect(await row.evaluate((n) => n.scrollWidth > n.clientWidth)).toBe(true);
      const violations = (await new AxeBuilder({ page }).include("[data-actor-sample]").analyze())
        .violations;
      expect(violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual(
        [],
      );
      await mkdir(".devspace-reports/next-stage/actor-refresh/batch-1", { recursive: true });
      await page.screenshot({
        path: `.devspace-reports/next-stage/actor-refresh/batch-1/samples-${locale}-${width}.png`,
      });
      await row.getByRole("button").first().click();
      const first = row.locator("video").first();
      await expect(first).toHaveAttribute("src", expected[0].video);
      await expect
        .poll(() => first.evaluate((v: HTMLVideoElement) => v.currentTime))
        .toBeGreaterThan(0);
      expect(await first.evaluate((v: HTMLVideoElement) => v.muted && !v.autoplay && !v.loop)).toBe(
        true,
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => first.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    });
  }
test("A6 shared sample IDs reach both actor pages; zero clips create no placeholders", async ({
  page,
}) => {
  const dual = OFFICIAL_SAMPLES.find(
    (s) => s.actorSlugs.includes("tang-yunqiu") && s.actorSlugs.includes("misha-luo"),
  )!;
  expect(dual).toBeTruthy();
  for (const slug of dual.actorSlugs) {
    await page.goto(`/en/actors/${slug}`);
    await expect(
      page.locator(`[data-actor-sample] [data-sample-id="${dual.sampleId}"] video`),
    ).toHaveAttribute("poster", dual.poster);
  }
  for (const slug of ["lei-le", "zawadi-mwangi"]) {
    await page.goto(`/en/actors/${slug}`);
    await expect(page.locator("[data-actor-sample]")).toHaveCount(0);
  }
});
