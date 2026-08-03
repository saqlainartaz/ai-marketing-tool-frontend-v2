"use client";

import { useSyncExternalStore } from "react";
import type { WorkMode } from "@/components/ui/dial-pill";
import { getFixtureClient } from "@/lib/fixtures/clients";

/**
 * Client-adjustable settings (M1: work mode). sessionStorage-backed;
 * the persona only chose the default — the client can re-declare anytime.
 */

const listeners = new Set<() => void>();
const KEY = (clientId: string) => `v2workmode:${clientId}`;

export function setWorkMode(clientId: string, mode: WorkMode) {
  try {
    window.sessionStorage.setItem(KEY(clientId), mode);
  } catch {
    /* in-memory fallback not needed — read falls back to fixture default */
  }
  listeners.forEach((l) => l());
}

function readWorkMode(clientId: string): WorkMode {
  try {
    const saved = window.sessionStorage.getItem(KEY(clientId));
    if (saved === "suggest" || saved === "prepare" || saved === "handle")
      return saved;
  } catch {
    /* fall through */
  }
  return getFixtureClient(clientId).workMode;
}

export function useWorkMode(clientId: string): WorkMode {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => readWorkMode(clientId),
    () => getFixtureClient(clientId).workMode,
  );
}
