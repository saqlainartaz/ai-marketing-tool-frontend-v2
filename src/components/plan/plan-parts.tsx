"use client";

import { PlatformMark } from "@/components/preview/platform-mark";
import type { FixtureClient } from "@/lib/fixtures/clients";
import { cn } from "@/lib/utils";

const WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

/**
 * A channel is a decision with a reason. Shown as a card with its own
 * mark, the reason it's on the plan, and whether it's running or queued —
 * so "where do I show up" is answered visually before it's read.
 */
export function ChannelCard({
  channel,
  count,
}: {
  channel: FixtureClient["plan"]["channels"][number];
  count?: number;
}) {
  const active = channel.state === "active";
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        active ? "surface" : "border-dashed border-line bg-transparent",
      )}
    >
      <div className="flex items-center gap-2">
        <PlatformMark platform={channel.platform} />
        <span className="text-[14px] font-semibold">{channel.name}</span>
        <span
          className={cn(
            "t-meta ml-auto shrink-0 rounded-full border px-2 py-0.5",
            active ? "border-moss/40 bg-moss-mist text-moss" : "border-line",
          )}
        >
          {active ? "running" : "next up"}
        </span>
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">
        {channel.why}
      </p>
      {active && count !== undefined ? (
        <p className="t-meta mt-2.5">
          {count} {count === 1 ? "piece" : "pieces"} made so far
        </p>
      ) : null}
    </div>
  );
}

/**
 * Pillars with the work behind them. A plan that shows what it has
 * produced is a living thing; a list of themes is a printout.
 */
export function PillarBar({
  pillar,
  count,
  total,
}: {
  pillar: string;
  count: number;
  /** Everything made across all pillars — the bar shows share, not rank. */
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="py-2.5">
      <div className="flex items-baseline gap-3">
        <span className="text-[13px] font-medium">{pillar}</span>
        <span className="t-meta ml-auto shrink-0">
          {count > 0 ? `${count} of ${total}` : "nothing yet"}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
        <div
          className={cn("h-full rounded-full", count > 0 && "bg-clay")}
          style={{ width: `${count > 0 ? Math.max(pct, 8) : 0}%` }}
        />
      </div>
    </div>
  );
}

/** The rhythm made visible: which days carry work, and how light it is. */
export function RhythmStrip({
  days,
  perWeek,
  effort,
}: {
  days: readonly string[];
  perWeek: number;
  effort: string;
}) {
  return (
    <div>
      <div className="flex gap-1.5">
        {WEEK.map((d) => {
          const on = days.includes(d);
          return (
            <div key={d} className="flex-1 text-center">
              <div
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg border font-mono text-[10px]",
                  on
                    ? "border-clay bg-clay text-onact"
                    : "border-line bg-paper/60 text-ink-3",
                )}
              >
                {d.slice(0, 1)}
              </div>
            </div>
          );
        })}
      </div>
      <p className="t-meta mt-2.5">
        {perWeek} {perWeek === 1 ? "piece" : "pieces"} a week · {effort}
      </p>
    </div>
  );
}
