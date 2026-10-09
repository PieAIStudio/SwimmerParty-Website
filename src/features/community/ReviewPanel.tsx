"use client";
import { useEffect, useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import {
  communityPostsResponseSchema,
  type CommunityPost,
  type ReviewAction,
} from "@/contracts/community";

export function ReviewPanel() {
  const { t } = useSiteI18n();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  async function load() {
    const response = await fetch("/api/community/review");
    if (response.ok) setPosts(communityPostsResponseSchema.parse(await response.json()).posts);
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function review(id: string, action: ReviewAction) {
    await fetch("/api/community/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await load();
  }
  return (
    <main className="sp-container sp-section">
      <h1 className="sp-title">{t("community.reviewTitle")}</h1>
      {posts.length ? (
        posts.map((post) => (
          <article
            key={post.id}
            className="sp-card mt-6 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <h2 className="sp-subtitle">{post.title}</h2>
              <p className="sp-small mt-2">
                {post.author} · {post.actorSlugs.join(", ")}
              </p>
            </div>
            <div className="flex gap-3">
              <GameButton onClick={() => review(post.id, "approve")}>
                {t("community.approve")}
              </GameButton>
              <GameButton variant="ghost" onClick={() => review(post.id, "hide")}>
                {t("community.hide")}
              </GameButton>
            </div>
          </article>
        ))
      ) : (
        <p className="sp-lead mt-6">{t("community.reviewEmpty")}</p>
      )}
    </main>
  );
}
