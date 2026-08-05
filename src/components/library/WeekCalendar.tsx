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
 * A ribbon day: a real control when it has work, plain structure when it
 * doesn't. A button that does nothing is worse than no button.
 */
function DayCell({
  asButton,
  onSelect,
  className,
  children,
}: {
  asButton: boolean;
  onSelect: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  if (!asButton) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn("pressable", className)}
    >
      {children}
    </button>
  );
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
      {/* Phone: a legible ribbon — day letter + one dot per prepared item.
          Seven columns of truncated text is unreadable at 44px, and the
          list below already carries the words. */}
      <div className="grid grid-cols-7 gap-1 sm:hidden">
        {DAYS.map((day, i) => (
          /* The ribbon used to be seven inert divs: on a phone, the week
             view had no touch targets at all. A day with work is now a
             button that opens it; an empty day stays a plain div rather
             than a control that does nothing. */
          <DayCell
            key={day}
            asButton={placed[i].length > 0}
            onSelect={() => onSelect(placed[i][0].id)}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-lg border py-2",
              i === today ? "border-clay bg-card" : "border-line bg-paper/60",
            )}
          >
            <span
              className={cn(
                "font-mono text-[10px] tracking-wider",
                i === today ? "text-ink" : "text-ink-3",
              )}
            >
              {day.slice(0, 1)}
            </span>
            <span className="flex min-h-3 flex-wrap justify-center gap-0.5">
              {placed[i].map((item) => (
                <span
                  key={item.id}
                  aria-hidden
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    item.status === "posted" || item.status === "approved"
                      ? "bg-moss"
                      : "bg-clay",
                  )}
                />
              ))}
            </span>
            {/* The dots differ only by colour, which carries no meaning to
                anyone who can't compare them. The same fact, in words. */}
            <span className="sr-only">
              {day}: {placed[i].length === 0 ? "nothing prepared" : null}
              {placed[i].length > 0
                ? `${placed[i].length} prepared, ${
                    placed[i].filter(
                      (it) =>
                        it.status === "posted" || it.status === "approved",
                    ).length
                  } approved`
                : null}
            </span>
          </DayCell>
        ))}
      </div>

      <div className="hidden grid-cols-7 gap-1.5 sm:grid">
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
                "min-h-24 space-y-1 rounded-lg border p-1 lg:min-h-28",
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

      <div className="mt-4 hidden flex-wrap items-center gap-x-4 gap-y-1 sm:flex">
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
