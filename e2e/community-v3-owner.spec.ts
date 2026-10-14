import { test, expect, type Page } from "@playwright/test";
import { installCommunityFixture } from "./fixtures/community-v3";
// The affordance must follow an actual authority response, never merely a member cookie or initial HTML.
async function authorizedHome(page: Page) {
  const access = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/community/access" && response.status() === 200,
  );
  await page.goto("/en");
  expect(await (await access).json()).toEqual({ mode: "owner", allowed: true, owner: true });
}

test("C3 real HTTP community APIs stay JSON and are never locale-routed", async ({ request }) => {
  const access = await request.get("/api/community/access", { maxRedirects: 0 });
  expect(access.status()).toBe(200);
  expect(access.headers()["content-type"]).toContain("application/json");
  expect(await access.json()).toEqual({ mode: "owner", allowed: false, owner: false });
  for (const path of ["/api/community/v3/get_limits", "/api/community/review"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(503);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect((await response.json()).error.code).toBe("COMMUNITY_UNAVAILABLE");
  }
});

for (const locale of ["en", "zh"])
  for (const member of [false, true])
    test(`C3 owner mode HTTP denies ${member ? "forged member" : "anonymous"} ${locale}`, async ({
      page,
    }) => {
      await installCommunityFixture(page, { member });
      await page.unroute("**/api/community/access");
      if (member)
        await page
          .context()
          .addCookies([{ name: "sp_mock_member", value: "1", url: "http://127.0.0.1:3487" }]);
      await page.goto(`/${locale}`);
      await expect(page.locator('header a[href$="/community"]')).toHaveCount(0);
      await expect(page.locator("[data-next-graduation]")).toHaveCount(0);
      for (const path of [
        "community",
        "community/new",
        "community/mine",
        "works/p/33333333-3333-4333-8333-333333333333",
        "admin/review",
        "%63ommunity",
        "community.rsc",
        "community.prefetch.rsc",
        "community.segments/_tree.segment.rsc",
        "community/new.prefetch.rsc",
        "community/mine.prefetch.rsc",
        "admin/review.rsc",
        "admin/review.prefetch.rsc",
        "admin/review.segments/_tree.segment.rsc",
        "works/p/33333333-3333-4333-8333-333333333333.prefetch.rsc",
      ]) {
        const response = await page.request.get(`/${locale}/${path}`, { headers: { rsc: "1" } });
        expect(response.status(), path).toBe(404);
        expect(response.headers()["cache-control"]).toContain("no-store");
      }
      const sitemap = await page.request.get("/sitemap.xml");
      expect(await sitemap.text()).not.toContain("/community");
    });
test("C3 Owner affordance rechecks backend access on focus and disappears on denial", async ({
  page,
}) => {
  const state = await installCommunityFixture(page, { owner: true });
  await authorizedHome(page);
  await expect(page.locator('header a[href="/en/community"]').first()).toBeVisible();
  await page.route("**/api/community/access", (route) =>
    route.fulfill({ json: { mode: "owner", allowed: false, owner: false } }),
  );
  state.owner = false;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator('header a[href="/en/community"]')).toHaveCount(0);
  await expect(page.locator("[data-next-graduation]")).toHaveCount(0);
});

test("C3 owner-mode client guard removes an already-mounted protected view when authority changes", async ({
  page,
}) => {
  await installCommunityFixture(page, { owner: true });
  await authorizedHome(page);
  await expect(page.locator('header a[href="/en/community"]').first()).toBeVisible();
  // Exercise the mounted guard without substituting for the separate real HTTP/SDK authorization tests.
  await page.evaluate(() => window.history.pushState(null, "", "/en/community/new"));
  await expect(page.locator("[data-community-access-pending]")).toHaveCount(0);
  await page.route("**/api/community/access", (route) =>
    route.fulfill({ json: { mode: "owner", allowed: false, owner: false } }),
  );
  await page.evaluate(() => window.dispatchEvent(new Event("sp-community-access-change")));
  await expect(page.locator("[data-community-access-pending]")).toBeVisible();
  await expect(page.locator('header a[href="/en/community"]')).toHaveCount(0);
  await expect(page.locator("[data-next-graduation]")).toHaveCount(0);
});
