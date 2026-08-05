"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TriangleAlert, Undo2 } from "lucide-react";

/**
 * Feedback after an action, done to spec.
 *
 * Rules applied:
 * - Act, then offer undo — don't interrupt with a dialog for anything
 *   reversible (NN/g; the Gmail pattern). Confirmation is reserved for
 *   actions we cannot take back, and this product has none: nothing
 *   publishes without the client.
 * - Toast copy stays under ~4 words / 30 characters (Stripe app patterns).
 * - The live region is role="status" + aria-live="polite" so screen
 *   readers hear the result without losing the user's place; the toast
 *   never steals focus (W3C ARIA APG).
 * - The undo window is generous (8s) because our users are not in a hurry
 *   and a missed undo costs them a re-do.
 */

type StatusOptions = {
  /** Offer to reverse what just happened, for the length of the window. */
  undo?: () => void;
  /** A failure looks and sounds different from a success. */
  tone?: "done" | "problem";
};

type Status = StatusOptions & { message: string };

type StatusContextValue = {
  announce: (message: string, options?: StatusOptions) => void;
};

const StatusContext = createContext<StatusContextValue | null>(null);

const UNDO_WINDOW_MS = 8000;

export function StatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((message: string, options?: StatusOptions) => {
    setStatus({ message, ...options });
  }, []);

  useEffect(() => {
    if (!status) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(null), UNDO_WINDOW_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status]);

  return (
    <StatusContext.Provider value={{ announce }}>
      {children}

      {/* Announced to assistive tech; never takes focus. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {status?.message ?? ""}
      </div>

      {status ? (
        <div
          data-testid="status-toast"
          className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8"
        >
          <div
            className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-2.5 shadow-overlay ${
              status.tone === "problem"
                ? "border border-honey bg-honey-mist text-honey"
                : "border border-line bg-ink text-paper"
            }`}
          >
            {status.tone === "problem" ? (
              <TriangleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
            ) : null}
            <span className="t-ui font-medium">{status.message}</span>
            {status.undo ? (
              <button
                type="button"
                onClick={() => {
                  status.undo?.();
                  setStatus(null);
                }}
                className="inline-flex min-h-6 cursor-pointer items-center gap-1.5 rounded-lg border border-current/30 px-2.5 py-1 t-sub font-semibold transition-colors hover:bg-current/10"
              >
                <Undo2 aria-hidden className="h-3 w-3" />
                Undo
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </StatusContext.Provider>
  );
}

export function useStatus(): StatusContextValue {
  const ctx = useContext(StatusContext);
  // Safe no-op outside the provider (e.g. isolated component tests).
  return ctx ?? { announce: () => {} };
}
