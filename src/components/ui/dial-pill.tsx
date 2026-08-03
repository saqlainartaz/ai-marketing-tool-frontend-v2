"use client";

import { cn } from "@/lib/utils";

export const WORK_MODES = ["suggest", "prepare", "handle"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

/** Client-facing labels — beginner language, never jargon. */
export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  suggest: "Show me ideas",
  prepare: "Prepare it, I'll approve",
  handle: "Handle the prep — I give the final yes",
};

/** Short labels for the compact pill on Home. */
export const WORK_MODE_SHORT: Record<WorkMode, string> = {
  suggest: "Showing you ideas",
  prepare: "Prepared for approval",
  handle: "Prepared for you · your yes sends it",
};

type DialPillProps = {
  mode: WorkMode;
  /** Interactive (settings) vs display-only (Home pill). */
  onChange?: (mode: WorkMode) => void;
  className?: string;
};

export function DialPill({ mode, onChange, className }: DialPillProps) {
  if (!onChange) {
    return (
      <span
        data-mode={mode}
        className={cn(
          "rounded-full border border-line bg-card px-3 py-1 text-[10.5px] text-ink-2",
          className,
        )}
      >
        {WORK_MODE_SHORT[mode]}
      </span>
    );
  }
  return (
    <div
      role="radiogroup"
      aria-label="How much should we handle?"
      className={cn(
        "flex overflow-hidden rounded-xl border border-line text-center text-[11px]",
        className,
      )}
    >
      {WORK_MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={cn(
            "flex-1 cursor-pointer px-2 py-2 transition-colors",
            mode === m ? "bg-ink font-semibold text-paper" : "text-ink-2",
          )}
        >
          {WORK_MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
