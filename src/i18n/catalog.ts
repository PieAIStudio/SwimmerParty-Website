import { createI18n, type CatalogTranslator } from "@pieai/swimmer-i18n-kit";
import source from "../../messages/zh-CN/messages.json";
import type { MessageContracts } from "./message-contracts";
export type SiteMessages = typeof source;
export type SiteTranslator = CatalogTranslator<SiteMessages, MessageContracts>;
export function createSiteI18n(locale: string, messages: SiteMessages) {
  return createI18n<SiteMessages, MessageContracts>({
    sourceLocale: "zh-CN",
    source,
    catalogs: { "zh-CN": source, [locale]: messages },
  });
}
