import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { ACTORS } from "../src/content/actors";
import { OFFICIAL_SAMPLES } from "../src/content/official-samples.generated";
import { WORKS, WORK_STATUS_LABEL } from "../src/content/works";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

const report = ".devspace-reports/next-stage/a2";
for (const locale of ["en", "zh"] as const) {
  test(`A2 home order and honest counts: ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("[data-home-section]")).toHaveCount(6);
    expect(
      await page
        .locator("[data-home-section]")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-home-section"))),
    ).toEqual(["hero", "samples", "ready", "new-faces", "credit", "updates"]);
    const ready = ACTORS.filter((actor) => actor.status === "active");
    const faces = ACTORS.filter((actor) => actor.status === "new-face");
    await expect(page.locator("[data-ready-count]")).toHaveAttribute(
      "data-ready-count",
      String(ready.length),
    );
    await expect(page.locator("[data-new-face-count]")).toHaveAttribute(
      "data-new-face-count",
      String(faces.length),
    );
    const listed = async (section: string) =>
      page
        .locator(`[data-home-section="${section}"] [data-actor-card]`)
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-actor-card")));
    expect(await listed("ready")).toEqual(ready.slice(0, 4).map((actor) => actor.slug));
    const selectedFaces = await listed("new-faces");
    expect(selectedFaces).toHaveLength(Math.min(2, faces.length));
    expect(new Set(selectedFaces).size).toBe(selectedFaces.length);
    for (const slug of selectedFaces) expect(faces.some((actor) => actor.slug === slug)).toBe(true);
    if (new Set(faces.map((actor) => actor.voiceLanguage).filter(Boolean)).size > 1) {
      expect(
        new Set(
          selectedFaces.map((slug) => faces.find((actor) => actor.slug === slug)?.voiceLanguage),
        ).size,
      ).toBe(2);
    }
    for (const work of WORKS)
      await expect(page.locator("main").getByText(work.title[locale], { exact: true })).toHaveCount(
        0,
      );
    await expect(page.locator('[data-home-section="updates"]')).not.toContainText(/v\d+\.\d+/);
    await expect(page.locator('footer a[href$="/studio#work-with-us"]')).toBeVisible();
  });
  test(`A2 Studio projects preserve real status and detail routes: ${locale}`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: locale === "en" ? 1440 : 390, height: 900 });
    await page.goto(`/${locale}/studio`);
    const projects = page.locator("[data-studio-projects]");
    for (const work of WORKS) {
      const card = projects.locator(`[data-project="${work.slug}"]`);
      await expect(card).toContainText(work.title[locale]);
      await expect(card).toContainText(WORK_STATUS_LABEL[work.status][locale]);
      expect((await request.get(`/${locale}/works/${work.slug}`)).status()).toBe(200);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await mkdir(report, { recursive: true });
    await projects.screenshot({ path: `${report}/studio-${locale}.png` });
  });
  for (const theme of ["light", "dark"] as const) {
    for (const width of [390, 1440]) {
      test(`A2 home screenshot and first-screen task: ${locale} ${theme} ${width}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(`/${locale}`);
        await expect(page.locator("html")).toHaveAttribute("data-game-ui-theme", theme);
        await page.evaluate(() => document.fonts.ready);
        const hero = page.locator('[data-home-section="hero"]');
        const cta = hero.getByRole("link", {
          name: (locale === "en" ? en : zh)["home.ctaAssets"],
          exact: true,
        });
        await expect(cta).toBeInViewport();
        // Owner 2026-10-22: record exact first-fold coverage as post-launch UX evidence, not a release blocker.
        await expect(hero.locator("video")).toBeInViewport();
        const heroVideoBounds = await hero.locator("video").boundingBox();
        await expect(cta).toHaveAttribute("href", `/${locale}/actors`);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        const text = await page.locator("main#main").innerText();
        const words = Array.from(
          new Intl.Segmenter(locale, { granularity: "word" }).segment(text),
        ).filter((part) => part.isWordLike).length;
        const characters = text.replace(/\s/g, "").length;
        // A1's visible main content: EN 372 words, ZH 748 non-whitespace characters.
        if (locale === "en") expect(words).toBeLessThanOrEqual(225);
        else expect(characters).toBeLessThanOrEqual(450);
        await mkdir(report, { recursive: true });
        const name = `home-${locale}-${theme}-${width}`;
        if (width === 390) await page.screenshot({ path: `${report}/${name}.viewport.png` });
        await page.screenshot({ path: `${report}/${name}.png`, fullPage: true });
        // Capture the resting layout before testing the UIKit keyboard-focus animation.
        await cta.focus();
        await expect(cta).toBeFocused();
        await writeFile(
          `${report}/${name}.json`,
          JSON.stringify(
            {
              locale,
              theme,
              width,
              words,
              characters,
              text,
              heroVideoBounds,
              viewport: page.viewportSize(),
            },
            null,
            2,
          ),
        );
      });
    }
  }
}

test("A2 home plays only approved clips on demand, without duplicated hero cards", async ({
  page,
}) => {
  await page.goto("/en");
  const videos = page.locator("main video");
  const sources = await page
    .locator("main [data-sample-id]")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-sample-id")));
  expect(sources.length).toBe(3);
  expect(new Set(sources).size).toBe(sources.length);
  for (const src of sources)
    expect(OFFICIAL_SAMPLES.some((sample) => sample.sampleId === src)).toBe(true);
  for (const video of await videos.all()) {
    await expect(video).toHaveAttribute("preload", "none");
    await expect(video).not.toHaveAttribute("src");
    expect(
      await video.evaluate((node: HTMLVideoElement) => node.paused && !node.autoplay && !node.loop),
    ).toBe(true);
  }
  const hero = page.locator('[data-home-section="hero"] video');
  await page
    .locator('[data-home-section="hero"]')
    .getByRole("button", { name: /Play sample/ })
    .click();
  await expect
    .poll(() => hero.evaluate((video: HTMLVideoElement) => video.currentTime))
    .toBeGreaterThan(0);
  await hero.evaluate((video: HTMLVideoElement) => video.pause());
});
