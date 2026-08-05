"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { DEMO_SCRIPT } from "@/lib/demo/script";
import { useSyncExternalStore } from "react";

/**
 * Demo mode — a scripted click-through for sales calls and reviews.
 *
 * Deliberately not a product feature: it's off unless someone opens
 * /demo, and it says so. It doubles as our own walkthrough, which is the
 * real reason it earns its keep — a path that's driven every week is a
 * path whose dead ends get found.
 */

const KEY = "v2demo";
const listeners = new Set<() => void>();
let step: number | null = null;
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    step = raw === null ? null : Number(raw);
  } catch {
    step = null;
  }
}

function emit() {
  try {
    if (step === null) window.sessionStorage.removeItem(KEY);
    else window.sessionStorage.setItem(KEY, String(step));
  } catch {
    /* in-memory only */
  }
  listeners.forEach((l) => l());
}

export function startDemo() {
  loaded = true;
  step = 0;
  emit();
}

export function stopDemo() {
  step = null;
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDemoStep(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return step;
    },
    () => null,
  );
}

export function DemoBar() {
  const current = useDemoStep();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || current === null) return null;
  const stop = DEMO_SCRIPT[current];
  if (!stop) return null;

  function go(next: number) {
    const target = DEMO_SCRIPT[next];
    if (!target) return;
    step = next;
    emit();
    if (target.href !== pathname) router.push(target.href);
  }

  return (
    <div
      data-testid="demo-bar"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <span className="t-meta shrink-0">
          {current + 1}/{DEMO_SCRIPT.length}
        </span>
        <div className="min-w-0 flex-1">
          <p className="t-ui truncate">{stop.title}</p>
          <p className="t-sub truncate">{stop.say}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => go(current - 1)}
            disabled={current === 0}
            aria-label="Previous stop"
            className="pressable flex h-11 w-11 items-center justify-center rounded-lg border border-line disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(current + 1)}
            disabled={current === DEMO_SCRIPT.length - 1}
            aria-label="Next stop"
            className="pressable mark-commitment flex h-11 w-11 items-center justify-center rounded-lg disabled:opacity-40"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={stopDemo}
            aria-label="End the demo"
            className="pressable flex h-11 w-11 items-center justify-center rounded-lg text-ink-3 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
