"use client";

import { CheckCheck, Handshake, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const WORK_MODES = ["suggest", "prepare", "handle"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

/** Client-facing labels — beginner language, never jargon. */
export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  suggest: "Show me ideas",
  prepare: "Prepare it, I'll approve",
  handle: "Handle the prep — I give the final yes",
};

/** The status line on Today: what the system is doing for you right now. */
export const WORK_MODE_SHORT: Record<WorkMode, string> = {
  suggest: "Ideas only",
  prepare: "Prepared for approval",
  handle: "Prepared for you",
};

const WORK_MODE_ICON: Record<WorkMode, LucideIcon> = {
  suggest: Sparkles,
  prepare: CheckCheck,
  handle: Handshake,
};

type DialPillProps = {
  mode: WorkMode;
  /** Interactive (settings) vs status display (shell/Today). */
  onChange?: (mode: WorkMode) => void;
  className?: string;
};

export function DialPill({ mode, onChange, className }: DialPillProps) {
  const Icon = WORK_MODE_ICON[mode];

  if (!onChange) {
    return (
      <span
        data-mode={mode}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1",
          className,
        )}
      >
        <Icon aria-hidden className="h-3 w-3 shrink-0 text-ink-3" />
        <span className="t-meta whitespace-nowrap">
          {WORK_MODE_SHORT[mode]}
        </span>
      </span>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="How much should we handle?"
      className={cn("space-y-1.5", className)}
    >
      {WORK_MODES.map((m) => {
        const ModeIcon = WORK_MODE_ICON[m];
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[13px] transition-colors",
              active
                ? "border-clay bg-card font-semibold text-ink shadow-[inset_0_0_0_1px_var(--clay)]"
                : "border-line bg-card text-ink-2 hover:border-ink-3",
            )}
          >
            <ModeIcon
              aria-hidden
              className={cn("h-4 w-4 shrink-0", active ? "text-clay" : "text-ink-3")}
            />
            {WORK_MODE_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
}
