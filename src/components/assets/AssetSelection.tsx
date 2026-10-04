"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { Actor } from "@/content/actors";
import type { ActorAssets, AssetItem } from "@/content/asset-types";
import { SWIMMER_PRODUCTS } from "@/content/swimmer-products";
import { useSiteI18n } from "@/i18n/client";
import { characterProfile } from "@/lib/asset-profile";
import { fetchImageBlob, saveBlob } from "@/lib/browser-files";
import { GUEST_COOLDOWN_KEY, GUEST_DOWNLOAD_WINDOW_SECONDS } from "@/lib/downloads";
import { GameBadge, GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { LiquidPopover } from "@pieai/swimmer-ui-kit/liquid-presence";
import { useAccount } from "../AccountProvider";
import { MemberExportDialog } from "./MemberExportDialog";

type Selection = {
  selected: ReadonlySet<string>;
  change: (slots: string[], add: boolean) => void;
  downloadOne: (item: AssetItem) => Promise<void>;
  requestPack: () => void;
  remaining: number;
  busy: boolean;
  modalOpen: boolean;
  sourceRef: RefObject<HTMLElement | null>;
};
const SelectionContext = createContext<Selection | null>(null);
export function useAssetSelection(): Selection {
  const value = useContext(SelectionContext);
  if (!value) throw new Error("Asset selection requires its library provider");
  return value;
}

export function AssetSelectionProvider({
  actor,
  assets,
  children,
}: {
  actor: Actor;
  assets: ActorAssets;
  children: ReactNode;
}) {
  const { t } = useSiteI18n();
  const [state, setState] = useState<{ slug: string | null; slots: string[] }>({
    slug: null,
    slots: [],
  });
  const [invite, setInvite] = useState(false);
  const [pack, setPack] = useState(false);
  const account = useAccount();
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const request = useRef<AbortController | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [notice, setNotice] = useState<"failed" | "started" | "cooldown" | "selectFirst" | null>(
    null,
  );
  const sourceRef = useRef<HTMLElement>(null);
  const selected = new Set(state.slug === actor.slug ? state.slots : []);
  const storageKey = `sp-asset-selection:${actor.slug}`;

  useEffect(() => {
    let slots: string[] = [];
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
      if (Array.isArray(saved))
        slots = assets.items.filter((item) => saved.includes(item.slot)).map((item) => item.slot);
    } catch {
      /* Selection still works when storage is unavailable. */
    }
    setState({ slug: actor.slug, slots });
  }, [actor.slug, assets.items, storageKey]);
  useEffect(() => {
    if (state.slug !== actor.slug) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state.slots));
    } catch {
      /* Optional persistence. */
    }
  }, [state, actor.slug, storageKey]);
  useEffect(() => {
    const restore = () => {
      let until = 0;
      try {
        until = Number(localStorage.getItem(GUEST_COOLDOWN_KEY));
      } catch {
        /* Server remains authoritative. */
      }
      setDeadline(
        Number.isFinite(until)
          ? Math.min(until, Date.now() + GUEST_DOWNLOAD_WINDOW_SECONDS * 1000)
          : 0,
      );
    };
    restore();
    window.addEventListener("storage", restore);
    return () => {
      window.removeEventListener("storage", restore);
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    if (deadline <= Date.now()) return;
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [deadline]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function change(slots: string[], add: boolean) {
    setState((previous) => {
      const next = new Set(previous.slug === actor.slug ? previous.slots : []);
      for (const slot of slots) {
        if (add && assets.items.some((item) => item.slot === slot)) next.add(slot);
        else next.delete(slot);
      }
      return {
        slug: actor.slug,
        slots: assets.items.filter((item) => next.has(item.slot)).map((item) => item.slot),
      };
    });
  }
  function cooldown(seconds: number) {
    const until = Date.now() + Math.max(1, Math.min(300, seconds)) * 1000;
    setDeadline(until);
    try {
      localStorage.setItem(GUEST_COOLDOWN_KEY, String(until));
    } catch {
      /* Server still limits requests. */
    }
    setNotice("cooldown");
  }
  async function downloadOne(item: AssetItem) {
    if (inFlight.current || (!account.user && remaining > 0)) return;
    inFlight.current = true;
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch(`/api/assets/${actor.slug}/${item.slot}/download`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (response.status === 429) {
        cooldown(Number(response.headers.get("Retry-After")) || GUEST_DOWNLOAD_WINDOW_SECONDS);
        return;
      }
      if (!response.ok) throw new Error("Download request failed");
      const result = (await response.json()) as {
        url: string;
        filename: string;
        cooldown?: number;
      };
      if (result.cooldown) cooldown(result.cooldown);
      const blob = await fetchImageBlob(result.url, controller.signal);
      if (controller.signal.aborted) return;
      saveBlob(blob, result.filename);
      account.event(result.cooldown ? "guest_download" : "member_download");
      if (!result.cooldown) setNotice("started");
    } catch {
      if (!controller.signal.aborted) setNotice("failed");
    } finally {
      inFlight.current = false;
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  function showInvite() {
    account.event("sign_in_prompt");
    setInvite(true);
  }
  async function signIn() {
    try {
      await account.signIn();
    } catch {
      setNotice("failed");
    }
  }
  return (
    <SelectionContext.Provider
      value={{
        selected,
        change,
        downloadOne,
        remaining: account.user ? 0 : remaining,
        busy: busy || account.busy || account.loading,
        modalOpen: invite || pack,
        sourceRef,
        requestPack: () => {
          if (!selected.size) {
            setNotice("selectFirst");
            return;
          }
          if (account.user) setPack(true);
          else showInvite();
        },
      }}
    >
      {children}
      <LiquidPopover
        open={invite}
        onOpenChange={(open) => {
          if (!open) setInvite(false);
        }}
        source={sourceRef}
        title={t("assets.signInTitle")}
      >
        <p>{t("assets.signInBody")}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {SWIMMER_PRODUCTS.map((product) => (
            <li key={product.id}>
              <GameBadge tone="neutral">{product.name}</GameBadge>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end gap-3">
          <GameButton onClick={() => setInvite(false)}>{t("assets.notNow")}</GameButton>
          <GameButton
            variant="secondary"
            disabled={busy || account.busy || account.loading}
            onClick={signIn}
          >
            {t("assets.signIn")}
          </GameButton>
        </div>
      </LiquidPopover>
      {pack ? (
        <MemberExportDialog
          actor={actor}
          assets={assets}
          selected={assets.items.filter((item) => selected.has(item.slot))}
          onClose={() => setPack(false)}
          onSuccess={() => {
            setPack(false);
            setNotice("started");
          }}
          onSignIn={() => {
            setPack(false);
            showInvite();
          }}
          source={sourceRef}
        />
      ) : null}
      {notice ? (
        <div className="fixed inset-x-5 bottom-24 z-50 mx-auto max-w-xl" data-asset-notice={notice}>
          <GameToast tone={notice === "failed" ? "danger" : "info"}>
            {notice === "cooldown" ? (
              <>
                <p>
                  {t("assets.guestCooldown", { seconds: GUEST_DOWNLOAD_WINDOW_SECONDS, remaining })}
                </p>
                <GameButton
                  onClick={() => {
                    setNotice(null);
                    showInvite();
                  }}
                >
                  {t("assets.signIn")}
                </GameButton>
              </>
            ) : (
              t(
                notice === "failed"
                  ? "assets.failed"
                  : notice === "selectFirst"
                    ? "assets.selectFirst"
                    : "assets.started",
              )
            )}
          </GameToast>
        </div>
      ) : null}
    </SelectionContext.Provider>
  );
}

export function AssetSelectionBar({ mobile = false }: { mobile?: boolean }) {
  const { t } = useSiteI18n();
  const { selected, change, requestPack, busy, sourceRef } = useAssetSelection();
  return (
    <div
      className={mobile ? "sp-selection-mobile" : "hidden shrink-0 items-center gap-3 md:flex"}
      data-selection-bar={mobile ? "mobile" : "desktop"}
    >
      <span className="sp-small whitespace-nowrap">
        {t("assets.selected", { count: selected.size })}
      </span>
      <GameButton disabled={!selected.size || busy} onClick={() => change([...selected], false)}>
        {t("assets.clear")}
      </GameButton>
      <GameButton
        variant="primary"
        disabled={busy}
        onClick={(event) => {
          sourceRef.current = event.currentTarget;
          requestPack();
        }}
      >
        {t("assets.downloadSelected")}
      </GameButton>
    </div>
  );
}

export function SelectAssetSeries({ slots }: { slots: string[] }) {
  const { t } = useSiteI18n();
  const { change } = useAssetSelection();
  return slots.length ? (
    <GameButton onClick={() => change(slots, true)}>{t("assets.selectSeries")}</GameButton>
  ) : null;
}

export function DownloadActorProfile({ actor, assets }: { actor: Actor; assets: ActorAssets }) {
  const { t } = useSiteI18n();
  return (
    <GameButton
      onClick={() =>
        saveBlob(
          new Blob([JSON.stringify(characterProfile(actor, assets), null, 2) + "\n"], {
            type: "application/json",
          }),
          "character.json",
        )
      }
    >
      {t("assets.downloadJson")}
    </GameButton>
  );
}
