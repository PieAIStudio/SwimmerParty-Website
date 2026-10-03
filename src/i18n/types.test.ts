import type { SiteTranslator } from "./catalog";
// This file participates in tsc, without executing invalid calls in the app.
export function checkMessageTypes(t: SiteTranslator) {
  t.t("common.skipToContent");
  t.t("roster.intro", { castable: 1, building: 2 });
  // @ts-expect-error Unknown keys must fail compilation.
  t.t("common.thisKeyDoesNotExist");
  // @ts-expect-error ICU arguments are required.
  t.t("roster.intro");
  // @ts-expect-error Unknown argument names must fail compilation.
  t.t("roster.intro", { wrong: 2 });
}
