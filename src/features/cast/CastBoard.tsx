"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import type { Actor } from "@/content/actors";
import { GameButton } from "@pieai/swimmer-ui-kit";
export function CastBoard({ actors }: { actors: Actor[] }) {
  const [slugs, setSlugs] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const p = new URLSearchParams(location.search).get("a");
    const saved = localStorage.getItem("sp-cast");
    return (p ?? saved ?? "").split(",").filter(Boolean).slice(0, 12);
  });
  const cast = useMemo(() => actors.filter((a) => slugs.includes(a.slug)), [actors, slugs]);
  function save(next: string[]) {
    setSlugs(next);
    localStorage.setItem("sp-cast", next.join(","));
  }
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <GameButton
          variant="secondary"
          onClick={() =>
            navigator.clipboard?.writeText(`${location.origin}/cast?a=${slugs.join(",")}`)
          }
        >
          Share
        </GameButton>
        <GameButton variant="secondary" onClick={() => save([])}>
          Clear
        </GameButton>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <h2 className="mt-3 font-semibold">{a.nameEn}</h2>
            <p className="sp-small text-muted-foreground">{a.tagline.en}</p>
            <GameButton
              className="mt-3"
              variant="ghost"
              onClick={() => save(slugs.filter((s) => s !== a.slug))}
            >
              Remove
            </GameButton>
          </article>
        ))}
      </div>
      {cast.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          Add actors from the roster to build your cast.
        </p>
      ) : null}
    </div>
  );
}
