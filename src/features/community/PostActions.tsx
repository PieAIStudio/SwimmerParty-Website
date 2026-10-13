"use client";
import { useSiteI18n } from "@/i18n/client";
import { useState } from "react";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { likeResultSchema } from "@/contracts/community";

export function PostActions({ id }: { id: string; locale: "en" | "zh" }) {
  const { t } = useSiteI18n();
  const [liked, setLiked] = useState(false);
  const [reported, setReported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"signin" | "failed" | null>(null);
  async function like() {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/community/likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId: id, liked: !liked }),
      });
      if (response.status === 401) {
        setNotice("signin");
        return;
      }
      if (!response.ok) throw new Error("Like failed");
      setLiked(likeResultSchema.parse(await response.json()).liked);
    } catch {
      setNotice("failed");
    } finally {
      setBusy(false);
    }
  }
  async function report() {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/community/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postId: id, reason: "Something else" }),
      });
      if (response.status === 401) {
        setNotice("signin");
        return;
      }
      if (!response.ok) throw new Error("Report failed");
      setReported(true);
    } catch {
      setNotice("failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {notice ? (
        <div className="basis-full">
          <GameToast tone="danger">
            {t(notice === "signin" ? "community.signIn" : "firstUse.actionFailed")}
          </GameToast>
        </div>
      ) : null}
      <GameButton pending={busy} aria-pressed={liked} onClick={() => void like()}>
        {t("community.like")}
      </GameButton>
      <GameButton pending={busy} variant="ghost" onClick={() => void report()} disabled={reported}>
        {reported ? t("community.reported") : t("community.report")}
      </GameButton>
    </div>
  );
}
