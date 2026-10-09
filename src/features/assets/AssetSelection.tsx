"use client";
import { COMMUNITY_ENABLED } from "@/content/features";
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
import type { ActorAssets, AssetItem } from "@/features/assets/asset-types";
import { useSiteI18n } from "@/i18n/client";
import { characterProfile } from "@/features/assets/asset-profile";
import { saveBlob } from "@/lib/browser-files";
import { GUEST_COOLDOWN_KEY, GUEST_DOWNLOAD_WINDOW_SECONDS } from "@/features/assets/downloads";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { useAccount } from "@/features/account";
import { MemberExportDialog } from "./MemberExportDialog";
import { downloadAsset, GuestDownloadCooldownError } from "./download-client";

type Selection = {
  selected: ReadonlySet<string>;
  change: (slots: string[], add: boolean) => void;
  downloadOne: (item: AssetItem) => Promise<void>;
  requestPack: () => void;
  requestStarter: () => void;
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
    queueMicrotask(() => setState({ slug: actor.slug, slots }));
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
      const result = await downloadAsset({
        endpoint: `/api/assets/${actor.slug}/${item.slot}/download`,
        signal: controller.signal,
        account,
      });
      if (controller.signal.aborted) return;
      if (result.cooldown) cooldown(result.cooldown);
      if (!result.cooldown) setNotice("started");
    } catch (error) {
      if (error instanceof GuestDownloadCooldownError) {
        cooldown(error.retryAfter);
        return;
      }
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
  function requestStarter() {
    setState({ slug: actor.slug, slots: assets.items.map((item) => item.slot) });
    setPack(true);
  }
  function focusInviteFromCooldown() {
    const trigger = [...document.querySelectorAll<HTMLElement>("[data-download-selected]")].find(
      (node) => node.getClientRects().length > 0,
    );
    if (trigger) sourceRef.current = trigger;
    setNotice(null);
    showInvite();
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
        requestStarter,
      }}
    >
      {children}
      {invite ? (
        <dialog
          open
          aria-labelledby="sign-in-title"
          className="fixed inset-0 z-50 m-0 grid h-full w-full max-w-none place-items-center bg-black/40 p-5"
        >
          <section className="w-full max-w-lg rounded-[26px] bg-card p-7 text-foreground shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h2 id="sign-in-title" className="sp-title">
                {t("assets.signInTitle")}
              </h2>
              <button
                type="button"
                aria-label={t("common.close")}
                className="sp-small"
                onClick={() => setInvite(false)}
              >
                ✕
              </button>
            </div>
            <p className="mt-4">{t("assets.signInBody")}</p>
            <ul className="mt-5 space-y-3">
              {(COMMUNITY_ENABLED ? [0, 3, 2, 1] : [0, 3, 2]).map((index) => (
                <li key={index} className="flex items-start gap-2">
                  <span aria-hidden="true">✓</span>
                  <span>{t(`assets.signInBenefits.${index}` as "assets.signInBenefits.0")}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col items-start gap-3">
              <GameButton
                variant="primary"
                disabled={busy || account.busy || account.loading}
                onClick={signIn}
              >
                {t("assets.signIn")}
              </GameButton>
              <button
                type="button"
                className="sp-small underline underline-offset-4"
                onClick={() => setInvite(false)}
              >
                {t("assets.notNow")}
              </button>
            </div>
            <p className="sp-small mt-5 text-muted-foreground">{t("assets.signInConsent")}</p>
          </section>
        </dialog>
      ) : null}
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
                <p>{t("assets.guestCooldown", { seconds: remaining })}</p>
                <GameButton variant="primary" onClick={focusInviteFromCooldown}>
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
  const { selected, change, requestPack, requestStarter, busy, sourceRef } = useAssetSelection();
  // On phones the bar only appears once something is picked; the hero already offers the full pack.
  if (mobile && !selected.size) return null;
  const size = mobile ? "sm" : undefined;
  return (
    <div
      className={mobile ? "sp-selection-mobile" : "hidden shrink-0 items-center gap-3 md:flex"}
      data-selection-bar={mobile ? "mobile" : "desktop"}
    >
      <span className="sp-small whitespace-nowrap">
        {t("assets.selected", { count: selected.size })}
      </span>
      <GameButton
        size={size}
        disabled={!selected.size || busy}
        onClick={() => change([...selected], false)}
      >
        {t("assets.clear")}
      </GameButton>
      {mobile ? null : (
        <GameButton
          variant="secondary"
          disabled={busy}
          onClick={(event) => {
            sourceRef.current = event.currentTarget;
            requestStarter();
          }}
        >
          {t("assets.download")}
        </GameButton>
      )}
      <GameButton
        variant="primary"
        size={size}
        data-download-selected
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
