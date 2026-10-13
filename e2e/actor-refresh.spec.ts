import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { ACTORS } from "../src/content/actors";
import { OFFICIAL_SAMPLES } from "../src/content/official-samples.generated";
import { getActorAssets } from "../src/features/assets/assets";
const refreshSlugs = new Set([
  "bao-man",
  "du-shouren",
  "qi-changfeng",
  "fan-yiming",
  "zawadi-mwangi",
  "miriam-adler",
  "pang-tiezhu",
  "ibrahima-ndiaye",
  "annika-brandt",
  "jiang-yifan",
  "xia-zhiyao",
  "callum-reid",
  "wei-qinghe",
  "qin-lie",
  "feng-ye",
]);
// Each batch exercises every currently imported actor; the roster tool test pins the batch's exact actor set.
for (const actor of ACTORS.filter((a) => a.status === "active" && refreshSlugs.has(a.slug))) {
  for (const [locale, width] of [
    ["en", 390],
    ["en", 1440],
    ["zh", 390],
    ["zh", 1440],
  ] as const) {
    test(`A6 imported pack ${actor.slug} ${locale} ${width}`, async ({ page, request }) => {
      const assets = getActorAssets(actor.slug);
      const images = assets.items.filter((item) => item.kind === "image");
      const voices = assets.items.filter((item) => item.kind === "voice");
      const clips = OFFICIAL_SAMPLES.filter((sample) => sample.actorSlugs.includes(actor.slug));
      expect(images).toHaveLength(55);
      expect(voices).toHaveLength(6);
      expect(images.every((item) => item.conformance === "source-original")).toBe(true);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/actors/${actor.slug}`);
      await expect(page.locator(`[data-actor-dossier="${actor.slug}"]`)).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        locale === "zh" ? actor.nameCn : actor.nameEn,
      );
      await expect(page.locator('[data-asset-slot][data-delivered="true"]')).toHaveCount(
        images.length,
      );
      await expect(page.locator("[data-voice-slot]")).toHaveCount(voices.length);
      await expect(page.locator("[data-actor-sample] [data-sample-id]")).toHaveCount(clips.length);
      if (actor.slug === "zawadi-mwangi") expect(clips).toHaveLength(0);
      const hero = page.locator('img[src*="turnaround.front.large.webp"]').first();
      await expect(hero).toBeVisible();
      await expect
        .poll(() => hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
        .toBe(true);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const response = await request.get(`/api/voice/${actor.slug}/intro`);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("audio/wav");
      expect((await response.body()).subarray(0, 4).toString()).toBe("RIFF");
      const report = ".devspace-reports/next-stage/actor-refresh/actors";
      await mkdir(report, { recursive: true });
      await page.screenshot({ path: `${report}/${actor.slug}-${locale}-${width}.png` });
    });
  }
}
