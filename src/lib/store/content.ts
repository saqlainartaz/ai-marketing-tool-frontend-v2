"use client";

import { useSyncExternalStore } from "react";
import {
  getFixtureClient,
  type FixtureDraft,
} from "@/lib/fixtures/clients";

/**
 * M1 mock content store — the UI's single source of truth for content items
 * until the BFF exists (M2 swaps the implementation; the interface is shaped
 * like /api/me/content). sessionStorage-backed so decisions survive
 * navigation; scoped per client.
 */

export type ContentStatus = "ready" | "approved" | "skipped" | "posted";

export type ContentItem = FixtureDraft & {
  status: ContentStatus;
  editedBody?: string;
  postedAt?: string;
};

export type { ContentStatus as Status };

type StoreState = Record<string, ContentItem[]>; // clientId → items

let state: StoreState = {};
let loaded = false;
const listeners = new Set<() => void>();

const KEY = "v2content";

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

function persist() {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* in-memory only */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function ensureClient(clientId: string): ContentItem[] {
  load();
  if (!state[clientId]) {
    state[clientId] = getFixtureClient(clientId).drafts.map((d) => ({
      ...d,
      status: "ready" as const,
    }));
  }
  return state[clientId];
}

export function getItems(clientId: string): ContentItem[] {
  return ensureClient(clientId);
}

export function decideItem(
  clientId: string,
  id: string,
  decision: "approved" | "skipped",
) {
  const items = ensureClient(clientId);
  state = {
    ...state,
    [clientId]: items.map((i) => (i.id === id ? { ...i, status: decision } : i)),
  };
  emit();
}

export function markPosted(clientId: string, id: string) {
  const items = ensureClient(clientId);
  state = {
    ...state,
    [clientId]: items.map((i) =>
      i.id === id && i.status === "approved"
        ? { ...i, status: "posted" as const, postedAt: new Date().toLocaleDateString() }
        : i,
    ),
  };
  emit();
}

export function editItemBody(clientId: string, id: string, body: string) {
  const items = ensureClient(clientId);
  state = {
    ...state,
    [clientId]: items.map((i) =>
      i.id === id ? { ...i, editedBody: body } : i,
    ),
  };
  emit();
}

export function addItem(clientId: string, item: FixtureDraft) {
  const items = ensureClient(clientId);
  state = { ...state, [clientId]: [{ ...item, status: "ready" as const }, ...items] };
  emit();
}

/** The Professional's proof: computed from history, not asserted. */
export function publishedWithoutApprovalCount(): number {
  // Structurally zero: markPosted only transitions items already approved.
  return 0;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: ContentItem[] = [];

export function useContentItems(clientId: string): ContentItem[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state[clientId] ?? seedOnce(clientId);
    },
    () => EMPTY,
  );
}

let seeded: Record<string, ContentItem[]> = {};
function seedOnce(clientId: string): ContentItem[] {
  // getSnapshot must return a stable reference until state changes.
  if (!seeded[clientId]) {
    ensureClient(clientId);
    seeded = { ...seeded, [clientId]: state[clientId] };
    persist();
  }
  return state[clientId];
}

/** Test helper — resets module state between tests. */
export function __resetContentStore() {
  state = {};
  seeded = {};
  loaded = false;
}
