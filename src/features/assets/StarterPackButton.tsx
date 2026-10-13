"use client";
import { useEffect, useRef, useState } from "react";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { useAccount } from "@/features/account";
import { trackProductEvent } from "@/features/analytics/client";
import { announceFirstUse } from "@/features/guidance/client";
import { useSiteI18n } from "@/i18n/client";
import { saveBlob } from "@/lib/browser-files";
import { SignInRequired } from "./downloads";
import { starterPack, type StarterActor } from "./starter-pack";
import { PackProgress } from "./PackProgress";
import type { AssetFetchProgress } from "./contracts";

export function StarterPackButton({ actor }: { actor: StarterActor }) {
  const account = useAccount();
  const { t } = useSiteI18n();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<"started" | "failed" | null>(null);
  const [progress, setProgress] = useState<AssetFetchProgress | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    // Errors remain until the next action; successful saves clear after six seconds.
    if (notice !== "started") return;
    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const leaving = !account.user && account.busy;
  async function start() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setNotice(null);
    trackProductEvent("download_started", { kind: "starter", slug: actor.slug });
    try {
      const { user } = await account.whenReady();
      controller.signal.throwIfAborted();
      if (!user) {
        trackProductEvent("sign_in_prompt_shown", { trigger: "starter" });
        await account.signIn();
        return;
      }
      setBusy(true);
      setProgress(null);
      const { blob, filename } = await starterPack([actor], controller.signal, setProgress);
      controller.signal.throwIfAborted();
      saveBlob(blob, filename);
      announceFirstUse("download");
      account.event("starter_download", { format: "starter" });
      setNotice("started");
    } catch (error) {
      if (!controller.signal.aborted) {
        if (error instanceof SignInRequired) {
          trackProductEvent("sign_in_prompt_shown", { trigger: "starter" });
          try {
            await account.signIn();
          } catch {
            setNotice("failed");
          }
        } else setNotice("failed");
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
      }
    }
  }
  return (
    <>
      <GameButton
        variant="primary"
        disabled={!actor.slots.length}
        pending={busy || leaving || account.loading}
        {...(account.user ? {} : account.signInIntent)}
        onClick={() => void start()}
      >
        {busy ? t("assets.loading") : leaving ? t("assets.signingIn") : t("actor.openLibrary")}
      </GameButton>
      {busy ? (
        <div className="mt-3 basis-full space-y-3" data-starter-progress>
          <PackProgress progress={progress} />
          <GameButton onClick={() => request.current?.abort()}>{t("assets.cancel")}</GameButton>
        </div>
      ) : null}
      {notice ? (
        <div className="fixed inset-x-5 bottom-24 z-50 mx-auto max-w-xl">
          <GameToast tone={notice === "failed" ? "danger" : "info"}>
            {t(notice === "failed" ? "assets.failed" : "assets.started")}
          </GameToast>
        </div>
      ) : null}
    </>
  );
}
