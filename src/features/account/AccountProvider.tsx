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
import { useSiteI18n } from "@/i18n/client";
import { GameBadge, GameButton, GameToast } from "@pieai/swimmer-ui-kit";

type EventName =
  | "guest_download"
  | "member_download"
  | "bundle_download"
  | "starter_download"
  | "sign_in_prompt"
  | "sign_in_start";
type Account = {
  user: { id: string } | null;
  mode: "mock" | "swimmer" | null;
  loading: boolean;
  busy: boolean;
  /** Spread on a sign-in button: starts sign-in on hover, focus or press so the click goes straight out. */
  signInIntent: { onPointerEnter: () => void; onFocus: () => void; onPointerDown: () => void };
  /** The session once its first check finishes; use it before acting on `user`. */
  whenReady: () => Promise<{ user: { id: string } | null; mode: "mock" | "swimmer" | null }>;
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
  // Lets a click made before the session check finishes wait for it instead of being lost.
  const current = useRef(session);
  const [sessionReady] = useState(() => {
    let resolve = () => {};
    const promise = new Promise<void>((done) => (resolve = done));
    return { promise, resolve };
  });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const prepared = useRef<{ at: number; path: string; url: Promise<string> } | null>(null);
  const event = useCallback(
    (name: EventName, data?: { format: string }) => {
      // Next production builds also run locally: NODE_ENV alone must not enable telemetry.
      if (analytics && typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("swimmer-party-event", { detail: { name, data } }));
    },
    [analytics],
  );
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Account unavailable");
        const value = await response.json();
        if (!["mock", "swimmer"].includes(value.mode)) throw new Error("Invalid account mode");
        current.current = { user: value.user?.id ? { id: value.user.id } : null, mode: value.mode };
        setSession(current.current);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        current.current = { user: null, mode: null };
        setSession(current.current);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
        sessionReady.resolve();
      });
    return () => controller.abort();
  }, [pathname, sessionReady]);
  // A bfcache "back" restores this page mid-redirect; let the button work again.
  useEffect(() => {
    const restore = (pageEvent: PageTransitionEvent) => {
      if (!pageEvent.persisted) return;
      pending.current = false;
      prepared.current = null;
      setBusy(false);
    };
    addEventListener("pageshow", restore);
    return () => removeEventListener("pageshow", restore);
  }, []);
  function prepare(): Promise<string> {
    const path = location.pathname + location.search + location.hash;
    const ready = prepared.current;
    if (ready && ready.path === path && Date.now() - ready.at < 60_000) return ready.url;
    const url = fetch("/api/auth/sso-start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectPath: path }),
    }).then(async (response) => {
      if (!response.ok) throw new Error("Account action failed");
      const result = (await response.json()) as { status: string; url: string };
      if (result.status !== "redirect" || !result.url.startsWith("https://"))
        throw new Error("Invalid account redirect");
      return result.url;
    });
    url.catch(() => {
      if (prepared.current?.url === url) prepared.current = null;
    });
    prepared.current = { at: Date.now(), path, url };
    return url;
  }
  function prepareSignIn() {
    if (session.mode === "swimmer" && !session.user && !pending.current)
      void prepare().catch(() => {});
  }
  async function action(signIn: boolean) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    let leaving = false;
    try {
      await sessionReady.promise;
      const { mode } = current.current;
      if (!mode) throw new Error("Account unavailable");
      if (signIn) event("sign_in_start");
      if (mode === "swimmer" && signIn) {
        const url = await prepare();
        leaving = true;
        location.assign(url);
        return;
      }
      const route = mode === "mock" ? `mock/${signIn ? "sign-in" : "sign-out"}` : "sign-out";
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
      leaving = true;
      location.reload();
    } finally {
      // While the page is leaving, stay busy so the button keeps saying so.
      if (!leaving) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  return (
    <AccountContext.Provider
      value={{
        ...session,
        loading,
        busy,
        event,
        signInIntent: {
          onPointerEnter: prepareSignIn,
          onFocus: prepareSignIn,
          onPointerDown: prepareSignIn,
        },
        whenReady: async () => {
          await sessionReady.promise;
          return current.current;
        },
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
  if (!account.user)
    return (
      <GameButton
        variant="primary"
        size="sm"
        disabled={!account.loading && !account.mode}
        aria-busy={account.busy || account.loading}
        {...account.signInIntent}
        onClick={() => void account.signIn().catch(() => setError(true))}
      >
        {account.busy ? t("assets.signingIn") : t("assets.signIn")}
      </GameButton>
    );
  return (
    <details className="relative" data-account-menu>
      <summary
        className="cursor-pointer whitespace-nowrap"
        title={account.mode === "mock" ? t("assets.mockAccount") : undefined}
      >
        <GameBadge tone="success">{t("assets.signedIn")}</GameBadge>
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
