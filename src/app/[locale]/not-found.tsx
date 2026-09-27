import { getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { Mega } from "@/components/Mega";

export default async function NotFound() {
  const t = await getSiteI18n().then((i18n) => i18n.t);
  const lines = [t("notFound.lines.0"), t("notFound.lines.1")];

  return (
    <div className="mx-auto grid min-h-[70svh] max-w-[var(--sp-max)] place-items-center px-[var(--sp-gutter)] pt-32 text-center">
      <div>
        <p className="sp-label sp-cjk text-[0.625rem]">{t("notFound.eyebrow")}</p>
        <Mega
          lines={lines}
          immediate
          className="mt-6 text-bone"
          size="text-[clamp(3rem,13vw,11rem)]"
        />
        <p className="sp-cjk mt-8 text-sm text-smoke">{t("notFound.body")}</p>
        <Link
          href="/actors"
          className="sp-label sp-cjk mt-10 inline-block border border-acid px-8 py-4 text-[0.6875rem] text-acid transition-colors hover:bg-acid hover:text-black"
        >
          {t("notFound.cta")} →
        </Link>
      </div>
    </div>
  );
}
