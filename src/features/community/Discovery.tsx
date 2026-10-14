"use client";
import { useEffect } from "react";
import { GameBadge, GameButton } from "@pieai/swimmer-ui-kit";
import { ACTORS } from "@/content/actors";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { Link } from "@/i18n/navigation";
import { useCommunityAccess } from "./AccessProvider";
import { CommunityFeed } from "./CommunityFeed";
import { useCommunityQuery } from "./hooks";
import { CommunityNotice } from "./CommunityNotice";
import { VoteButton } from "./VoteButton";
export function CommunitySection() {
  const { t } = useSiteI18n();
  const access = useCommunityAccess();
  if (!access.visible) return null;
  return (
    <section className="sp-section" id="community">
      <h2 className="sp-title">{t("c3.creatorWorks")}</h2>
      <CommunityFeed />
    </section>
  );
}
export function ActorCommunity({
  slug,
  name,
  newFace,
}: {
  slug: string;
  name: string;
  newFace: boolean;
}) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const access = useCommunityAccess();
  if (!access.visible) return null;
  return (
    <section className="sp-section" data-actor-community={slug}>
      <h2 className="sp-title">{t("c3.withActor", { name })}</h2>
      {newFace ? <VoteButton slug={slug} name={name} locale={locale} /> : null}
      <CommunityFeed actorSlug={slug} />
    </section>
  );
}
export function NextGraduation() {
  const access = useCommunityAccess();
  return access.visible ? <Graduation /> : null;
}
function Graduation() {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const result = useCommunityQuery("list_actor_votes", {});
  const refresh = result.refresh;
  useEffect(() => {
    const listener = () => refresh();
    window.addEventListener("sp-community-vote", listener);
    return () => window.removeEventListener("sp-community-vote", listener);
  }, [refresh]);
  const votes =
    result.data?.votes.filter((vote) =>
      ACTORS.some((actor) => actor.status === "new-face" && actor.slug === vote.actorSlug),
    ) ?? [];
  const max = Math.max(0, ...votes.map((vote) => vote.count));
  const leaders = max > 0 ? votes.filter((vote) => vote.count === max) : [];
  return (
    <section className="sp-section" data-next-graduation>
      <h2 className="sp-title">{t("c3.nextGraduation")}</h2>
      <p className="sp-small my-4">{t("c3.voteNotPromise")}</p>
      {result.error ? (
        <>
          <CommunityNotice error={result.error} />
          <GameButton onClick={result.refresh}>{t("c.retry")}</GameButton>
        </>
      ) : result.loading ? (
        <output>{t("c.loading")}</output>
      ) : leaders.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {leaders.map((vote) => {
            const actor = ACTORS.find((item) => item.slug === vote.actorSlug)!;
            return (
              <li
                key={vote.actorSlug}
                className="sp-panel min-w-0 p-5"
                data-vote-leader={vote.actorSlug}
              >
                <GameBadge>{t("c3.votes", { count: vote.count })}</GameBadge>
                <p className="my-3">
                  <Link href={`/actors/${actor.slug}`} className="underline">
                    {locale === "zh" ? actor.nameCn : actor.nameEn}
                  </Link>
                </p>
                {leaders.length > 1 ? <p>{t("c3.tied")}</p> : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>{t("c3.noVotes")}</p>
      )}
      <Link className="mt-5 inline-block underline" href="/actors#new-faces">
        {t("c3.voteRoster")}
      </Link>
    </section>
  );
}
