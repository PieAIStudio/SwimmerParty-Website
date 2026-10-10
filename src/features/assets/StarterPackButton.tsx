"use client";
import { useEffect, useState } from "react";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { useAccount } from "@/features/account";
import { useSiteI18n } from "@/i18n/client";
import { saveBlob } from "@/lib/browser-files";
import { SignInRequired } from "./downloads";
import { starterPack, type StarterActor } from "./starter-pack";

export function StarterPackButton({ actor }: { actor: StarterActor }) {
  const account = useAccount();
  const { t } = useSiteI18n();
  const [busy, setBusy] = useState(false);
  // The outcome shows in the same fixed notice as the other download buttons, and clears after 6 s.
  const [notice, setNotice] = useState<"started" | "failed" | null>(null);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  // Signed-out guests are sent to sign in; say so while the page leaves.
  const leaving = !account.user && account.busy;
  async function start() {
    if (busy) return;
    const { user } = await account.whenReady();
    if (!user) {
      await account.signIn();
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const { blob, filename } = await starterPack([actor]);
      saveBlob(blob, filename);
      account.event("starter_download", { format: "starter" });
      setNotice("started");
    } catch (error) {
      if (error instanceof SignInRequired) await account.signIn();
      else setNotice("failed");
    } finally {
      setBusy(false);
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
