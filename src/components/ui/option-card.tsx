"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A pickable answer, and the whole card is the target — never a small
 * control inside it.
 *
 * Unselected must never read as disabled (the audit's finding): white
 * surface, real border, a lift on hover. Selected is the system's one
 * `selected` treatment plus a filled check — unmistakable at a glance,
 * no colour wash needed.
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
        "pressable flex min-h-14 w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left",
        selected
          ? "selected border-clay"
          : "border-line hover:-translate-y-px hover:border-ink-3 hover:shadow-float",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-clay bg-clay text-onact" : "border-line",
        )}
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0">
        <span className="t-ui block">{children}</span>
        {hint ? <span className="t-meta mt-0.5 block">{hint}</span> : null}
      </span>
    </button>
  );
}
