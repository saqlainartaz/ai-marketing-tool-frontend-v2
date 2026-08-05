"use client";

import { useSyncExternalStore } from "react";
import {
  getEngineFixture,
  type DocumentStatus,
  type EngineDocument,
} from "@/lib/fixtures/engine";

/**
 * Documents the client has given us, and what we learned from each.
 *
 * Mirrors the engine's own pipeline — `uploaded → parsed → cleaned →
 * atomised | failed` — because that progression is the honest thing to
 * show. "Uploading…" tells a client nothing; "reading it", "pulling out
 * what matters" tells them what they're waiting for.
 *
 * Session-scoped like the content store, and swapped for the real
 * documents endpoint at wiring time.
 */

export type LearnedFact = { text: string; kind: string };

export type StoredDocument = EngineDocument & {
  /** What this document taught us — shown once it's atomised. */
  learned?: LearnedFact[];
};

type State = Record<string, StoredDocument[]>;

let state: State = {};
let loaded = false;
const listeners = new Set<() => void>();
const KEY = "v2documents";

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {
    /* fresh state */
  }
}

function emit() {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* in-memory only */
  }
  listeners.forEach((l) => l());
}

function ensure(clientId: string): StoredDocument[] {
  load();
  if (!state[clientId]) {
    state[clientId] = getEngineFixture(clientId).documents.map((d) => ({
      ...d,
    }));
  }
  return state[clientId];
}

export function addDocument(
  clientId: string,
  doc: Omit<StoredDocument, "status">,
) {
  const docs = ensure(clientId);
  state = {
    ...state,
    [clientId]: [{ ...doc, status: "uploaded" as DocumentStatus }, ...docs],
  };
  emit();
}

export function advanceDocument(
  clientId: string,
  id: string,
  status: DocumentStatus,
  extra?: { atomCount?: number; learned?: LearnedFact[]; error?: string },
) {
  const docs = ensure(clientId);
  state = {
    ...state,
    [clientId]: docs.map((d) =>
      d.id === id ? { ...d, status, ...extra } : d,
    ),
  };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: StoredDocument[] = [];
let seeded: State = {};

export function useDocuments(clientId: string): StoredDocument[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      if (!state[clientId] && !seeded[clientId]) {
        ensure(clientId);
        seeded = { ...seeded, [clientId]: state[clientId] };
      }
      return state[clientId] ?? EMPTY;
    },
    () => EMPTY,
  );
}

/** Test helper — resets module state between tests. */
export function __resetDocumentStore() {
  state = {};
  seeded = {};
  loaded = false;
}
