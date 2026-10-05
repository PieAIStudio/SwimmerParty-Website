import type { NextApiRequest, NextApiResponse } from "next";
import { accountUser, swimmerAccount } from "./account.ts";
import { apiFailure, requireSameOrigin } from "../../../lib/server/api.ts";
import { HttpError, runtimeModes } from "../../../lib/server/runtime-mode.ts";

// AuthKit reads IncomingMessage itself; Next must not consume that stream first.
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Cookie");
  res.setHeader("Referrer-Policy", "no-referrer");
  let stage = "runtime-modes";
  try {
    const { account } = runtimeModes();
    stage = "route";
    const action = Array.isArray(req.query.action) ? req.query.action.join("/") : "";
    if (action === "session" && req.method === "GET") {
      if (req.headers["sec-fetch-site"] === "cross-site")
        throw new HttpError(403, "cross-site-request");
      stage = "account-user";
      res.status(200).json({ user: await accountUser(req, res, account), mode: account });
      return;
    }
    if (account === "swimmer") {
      stage = "auth-handle";
      if (!(await (await swimmerAccount(req, res)).handle()))
        throw new HttpError(404, "auth-not-found");
      return;
    }
    if (!["mock/sign-in", "mock/sign-out"].includes(action))
      throw new HttpError(404, "auth-not-found");
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      throw new HttpError(405, "method-not-allowed");
    }
    requireSameOrigin(req, account);
    // A deliberately local-only fixture cookie, never accepted by swimmer mode or Vercel.
    res.setHeader(
      "Set-Cookie",
      `sp_mock_member=${action === "mock/sign-in" ? "1" : ""}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${action === "mock/sign-in" ? "86400" : "0"}`,
    );
    res.status(200).json({ ok: true });
  } catch (error) {
    if (!(error instanceof HttpError)) {
      const detail = error instanceof Error ? error.message : "unknown";
      const safeDetail = detail.startsWith("iron-session:")
        ? detail
        : detail === "Explicit isolated SSO configuration required."
          ? detail
          : "unclassified";
      process.stderr.write(
        `[swimmer-party] auth-runtime-failure:${stage}:${error instanceof Error ? error.name : "unknown"}:${safeDetail}\n`,
      );
    }
    apiFailure(res, error);
  }
}
