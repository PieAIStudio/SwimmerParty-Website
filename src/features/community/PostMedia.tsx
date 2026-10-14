"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { normalizeMediaAccess } from "@/contracts/community-transfer";
import type { CommunityPost, AuthorPost, VideoDescriptor } from "@/contracts/community";
import { communityEmbed } from "./video";
import { AudioPreview } from "./AudioPreview";
export function VideoPreview({ video, title }: { video: VideoDescriptor; title: string }) {
  const { t } = useSiteI18n();
  const [open, setOpen] = useState(false);
  let embed: string;
  try {
    embed = communityEmbed(video);
  } catch {
    return <p>{t("c.mediaUnavailable")}</p>;
  }
  return (
    <div className="grid gap-3" data-community-video>
      {open ? (
        <iframe
          src={embed}
          title={t("c.playerTitle", { title })}
          className="aspect-video w-full rounded-xl border-0"
          // Only cross-origin, hard-allowlisted players can reach this element; none can access this document to remove sandbox.
          // oxlint-disable-next-line react/iframe-missing-sandbox
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <GameButton onClick={() => setOpen(true)}>{t("c.openVideo")}</GameButton>
      )}
      <p className="sp-small text-muted-foreground">{t("c.externalFallback")}</p>
      <a
        href={video.canonicalUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline"
      >
        {t("c.original", { platform: video.platform })}
      </a>
    </div>
  );
}
function StoredMedia({
  item,
  transcript,
  review,
  onAccessDenied,
}: {
  item: CommunityPost["media"][number];
  transcript: string | null;
  review: boolean;
  onAccessDenied?: () => void;
}) {
  const { t } = useSiteI18n();
  const [source, setSource] = useState<{ url: string; expiresAt: string } | null>(null);
  const [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!source) return;
    const timer = setTimeout(
      () => setSource(null),
      Math.max(0, Date.parse(source.expiresAt) - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [source]);
  async function load() {
    setBusy(true);
    setError(false);
    try {
      const requestedAt = Date.now();
      const response = await fetch(`/api/community/media/${item.id}`, {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mediaId: item.id, mode: review ? "review" : "read" }),
      });
      if (!response.ok) {
        if (review && [401, 403, 404].includes(response.status)) onAccessDenied?.();
        throw Error();
      }
      const data = normalizeMediaAccess(await response.json(), item.id, requestedAt);
      if (Date.parse(data.expiresAt) <= Date.now() || !data.mime.startsWith(item.kind + "/"))
        throw Error();
      setSource(data);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-w-0 grid gap-2" data-community-media={item.id}>
      {source ? (
        item.kind === "image" ? (
          <Image
            unoptimized
            src={source.url}
            width={1024}
            height={768}
            alt={item.altText ?? ""}
            className="h-auto max-h-96 w-full object-contain"
            onError={() => {
              setSource(null);
              setError(true);
            }}
          />
        ) : (
          <AudioPreview
            src={source.url}
            transcript={transcript}
            onError={() => {
              setSource(null);
              setError(true);
            }}
          />
        )
      ) : (
        <GameButton pending={busy} onClick={() => void load()}>
          {t("c.openMedia")}
        </GameButton>
      )}
      {error ? <output>{t("c.mediaUnavailable")}</output> : null}
    </div>
  );
}
export function PostMedia({
  post,
  review = false,
  onAccessDenied,
}: {
  post: CommunityPost | AuthorPost;
  review?: boolean;
  onAccessDenied?: () => void;
}) {
  return (
    <div className="my-5 grid gap-4">
      {post.video ? (
        <VideoPreview key={post.video.canonicalUrl} video={post.video} title={post.title ?? ""} />
      ) : null}
      {post.media.map((item) => (
        <StoredMedia
          key={item.id}
          item={item}
          transcript={post.description}
          review={review}
          onAccessDenied={onAccessDenied}
        />
      ))}
    </div>
  );
}
