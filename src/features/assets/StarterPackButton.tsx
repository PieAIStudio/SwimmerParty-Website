"use client";
import { useState } from "react";
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
  const [failed, setFailed] = useState(false);
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
    setFailed(false);
    try {
      const { blob, filename } = await starterPack([actor]);
      saveBlob(blob, filename);
      account.event("starter_download", { format: "starter" });
    } catch (error) {
      if (error instanceof SignInRequired) await account.signIn();
      else setFailed(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <GameButton
        variant="primary"
        disabled={!actor.slots.length}
        aria-busy={busy || leaving || account.loading}
        {...(account.user ? {} : account.signInIntent)}
        onClick={() => void start()}
      >
        {busy ? t("assets.loading") : leaving ? t("assets.signingIn") : t("actor.openLibrary")}
      </GameButton>
      {failed ? <GameToast tone="danger">{t("assets.failed")}</GameToast> : null}
    </>
  );
}
