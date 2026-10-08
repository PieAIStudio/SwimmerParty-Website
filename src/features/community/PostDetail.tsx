"use client";
import { useEffect, useState } from "react";
import { PostActions } from "./PostActions";
import type { CommunityPost } from "./types";
export function PostDetail({ id, locale }: { id: string; locale: "en" | "zh" }) {
  const [post, setPost] = useState<CommunityPost | null>(null);
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
    </article>
  );
}
