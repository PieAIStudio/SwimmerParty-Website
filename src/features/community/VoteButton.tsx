"use client";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { announceFirstUse } from "@/features/guidance/client";
import { useCommunityQuery, useCommunityAction } from "./hooks";
import { CommunityNotice } from "./CommunityNotice";
import { callCommunity } from "./api";
export function VoteButton({ slug, name }: { slug: string; name: string; locale: "en" | "zh" }) {
  const { t } = useSiteI18n();
  const votes = useCommunityQuery("get_actor_votes", { actorSlug: slug });
  const action = useCommunityAction(`vote:${slug}`);
  const error = action.error ?? votes.error;
  return (
    <div>
      <p className="sp-small mb-2">{t("firstUse.vote.condition")}</p>
      <GameButton
        variant="ghost"
        pending={action.busy}
        disabled={!votes.data}
        aria-pressed={votes.data?.voted ?? false}
        onClick={() =>
          void action.perform(async (journal, signal) => {
            const saved = await journal.execute(
              "set_actor_vote",
              { actorSlug: slug, voted: !votes.data!.voted },
              callCommunity,
              signal,
            );
            if (saved.voted) announceFirstUse("vote");
            votes.refresh();
          })
        }
      >
        {t("community.voteLabel", { name })}
        {votes.data ? ` · ${votes.data.count}` : ""}
      </GameButton>
      {error ? <CommunityNotice error={error} /> : null}
      {action.journal.snapshot() ? (
        <GameButton
          onClick={() =>
            void action.perform(async (journal, signal) => {
              await journal.retry(callCommunity, signal);
              votes.refresh();
            })
          }
        >
          {t("c.retryWrite")}
        </GameButton>
      ) : null}
    </div>
  );
}
