"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type ChipProps = {
  children: React.ReactNode;
  selected?: boolean;
  /** Locked chips (compliance) render dashed with a lock and cannot toggle. */
  locked?: boolean;
  onToggle?: () => void;
  className?: string;
};

/**
 * Selection is a ring + a check, never a colour wash — so a chosen chip
 * is unmistakable at a glance and unselected chips never read as disabled.
 */
export function Chip({
  children,
  selected,
  locked,
  onToggle,
  className,
}: ChipProps) {
  if (locked) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-dashed border-ink-3/60 bg-paper px-3 py-1.5 text-xs text-ink-2",
          className,
        )}
      >
        <Lock aria-hidden className="h-3 w-3" />
        {children}
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={selected ?? false}
      onClick={onToggle}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
        selected
          ? "border-clay bg-card font-semibold text-ink shadow-[inset_0_0_0_1px_var(--clay)]"
          : "border-line bg-card text-ink-2 hover:border-ink-3 hover:text-ink",
        className,
      )}
    >
      {selected ? (
        <Check aria-hidden className="h-3 w-3 text-clay" strokeWidth={3} />
      ) : null}
      {children}
    </button>
  );
}
