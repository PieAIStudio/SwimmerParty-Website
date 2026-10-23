import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";
import { getSiteI18n, setSiteLocale } from "@/i18n/server";
import { ACTORS } from "@/content/actors";
import { ActorFilters, makeActorFacets } from "@/features/actors";
import { getActorAssets } from "@/features/assets/queries";
import { OFFICIAL_SAMPLES } from "@/content/official-samples.generated";
import { WORKS } from "@/content/works";
import { localizedAlternates } from "@/i18n/metadata";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  return {
    title: t("roster.metaTitle"),
    description: t("roster.metaDescription"),
    alternates: localizedAlternates(locale, "/actors"),
  };
}
export default async function ActorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setSiteLocale(locale);
  const { t } = await getSiteI18n();
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const entry of typeof value === "string" ? [value] : (value ?? []))
      search.append(key, entry);
  }
  const media = Object.fromEntries(
    ACTORS.map((actor) => [actor.slug, getActorAssets(actor.slug).items]),
  );
  const facets = makeActorFacets(ACTORS, media, OFFICIAL_SAMPLES, WORKS);
  const portraits = Object.fromEntries(
    ACTORS.map((actor) => [
      actor.slug,
      media[actor.slug]?.find((item) => item.slot === "face.front")?.preview ??
        media[actor.slug]?.find((item) => item.slot === "turnaround.front")?.preview ??
        actor.portrait ??
        "",
    ]),
  );
  const samples = Object.fromEntries(
    ACTORS.flatMap((actor) => {
      const sample = OFFICIAL_SAMPLES.find((entry) => entry.actorSlugs.includes(actor.slug));
      return sample ? [[actor.slug, sample]] : [];
    }),
  );
  const counts = {
    castable: ACTORS.filter((a) => a.status === "active").length,
    newFaces: ACTORS.filter((a) => a.status === "new-face").length,
  };
  return (
    <div className="sp-container">
      <header className="py-6">
        <h1 className="sp-title">{t("roster.metaTitle")}</h1>
        <p className="sp-small mt-2 text-muted-foreground">{t("roster.intro", counts)}</p>
      </header>
      <ActorFilters
        actors={ACTORS}
        facets={facets}
        portraits={portraits}
        samples={samples}
        initialSearch={search.toString()}
      />
    </div>
  );
}
