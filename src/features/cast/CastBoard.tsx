"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import type { Actor } from "@/content/actors";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { useAccount } from "@/features/account";
import { starterPack, SignInRequired } from "@/features/assets/client";
import { saveBlob } from "@/lib/browser-files";
export function CastBoard({
  actors,
  starterSlots,
  locale,
}: {
  actors: Actor[];
  starterSlots: Record<string, string[]>;
  locale: "en" | "zh";
}) {
  const account = useAccount();
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slugs, setSlugs] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const p = new URLSearchParams(location.search).get("a");
    const saved = localStorage.getItem("sp-cast");
    return (p ?? saved ?? "").split(",").filter(Boolean).slice(0, 12);
  });
  const cast = useMemo(() => actors.filter((a) => slugs.includes(a.slug)), [actors, slugs]);
  const names = cast.map((a) => (locale === "zh" ? a.nameCn : a.nameEn)).join(", ");
  function save(next: string[]) {
    setSlugs(next);
    localStorage.setItem("sp-cast", next.join(","));
  }
  async function copy(value: string) {
    await navigator.clipboard?.writeText(value);
  }
  async function downloadPack() {
    if (!account.user) {
      await account.signIn();
      return;
    }
    setDownloading(true);
    setFailed(false);
    try {
      const { blob, filename } = await starterPack(
        cast.map((a) => ({ ...a, slots: starterSlots[a.slug] ?? [] })),
      );
      saveBlob(blob, filename);
      account.event("starter_download", { format: "cast" });
    } catch (error) {
      if (error instanceof SignInRequired) await account.signIn();
      else setFailed(true);
    } finally {
      setDownloading(false);
    }
  }
  return (
    <div>
      <p className="sp-small mt-8">
        {locale === "zh"
          ? `${cast.length} 位演员 · 最多 12 位`
          : `${cast.length} actors · up to 12`}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <GameButton
          variant="secondary"
          onClick={() => void copy(`${location.origin}/cast?a=${slugs.join(",")}`)}
        >
          {locale === "zh" ? "分享选角单" : "Share cast"}
        </GameButton>
        <GameButton variant="secondary" onClick={() => void copy(names)}>
          {locale === "zh" ? "复制名单" : "Copy names"}
        </GameButton>
        <GameButton
          variant="secondary"
          onClick={() =>
            void copy(`${locale === "zh" ? "署名：" : "Credit: "}${names} · Swim In AI`)
          }
        >
          {locale === "zh" ? `署名：${names} · Swim In AI` : `Credit: ${names} · Swim In AI`}
        </GameButton>
        <GameButton variant="ghost" onClick={() => save([])}>
          {locale === "zh" ? "清空" : "Clear cast"}
        </GameButton>
      </div>
      <section className="mt-8">
        <h2 className="sp-title">{locale === "zh" ? "合影" : "Lineup"}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cast.map((a) => (
            <article key={a.slug} className="sp-panel p-4">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={a.portrait ?? "/media/placeholder.svg"}
                  alt=""
                  width={240}
                  height={320}
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="mt-3 font-semibold">{locale === "zh" ? a.nameCn : a.nameEn}</h3>
              <GameButton
                className="mt-3"
                variant="ghost"
                onClick={() => save(slugs.filter((s) => s !== a.slug))}
              >
                {locale === "zh" ? "移出" : "Remove"}
              </GameButton>
            </article>
          ))}
        </div>
      </section>
      {cast.length === 0 ? (
        <p className="sp-lead mt-8">
          {locale === "zh"
            ? "选角单是空的。在演员页或演员列表里点“加入选角单”。"
            : "Your cast is empty. Add actors from their pages or the roster."}
        </p>
      ) : null}
      <p className="sp-small mt-8 text-muted-foreground">
        {locale === "zh"
          ? "每位演员的懒人包，和一份合并好的署名。"
          : "Each actor’s starter pack, plus one credit line for all."}
      </p>
      <GameButton
        className="mt-4"
        variant="primary"
        onClick={() => void downloadPack()}
        disabled={downloading || cast.length === 0}
      >
        {downloading
          ? locale === "zh"
            ? "下载中…"
            : "Downloading…"
          : locale === "zh"
            ? "下载选角包"
            : "Download cast pack"}
      </GameButton>
      {failed ? (
        <div className="mt-4">
          <GameToast tone="danger">
            {locale === "zh" ? "出了点问题，请再试一次。" : "Something went wrong. Try again."}
          </GameToast>
        </div>
      ) : null}
    </div>
  );
}
export function CastAddButton({
  slug,
  locale,
}: {
  slug: string;
  locale: "en" | "zh";
  name?: string;
}) {
  const [added, setAdded] = useState(false);
  function add() {
    const saved = (localStorage.getItem("sp-cast") ?? "").split(",").filter(Boolean);
    if (!saved.includes(slug) && saved.length < 12) {
      localStorage.setItem("sp-cast", [...saved, slug].join(","));
      setAdded(true);
    }
  }
  return (
    <GameButton variant="ghost" onClick={add}>
      {added
        ? locale === "zh"
          ? "已在选角单"
          : "In your cast"
        : locale === "zh"
          ? "加入选角单"
          : "Add to cast"}
    </GameButton>
  );
}
