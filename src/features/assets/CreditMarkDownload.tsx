"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { useAccount } from "@/features/account";
import { useSiteI18n } from "@/i18n/client";
import { GUEST_COOLDOWN_KEY, GUEST_DOWNLOAD_WINDOW_SECONDS } from "./downloads";
import { downloadAsset, GuestDownloadCooldownError } from "./download-client";

const COOLDOWN_EVENT = "swimmer-party-guest-cooldown";

export function CreditMarkDownload({
  endpoint,
  children,
}: {
  endpoint: string;
  children: ReactNode;
}) {
  const { t } = useSiteI18n();
  const account = useAccount();
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"failed" | "started" | "cooldown" | null>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const restore = (event?: Event) => {
      const value =
        event instanceof CustomEvent && typeof event.detail === "number" ? event.detail : null;
      let until = value ?? 0;
      if (!until) {
        try {
          until = Number(localStorage.getItem(GUEST_COOLDOWN_KEY));
        } catch {
          /* Server remains authoritative. */
        }
      }
      setDeadline(
        Number.isFinite(until)
          ? Math.min(until, Date.now() + GUEST_DOWNLOAD_WINDOW_SECONDS * 1000)
          : 0,
      );
    };
    restore();
    window.addEventListener("storage", restore);
    window.addEventListener(COOLDOWN_EVENT, restore);
    return () => {
      window.removeEventListener("storage", restore);
      window.removeEventListener(COOLDOWN_EVENT, restore);
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

  function cooldown(seconds: number) {
    const until = Date.now() + Math.max(1, Math.min(300, seconds)) * 1000;
    setDeadline(until);
    try {
      localStorage.setItem(GUEST_COOLDOWN_KEY, String(until));
    } catch {
      /* Server still limits requests. */
    }
    window.dispatchEvent(new CustomEvent(COOLDOWN_EVENT, { detail: until }));
    setNotice("cooldown");
  }

  async function download() {
    if (busy || (!account.user && remaining > 0)) return;
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const result = await downloadAsset({ endpoint, signal: controller.signal, account });
      if (result.cooldown) cooldown(result.cooldown);
      else if (!controller.signal.aborted) setNotice("started");
    } catch (error) {
      if (error instanceof GuestDownloadCooldownError) cooldown(error.retryAfter);
      else if (!controller.signal.aborted) setNotice("failed");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  async function signIn() {
    account.event("sign_in_prompt");
    try {
      await account.signIn();
    } catch {
      setNotice("failed");
    }
  }

  return (
    <>
      <GameButton
        disabled={busy || account.busy || account.loading || (!account.user && remaining > 0)}
        onClick={() => void download()}
      >
        {children}
      </GameButton>
      {notice ? (
        <div className="fixed inset-x-5 bottom-24 z-50 mx-auto max-w-xl">
          <GameToast tone={notice === "failed" ? "danger" : "info"}>
            {notice === "cooldown" ? (
              <>
                <p>{t("assets.guestCooldown", { seconds: remaining })}</p>
                <GameButton onClick={() => void signIn()}>{t("assets.signIn")}</GameButton>
              </>
            ) : (
              t(notice === "failed" ? "assets.failed" : "assets.started")
            )}
          </GameToast>
        </div>
      ) : null}
    </>
  );
}
