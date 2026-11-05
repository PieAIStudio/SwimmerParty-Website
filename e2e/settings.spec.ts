import { test, expect, type BrowserContext } from "@playwright/test";
import { mkdir, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  SETTING_GROUPS,
  SETTING_IDS,
  SETTING_MANIFEST,
  type SettingId,
} from "../src/content/settings";
import { LICENSE } from "../src/content/license";
import en from "../messages/en/messages.json";
import zh from "../messages/zh-CN/messages.json";

const evidenceRoot = process.env.PLAYWRIGHT_EVIDENCE_DIR ?? "run-1";

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
        await mkdir(`${evidenceRoot}/shots`, { recursive: true });
        await isolateClipboard(context);
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.goto(`/${locale}/${route}`, { waitUntil: "domcontentloaded" });
        const picker = page.locator("[data-setting-picker]");
        expect(SETTING_IDS).toHaveLength(26);
        const counts = { indoor: 9, outdoor: 10, night: 7 };
        const groupIds = (group: (typeof SETTING_GROUPS)[number]) =>
          SETTING_IDS.filter((id) => SETTING_MANIFEST[id].group === group);
        const selectGroup = async (group: (typeof SETTING_GROUPS)[number]) => {
          const control = picker.getByRole("button", {
            name: `${m[`settings.group.${group}`]} (${counts[group]})`,
            exact: true,
          });
          if ((await control.getAttribute("aria-pressed")) !== "true") await control.click();
          await expect(control).toHaveAttribute("aria-pressed", "true");
        };
        const selectSetting = async (id: SettingId) => {
          await selectGroup(SETTING_MANIFEST[id].group);
          await picker.getByRole("button", { name: m[`settings.name.${id}`], exact: true }).click();
        };
        await expect(picker.locator("[data-setting-groups] button")).toHaveCount(3);
        for (const group of SETTING_GROUPS) {
          await selectGroup(group);
          await expect(picker.locator("[data-setting-card]")).toHaveCount(counts[group]);
          await expect(picker.locator("[data-setting-placeholder]")).toHaveCount(0);
          await expect(picker.locator("img")).toHaveCount(counts[group]);
          for (const id of groupIds(group)) {
            const image = picker.locator(`[data-setting-card=${id}] img`);
            const reference = SETTING_MANIFEST[id].image!;
            await expect(image).toHaveAttribute("alt", m[`settings.name.${id}`]);
            await expect(image).toHaveAttribute("loading", "lazy");
            await expect(image).toHaveAttribute("width", String(reference.width));
            await expect(image).toHaveAttribute("height", String(reference.height));
            await image.scrollIntoViewIfNeeded();
            await image.evaluate((node: HTMLImageElement) => node.decode());
            expect(
              await image.evaluate((node: HTMLImageElement) => node.naturalWidth),
            ).toBeGreaterThan(0);
          }
          await page.evaluate(() => document.fonts.ready);
          // Chromium's if-needed scroll can leave a fractional edge clipped after group changes.
          await picker
            .locator("[data-setting-card]")
            .last()
            .evaluate((node) => node.scrollIntoView({ block: "center", behavior: "instant" }));
          await expect(picker.locator("[data-setting-card]").last()).toBeInViewport({ ratio: 1 });
          await page.screenshot({
            path: `${evidenceRoot}/shots/B-picker-${route}-${locale}-${width}-${group}-bottom.png`,
          });
          await picker.getByRole("heading", { level: 2 }).evaluate((node) =>
            window.scrollTo({
              top: scrollY + node.getBoundingClientRect().top - 88,
              behavior: "instant",
            }),
          );
          await page.screenshot({
            path: `${evidenceRoot}/shots/B-picker-${route}-${locale}-${width}-${group}.png`,
          });
        }
        const sentence = picker.getByLabel(m["settings.sentence"], { exact: true });
        const edits = new Map<string, string>();
        for (const id of SETTING_GROUPS.flatMap(groupIds)) {
          await selectGroup(SETTING_MANIFEST[id].group);
          const card = picker.locator(`[data-setting-card=${id}]`);
          const button = card.getByRole("button", { name: m[`settings.name.${id}`], exact: true });
          await button.click();
          await expect(button).toHaveAttribute("aria-pressed", "true");
          await expect(sentence).toHaveValue(m[`settings.sentence.${id}`]);
          expect(m[`settings.sentence.${id}`].length).toBeLessThanOrEqual(300);
          const edited = `${m[`settings.sentence.${id}`]} ${locale === "en" ? "Test note." : "测试备注。"}`;
          edits.set(id, edited);
          await sentence.fill(edited);
          await picker.getByRole("button", { name: m["settings.copyPrompt"], exact: true }).click();
          await expect(
            picker.getByRole("button", { name: m["settings.promptCopied"], exact: true }),
          ).toBeVisible();
          expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(edited);
          const save = picker.getByRole("button", { name: m["settings.saveImage"], exact: true });
          await expect(save).toBeEnabled();
          await expect(picker.getByText(m["settings.notSupplied"], { exact: true })).toHaveCount(0);
          // Check all 26 originals once, plus a real save in each route/locale/viewport.
          if ((route === "guide" && locale === "en" && width === 1440) || id === "studio") {
            const reference = SETTING_MANIFEST[id].image!;
            const downloadEvent = page.waitForEvent("download");
            await save.click();
            const download = await downloadEvent;
            expect(download.suggestedFilename()).toBe(reference.filename);
            const savedPath = test.info().outputPath(reference.filename);
            await download.saveAs(savedPath);
            const bytes = await readFile(savedPath);
            const original = await readFile(`public${reference.download}`);
            expect(createHash("sha256").update(bytes).digest("hex")).toBe(
              createHash("sha256").update(original).digest("hex"),
            );
            expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
            expect(bytes.readUInt32BE(16)).toBe(reference.width);
            expect(bytes.readUInt32BE(20)).toBe(reference.height);
            await expect(picker.getByRole("status")).toHaveText(m["settings.imageSaved"]);
          }
        }
        await picker.locator("[data-setting-editor]").scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `${evidenceRoot}/shots/B-editor-${route}-${locale}-${width}.png`,
        });
        await selectSetting("studio");
        await expect(sentence).toHaveValue(edits.get("studio")!);
        if (route === "scene") {
          await page.reload({ waitUntil: "domcontentloaded" });
          for (const id of SETTING_GROUPS.flatMap(groupIds)) {
            await selectSetting(id);
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
  await page.screenshot({ path: `${evidenceRoot}/shots/B-hydration-en-390.png` });
});

test("setting cards shared CopyButton retains its existing success label", async ({
  page,
  context,
}) => {
  await isolateClipboard(context);
  await mkdir(`${evidenceRoot}/shots`, { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/license", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: en["license.copyCredit"], exact: true }).click();
  await expect(page.getByRole("button", { name: en["common.copied"], exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(LICENSE.credit.en);
  await page.screenshot({ path: `${evidenceRoot}/shots/B-copy-default-en-390.png` });
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
  await page.screenshot({ path: `${evidenceRoot}/shots/B-copy-denied-en-390.png` });
});
