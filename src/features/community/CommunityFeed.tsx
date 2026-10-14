"use client";
import { useState } from "react";
import { GameButton, GameEmptyState } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/features/account";
import type { CommunityPost } from "@/contracts/community";
import { CommunityNotice } from "./CommunityNotice";
import { PostMedia } from "./PostMedia";
import { useCommunityQuery } from "./hooks";
export function CommunityFeed() {
  const account = useAccount();
  return <Feed key={account.user?.id ?? "guest"} />;
}
function Feed() {
  const { t } = useSiteI18n();
  const [cursor, setCursor] = useState<string | null>(null);
  const [earlier, setEarlier] = useState<CommunityPost[]>([]);
  const result = useCommunityQuery("list_posts", { cursor, pageSize: 20 });
  const posts = [...earlier, ...(result.data?.posts ?? [])].filter(
    (post, index, all) => all.findIndex((item) => item.id === post.id) === index,
  );
  return (
    <section data-community-feed>
      <div className="mb-6 flex flex-wrap gap-4">
        <Link className="underline" href="/community/new">
          {t("c.new")}
        </Link>
        <Link className="underline" href="/community/mine">
          {t("c.mine")}
        </Link>
      </div>
      <p className="sp-lead">{t("community.intro")}</p>
      {result.error ? (
        <>
          <CommunityNotice error={result.error} />
          <GameButton
            onClick={() => {
              setCursor(null);
              setEarlier([]);
              result.refresh();
            }}
          >
            {t("c.retry")}
          </GameButton>
        </>
      ) : null}
      {result.loading ? <output>{t("c.loading")}</output> : null}
      {!result.error && !result.loading && !posts.length ? (
        <GameEmptyState title={t("c.noPosts")} />
      ) : null}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="sp-panel min-w-0 p-5">
            <h3 className="sp-subtitle">
              <Link href={`/works/p/${post.id}`}>{post.title}</Link>
            </h3>
            <p>{t("community.author", { author: post.author.displayName })}</p>
            <PostMedia post={post} />
          </article>
        ))}
      </div>
      {result.data?.hasMore ? (
        <GameButton
          className="mt-5"
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
