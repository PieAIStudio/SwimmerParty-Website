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
  const [description, setDescription] = useState("");
  const [recipe, setRecipe] = useState("");
  const [tool, setTool] = useState("");
  const [creditConfirmed, setCreditConfirmed] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
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
      body: JSON.stringify({
        title,
        kind,
        actorSlugs: [actor],
        description,
        recipe,
        tool: tool || undefined,
        creditConfirmed,
        rightsConfirmed,
      }),
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
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={locale === "zh" ? "简介（可选）" : "Description (optional)"}
            className="rounded border border-border bg-background p-3"
          />
          <textarea
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            placeholder={
              locale === "zh"
                ? "怎么做的：提示词或步骤（可选）"
                : "How you made it: prompt or steps (optional)"
            }
            className="rounded border border-border bg-background p-3"
          />
          <input
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            placeholder={
              locale === "zh" ? "用什么做的？（可选）" : "What did you make it with? (optional)"
            }
            className="rounded border border-border bg-background p-3"
          />
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={creditConfirmed}
              onChange={(e) => setCreditConfirmed(e.target.checked)}
            />
            {locale === "zh" ? "我的作品里署了 Swim In AI。" : "My work credits Swim In AI."}
          </label>
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={rightsConfirmed}
              onChange={(e) => setRightsConfirmed(e.target.checked)}
            />
            {locale === "zh"
              ? "这是我做的，并且遵守免费商用的规则。"
              : "I made this, and it follows the Free License rules."}
          </label>
          <GameButton
            type="submit"
            variant="primary"
            disabled={!creditConfirmed || !rightsConfirmed}
          >
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
