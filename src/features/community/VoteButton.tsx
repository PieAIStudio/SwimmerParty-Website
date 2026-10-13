"use client";
import { useSiteI18n } from "@/i18n/client";
import { useEffect, useState } from "react";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { announceFirstUse } from "@/features/guidance/client";
import { voteCountSchema, voteResultSchema } from "@/contracts/community";
export function VoteButton({ slug, name }: { slug: string; name: string; locale: "en" | "zh" }) {
  const { t } = useSiteI18n();
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"signin" | "failed" | "saved" | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/community/votes?slug=${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Vote count unavailable");
        const parsed = voteCountSchema.parse(await response.json());
        if (!controller.signal.aborted) setCount(parsed.count);
      })
      .catch(() => {
        if (!controller.signal.aborted) setNotice("failed");
      });
    return () => controller.abort();
  }, [slug]);
  async function vote() {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/community/votes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (response.status === 401) {
        setNotice("signin");
        return;
      }
      if (!response.ok) throw new Error("Vote unavailable");
      const result = voteResultSchema.parse(await response.json());
      setCount(result.count);
      setNotice("saved");
      if (result.voted) announceFirstUse("vote");
    } catch {
      setNotice("failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <p className="sp-small mb-2 text-muted-foreground">{t("firstUse.vote.condition")}</p>
      <GameButton variant="ghost" pending={busy} onClick={() => void vote()}>
        {t("community.voteLabel", { name })}
        {count === null ? "" : ` · ${count}`}
      </GameButton>
      {notice ? (
        <div className="mt-2">
          <GameToast tone={notice === "saved" ? "success" : "danger"}>
            {t(
              notice === "signin"
                ? "community.signInToVote"
                : notice === "saved"
                  ? "firstUse.vote.saved"
                  : "firstUse.actionFailed",
            )}
          </GameToast>
        </div>
      ) : null}
    </div>
  );
}
