"use client";
import { useState } from "react";
import { GameButton } from "@pieai/swimmer-ui-kit";

export function PostActions({ id, locale }: { id: string; locale: "en" | "zh" }) {
  const [liked, setLiked] = useState(false);
  const [reported, setReported] = useState(false);
  async function like() {
    const response = await fetch("/api/community/likes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    if (response.status === 401)
      return alert(locale === "zh" ? "登录后参与" : "Sign in to join in");
    if (response.ok) setLiked(((await response.json()) as { liked: boolean }).liked);
  }
  async function report() {
    const response = await fetch("/api/community/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId: id, reason: "Something else" }),
    });
    if (response.status === 401)
      return alert(locale === "zh" ? "登录后参与" : "Sign in to join in");
    if (response.ok) setReported(true);
  }
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <GameButton onClick={() => void like()}>
        {liked ? (locale === "zh" ? "已赞" : "Liked") : locale === "zh" ? "赞" : "Like"}
      </GameButton>
      <GameButton variant="ghost" onClick={() => void report()} disabled={reported}>
        {reported
          ? locale === "zh"
            ? "谢谢，我们会看一下。"
            : "Thanks. We’ll take a look."
          : locale === "zh"
            ? "举报这个作品"
            : "Report this post"}
      </GameButton>
    </div>
  );
}
