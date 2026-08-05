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

const SHAPE =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[13px]";

/**
 * Selection is the system's `selected` edge plus a check, never a colour
 * wash — so a chosen chip is unmistakable and unselected chips never read
 * as disabled.
 *
 * Three renderings, and which one you get depends on what the chip can
 * actually do. A chip with no handler used to render as a `<button>` that
 * did nothing when pressed; now it renders as text, because a control
 * that ignores you is worse than no control.
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
          SHAPE,
          "is-off border-dashed border-ink-3",
          className,
        )}
      >
        <Lock aria-hidden className="h-3 w-3 shrink-0" />
        {children}
      </span>
    );
  }

  if (!onToggle) {
    return (
      <span
        className={cn(
          SHAPE,
          selected
            ? "border-clay bg-clay-mist font-medium text-ink"
            : "border-line bg-card text-ink-2",
          className,
        )}
      >
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
        SHAPE,
        "pressable",
        selected
          ? "selected border-clay font-semibold text-ink"
          : "border-line bg-card text-ink-2 hover:border-ink-3 hover:text-ink",
        className,
      )}
    >
      {selected ? (
        <Check aria-hidden className="h-3 w-3 shrink-0 text-clay" strokeWidth={3} />
      ) : null}
      {children}
    </button>
  );
}
