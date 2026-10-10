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
import { useSiteI18n, useSiteLocale } from "@/i18n/client";
import { SITE } from "@/content/site";
import { COMMUNITY_ENABLED } from "@/content/features";
import { TextLink } from "@/site/TextLink";
import { useCastCount } from "@/features/cast/client";
import { GameButton, GameToast } from "@pieai/swimmer-ui-kit";
import { GameAccountMenu, type GameAccountProduct } from "@pieai/swimmer-ui-kit/liquid-presence";
import { planArrival } from "./arrival.ts";
import { fetchProducts } from "./products.ts";
import type { AccountProfile } from "./profile.ts";

type EventName =
  | "guest_download"
  | "member_download"
  | "bundle_download"
  | "starter_download"
  | "sign_in_prompt"
  | "sign_in_start";
type Session = {
  user: { id: string } | null;
  mode: "mock" | "swimmer" | null;
  profile: AccountProfile | null;
};
type Account = {
  user: { id: string } | null;
  /** The signed-in person for the header; null when signed out. */
  profile: AccountProfile | null;
  mode: "mock" | "swimmer" | null;
  loading: boolean;
  busy: boolean;
  /** Spread on a sign-in button: starts sign-in on hover, focus or press so the click goes straight out. */
  signInIntent: { onPointerEnter: () => void; onFocus: () => void; onPointerDown: () => void };
  /** The session once its first check finishes; use it before acting on `user`. */
  whenReady: () => Promise<Session>;
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

function profileFrom(raw: unknown): AccountProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<Record<keyof AccountProfile, unknown>>;
  if (typeof value.id !== "string" || !value.id) return null;
  return {
    id: value.id,
    name: typeof value.name === "string" && value.name ? value.name : "Swimmer",
    email: typeof value.email === "string" ? value.email : null,
    avatarUrl: typeof value.avatarUrl === "string" ? value.avatarUrl : null,
  };
}

export function AccountProvider({
  children,
  analytics = false,
}: {
  children: ReactNode;
  analytics?: boolean;
}) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session>({ user: null, mode: null, profile: null });
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
  // The first finished session check decides the cross-product arrival, once per page load.
  const arrival = useRef<"waiting" | "done">("waiting");
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
        const profile = profileFrom(value.user);
        current.current = { user: profile ? { id: profile.id } : null, mode: value.mode, profile };
        setSession(current.current);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        current.current = { user: null, mode: null, profile: null };
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
  const prepare = useCallback((): Promise<string> => {
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
  }, []);
  function prepareSignIn() {
    if (session.mode === "swimmer" && !session.user && !pending.current)
      void prepare().catch(() => {});
  }
  const action = useCallback(
    async (signIn: boolean) => {
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
    },
    [event, prepare, sessionReady],
  );
  // Runs once per page load, after the first session check. Mock accounts never start a sign-in.
  useEffect(() => {
    if (loading || arrival.current === "done") return;
    arrival.current = "done";
    const plan = planArrival({
      search: location.search,
      mode: session.mode,
      signedIn: session.user !== null,
    });
    if (plan.search === null) return;
    history.replaceState(history.state, "", location.pathname + plan.search + location.hash);
    if (plan.startSignIn) void action(true).catch(() => {});
    // The `arrival` guard above keeps this to a single attempt per page load.
  }, [loading, session, action]);
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

/** Runs `task` when the browser is quiet, or after a short delay where idle callbacks are missing. */
function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(task, { timeout: 3_000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(task, 1_500);
  return () => window.clearTimeout(id);
}

/** Product list for the signed-in menu only; signed-out visitors never request it. */
function useProducts(enabled: boolean): GameAccountProduct[] {
  const locale = useSiteLocale();
  const [products, setProducts] = useState<GameAccountProduct[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    const cancel = whenIdle(() => {
      void fetchProducts(locale).then((list) => {
        if (live) setProducts(list);
      });
    });
    return () => {
      live = false;
      cancel();
    };
  }, [enabled, locale]);
  return products;
}

export function AccountMenu() {
  const account = useAccount();
  const { t } = useSiteI18n();
  const castCount = useCastCount();
  const products = useProducts(account.profile !== null);
  const [error, setError] = useState(false);
  const profile = account.profile;
  if (!profile)
    return (
      <GameButton
        variant="primary"
        size="sm"
        disabled={!account.loading && !account.mode}
        pending={account.busy || account.loading}
        {...account.signInIntent}
        onClick={() => void account.signIn().catch(() => setError(true))}
      >
        {account.busy ? t("assets.signingIn") : t("assets.signIn")}
      </GameButton>
    );
  return (
    <div data-account-menu className="relative">
      <GameAccountMenu
        user={{
          name: profile.name,
          email: profile.email ?? undefined,
          avatarUrl: profile.avatarUrl ?? undefined,
        }}
        labels={{
          trigger: t("account.menuLabel", { name: profile.name }),
          siteTab: SITE.name,
          productsTab: t("account.productsTab"),
          accountTab: t("account.accountTab"),
          current: t("account.current"),
          manage: t("account.manage"),
          signOut: t("account.signOut"),
        }}
        site={
          <ul className="grid gap-4">
            <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <TextLink href="/cast">{t("account.cast")}</TextLink>
              <span className="sp-small">{t("account.castCount", { count: castCount })}</span>
            </li>
            {COMMUNITY_ENABLED ? (
              <li>
                <TextLink href="/works#community">{t("community.openForm")}</TextLink>
              </li>
            ) : null}
            <li>
              <TextLink href="/guide">{t("guide.helpLabel")}</TextLink>
            </li>
          </ul>
        }
        products={products}
        accountHref={`${SITE.accountUrl}/account`}
        onSignOut={() => account.signOut().catch(() => setError(true))}
        signingOut={account.busy}
      />
      {error ? <GameToast tone="danger">{t("assets.failed")}</GameToast> : null}
    </div>
  );
}
