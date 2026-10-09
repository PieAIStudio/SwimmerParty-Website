import { getSiteLocale, getSiteI18n } from "@/i18n/server";
import { Link } from "@/i18n/navigation";
import { getActor } from "@/content/actors";
import { OFFICIAL_SAMPLES, type OfficialSample } from "@/content/official-samples.generated";

/** One actor's sample: two scene images and a short video, plus the recipe to repeat it. */
async function SampleBlock({ sample, linkActor }: { sample: OfficialSample; linkActor: boolean }) {
  const locale = await getSiteLocale();
  const { t } = await getSiteI18n();
  const actor = getActor(sample.slug);
  if (!actor) return null;
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  return (
    <article data-official-sample={sample.slug} className="sp-card bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {linkActor ? (
          <Link href={`/actors/${sample.slug}`} className="sp-subtitle hover:underline">
            {name}
          </Link>
        ) : (
          <span className="sp-subtitle">{name}</span>
        )}
        <span className="sp-small text-muted-foreground">{t("samples.official")}</span>
      </div>
      <div
        className={`mt-5 grid ${sample.images.length === 1 ? "grid-cols-2" : "grid-cols-3"} gap-3`}
      >
        {sample.images.map((src, index) => (
          // Small, fixed-size web copies; next/image would add nothing here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={t("samples.sceneAlt", { name, tool: sample.tools[0] ?? "ChatGPT" })}
            width={720}
            height={1280}
            loading="lazy"
            className="aspect-9/16 w-full rounded-[var(--game-ui-radius-card)] object-cover"
            data-index={index}
          />
        ))}
        <video
          src={sample.video}
          poster={sample.poster}
          aria-label={t("samples.videoLabel", { name })}
          controls
          muted
          loop
          playsInline
          preload="none"
          className="aspect-9/16 w-full rounded-[var(--game-ui-radius-card)] bg-muted object-cover"
        />
      </div>
      <p className="sp-small mt-4">
        <span className="text-muted-foreground">{t("samples.madeWith")} </span>
        {sample.tools.join(" · ")}
      </p>
      <details className="mt-3">
        <summary className="sp-small cursor-pointer">{t("samples.howMade")}</summary>
        <ol className="sp-small mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>{t("samples.step1", { name })}</li>
          <li>{t("samples.step2")}</li>
          <li>{t("samples.step3")}</li>
        </ol>
      </details>
    </article>
  );
}

/** Works page: every actor that has an approved sample. */
export async function OfficialSamplesSection() {
  const { t } = await getSiteI18n();
  if (!OFFICIAL_SAMPLES.length) return null;
  return (
    <section className="sp-section" data-official-samples>
      <h2 className="sp-title">{t("samples.worksTitle")}</h2>
      <p className="sp-lead mt-6 max-w-[36rem] text-muted-foreground">{t("samples.description")}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {OFFICIAL_SAMPLES.map((sample) => (
          <SampleBlock key={sample.slug} sample={sample} linkActor />
        ))}
      </div>
    </section>
  );
}

/** Actor page: this actor's sample, if one has been approved. */
export async function ActorSample({ slug }: { slug: string }) {
  const sample = OFFICIAL_SAMPLES.find((candidate) => candidate.slug === slug);
  if (!sample) return null;
  const locale = await getSiteLocale();
  const { t } = await getSiteI18n();
  const actor = getActor(slug);
  if (!actor) return null;
  const name = locale === "zh" ? actor.nameCn : actor.nameEn;
  return (
    <section className="sp-section" data-actor-sample>
      <h2 className="sp-title">{t("samples.actorTitle", { name })}</h2>
      <p className="sp-lead mt-6 max-w-[36rem] text-muted-foreground">{t("samples.description")}</p>
      <div className="mt-8 max-w-[40rem]">
        <SampleBlock sample={sample} linkActor={false} />
      </div>
    </section>
  );
}
