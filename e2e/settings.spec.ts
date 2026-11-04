import { test, expect, type BrowserContext } from "@playwright/test";
import { mkdir, readFile, readdir } from "node:fs/promises";
import { SETTING_IDS, SETTING_MANIFEST } from "../src/content/settings";
import { LICENSE } from "../src/content/license";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

// Keep the Owner's OS pasteboard untouched and isolate parallel contexts.
async function isolateClipboard(context: BrowserContext) {
  await context.addInitScript(() => {
    let clipboard = "";
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          clipboard = text;
        },
        readText: async () => clipboard,
      },
    });
  });
}

test.use({ channel: "chrome" });
for (const locale of ["en", "zh"] as const)
  for (const width of [1440, 390])
    for (const route of ["guide", "scene"] as const) {
      test(`setting cards ${route} ${locale} ${width}`, async ({ page, context }) => {
        test.setTimeout(60_000);
        const m = locale === "en" ? en : zh;
        const errors: string[] = [];
        const generationRequests: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("request", (request) => {
          if (/\/api\/generate|\/v1\/images|\/generations/.test(request.url()))
            generationRequests.push(request.url());
        });
        await mkdir("run-1/shots", { recursive: true });
        await isolateClipboard(context);
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.goto(`/${locale}/${route}`, { waitUntil: "domcontentloaded" });
        const picker = page.locator("[data-setting-picker]");
        await expect(picker.locator("[data-setting-card]")).toHaveCount(6);
        await expect(picker.locator("[data-setting-placeholder]")).toHaveCount(6);
        await expect(picker.locator("img")).toHaveCount(0);
        expect(SETTING_IDS.every((id) => SETTING_MANIFEST[id].image === null)).toBe(true);
        await page.evaluate(() => document.fonts.ready);
        await picker
          .getByRole("heading", { level: 2 })
          .evaluate((node) => node.scrollIntoView({ block: "start", behavior: "instant" }));
        await page.screenshot({ path: `run-1/shots/B-picker-${route}-${locale}-${width}.png` });
        const sentence = picker.getByLabel(m["settings.sentence"], { exact: true });
        const edits = new Map<string, string>();
        for (const id of SETTING_IDS) {
          const card = picker.locator(`[data-setting-card=${id}]`);
          const button = card.getByRole("button", { name: m[`settings.name.${id}`], exact: true });
          await button.click();
          await expect(button).toHaveAttribute("aria-pressed", "true");
          await expect(sentence).toHaveValue(m[`settings.sentence.${id}`]);
          const edited = `${m[`settings.sentence.${id}`]} ${locale === "en" ? "Test note." : "测试备注。"}`;
          edits.set(id, edited);
          await sentence.fill(edited);
          await picker.getByRole("button", { name: m["settings.copyPrompt"], exact: true }).click();
          await expect(
            picker.getByRole("button", { name: m["settings.promptCopied"], exact: true }),
          ).toBeVisible();
          expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(edited);
          await expect(
            picker.getByRole("button", { name: m["settings.saveImage"], exact: true }),
          ).toBeDisabled();
          await expect(picker.getByText(m["settings.notSupplied"], { exact: true })).toBeVisible();
        }
        await picker.locator("[data-setting-editor]").scrollIntoViewIfNeeded();
        await page.screenshot({ path: `run-1/shots/B-editor-${route}-${locale}-${width}.png` });
        await picker.getByRole("button", { name: m["settings.name.studio"], exact: true }).click();
        await expect(sentence).toHaveValue(edits.get("studio")!);
        if (route === "scene") {
          await page.reload({ waitUntil: "domcontentloaded" });
          for (const id of SETTING_IDS) {
            await picker
              .getByRole("button", { name: m[`settings.name.${id}`], exact: true })
              .click();
            await expect(sentence).toHaveValue(edits.get(id)!);
          }
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        expect(generationRequests).toEqual([]);
        expect(errors).toEqual([]);
      });
    }

test("setting cards wait for hydration before accepting sentence edits", async ({
  page,
  context,
}) => {
  test.setTimeout(60_000);
  await isolateClipboard(context);
  let blockedFile = "";
  for (const file of (await readdir(".next/static/chunks")).filter((name) =>
    name.endsWith(".js"),
  )) {
    if ((await readFile(`.next/static/chunks/${file}`, "utf8")).includes("data-setting-picker")) {
      blockedFile = file;
      break;
    }
  }
  expect(blockedFile).not.toBe("");
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**/_next/static/chunks/${blockedFile}`, async (route) => {
    await gate;
    await route.continue();
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const sentence = page
    .locator("[data-setting-picker]")
    .getByLabel(en["settings.sentence"], { exact: true });
  try {
    await page.goto("/en/guide", { waitUntil: "commit" });
    await expect(sentence).toBeVisible();
    await expect(sentence).toBeDisabled();
  } finally {
    release();
    await page.waitForLoadState("domcontentloaded");
  }
  await sentence.fill("A quiet studio in soft daylight.");
  await expect(sentence).toHaveValue("A quiet studio in soft daylight.");
  await page.getByRole("button", { name: en["settings.copyPrompt"], exact: true }).click();
  await expect(
    page.getByRole("button", { name: en["settings.promptCopied"], exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "A quiet studio in soft daylight.",
  );
  await page.screenshot({ path: "run-1/shots/B-hydration-en-390.png" });
});

test("setting cards shared CopyButton retains its existing success label", async ({
  page,
  context,
}) => {
  await isolateClipboard(context);
  await mkdir("run-1/shots", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/license", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: en["license.copyCredit"], exact: true }).click();
  await expect(page.getByRole("button", { name: en["common.copied"], exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(LICENSE.credit.en);
  await page.screenshot({ path: "run-1/shots/B-copy-default-en-390.png" });
});

test("setting cards retain selectable prompt when clipboard permission is denied", async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () => {
          (window as unknown as { settingCopyAttempts: number }).settingCopyAttempts = 1;
          return Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
        },
      },
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/guide", { waitUntil: "domcontentloaded" });
  const picker = page.locator("[data-setting-picker]");
  const sentence = picker.getByLabel(en["settings.sentence"], { exact: true });
  await sentence.fill("A quiet garden in soft daylight.");
  await expect(sentence).toHaveValue("A quiet garden in soft daylight.");
  await picker.getByRole("button", { name: en["settings.copyPrompt"], exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { settingCopyAttempts: number }).settingCopyAttempts,
      ),
    )
    .toBe(1);
  await expect(
    picker.getByRole("button", { name: en["settings.copyPrompt"], exact: true }),
  ).toBeVisible();
  await sentence.focus();
  await sentence.press("ControlOrMeta+A");
  expect(
    await sentence.evaluate(
      (node: HTMLTextAreaElement) =>
        node.selectionStart === 0 && node.selectionEnd === node.value.length,
    ),
  ).toBe(true);
  await page.screenshot({ path: "run-1/shots/B-copy-denied-en-390.png" });
});
