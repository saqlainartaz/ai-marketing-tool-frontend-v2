import { describe, expect, it } from "vitest";
import { goalProgress, type RecordedOutcome } from "@/lib/outcomes";
import type { Goal } from "@/lib/brief/types";

/**
 * The goal number, and the honesty constraint that shapes it.
 *
 * A marketing tool's easiest lie is the one where a post goes out and a
 * number goes up, implying the first caused the second. `GoalMetric` has
 * exactly two shapes — a platform reports it, or a person logged it — so
 * the lie can't be expressed, and every number renders beside its source.
 *
 * The tests that matter here are the ones about what we *refuse* to show.
 */

const LOGGED: Goal = {
  statement: "Book 6 jobs by the end of September",
  metric: { kind: "logged", name: "booked jobs", loggedBy: "operator" },
  target: 6,
  deadline: "2026-09-30",
};

const PLATFORM: Goal = {
  statement: "Reach 2,000 Austin homeowners by the end of September",
  metric: { kind: "platform", name: "views" },
  target: 2000,
  deadline: "2026-09-30",
};

const NOW = new Date("2026-08-06T09:00:00Z");

function outcome(value: number, source: RecordedOutcome["source"]): RecordedOutcome {
  return { value, at: "2026-07-14", source };
}

describe("a goal with nothing measured", () => {
  it("is not measured, and says so instead of showing a zero", () => {
    const p = goalProgress(LOGGED, [], NOW);
    expect(p.measured).toBe(false);
    // A zero reads as failure. "Nothing measured yet" reads as early.
    expect(p.progressLabel).toMatch(/nothing measured yet/i);
    expect(p.progressLabel).not.toMatch(/\b0\b/);
  });

  it("still shows the target, so the goal is visible before any progress", () => {
    const p = goalProgress(LOGGED, [], NOW);
    expect(p.target).toBe(6);
    expect(p.statement).toBe(LOGGED.statement);
  });
});

describe("a goal with progress", () => {
  it("sums what was recorded", () => {
    const p = goalProgress(LOGGED, [outcome(1, "operator"), outcome(1, "operator")], NOW);
    expect(p.measured).toBe(true);
    expect(p.value).toBe(2);
    expect(p.progressLabel).toBe("2 of 6");
  });

  it("never reports past the target — an overshoot is still the goal met", () => {
    const p = goalProgress(LOGGED, [outcome(9, "operator")], NOW);
    expect(p.value).toBe(9);
    expect(p.met).toBe(true);
  });
});

describe("the source is never separable from the number", () => {
  it("names the person for a logged goal", () => {
    expect(goalProgress(LOGGED, [outcome(2, "operator")], NOW).sourceLabel).toMatch(
      /logged by your strategist/i,
    );
  });

  it("names the platform for a platform goal", () => {
    expect(goalProgress(PLATFORM, [outcome(900, "platform")], NOW).sourceLabel).toMatch(
      /reported by facebook and google|from the platforms/i,
    );
  });

  it("labels the source even when nothing has been measured", () => {
    // Otherwise the empty state quietly drops the honesty the type exists for.
    expect(goalProgress(LOGGED, [], NOW).sourceLabel).toBeTruthy();
  });
});

describe("a logged goal refuses platform-sourced numbers", () => {
  it("ignores an outcome whose source doesn't match the metric", () => {
    /* This is the whole point. If a platform view count could roll into
     * "booked jobs", the product would be claiming a post caused a booking
     * — the attribution `GoalMetric` was designed to make unsayable. */
    const p = goalProgress(LOGGED, [outcome(1, "operator"), outcome(4000, "platform")], NOW);
    expect(p.value).toBe(1);
  });

  it("and a platform goal ignores hand-logged numbers", () => {
    const p = goalProgress(PLATFORM, [outcome(900, "platform"), outcome(5, "operator")], NOW);
    expect(p.value).toBe(900);
  });
});

describe("the deadline is read as time left, not a date to decode", () => {
  it("says how long is left while there is time", () => {
    expect(goalProgress(LOGGED, [], NOW).deadlineLabel).toMatch(/by 30 September/i);
  });

  it("marks a passed deadline without scolding", () => {
    const p = goalProgress(LOGGED, [outcome(2, "operator")], new Date("2026-10-05"));
    expect(p.passed).toBe(true);
    expect(p.deadlineLabel).not.toMatch(/fail|missed|overdue/i);
  });
});
