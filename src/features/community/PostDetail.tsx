"use client";
import { useEffect, useState } from "react";
import { PostActions } from "./PostActions";
import type { CommunityPost } from "./types";
import { useAccount } from "@/features/account";
import { GameButton } from "@pieai/swimmer-ui-kit";
export function PostDetail({ id, locale }: { id: string; locale: "en" | "zh" }) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const account = useAccount();
  useEffect(() => {
    void fetch(`/api/community/posts/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((x: { post?: CommunityPost } | null) => setPost(x?.post ?? null));
  }, [id]);
  if (!post)
    return (
      <p className="sp-lead mt-8">
        {locale === "zh" ? "没有找到这个作品。" : "This post could not be found."}
      </p>
    );
  const postId = post.id;
  async function remove() {
    if (
      !confirm(
        locale === "zh"
          ? "删除这个作品？删了就找不回来了。"
          : "Delete this post? This can’t be undone.",
      )
    )
      return;
    const response = await fetch(`/api/community/posts/${postId}`, { method: "DELETE" });
    if (response.ok) setPost(null);
  }
  return (
    <article className="sp-section">
      <p className="sp-small text-muted-foreground">
        {locale === "zh" ? `作者：${post.author}` : `by ${post.author}`}
      </p>
      <h1 className="sp-display-lg mt-4">{post.title}</h1>
      <p className="mt-5">{post.description}</p>
      <p className="sp-small mt-6">
        {locale === "zh"
          ? `出演：${post.actorSlugs.join("、")}`
          : `Starring ${post.actorSlugs.join(", ")}`}
      </p>
      <PostActions id={post.id} locale={locale} />
      {account.user?.id === post.authorId ? (
        <GameButton variant="ghost" className="mt-4" onClick={() => void remove()}>
          {locale === "zh" ? "删除" : "Delete"}
        </GameButton>
      ) : null}
    </article>
  );
}
