"use client";
import { useSiteI18n } from "@/i18n/client";
import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Mannequin } from "@/site/Mannequin";
import type { Actor } from "@/content/actors";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { Link } from "@/i18n/navigation";
import { useAccount } from "@/features/account";
import { starterPack, SignInRequired } from "@/features/assets/client";
import { saveBlob } from "@/lib/browser-files";
const CAST_EVENT = "sp-cast-change";
function readCast(): string {
  const shared = new URLSearchParams(location.search).get("a");
  if (shared !== null) return shared;
  try {
    return localStorage.getItem("sp-cast") ?? "";
  } catch {
    return "";
  }
}
function subscribeCast(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CAST_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CAST_EVENT, callback);
  };
}
export function CastBoard({
  actors,
  starterSlots,
  locale,
}: {
  actors: Actor[];
  starterSlots: Record<string, string[]>;
  locale: "en" | "zh";
}) {
  const { t } = useSiteI18n();
  const account = useAccount();
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  // The shared link wins over the saved cast; the server renders nothing until the browser reads it.
  const raw = useSyncExternalStore(subscribeCast, readCast, () => null);
  const slugs = useMemo(
    () => (raw === null ? null : raw.split(",").filter(Boolean).slice(0, 12)),
    [raw],
  );
  const cast = useMemo(() => actors.filter((a) => slugs?.includes(a.slug)), [actors, slugs]);
  const names = cast.map((a) => (locale === "zh" ? a.nameCn : a.nameEn)).join(", ");
  function save(next: string[]) {
    try {
      localStorage.setItem("sp-cast", next.join(","));
    } catch {}
    // Once edited, the saved cast is the truth, so drop a shared ?a= from the address.
    const url = new URL(location.href);
    url.searchParams.delete("a");
    history.replaceState(history.state, "", url);
    window.dispatchEvent(new Event(CAST_EVENT));
  }
  async function copy(value: string) {
    await navigator.clipboard?.writeText(value);
  }
  async function downloadPack() {
    if (downloading) return;
    const { user } = await account.whenReady();
    if (!user) {
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
  if (slugs === null) return null;
  if (cast.length === 0)
    return (
      <div className="mt-8">
        <p className="sp-lead">{t("cast.empty")}</p>
        <GameButton variant="primary" href="/actors" linkComponent={Link} className="mt-6">
          {t("cast.pickActors")}
        </GameButton>
      </div>
    );
  return (
    <div>
      <p className="sp-small mt-8">{t("cast.count", { count: cast.length })}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <GameButton
          variant="primary"
          onClick={() => void downloadPack()}
          aria-busy={downloading || account.loading}
        >
          {downloading ? t("cast.downloading") : t("cast.downloadPack")}
        </GameButton>
        <GameButton
          variant="secondary"
          onClick={() => void copy(`${location.origin}/cast?a=${slugs.join(",")}`)}
        >
          {t("cast.share")}
        </GameButton>
        <GameButton
          variant="secondary"
          onClick={() => void copy(`${t("cast.creditPrefix")}${names} · Swim In AI`)}
        >
          {t("cast.copyCredit")}
        </GameButton>
        <GameButton variant="ghost" onClick={() => save([])}>
          {t("cast.clear")}
        </GameButton>
      </div>
      {failed ? (
        <div className="mt-4">
          <GameToast tone="danger">{t("cast.failed")}</GameToast>
        </div>
      ) : null}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cast.map((a) => (
          <article key={a.slug} className="sp-panel p-4">
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
              {a.portrait ? (
                <Image
                  src={a.portrait}
                  alt=""
                  width={240}
                  height={320}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Mannequin className="h-full w-full" />
              )}
            </div>
            <h3 className="mt-3 font-semibold">{locale === "zh" ? a.nameCn : a.nameEn}</h3>
            <GameButton
              className="mt-3"
              variant="ghost"
              onClick={() => save(slugs.filter((s) => s !== a.slug))}
            >
              {t("cast.remove")}
            </GameButton>
          </article>
        ))}
      </div>
    </div>
  );
}
export function CastAddButton({ slug }: { slug: string; locale: "en" | "zh"; name?: string }) {
  const { t } = useSiteI18n();
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
      {added ? t("cast.added") : t("cast.add")}
    </GameButton>
  );
}
