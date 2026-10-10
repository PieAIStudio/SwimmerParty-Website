import { slotLabelKey } from "./asset-series";
import type { ActorAssets, AssetItem } from "./asset-types";
import { siteI18n } from "@/i18n/catalog";

const translators = { en: siteI18n.translator("en"), zh: siteI18n.translator("zh-CN") };

/** Both authored names of an image, for sheet labels and archive descriptions. */
export function labelsFor(item: AssetItem, assets: ActorAssets) {
  const extra = assets.looks
    .find((look) => look.id === item.look)
    ?.extras.find((entry) => entry.key === item.key);
  if (extra) return { en: extra.label.en, zh: extra.label.zh };
  const key = slotLabelKey(item.series, item.key);
  return { en: translators.en.t(key), zh: translators.zh.t(key) };
}
