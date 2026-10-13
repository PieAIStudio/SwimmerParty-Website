"use client";
import { useEffect, useRef, useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { useAccount } from "@/features/account";
import {
  communityPostsResponseSchema,
  type CommunityPost,
  type ReviewAction,
} from "@/contracts/community";

type ReviewState = { userId: string } & (
  | { status: "ready"; posts: CommunityPost[] }
  | { status: "signed-out" | "forbidden" | "unavailable" }
);
function rejectedStatus(status: number): "signed-out" | "forbidden" | "unavailable" {
  return status === 401 ? "signed-out" : status === 403 ? "forbidden" : "unavailable";
}

export function ReviewPanel() {
  const { t } = useSiteI18n();
  const account = useAccount();
  const userId = account.user?.id;
  const [queue, setQueue] = useState<ReviewState | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [pending, setPending] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!userId || account.loading) return;
    const controller = new AbortController();
    request.current = controller;
    async function load() {
      try {
        const response = await fetch("/api/community/review", {
          cache: "no-store",
          signal: controller.signal,
        });
        const next: ReviewState = response.ok
          ? {
              userId: userId!,
              status: "ready",
              posts: communityPostsResponseSchema.parse(await response.json()).posts,
            }
          : { userId: userId!, status: rejectedStatus(response.status) };
        if (!controller.signal.aborted) {
          setQueue(next);
          setPending(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setQueue({ userId: userId!, status: "unavailable" });
          setPending(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [userId, account.loading, refresh]);

  async function review(id: string, action: ReviewAction) {
    const signal = request.current?.signal;
    if (pending || !userId || !signal || signal.aborted) return;
    setPending(true);
    try {
      const response = await fetch("/api/community/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, action }),
        signal,
      });
      if (signal.aborted) return;
      if (!response.ok) {
        setQueue({ userId, status: rejectedStatus(response.status) });
        return;
      }
      setQueue(null);
      setRefresh((value) => value + 1);
    } catch {
      if (!signal.aborted) setQueue({ userId, status: "unavailable" });
    } finally {
      if (!signal.aborted) setPending(false);
    }
  }

  // Never reuse another account's queue, even for the render before effect cleanup.
  const current = queue?.userId === userId ? queue : null;
  if (account.loading || (userId && !current))
    return (
      <section className="sp-container sp-section">
        <output>{t("community.reviewLoading")}</output>
      </section>
    );
  if (!userId || current?.status === "signed-out")
    return (
      <section className="sp-container sp-section">
        <p className="sp-lead">{t("community.reviewSignIn")}</p>
        <GameButton
          className="mt-6"
          pending={account.busy}
          {...account.signInIntent}
          onClick={() => void account.signIn()}
        >
          {t("assets.signIn")}
        </GameButton>
      </section>
    );
  if (current?.status !== "ready")
    return (
      <section className="sp-container sp-section">
        <output className="sp-lead block">
          {t(
            current?.status === "forbidden"
              ? "community.reviewForbidden"
              : "community.reviewUnavailable",
          )}
        </output>
        {current?.status !== "forbidden" ? (
          <GameButton
            className="mt-6"
            onClick={() => {
              setQueue(null);
              setRefresh((value) => value + 1);
            }}
          >
            {t("community.reviewRetry")}
          </GameButton>
        ) : null}
      </section>
    );
  return (
    <section className="sp-container sp-section">
      <h1 className="sp-title">{t("community.reviewTitle")}</h1>
      {current.posts.length ? (
        current.posts.map((post) => (
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
              <GameButton pending={pending} onClick={() => void review(post.id, "approve")}>
                {t("community.approve")}
              </GameButton>
              <GameButton
                variant="ghost"
                pending={pending}
                onClick={() => void review(post.id, "hide")}
              >
                {t("community.hide")}
              </GameButton>
            </div>
          </article>
        ))
      ) : (
        <p className="sp-lead mt-6">{t("community.reviewEmpty")}</p>
      )}
    </section>
  );
}
