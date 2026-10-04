import { getSiteI18n } from "@/i18n/server";
import { coreProgress } from "@/features/assets/assets";
import { GameProgress } from "@pieai/swimmer-ui-kit";

export async function AssetProgress({ slug }: { slug: string }) {
  const { t } = await getSiteI18n();
  const progress = coreProgress(slug);
  const label = t("assets.progress", progress);
  return (
    <div className="w-60 max-w-full" data-core-progress={`${progress.done}/${progress.total}`}>
      <p className="sp-small mb-2 text-muted-foreground">{label}</p>
      <GameProgress value={progress.done} max={progress.total} label={label} />
    </div>
  );
}
