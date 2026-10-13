import { test, expect } from "@playwright/test";

for (const locale of ["en", "zh"] as const) {
  test(`A6 retired actors are absent from roster, routes, media and sitemap: ${locale}`, async ({
    page,
    request,
  }) => {
    await page.goto(`/${locale}/actors`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const slug of ["lei-le", "chang-shulan"]) {
      await expect(page.locator(`[data-actor-card="${slug}"]`)).toHaveCount(0);
      for (const route of [
        `/${locale}/actors/${slug}`,
        `/${locale}/actors/${slug}/sheet`,
        `/api/voice/${slug}/intro`,
        `/media/assets/${slug}/turnaround.front.webp`,
        `/media/og/${slug}.jpg`,
      ]) {
        const response = await request.get(route);
        expect(response.status(), route).toBe(404);
      }
    }
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).not.toMatch(/lei-le|chang-shulan/);
  });
}
