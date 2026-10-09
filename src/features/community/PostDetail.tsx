"use client";
import { useSiteI18n } from "@/i18n/client";
import { useEffect, useState } from "react";
import { PostActions } from "./PostActions";
import type { CommunityPost } from "./types";
import { communityPostResponseSchema } from "@/contracts/community";
import { useAccount } from "@/features/account";
import { GameButton } from "@pieai/swimmer-ui-kit";
export function PostDetail({ id, locale }: { id: string; locale: "en" | "zh" }) {
  const { t } = useSiteI18n();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const account = useAccount();
  useEffect(() => {
    void fetch(`/api/community/posts/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((x: unknown) => {
        const parsed = communityPostResponseSchema.safeParse(x);
        setPost(parsed.success ? parsed.data.post : null);
      });
  }, [id]);
  if (!post) return <p className="sp-lead mt-8">{t("community.notFound")}</p>;
  const postId = post.id;
  async function remove() {
    if (!confirm(t("community.deleteConfirmation"))) return;
    const response = await fetch(`/api/community/posts/${postId}`, { method: "DELETE" });
    if (response.ok) setPost(null);
  }
  return (
    <article className="sp-section">
      <p className="sp-small text-muted-foreground">
        {t("community.author", { author: post.author })}
      </p>
      <h1 className="sp-display-lg mt-4">{post.title}</h1>
      <p className="mt-5">{post.description}</p>
      <p className="sp-small mt-6">
        {t("community.starring", {
          actors: locale === "zh" ? post.actorSlugs.join("、") : post.actorSlugs.join(", "),
        })}
      </p>
      <PostActions id={post.id} locale={locale} />
      {account.user?.id === post.authorId ? (
        <GameButton variant="ghost" className="mt-4" onClick={() => void remove()}>
          {t("community.delete")}
        </GameButton>
      ) : null}
    </article>
  );
}
