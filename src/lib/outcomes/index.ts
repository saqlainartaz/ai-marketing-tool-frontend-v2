import type { Goal } from "@/lib/brief/types";

/**
 * Rolling recorded outcomes up into goal progress. Pure — no store, no
 * clock of its own, no I/O — so the honesty rules below are table-testable.
 */

export type RecordedOutcome = {
  /** The asset this came from, when it came from one. */
  assetId?: string;
  value: number;
  /** ISO date. */
  at: string;
  /** Who counted it. Must match the goal's metric to be admitted. */
  source: "platform" | "operator";
};

export type GoalProgress = {
  statement: string;
  target: number;
  value: number;
  /** False until something has actually been counted. */
  measured: boolean;
  met: boolean;
  passed: boolean;
  /** "2 of 6", or the honest absence. Never a bare zero. */
  progressLabel: string;
  /** Where the number came from. Rendered beside it, always. */
  sourceLabel: string;
  deadlineLabel: string;
};

/** A metric admits only outcomes counted the way it says they are. */
function admits(goal: Goal, o: RecordedOutcome): boolean {
  return goal.metric.kind === "logged"
    ? o.source === "operator"
    : o.source === "platform";
}

function sourceLabel(goal: Goal): string {
  return goal.metric.kind === "logged"
    ? "logged by your strategist"
    : "from the platforms";
}

function deadlineLabel(deadline: string): string {
  /* UTC, explicitly. An ISO date parses as UTC midnight, so formatting it
   * in a negative-offset timezone silently reports the day before. */
  const when = new Date(deadline).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return `by ${when}`;
}

export function goalProgress(
  goal: Goal,
  outcomes: RecordedOutcome[],
  now: Date,
): GoalProgress {
  /* Filtering rather than summing everything is the load-bearing line in
   * this file. A platform view count rolling into "booked jobs" would have
   * the product claim a post caused a booking — the exact attribution the
   * metric type exists to make unsayable. */
  const admitted = outcomes.filter((o) => admits(goal, o));
  const value = admitted.reduce((sum, o) => sum + o.value, 0);
  const measured = admitted.length > 0;

  return {
    statement: goal.statement,
    target: goal.target,
    value,
    measured,
    met: measured && value >= goal.target,
    passed: now > new Date(goal.deadline),
    /* Never a bare zero. A zero on a goal reads as failure; the truth
     * early on is that nobody has counted anything yet. */
    progressLabel: measured
      ? `${value.toLocaleString("en-GB")} of ${goal.target.toLocaleString("en-GB")}`
      : "Nothing measured yet",
    sourceLabel: sourceLabel(goal),
    deadlineLabel: deadlineLabel(goal.deadline),
  };
}
