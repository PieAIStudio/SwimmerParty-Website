"use client";
import { useEffect, useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";
import type { CommunityPost } from "./types";
import { Link } from "@/i18n/navigation";
export function CommunityFeed({ locale }: { locale: "en" | "zh" }) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("image");
  const [actor, setActor] = useState("tang-yunqiu");
  useEffect(() => {
    fetch("/api/community/posts")
      .then((r) => r.json())
      .then((x) => setPosts(x.posts ?? []))
      .catch(() => undefined);
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, kind, actorSlugs: [actor] }),
    });
    if (r.ok) {
      const result = (await r.json()) as { post: CommunityPost };
      setPosts((current) => [result.post, ...current]);
      setTitle("");
      setOpen(false);
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="sp-lead">
          {locale === "zh"
            ? "先是我们自己的作品，然后是大家用我们演员做的一切：图片、视频、声音、游戏。"
            : "Our own productions first. Then everything you make with our actors: images, videos, voices, games."}
        </p>
        <GameButton variant="secondary" onClick={() => setOpen((v) => !v)}>
          {locale === "zh" ? "发布作品" : "Post your work"}
        </GameButton>
      </div>
      {open ? (
        <form onSubmit={submit} className="sp-panel mt-6 grid gap-4 p-5">
          <label className="grid gap-2">
            <span className="sp-label">{locale === "zh" ? "标题" : "Title"}</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded border border-border bg-background p-3"
            />
          </label>
          <div className="flex gap-3">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="rounded border border-border bg-background p-3"
            >
              <option value="image">Image · 图片</option>
              <option value="video">Video · 视频</option>
              <option value="audio">Audio · 声音</option>
              <option value="game">Game · 游戏</option>
            </select>
            <input
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              aria-label="Actor slug"
              className="rounded border border-border bg-background p-3"
            />
          </div>
          <GameButton type="submit" variant="primary">
            {locale === "zh" ? "发布" : "Post"}
          </GameButton>
        </form>
      ) : null}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.id} className="sp-panel p-5">
            <Link href={`/works/p/${post.id}`} className="sp-subtitle hover:underline">
              {post.title}
            </Link>
            <p className="sp-small mt-2 text-muted-foreground">
              {locale === "zh" ? `作者：${post.author}` : `by ${post.author}`}
            </p>
            <p className="sp-small mt-4">{locale === "zh" ? "等待审核" : "Waiting for review"}</p>
          </article>
        ))}
        {!posts.length ? (
          <p className="sp-lead">
            {locale === "zh"
              ? "还没有作品。来当第一个：发一个你用我们演员做的东西。"
              : "Nothing here yet. Be the first: post something you made with our actors."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
