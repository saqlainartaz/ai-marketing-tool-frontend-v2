"use client";

import { goalProgress, type RecordedOutcome } from "@/lib/outcomes";
import type { Goal } from "@/lib/brief/types";
import { cn } from "@/lib/utils";

/**
 * The one number the work is for.
 *
 * Everything below this line on Today is a decision; this says what the
 * decisions are *for*. Without it the product prepares work forever and
 * never reports whether any of it mattered — which is the difference
 * between a content tool and a marketing tool.
 *
 * Two rules hold it honest, and both are visible rather than documented:
 *
 * 1. The goal is the client's own sentence, verbatim. Not our paraphrase
 *    of what we think they meant.
 * 2. The number never appears without its source beside it. A person
 *    logged it, or a platform reported it — and marking a post as posted
 *    moves neither, because `GoalMetric` has no shape that would let it.
 *    Every competitor's dashboard implies that link. Not saying it is the
 *    thing worth being known for.
 */
export function GoalLine({
  goal,
  outcomes,
}: {
  goal: Goal;
  outcomes: RecordedOutcome[];
}) {
  const progress = goalProgress(goal, outcomes, new Date());

  return (
    <div data-testid="goal-line" className="mt-5">
      <p className="t-sub">{progress.statement}</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span
          className={cn(
            "t-lead tabular-nums",
            /* Unmeasured is a sentence, not a figure, so it takes the
             * quieter colour — the eye shouldn't read it as a result. */
            !progress.measured && "font-normal text-ink-3",
          )}
        >
          {progress.progressLabel}
        </span>
        <span className="t-meta">{progress.sourceLabel}</span>
      </p>
    </div>
  );
}
