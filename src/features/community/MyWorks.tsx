"use client";
import { useState } from "react";
import {
  GameBadge,
  GameButton,
  GameEmptyState,
  GameField,
  GameSelect,
  GameToast,
} from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/features/account";
import { postStatusSchema, type AuthorPost } from "@/contracts/community";
import { callCommunity } from "./api";
import { CommunityError } from "./errors";
import { CommunityNotice } from "./CommunityNotice";
import { useCommunityAction, useCommunityQuery } from "./hooks";
import { stateMessages } from "./presentation";
import { PostMedia } from "./PostMedia";
export function MyWorks() {
  const { t } = useSiteI18n();
  const account = useAccount();
  if (account.loading) return <output>{t("c.loading")}</output>;
  if (!account.user) return <CommunityNotice error={new CommunityError("AUTH_REQUIRED")} />;
  return <OwnList key={account.user.id} />;
}
function OwnList() {
  const { t } = useSiteI18n();
  const [status, setStatus] = useState<AuthorPost["status"]>("draft");
  const [cursor, setCursor] = useState<string | null>(null),
    [earlier, setEarlier] = useState<AuthorPost[]>([]);
  const result = useCommunityQuery("list_my_posts", { status, cursor, pageSize: 20 });
  const posts = result.data
    ? [...earlier, ...result.data.posts].filter(
        (post, index, all) => all.findIndex((item) => item.id === post.id) === index,
      )
    : [];
  const refresh = () => {
    setCursor(null);
    setEarlier([]);
    result.refresh();
  };
  return (
    <section className="sp-section" data-my-works>
      <h1 className="sp-title">{t("c.mine")}</h1>
      <Link href="/community/new" className="my-5 inline-block underline">
        {t("c.new")}
      </Link>
      <GameField label={t("c.mine")}>
        <GameSelect
          value={status}
          onChange={(event) => {
            setStatus(postStatusSchema.parse(event.target.value));
            setCursor(null);
            setEarlier([]);
          }}
        >
          {postStatusSchema.options.map((id) => (
            <option key={id} value={id}>
              {t(stateMessages[id])}
            </option>
          ))}
        </GameSelect>
      </GameField>
      {result.error ? (
        <>
          <CommunityNotice error={result.error} />
          <GameButton onClick={refresh}>{t("c.retry")}</GameButton>
        </>
      ) : null}
      {result.loading ? <output>{t("c.loading")}</output> : null}
      {!result.loading && !result.error && !posts.length ? (
        <GameEmptyState title={t("c.noPosts")} />
      ) : null}
      <div className="mt-6 grid gap-5">
        {posts.map((post) => (
          <OwnPost key={post.id} post={post} refresh={refresh} />
        ))}
      </div>
      {result.data?.hasMore ? (
        <GameButton
          onClick={() => {
            setEarlier(posts);
            setCursor(result.data!.nextCursor);
          }}
        >
          {t("c.loadMore")}
        </GameButton>
      ) : null}
    </section>
  );
}
function OwnPost({ post, refresh }: { post: AuthorPost; refresh: () => void }) {
  const { t } = useSiteI18n();
  const action = useCommunityAction(`delete:${post.id}`);
  const [confirm, setConfirm] = useState(false),
    [removed, setRemoved] = useState(false);
  if (removed)
    return (
      <article className="sp-panel p-5">
        <GameToast>{t("c.deleted")}</GameToast>
      </article>
    );
  return (
    <article className="sp-panel min-w-0 p-5" data-my-post={post.id}>
      <GameBadge>{t(stateMessages[post.status])}</GameBadge>
      <h2 className="sp-subtitle my-3">{post.title || t("c.state.draft")}</h2>
      {post.returnedReason || post.hiddenReason ? (
        <p className="break-words">
          {t("c.returnReason")}: {post.returnedReason ?? post.hiddenReason}
        </p>
      ) : null}
      <PostMedia post={post} />
      {["draft", "returned", "published"].includes(post.status) ? (
        <Link className="underline" href={`/community/new?id=${post.id}`}>
          {t("c.edit")}
        </Link>
      ) : null}
      {action.error ? <CommunityNotice error={action.error} /> : null}
      {action.journal.snapshot() ? (
        <GameButton
          pending={action.busy}
          onClick={() =>
            void action.perform(async (journal, signal) => {
              await journal.retry(callCommunity, signal);
              refresh();
            })
          }
        >
          {t("c.retryWrite")}
        </GameButton>
      ) : null}
      {removed ? (
        <GameToast>{t("c.deleted")}</GameToast>
      ) : post.status !== "deleted" ? (
        <div className="mt-4">
          {confirm ? (
            <>
              <p>{t("c.confirmDelete")}</p>
              <GameButton
                pending={action.busy}
                onClick={() =>
                  void action.perform(async (journal, signal) => {
                    await journal.execute(
                      "delete_post",
                      { postId: post.id, expectedRevision: post.revision },
                      callCommunity,
                      signal,
                    );
                    setRemoved(true);
                  })
                }
              >
                {t("community.delete")}
              </GameButton>
              <GameButton onClick={() => setConfirm(false)}>{t("c.cancel")}</GameButton>
            </>
          ) : (
            <GameButton onClick={() => setConfirm(true)}>{t("community.delete")}</GameButton>
          )}
        </div>
      ) : null}
    </article>
  );
}
