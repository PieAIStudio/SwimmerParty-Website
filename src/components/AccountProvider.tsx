"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { useSiteI18n } from "@/i18n/client";
import { GameButton, GameToast } from "@/ui/kit";

type EventName =
  | "guest_download"
  | "member_download"
  | "bundle_download"
  | "sign_in_prompt"
  | "sign_in_start";
type Account = {
  user: { id: string } | null;
  mode: "mock" | "swimmer" | null;
  loading: boolean;
  busy: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  event: (name: EventName, data?: { format: string }) => void;
};
const AccountContext = createContext<Account | null>(null);
export function useAccount(): Account {
  const value = useContext(AccountContext);
  if (!value) throw new Error("Account requires its provider");
  return value;
}
export function AccountProvider({
  children,
  analytics = false,
}: {
  children: ReactNode;
  analytics?: boolean;
}) {
  const pathname = usePathname();
  const [session, setSession] = useState<{
    user: { id: string } | null;
    mode: "mock" | "swimmer" | null;
  }>({ user: null, mode: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const event = useCallback(
    (name: EventName, data?: { format: string }) => {
      // Next production builds also run locally: NODE_ENV alone must not enable telemetry.
      if (analytics) track(name, data);
    },
    [analytics],
  );
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Account unavailable");
        const value = await response.json();
        if (!["mock", "swimmer"].includes(value.mode)) throw new Error("Invalid account mode");
        setSession({ user: value.user?.id ? { id: value.user.id } : null, mode: value.mode });
      })
      .catch(() => {
        if (!controller.signal.aborted) setSession({ user: null, mode: null });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [pathname]);
  async function action(signIn: boolean) {
    if (pending.current || loading) return;
    if (!session.mode) throw new Error("Account unavailable");
    pending.current = true;
    setBusy(true);
    try {
      if (signIn) event("sign_in_start");
      const route =
        session.mode === "mock"
          ? `mock/${signIn ? "sign-in" : "sign-out"}`
          : signIn
            ? "sso-start"
            : "sign-out";
      const response = await fetch(`/api/auth/${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          signIn
            ? { redirectPath: location.pathname + location.search + location.hash }
            : { scope: "local" },
        ),
      });
      if (!response.ok) throw new Error("Account action failed");
      if (session.mode === "swimmer" && signIn) {
        const result = (await response.json()) as { status: string; url: string };
        if (result.status !== "redirect" || !result.url.startsWith("https://"))
          throw new Error("Invalid account redirect");
        location.assign(result.url);
      } else location.reload();
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <AccountContext.Provider
      value={{
        ...session,
        loading,
        busy,
        event,
        signIn: () => action(true),
        signOut: () => action(false),
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function AccountMenu() {
  const account = useAccount();
  const { t } = useSiteI18n();
  const [error, setError] = useState(false);
  if (!account.user) return null;
  return (
    <details className="relative" data-account-menu>
      <summary
        className="sp-pill cursor-pointer whitespace-nowrap"
        title={account.mode === "mock" ? t("assets.mockAccount") : undefined}
      >
        {t("assets.signedIn")}
      </summary>
      <div className="sp-card absolute right-0 z-50 mt-3 min-w-40 bg-background">
        {account.mode === "mock" ? (
          <p className="sp-small mb-3">{t("assets.mockAccount")}</p>
        ) : null}
        <GameButton
          disabled={account.busy}
          onClick={() => void account.signOut().catch(() => setError(true))}
        >
          {t("assets.signOut")}
        </GameButton>
        {error ? <GameToast tone="danger">{t("assets.failed")}</GameToast> : null}
      </div>
    </details>
  );
}
