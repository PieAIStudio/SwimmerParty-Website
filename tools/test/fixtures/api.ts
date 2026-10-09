import type { NextApiRequest, NextApiResponse } from "next";

export function apiRequest(options: Partial<NextApiRequest> = {}): NextApiRequest {
  return {
    method: "GET",
    query: {},
    headers: { host: "127.0.0.1:3399" },
    socket: { remoteAddress: "synthetic-test-client" },
    ...options,
  } as NextApiRequest;
}
export function apiResponse() {
  const headers = new Map<string, unknown>();
  const value = {
    code: 0,
    body: undefined as unknown,
    writableEnded: false,
    setHeader(name: string, content: unknown) {
      headers.set(name.toLowerCase(), content);
      return this;
    },
    status(code: number) {
      this.code = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      this.writableEnded = true;
      return this;
    },
    send(body: unknown) {
      this.body = body;
      this.writableEnded = true;
      return this;
    },
    end() {
      this.writableEnded = true;
      return this;
    },
  };
  return { value, headers, res: value as unknown as NextApiResponse };
}
export async function withEnvironment<T>(
  values: Record<string, string | undefined>,
  run: () => Promise<T>,
): Promise<T> {
  const previous = Object.fromEntries(Object.keys(values).map((name) => [name, process.env[name]]));
  try {
    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    return await run();
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}
