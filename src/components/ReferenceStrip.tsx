import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import type { Actor } from "@/content/actors";
import type { AppLocale } from "@/i18n/routing";

/**
 * The delivered reference angles for one actor.
 *
 * Renders nothing but an honest line when the set is only a front plate.
 * The temptation on a kit page is to show three frames and let two of them
 * be "coming soon" placeholders — which is precisely the move that makes a
 * visitor stop believing the rest of the page.
 */
export async function ReferenceStrip({ actor }: { actor: Actor }) {
  const t = await getTranslations("kit");
  const locale = (await getLocale()) as AppLocale;

  if (actor.views.length === 0) {
    return (
      <p className="sp-label sp-cjk text-[0.5rem] text-ash">
        {t("platesLabel")} — {t("platesNone")}
      </p>
    );
  }

  return (
    <div>
      <p className="sp-label sp-cjk text-[0.5rem] text-ash">{t("platesLabel")}</p>
      <ul className="mt-3 grid grid-cols-3 gap-px bg-[var(--sp-hairline)]">
        {actor.views.map((view) => (
          <li key={view.id} className="relative bg-void">
            <div className="sp-scanlines relative aspect-2/3">
              <Image
                src={view.src}
                alt={`${locale === "zh" ? actor.nameCn : actor.nameEn} — ${actor.code} ${view.label[locale]}`}
                fill
                sizes="(max-width: 1024px) 30vw, 12rem"
                className="object-contain"
              />
            </div>
            <p className="sp-label sp-cjk border-t border-[var(--sp-hairline)] px-2 py-1.5 text-[0.5rem]">
              {view.label[locale]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
