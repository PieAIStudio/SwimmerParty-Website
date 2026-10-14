"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAccount } from "@/features/account";
import { COMMUNITY_MODE } from "@/content/features";
import { SiteHeader } from "@/site/SiteHeader";
import { usePathname } from "next/navigation";
import { isCommunityPage } from "@/contracts/community-access";
import { useSiteI18n } from "@/i18n/client";
const Context = createContext({ visible: false, owner: false });
export function CommunityAccessProvider({ children }: { children: ReactNode }) {
  const account = useAccount();
  const identity = account.user?.id ?? "guest";
  const [result, setResult] = useState<{
    identity: string;
    allowed: boolean;
    owner: boolean;
  } | null>(null);
  useEffect(() => {
    if (COMMUNITY_MODE === "off" || account.loading) return;
    if (COMMUNITY_MODE === "owner" && !account.user) return;
    let controller: AbortController;
    const refresh = () => {
      controller?.abort();
      controller = new AbortController();
      const current = controller;
      setResult(null);
      void fetch("/api/community/access", {
        cache: "no-store",
        credentials: "same-origin",
        signal: current.signal,
      })
        .then(async (response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (!current.signal.aborted)
            setResult({ identity, allowed: data?.allowed === true, owner: data?.owner === true });
        })
        .catch(() => {
          /* Fail closed. The feed displays actual transport errors once access is allowed. */
        });
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("sp-community-access-change", refresh);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", refresh);
      window.removeEventListener("sp-community-access-change", refresh);
    };
  }, [identity, account.loading, account.user]);
  const current = !account.loading && result?.identity === identity ? result : null;
  return (
    <Context.Provider
      value={{
        visible:
          COMMUNITY_MODE === "on" ||
          (COMMUNITY_MODE === "owner" && Boolean(account.user) && current?.allowed === true),
        owner: current?.owner === true,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCommunityAccess() {
  return useContext(Context);
}

/** The server enforces 404 before routing; this also clears already-mounted private views after access changes. */
export function CommunityRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const access = useCommunityAccess();
  const { t } = useSiteI18n();
  if (COMMUNITY_MODE === "owner" && isCommunityPage(pathname ?? "") && !access.visible)
    return (
      <div className="sp-container sp-section" data-community-access-pending>
        <output>{t("c.loading")}</output>
      </div>
    );
  return children;
}

export function CommunityHeader({ accountMenu }: { accountMenu: ReactNode }) {
  const { visible } = useCommunityAccess();
  return <SiteHeader accountMenu={accountMenu} communityVisible={visible} />;
}
