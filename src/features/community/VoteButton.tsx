"use client";
import { useSiteI18n } from "@/i18n/client";
import { useEffect, useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { voteCountSchema, voteResultSchema } from "@/contracts/community";
export function VoteButton({ slug, name }: { slug: string; name: string; locale: "en" | "zh" }) {
  const { t } = useSiteI18n();
  const [count, setCount] = useState(0);
  useEffect(() => {
    void fetch(`/api/community/votes?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((x: unknown) => {
        const parsed = voteCountSchema.safeParse(x);
        if (parsed.success) setCount(parsed.data.count);
      });
  }, [slug]);
  async function vote() {
    const r = await fetch("/api/community/votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (r.status === 401) {
      alert(t("community.signInToVote"));
      return;
    }
    if (r.ok) {
      const x = voteResultSchema.parse(await r.json());
      setCount(x.count);
    }
  }
  return (
    <GameButton variant="ghost" onClick={vote}>
      {t("community.voteLabel", { name })} {""}· {count}
    </GameButton>
  );
}
