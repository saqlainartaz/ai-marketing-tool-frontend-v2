"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type SpineItem = {
  id: string;
  label: string;
  state: "done" | "current" | "waiting";
};

/**
 * The work spine — the week's prepared items as a numbered rail.
 * Replaces meaningless progress dots: the client always knows how many
 * decisions remain and what they are. Vertical on desktop, horizontal
 * segments on phones.
 */
export function WorkSpine({
  items,
  className,
}: {
  items: SpineItem[];
  className?: string;
}) {
  const done = items.filter((i) => i.state === "done").length;

  return (
    <div className={className} data-testid="work-spine">
      {/* Phone: compact segmented bar */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2">
          {/* No denominator here on purpose. This sat directly beneath the
           * goal's "2 of 6" and the greeting's count — three counters in
           * 100px, two of them fractions, which is the comprehension tax
           * UX_RULES §9 names. The goal keeps the fraction because it's the
           * one that means something; this keeps the bar and drops to a
           * plain count, and says nothing at all when nothing is done. */}
          <span className="sr-only">
            {done} of {items.length} decided
          </span>
          {done > 0 ? (
            <span aria-hidden className="t-meta">
              {done} done
            </span>
          ) : null}
          <div className="flex flex-1 gap-1">
            {items.map((item) => (
              <span
                key={item.id}
                title={item.label}
                className={cn(
                  "flex-1 rounded-full transition-all",
                  item.state === "done" && "h-1 bg-moss",
                  item.state === "current" && "h-1.5 bg-clay",
                  item.state === "waiting" && "h-1 bg-line",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: the numbered rail */}
      <ol className="hidden lg:block">
        {items.map((item, i) => (
          <li key={item.id} className="relative flex gap-3 pb-3 last:pb-0">
            {i < items.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-6 left-[11px] h-full w-px bg-line"
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border t-meta",
                item.state === "done" &&
                  "border-moss bg-moss-mist text-moss",
                item.state === "current" &&
                  "border-clay bg-clay text-onact",
                item.state === "waiting" &&
                  "border-line bg-card text-ink-3",
              )}
            >
              {item.state === "done" ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "pt-0.5 t-sub leading-snug",
                item.state === "current"
                  ? "font-semibold text-ink"
                  : item.state === "done"
                    ? "text-ink-3 line-through decoration-line"
                    : "text-ink-2",
              )}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
