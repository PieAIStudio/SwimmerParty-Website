"use client";
import { GameBadge, GameButton, GameEmptyState } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { useAccount } from "@/features/account";
import { useCommunityQuery } from "./hooks";
import { CommunityError } from "./errors";
import { CommunityNotice } from "./CommunityNotice";
import { stateMessages } from "./presentation";
/** C1 validates the Owner read boundary. Moderation controls arrive in the separate C2 commit. */
export function ReviewPanel() {
  const { t } = useSiteI18n();
  const account = useAccount();
  const result = useCommunityQuery("list_review_queue", { pageSize: 20 }, Boolean(account.user));
  if (account.loading)
    return (
      <section className="sp-container sp-section">
        <output>{t("c.loading")}</output>
      </section>
    );
  if (!account.user)
    return (
      <section className="sp-container sp-section">
        <CommunityNotice error={new CommunityError("AUTH_REQUIRED")} />
      </section>
    );
  if (result.error)
    return (
      <section className="sp-container sp-section">
        <CommunityNotice error={result.error} />
        <GameButton onClick={result.refresh}>{t("c.retry")}</GameButton>
      </section>
    );
  if (!result.data)
    return (
      <section className="sp-container sp-section">
        <output>{t("c.loading")}</output>
      </section>
    );
  return (
    <section className="sp-container sp-section" data-review-desk>
      <h1 className="sp-title">{t("community.reviewTitle")}</h1>
      {result.data.posts.length ? (
        result.data.posts.map((post) => (
          <article key={post.id} className="sp-panel my-5 p-5">
            <GameBadge>{t(stateMessages[post.status])}</GameBadge>
            <h2 className="sp-subtitle">{post.title}</h2>
          </article>
        ))
      ) : (
        <GameEmptyState title={t("community.reviewEmpty")} />
      )}
    </section>
  );
}
