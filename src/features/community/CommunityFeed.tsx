"use client";
import { useState } from "react";
import {
  GameBadge,
  GameButton,
  GameEmptyState,
  GameField,
  GameSelect,
} from "@pieai/swimmer-ui-kit";
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/features/account";
import { ACTORS } from "@/content/actors";
import { communityKindSchema, type CommunityPost } from "@/contracts/community";
import { CommunityNotice } from "./CommunityNotice";
import { PostMedia } from "./PostMedia";
import { useCommunityQuery } from "./hooks";
import { useCommunityAccess } from "./AccessProvider";
export function CommunityFeed({ actorSlug }: { actorSlug?: string } = {}) {
  const account = useAccount();
  const access = useCommunityAccess();
  return access.visible ? (
    <Feed key={`${account.user?.id ?? "guest"}:${actorSlug ?? "all"}`} actorSlug={actorSlug} />
  ) : null;
}
function Feed({ actorSlug }: { actorSlug?: string }) {
  const { t } = useSiteI18n();
  const locale = useSiteLocale();
  const access = useCommunityAccess();
  const [sort, setSort] = useState<"latest" | "featured">("latest");
  const [kind, setKind] = useState<"" | CommunityPost["kind"]>("");
  const [actor, setActor] = useState(actorSlug ?? "");
  const [cursor, setCursor] = useState<string | null>(null);
  const [earlier, setEarlier] = useState<CommunityPost[]>([]);
  const result = useCommunityQuery("list_posts", {
    cursor,
    pageSize: 20,
    filter: { sort, ...(kind ? { kind } : {}), ...(actor ? { actorSlug: actor } : {}) },
  });
  // No stale/partial private cards when a request fails or its audience changes.
  const posts = result.data
    ? [...earlier, ...result.data.posts].filter(
        (post, index, all) => all.findIndex((item) => item.id === post.id) === index,
      )
    : [];
  function reset() {
    setCursor(null);
    setEarlier([]);
  }
  return (
    <section data-community-feed>
      <div className="my-6 flex flex-wrap gap-4">
        <Link className="underline" href="/community/new">
          {t("c.new")}
        </Link>
        <Link className="underline" href="/community/mine">
          {t("c.mine")}
        </Link>
        {access.owner ? (
          <Link className="underline" href="/admin/review">
            {t("community.reviewTitle")}
          </Link>
        ) : null}
        <Link className="underline" href="/works#samples">
          {t("c3.officialExamples")}
        </Link>
      </div>
      <p className="sp-lead">{t("community.intro")}</p>
      <p className="sp-small mt-3">{t("c3.separation")}</p>
      <div className="my-6 grid min-w-0 gap-4 sm:grid-cols-3">
        <GameField label={t("c3.sort")}>
          <GameSelect
            value={sort}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "latest" || value === "featured") {
                setSort(value);
                reset();
              }
            }}
          >
            <option value="latest">{t("c3.latest")}</option>
            <option value="featured">{t("c3.featured")}</option>
          </GameSelect>
        </GameField>
        <GameField label={t("c3.kind")}>
          <GameSelect
            value={kind}
            onChange={(event) => {
              const value = event.target.value;
              setKind(value === "" ? "" : communityKindSchema.parse(value));
              reset();
            }}
          >
            <option value="">{t("c3.allKinds")}</option>
            {communityKindSchema.options.map((value) => (
              <option key={value} value={value}>
                {t(`community.kind.${value}`)}
              </option>
            ))}
          </GameSelect>
        </GameField>
        <GameField label={t("c3.actor")}>
          <GameSelect
            value={actor}
            disabled={Boolean(actorSlug)}
            onChange={(event) => {
              setActor(event.target.value);
              reset();
            }}
          >
            <option value="">{t("c3.allActors")}</option>
            {ACTORS.map((item) => (
              <option key={item.slug} value={item.slug}>
                {locale === "zh" ? item.nameCn : item.nameEn}
              </option>
            ))}
          </GameSelect>
        </GameField>
      </div>
      {result.error ? (
        <>
          <CommunityNotice error={result.error} />
          <GameButton
            onClick={() => {
              reset();
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
          <article key={post.id} className="sp-panel min-w-0 p-5" data-community-card={post.id}>
            <div className="mb-3 flex flex-wrap gap-2">
              <GameBadge>{t(post.official ? "c3.official" : "c3.creator")}</GameBadge>
              {post.featuredAt ? <GameBadge>{t("c3.featured")}</GameBadge> : null}
              <GameBadge>{t(`community.kind.${post.kind}`)}</GameBadge>
            </div>
            <h3 className="sp-subtitle break-words">
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
