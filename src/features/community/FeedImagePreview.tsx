"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GameBadge, GameButton } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { Link } from "@/i18n/navigation";
import type { CommunityPost } from "@/contracts/community";
import { normalizeMediaAccess } from "@/contracts/community-transfer";

type ImageItem = CommunityPost["media"][number];
type Grant = ReturnType<typeof normalizeMediaAccess>;

/** A compact first-image cover, not a new thumbnail service or a permanent public URL. */
export function FeedImagePreview({ post }: { post: CommunityPost }) {
  const { t } = useSiteI18n();
  const images = post.media
    .filter((item) => item.kind === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const item = images[0];
  return (
    <div className="my-5 grid gap-2">
      {item ? (
        <Thumbnail
          key={`${post.id}:${post.revision}:${item.id}`}
          item={item}
          title={post.title}
          href={`/works/p/${post.id}`}
        />
      ) : (
        <div className="grid aspect-[4/3] place-items-center rounded-[var(--game-ui-radius-card)] bg-muted p-4">
          <p>{t("c.mediaUnavailable")}</p>
        </div>
      )}
      {images.length > 1 ? (
        <GameBadge className="justify-self-start">
          {t("c3.imageCount", { count: images.length })}
        </GameBadge>
      ) : null}
    </div>
  );
}

function Thumbnail({ item, title, href }: { item: ImageItem; title: string; href: string }) {
  const { t } = useSiteI18n();
  const frame = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ active: false, generation: 0 });
  const [attempt, retry] = useState(0);
  const [result, setResult] = useState<{ key: string; source?: Grant; failed?: boolean } | null>(
    null,
  );
  const key = `${item.id}:${view.generation}:${attempt}`;
  const current = view.active && result?.key === key ? result : null;
  const source = current?.source;

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const supported = typeof window.IntersectionObserver === "function";
    let near = !supported;
    const update = () => {
      const active = near && document.visibilityState !== "hidden";
      setView((value) =>
        value.active === active ? value : { active, generation: value.generation + 1 },
      );
    };
    const observer = supported
      ? new IntersectionObserver(
          ([entry]) => {
            near = entry.isIntersecting;
            update();
          },
          { rootMargin: "160px" },
        )
      : null;
    observer?.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!view.active) return;
    const controller = new AbortController();
    const requestedAt = Date.now();
    void fetch(`/api/community/media/${item.id}`, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mediaId: item.id, mode: "read" }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw Error();
        const grant = normalizeMediaAccess(await response.json(), item.id, requestedAt);
        if (!grant.mime.startsWith("image/") || Date.parse(grant.expiresAt) <= Date.now())
          throw Error();
        if (!controller.signal.aborted) setResult({ key, source: grant });
      })
      .catch(() => {
        // No provider message, URL or credentials enter UI/logs. Retry is explicit after a failure.
        if (!controller.signal.aborted) setResult({ key, failed: true });
      });
    return () => controller.abort();
  }, [item.id, key, view.active]);

  useEffect(() => {
    if (!source) return;
    // Remove the old image and re-authorize when it expires; no grant survives tab/viewport or identity changes.
    const timer = setTimeout(
      () => retry((value) => value + 1),
      Math.max(0, Date.parse(source.expiresAt) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [source]);

  return (
    <div
      ref={frame}
      data-community-thumbnail={item.id}
      className="relative aspect-[4/3] min-w-0 rounded-[var(--game-ui-radius-card)] bg-muted"
      aria-busy={view.active && !current}
    >
      {source ? (
        <Link
          href={href}
          prefetch={false}
          aria-label={t("c3.openWork", { title })}
          className="absolute inset-0 rounded-[inherit]"
        >
          <Image
            unoptimized
            fill
            loading="lazy"
            src={source.url}
            alt={item.altText ?? title}
            sizes="(max-width: 767px) calc(100vw - 80px), 500px"
            className="rounded-[inherit] object-contain"
            referrerPolicy="no-referrer"
            onError={() =>
              setResult((value) => (value?.key === key ? { key, failed: true } : value))
            }
          />
        </Link>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <output className="sp-small">
            {t(current?.failed ? "c.mediaUnavailable" : "c.loading")}
          </output>
          {current?.failed ? (
            <GameButton onClick={() => retry((value) => value + 1)}>{t("c.retry")}</GameButton>
          ) : null}
        </div>
      )}
    </div>
  );
}
