"use client";
import { GameButton } from "@pieai/swimmer-ui-kit";
import { useAccount } from "@/features/account";
import { useSiteI18n } from "@/i18n/client";
import { useRouter } from "next/navigation";

export function StarterPackButton({ slug }: { slug: string }) {
  const account = useAccount();
  const { t } = useSiteI18n();
  const router = useRouter();
  async function start() {
    if (!account.user) {
      await account.signIn();
      return;
    }
    router.push(`/api/assets/${slug}/pack`);
  }
  return <GameButton onClick={() => void start()}>{t("actor.openLibrary")}</GameButton>;
}
