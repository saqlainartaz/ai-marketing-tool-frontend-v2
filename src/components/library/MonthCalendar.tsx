"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlatformMark } from "@/components/preview/platform-mark";
import { resolveItemDate, sameDay } from "@/lib/calendar";
import type { ContentItem } from "@/lib/store/content";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/** Monday-first grid covering the whole month, padded to full weeks. */
function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * The full calendar: a month at a glance, scrollable through time. Days
 * carry marks for what's prepared; the client can see their rhythm as a
 * shape rather than a promise.
 */
export function MonthCalendar({
  items,
  onSelect,
}: {
  items: ContentItem[];
  onSelect: (id: string) => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const days = monthGrid(month);
  const dated = items
    .filter((i) => i.status !== "skipped")
    .map((item) => ({ item, date: resolveItemDate(item) }))
    .filter((x): x is { item: ContentItem; date: Date } => x.date !== null);

  const inMonth = dated.filter(
    (d) => d.date.getMonth() === month.getMonth(),
  ).length;

  function shift(by: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));
  }

  return (
    <div data-testid="month-calendar">
      <div className="mb-3 flex items-center gap-3">
        <span className="t-label shrink-0">
          {month.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <span className="h-px flex-1 bg-line" aria-hidden />
        <span className="t-meta shrink-0">{inMonth} prepared</span>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-line bg-card text-ink-2 hover:border-ink-3 hover:text-ink"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shift(1)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-line bg-card text-ink-2 hover:border-ink-3 hover:text-ink"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="t-label pb-1 text-center">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const isThisMonth = day.getMonth() === month.getMonth();
          const isToday = sameDay(day, today);
          const dayItems = dated.filter((d) => sameDay(d.date, day));
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-12 rounded-lg border p-1 sm:min-h-16",
                isToday
                  ? "border-clay bg-card"
                  : isThisMonth
                    ? "border-line bg-card/60"
                    : "border-transparent bg-transparent",
              )}
            >
              <div
                className={cn(
                  "font-mono text-[10px]",
                  isToday
                    ? "font-semibold text-ink"
                    : isThisMonth
                      ? "text-ink-3"
                      : "text-ink-3/40",
                )}
              >
                {day.getDate()}
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {dayItems.map(({ item }) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    title={item.pillar ?? item.body.slice(0, 60)}
                    className={cn(
                      "flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-colors hover:border-ink-3",
                      item.status === "posted" || item.status === "approved"
                        ? "border-moss/40 bg-moss-mist"
                        : "border-dashed border-line bg-card",
                    )}
                  >
                    <PlatformMark
                      platform={item.platform}
                      className="h-2.5 w-2.5"
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
