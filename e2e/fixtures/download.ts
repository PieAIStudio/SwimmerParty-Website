import { readFile } from "node:fs/promises";
import { expect, type BrowserContext, type Locator, type Page } from "@playwright/test";

/** Establish a local fixture session, never an external account-center login. */
export async function localMember(context: BrowserContext) {
  const response = await context.request.post("/api/auth/mock/sign-in");
  expect(response.ok()).toBe(true);
  const session = await context.request.get("/api/auth/session");
  expect(await session.json()).toEqual({
    user: {
      id: "local-mock-member",
      name: "Local member",
      email: "member@example.test",
      avatarUrl: null,
    },
    mode: "mock",
  });
}

export async function downloadFrom(page: Page, trigger: Locator) {
  const pending = page.waitForEvent("download");
  await trigger.click();
  const download = await pending;
  expect(await download.failure()).toBeNull();
  return { name: download.suggestedFilename(), bytes: await readFile((await download.path())!) };
}
