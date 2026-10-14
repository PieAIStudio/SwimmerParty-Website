"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "@/features/account";
import type {
  CommunityOperation,
  OperationInput,
  OperationOutput,
} from "@/contracts/community-operations";
import { callCommunity, WriteSession } from "./api";
import { asCommunityError, type CommunityError } from "./errors";
export function useCommunityQuery<K extends CommunityOperation>(
  operation: K,
  input: OperationInput<K>,
  allowed = true,
) {
  const account = useAccount();
  const identity = account.user?.id ?? "guest";
  const serialized = JSON.stringify(input),
    key = `${identity}:${operation}:${serialized}`;
  const [version, refresh] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    version: number;
    data?: OperationOutput<K>;
    error?: CommunityError;
  } | null>(null);
  useEffect(() => {
    if (!allowed || account.loading) return;
    const controller = new AbortController();
    void callCommunity(operation, JSON.parse(serialized), controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, version, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ key, version, error: asCommunityError(error) });
      });
    return () => controller.abort();
  }, [operation, serialized, key, version, allowed, account.loading]);
  const current = result?.key === key && result.version === version && allowed ? result : null;
  return {
    data: current?.data,
    error: current?.error,
    loading: allowed && !current,
    refresh: () => refresh((value) => value + 1),
  };
}
export function useCommunityAction(scope: string) {
  const account = useAccount();
  const journal = useMemo(() => {
    let storage: Storage | undefined;
    try {
      if (typeof window !== "undefined") storage = window.sessionStorage;
    } catch {
      /* Journal still survives mounted retries. */
    }
    return new WriteSession(account.user?.id ?? "guest", scope, storage);
  }, [account.user?.id, scope]);
  const controller = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<CommunityError | null>(null);
  useEffect(() => () => controller.current?.abort(), [journal]);
  async function perform<T>(
    action: (journal: WriteSession, signal: AbortSignal) => Promise<T>,
  ): Promise<T | undefined> {
    if (controller.current) return;
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError(null);
    try {
      return await action(journal, current.signal);
    } catch (value) {
      if (!current.signal.aborted) setError(asCommunityError(value));
    } finally {
      if (controller.current === current) {
        controller.current = null;
        setBusy(false);
      }
    }
  }
  return {
    journal,
    busy,
    error,
    perform,
    cancel: () => {
      controller.current?.abort();
    },
    clearError: () => setError(null),
  };
}
