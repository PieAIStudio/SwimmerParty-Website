"use client";
import { useSiteI18n } from "@/i18n/client";
import { useEffect, useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";
import type { CommunityPost } from "./types";
import { Link } from "@/i18n/navigation";
export function CommunityFeed({ locale: _locale }: { locale: "en" | "zh" }) {
  // Retain the existing locale prop; authored copy follows the site provider.
  void _locale;
  const { t } = useSiteI18n();
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
        <p className="sp-lead">{t("community.intro")}</p>
        <GameButton variant="secondary" onClick={() => setOpen((v) => !v)}>
          {t("community.openForm")}
        </GameButton>
      </div>
      {open ? (
        <form onSubmit={submit} className="sp-panel mt-6 grid gap-4 p-5">
          <label className="grid gap-2">
            <span className="sp-label">{t("community.titleLabel")}</span>
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
              <option value="image">{t("community.kind.image")}</option>
              <option value="video">{t("community.kind.video")}</option>
              <option value="audio">{t("community.kind.audio")}</option>
              <option value="game">{t("community.kind.game")}</option>
            </select>
            <input
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              aria-label={t("community.actorSlugLabel")}
              className="rounded border border-border bg-background p-3"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("community.descriptionPlaceholder")}
            className="rounded border border-border bg-background p-3"
          />
          <textarea
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            placeholder={t("community.recipePlaceholder")}
            className="rounded border border-border bg-background p-3"
          />
          <input
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            placeholder={t("community.toolPlaceholder")}
            className="rounded border border-border bg-background p-3"
          />
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={creditConfirmed}
              onChange={(e) => setCreditConfirmed(e.target.checked)}
            />
            {t("community.creditConfirmation")}
          </label>
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={rightsConfirmed}
              onChange={(e) => setRightsConfirmed(e.target.checked)}
            />
            {t("community.rightsConfirmation")}
          </label>
          <GameButton
            type="submit"
            variant="primary"
            disabled={!creditConfirmed || !rightsConfirmed}
          >
            {t("community.submit")}
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
              {t("community.author", { author: post.author })}
            </p>
            <p className="sp-small mt-4">{t("community.waiting")}</p>
          </article>
        ))}
        {!posts.length ? <p className="sp-lead">{t("community.empty")}</p> : null}
      </div>
    </div>
  );
}
