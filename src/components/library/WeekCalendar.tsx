"use client";

import { Mail, MessageSquareQuote, PenLine } from "lucide-react";
import { PlatformMark } from "@/components/preview/platform-mark";
import type { ContentItem } from "@/lib/store/content";
import { cn } from "@/lib/utils";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
export type DayKey = (typeof DAYS)[number] | "TODAY";

const KIND_ICON = {
  post: PenLine,
  review_reply: MessageSquareQuote,
  email: Mail,
} as const;

/** Monday-first index of today, so "TODAY" lands on the right column. */
function todayIndex(): number {
  const js = new Date().getDay(); // 0 = Sunday
  return (js + 6) % 7;
}

function columnFor(item: ContentItem): number | null {
  const key = item.scheduledFor;
  if (!key) return null;
  if (key === "TODAY") return todayIndex();
  const i = DAYS.indexOf(key as (typeof DAYS)[number]);
  return i === -1 ? null : i;
}

/**
 * The week as it will actually happen. Clients ask "when does this go
 * out?" before they ask anything else — a list can't answer that at a
 * glance, a week can. Nothing here publishes: it shows what is prepared
 * for which day and what already went out.
 */
export function WeekCalendar({
  items,
  onSelect,
}: {
  items: ContentItem[];
  onSelect: (id: string) => void;
}) {
  const today = todayIndex();
  const placed = DAYS.map((_, i) =>
    items.filter((item) => columnFor(item) === i && item.status !== "skipped"),
  );
  const unscheduled = items.filter(
    (item) => columnFor(item) === null && item.status !== "skipped",
  );

  const prepared = placed.flat().length;
  const needsYes = placed
    .flat()
    .filter((i) => i.status === "ready").length;

  return (
    <div data-testid="week-calendar">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="t-label shrink-0">
          {prepared} prepared this week
        </span>
        <span className="h-px flex-1 bg-line" aria-hidden />
        {needsYes > 0 ? (
          <span className="t-meta shrink-0 text-ink">
            {needsYes} still needs your yes
          </span>
        ) : (
          <span className="t-meta shrink-0 text-moss">all handled</span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, i) => (
          <div key={day} className="min-w-0">
            <div
              className={cn(
                "t-label mb-1.5 text-center",
                i === today && "text-ink",
              )}
            >
              {day.slice(0, 3)}
            </div>
            <div
              className={cn(
                "min-h-28 space-y-1 rounded-lg border p-1 lg:min-h-[13rem]",
                i === today
                  ? "border-clay bg-card"
                  : "border-line bg-paper/60",
              )}
            >
              {placed[i].map((item) => {
                const Icon = KIND_ICON[item.kind ?? "post"];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    title={item.editedBody ?? item.body}
                    className={cn(
                      "flex w-full cursor-pointer flex-col gap-1 rounded-md border p-1.5 text-left transition-colors",
                      item.status === "posted"
                        ? "border-moss/40 bg-moss-mist"
                        : item.status === "approved"
                          ? "border-line bg-card hover:border-ink-3"
                          : "border-dashed border-line bg-card hover:border-ink-3",
                    )}
                  >
                    <span className="flex items-center gap-1">
                      <PlatformMark
                        platform={item.platform}
                        className="h-2.5 w-2.5 shrink-0"
                      />
                      <Icon
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 text-ink-3"
                      />
                    </span>
                    <span className="line-clamp-2 text-[10px] leading-tight text-ink-2">
                      {item.pillar ?? item.body.slice(0, 40)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="t-meta flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-moss/40 bg-moss-mist" />
          posted
        </span>
        <span className="t-meta flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-line bg-card" />
          approved · waiting for the team
        </span>
        <span className="t-meta flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-line bg-card" />
          still needs your yes
        </span>
      </div>

      {unscheduled.length > 0 ? (
        <div className="mt-5">
          <p className="t-label mb-2">No day yet</p>
          <div className="flex flex-wrap gap-1.5">
            {unscheduled.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1.5 text-[11.5px] text-ink-2 hover:border-ink-3 hover:text-ink"
              >
                <PlatformMark platform={item.platform} className="h-3 w-3" />
                {item.pillar ?? "Untitled"}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
