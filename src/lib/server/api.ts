import type { NextApiRequest, NextApiResponse } from "next";

export class HttpError extends Error {
  status: number;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
  }
}
export function apiFailure(res: NextApiResponse, error: unknown) {
  if (res.writableEnded) return;
  const status = error instanceof HttpError ? error.status : 503;
  const code = error instanceof HttpError ? error.message : "service-unavailable";
  if (status >= 500) process.stderr.write(`[swimmer-party] ${code}\n`); // No provider errors, cookies or tokens.
  res.status(status).json({ error: code });
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
  expectedOrigin?: string,
) {
  if (req.headers["sec-fetch-site"] === "cross-site")
    throw new HttpError(403, "cross-site-request");
  if (mode === "swimmer") {
    if (!expectedOrigin || req.headers.origin !== expectedOrigin)
      throw new HttpError(403, "cross-site-request");
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
