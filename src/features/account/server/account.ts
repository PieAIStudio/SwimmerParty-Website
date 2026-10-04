import type { IncomingMessage, ServerResponse } from "node:http";
import { createAuthClient } from "@pieai/swimmer-backend-client";
import type { createNodeAuth, NodeAuthConfig } from "@pieaistudio/swimmer-auth-kit/server";
import { SITE } from "../../../content/site.ts";
import { HttpError } from "../../../lib/server/runtime-mode.ts";

export function swimmerAccountConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
): NodeAuthConfig {
  const required = (key: string) => {
    const value = env[key];
    if (!value) throw new HttpError(503, "account-not-configured");
    return value;
  };
  const cookiePassword = required("SWIMMER_COOKIE_PASSWORD");
  if (cookiePassword.length < 32) throw new HttpError(503, "account-not-configured");
  const origin =
    env.SWIMMER_ORIGIN ?? (env.NODE_ENV === "production" ? SITE.url : "http://localhost:3000");
  return {
    createAuthClient,
    origin,
    backendUrl: required("SWIMMER_BACKEND_URL"),
    publishableKey: required("SWIMMER_PUBLISHABLE_KEY"),
    cookieName: "__Host-swimmerparty-session",
    basePath: "/api/auth",
    successPath: "/",
    failurePath: "/?auth=failed",
    recoveryPath: "/",
    sso: {
      clientId: required("SWIMMER_OAUTH_CLIENT_ID"),
      cookiePassword,
      accountUrl: required("SWIMMER_ACCOUNT_URL"),
    },
    // This configuration requires an explicitly registered public PKCE client at the account center.
  };
}
type AccountDependencies = {
  createNodeAuth?: typeof createNodeAuth;
  env?: Readonly<Record<string, string | undefined>>;
};
export async function swimmerAccount(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: AccountDependencies = {},
) {
  const factory =
    dependencies.createNodeAuth ??
    (await import("@pieaistudio/swimmer-auth-kit/server")).createNodeAuth;
  return factory(swimmerAccountConfig(dependencies.env))(request, response);
}
export async function accountUser(
  request: IncomingMessage,
  response: ServerResponse,
  mode: "mock" | "swimmer",
  dependencies: AccountDependencies = {},
): Promise<{ id: string } | null> {
  if (mode === "mock")
    return /(?:^|;\s*)sp_mock_member=1(?:;|$)/.test(request.headers.cookie ?? "")
      ? { id: "local-mock-member" }
      : null;
  const user = await (await swimmerAccount(request, response, dependencies)).verifiedUser();
  return user && user.is_anonymous === false ? { id: user.id } : null;
}
