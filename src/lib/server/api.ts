import type { NextApiRequest, NextApiResponse } from "next";
import { SITE } from "../../content/site.ts";
import { HttpError, runtimeModes, type RuntimeModes } from "./runtime-mode.ts";

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  modes: RuntimeModes,
) => Promise<void>;
export function privateApi(method: "GET" | "POST", handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    try {
      const modes = runtimeModes();
      if (req.method !== method) {
        res.setHeader("Allow", method);
        throw new HttpError(405, "method-not-allowed");
      }
      if (method === "POST") requireSameOrigin(req, modes.account);
      await handler(req, res, modes);
    } catch (error) {
      apiFailure(res, error);
    }
  };
}
export function apiFailure(res: NextApiResponse, error: unknown) {
  if (res.writableEnded) return;
  const status = error instanceof HttpError ? error.status : 503;
  const code = error instanceof HttpError ? error.message : "service-unavailable";
  if (status >= 500) process.stderr.write(`[swimmer-party] ${code}\n`); // No provider errors, cookies or tokens.
  res.status(status).json({ error: code });
}
export function queryText(value: string | string[] | undefined): string {
  if (typeof value !== "string" || value.length > 160) throw new HttpError(404, "asset-not-found");
  return value;
}
export async function readJsonBody(req: NextApiRequest): Promise<Record<string, unknown>> {
  let value: unknown = req.body;
  if (value === undefined) {
    if (!req.headers["content-type"]?.toLowerCase().startsWith("application/json"))
      throw new HttpError(415, "json-required");
    const chunks: Buffer[] = [];
    let bytes = 0;
    // Oversized bodies must receive a private 413, not destroy the response socket.
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      bytes += buffer.length;
      if (bytes > 16 * 1024) {
        req.resume();
        throw new HttpError(413, "request-too-large");
      }
      chunks.push(buffer);
    }
    try {
      value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new HttpError(400, "invalid-json");
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new HttpError(400, "invalid-json");
  return value as Record<string, unknown>;
}

export function requireSameOrigin(
  req: NextApiRequest,
  mode: "mock" | "swimmer",
  expectedOrigin = process.env.SWIMMER_ORIGIN ?? SITE.url,
) {
  if (req.headers["sec-fetch-site"] === "cross-site")
    throw new HttpError(403, "cross-site-request");
  if (mode === "swimmer") {
    if (req.headers.origin !== expectedOrigin) throw new HttpError(403, "cross-site-request");
  } else if (req.headers.origin) {
    try {
      const origin = new URL(req.headers.origin);
      if (
        !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname) ||
        origin.host !== req.headers.host
      )
        throw new Error("Untrusted local origin");
    } catch {
      throw new HttpError(403, "cross-site-request");
    }
  }
}
