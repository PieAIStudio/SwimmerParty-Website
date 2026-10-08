"use client";
import { useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";
export function VoteButton({
  slug,
  name,
  locale,
}: {
  slug: string;
  name: string;
  locale: "en" | "zh";
}) {
  const [count, setCount] = useState(0);
  const [voted, setVoted] = useState(false);
  async function vote() {
    const r = await fetch("/api/community/votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (r.status === 401) {
      alert(locale === "zh" ? "登录后投票" : "Sign in to vote");
      return;
    }
    if (r.ok) {
      const x = await r.json();
      setCount(x.count);
      setVoted(x.voted);
    }
  }
  return (
    <GameButton variant="ghost" onClick={vote}>
      {voted
        ? locale === "zh"
          ? "已想看"
          : "You want more"
        : locale === "zh"
          ? `想看更多${name}`
          : `Want more of ${name}`}{" "}
      · {count}
    </GameButton>
  );
}
