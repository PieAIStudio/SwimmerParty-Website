import { getSiteLocale, getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { TextLink } from "@/site/TextLink";
import { getActor } from "@/features/actors/queries";
import { ACTORS } from "@/content/actors";
import { OFFICIAL_SAMPLES, type OfficialSample } from "@/content/official-samples.generated";
import { SampleVideo } from "./SampleVideo";

async function SampleBlock({ sample }: { sample: OfficialSample }) {
  const locale = await getSiteLocale();
  const { t } = await getSiteI18n();
  const names = sample.actorSlugs
    .map((slug) => getActor(slug))
    .filter((actor) => actor !== undefined)
    .map((actor) => (locale === "zh" ? actor.nameCn : actor.nameEn))
    .join(" · ");
  const label = t(`samples.label.${sample.label}`);
  return (
    <article
      data-official-sample={sample.slug}
      data-sample-id={sample.sampleId}
      className="min-w-0 flex-none w-[min(82vw,20rem)] sm:w-72"
    >
      <SampleVideo
        src={sample.video}
        poster={sample.poster}
        label={`${names} · ${label}`}
        className="aspect-[9/14]"
      />
      <p className="mt-3 font-semibold">{names}</p>
      <p className="sp-small mt-1 text-muted-foreground">
        {label} · {sample.tools.join(" · ")}
      </p>
    </article>
  );
}
async function SampleRow({ slug, title }: { slug: string; title: string }) {
  const samples = OFFICIAL_SAMPLES.filter((sample) => sample.actorSlugs.includes(slug));
  if (!samples.length) return null;
  return (
    <section data-actor-samples={slug} className="min-w-0">
      <h3 className="sp-subtitle">
        <Link href={`/actors/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="mt-5 flex gap-5 overflow-x-auto pb-4" data-sample-row>
        {samples.map((sample) => (
          <SampleBlock key={sample.sampleId} sample={sample} />
        ))}
      </div>
    </section>
  );
}
export async function OfficialSamplesSection({ limit }: { limit?: number } = {}) {
  const locale = await getSiteLocale();
  const { t } = await getSiteI18n();
  const actors = ACTORS.filter((actor) =>
    OFFICIAL_SAMPLES.some((sample) => sample.actorSlugs.includes(actor.slug)),
  );
  if (!actors.length) return null;
  return (
    <section id="samples" className="sp-section scroll-mt-24" data-official-samples>
      <h2 className="sp-title">{t("samples.worksTitle")}</h2>
      <div className="mt-8 space-y-12">
        {(limit ? actors.slice(0, limit) : actors).map((actor) => (
          <SampleRow
            key={actor.slug}
            slug={actor.slug}
            title={locale === "zh" ? actor.nameCn : actor.nameEn}
          />
        ))}
      </div>
      {limit && actors.length > limit ? (
        <TextLink href="/works#samples" className="mt-8">
          {t("samples.seeAll")}
        </TextLink>
      ) : null}
    </section>
  );
}
export async function ActorSample({ slug }: { slug: string }) {
  const samples = OFFICIAL_SAMPLES.filter((sample) => sample.actorSlugs.includes(slug));
  if (!samples.length) return null;
  const locale = await getSiteLocale();
  const { t } = await getSiteI18n();
  const actor = getActor(slug);
  if (!actor) return null;
  return (
    <section className="sp-section min-w-0" data-actor-sample>
      <h2 className="sp-title">
        {t("samples.actorTitle", { name: locale === "zh" ? actor.nameCn : actor.nameEn })}
      </h2>
      <div className="mt-6 flex gap-5 overflow-x-auto pb-4" data-sample-row>
        {samples.map((sample) => (
          <SampleBlock key={sample.sampleId} sample={sample} />
        ))}
      </div>
    </section>
  );
}
