import { createI18n, type CatalogTranslator } from "@pieai/swimmer-i18n-kit";
import source from "../../messages/zh-CN/messages.json";
import en from "../../messages/en/messages.json";
import type { MessageContracts } from "./message-contracts";
export type SiteMessages = typeof source;
export type SiteTranslator = CatalogTranslator<SiteMessages, MessageContracts>;
// Immutable directory snapshot. Language is presentation, never instance identity.
export const siteI18n = createI18n<SiteMessages, MessageContracts>({
  sourceLocale: "zh-CN",
  source,
  catalogs: { "zh-CN": source, en },
});
