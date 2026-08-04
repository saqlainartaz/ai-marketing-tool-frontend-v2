"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A pickable answer. Unselected must never read as disabled (the audit's
 * finding): white surface, real border, hover lift. Selected is a ring
 * plus a filled check — unmistakable at a glance, no colour wash needed.
 */
export function OptionCard({
  children,
  hint,
  selected,
  onSelect,
  className,
}: {
  children: React.ReactNode;
  hint?: string;
  selected?: boolean;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected ?? false}
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-left transition-all",
        selected
          ? "border-clay shadow-[inset_0_0_0_1px_var(--clay)]"
          : "border-line hover:-translate-y-px hover:border-ink-3 hover:shadow-[0_6px_16px_-10px_color-mix(in_srgb,var(--ink)_35%,transparent)]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-clay bg-clay text-onact" : "border-line",
        )}
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[14.5px] font-semibold">{children}</span>
        {hint ? <span className="t-meta mt-0.5 block">{hint}</span> : null}
      </span>
    </button>
  );
}
