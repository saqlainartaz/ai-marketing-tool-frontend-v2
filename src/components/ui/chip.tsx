"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type ChipProps = {
  children: React.ReactNode;
  selected?: boolean;
  /** Locked chips (compliance) render dashed with a lock and cannot be toggled off. */
  locked?: boolean;
  onToggle?: () => void;
  className?: string;
};

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
          "inline-flex items-center gap-1 rounded-full border border-dashed border-ink-3 px-3 py-1.5 text-xs text-ink-3",
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
        "inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs transition-colors",
        selected
          ? "border-clay bg-clay-mist font-semibold text-ink"
          : "border-line bg-card text-ink-2 hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
