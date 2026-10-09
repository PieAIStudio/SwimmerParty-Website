"use client";
import { useSiteI18n } from "@/i18n/client";
import { useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { likeResultSchema } from "@/contracts/community";

export function PostActions({ id }: { id: string; locale: "en" | "zh" }) {
  const { t } = useSiteI18n();
  const [liked, setLiked] = useState(false);
  const [reported, setReported] = useState(false);
  async function like() {
    const response = await fetch("/api/community/likes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId: id, liked: !liked }),
    });
    if (response.status === 401) return alert(t("community.signIn"));
    if (response.ok) setLiked(likeResultSchema.parse(await response.json()).liked);
  }
  async function report() {
    const response = await fetch("/api/community/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId: id, reason: "Something else" }),
    });
    if (response.status === 401) return alert(t("community.signIn"));
    if (response.ok) setReported(true);
  }
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <GameButton aria-pressed={liked} onClick={() => void like()}>
        {t("community.like")}
      </GameButton>
      <GameButton variant="ghost" onClick={() => void report()} disabled={reported}>
        {reported ? t("community.reported") : t("community.report")}
      </GameButton>
    </div>
  );
}
