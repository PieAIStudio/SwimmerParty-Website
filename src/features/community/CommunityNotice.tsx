"use client";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { useSiteI18n } from "@/i18n/client";
import { useAccount } from "@/features/account";
import { errorMessages } from "./presentation";
import type { CommunityError } from "./errors";
export function CommunityNotice({
  error,
  draftValidation = false,
}: {
  error: CommunityError;
  draftValidation?: boolean;
}) {
  const { t } = useSiteI18n();
  const account = useAccount();
  return (
    <div role="alert" data-community-error={error.code} className="my-4 grid gap-3">
      <GameToast tone="danger">
        {t(errorMessages[error.code])}
        {error.uncertain ? <p>{t("c.uncertain")}</p> : null}
        {draftValidation && error.code === "INVALID_INPUT" ? (
          <p data-community-draft-invalid>{t("c.draftInvalidHint")}</p>
        ) : null}
      </GameToast>
      {error.requestId !== "local" &&
      error.requestId !== "transport" &&
      /^[A-Za-z0-9_-]{1,100}$/.test(error.requestId) ? (
        <p className="sp-small break-words" data-community-request-id>
          {t("c.requestReference", { id: error.requestId })}
        </p>
      ) : null}
      {error.code === "AUTH_REQUIRED" ? (
        <GameButton
          {...account.signInIntent}
          onClick={() => void account.signIn()}
          pending={account.busy}
        >
          {t("assets.signIn")}
        </GameButton>
      ) : null}
    </div>
  );
}
