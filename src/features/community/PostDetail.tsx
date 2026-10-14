"use client";
import { useSiteI18n } from "@/i18n/client";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { useAccount } from "@/features/account";
import { useCommunityQuery } from "./hooks";
import { CommunityNotice } from "./CommunityNotice";
import { PostMedia } from "./PostMedia";
import { PostActions } from "./PostActions";
export function PostDetail({ id }: { id: string }) {
  const account = useAccount();
  return <Detail key={`${id}:${account.user?.id ?? "guest"}`} id={id} />;
}
function Detail({ id }: { id: string }) {
  const { t } = useSiteI18n();
  const result = useCommunityQuery("get_post", { postId: id });
  if (result.error)
    return (
      <>
        <CommunityNotice error={result.error} />
        <GameButton onClick={result.refresh}>{t("c.retry")}</GameButton>
      </>
    );
  if (!result.data) return <output>{t("c.loading")}</output>;
  const post = result.data.post;
  return (
    <article className="sp-section" data-community-post={post.id}>
      <h1 className="sp-title">{post.title}</h1>
      <p>{t("community.author", { author: post.author.displayName })}</p>
      <p className="mt-4 whitespace-pre-wrap break-words">{post.description}</p>
      <p className="sp-small mt-3">
        {t("community.starring", {
          actors: post.actors.map((actor) => `${actor.slug} · ${actor.assetVersion}`).join(", "),
        })}
      </p>
      <PostMedia post={post} />
      <p className="whitespace-pre-wrap break-words">{post.recipe}</p>
      <PostActions key={`${post.id}:${post.viewerHasLiked}`} post={post} refresh={result.refresh} />
    </article>
  );
}
