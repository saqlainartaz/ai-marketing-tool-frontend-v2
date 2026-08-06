import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { GoalLine } from "@/components/goal/GoalLine";
import { getFixtureClient } from "@/lib/fixtures/clients";
import type { Goal } from "@/lib/brief/types";

afterEach(cleanup);

/**
 * The rendered goal, gated on the two things that make it trustworthy
 * rather than decorative.
 */

describe("the goal is the client's sentence, not ours", () => {
  it("renders the statement verbatim", () => {
    const dave = getFixtureClient("dave");
    render(<GoalLine goal={dave.goal} outcomes={dave.outcomes} />);
    expect(screen.getByText(dave.goal.statement)).toBeInTheDocument();
  });
});

describe("no number without its source", () => {
  it("names the person on a logged goal", () => {
    const dave = getFixtureClient("dave");
    render(<GoalLine goal={dave.goal} outcomes={dave.outcomes} />);
    expect(screen.getByText("2 of 6")).toBeInTheDocument();
    expect(screen.getByText(/logged by your strategist/i)).toBeInTheDocument();
  });

  it("names the platforms on a reported goal", () => {
    const amara = getFixtureClient("amara");
    render(<GoalLine goal={amara.goal} outcomes={amara.outcomes} />);
    expect(screen.getByText(/from the platforms/i)).toBeInTheDocument();
  });

  it("still attributes when nothing has been counted", () => {
    const dave = getFixtureClient("dave");
    render(<GoalLine goal={dave.goal} outcomes={[]} />);
    expect(screen.getByText(/logged by your strategist/i)).toBeInTheDocument();
  });
});

describe("an unmeasured goal never shows a zero", () => {
  it("says nothing has been measured instead", () => {
    const goal: Goal = {
      statement: "Book 6 jobs by the end of September",
      metric: { kind: "logged", name: "booked jobs", loggedBy: "operator" },
      target: 6,
      deadline: "2026-09-30",
    };
    render(<GoalLine goal={goal} outcomes={[]} />);
    const line = screen.getByTestId("goal-line");
    expect(line).toHaveTextContent(/nothing measured yet/i);
    /* "0 of 6" on a goal reads as failure. The truth this early is that
     * nobody has counted anything, which is a different statement. */
    expect(line).not.toHaveTextContent(/\b0 of 6\b/);
  });
});

describe("a post going out cannot move a logged goal", () => {
  it("ignores platform numbers on a logged metric", () => {
    const dave = getFixtureClient("dave");
    render(
      <GoalLine
        goal={dave.goal}
        outcomes={[
          ...dave.outcomes,
          { value: 5000, at: "2026-08-01", source: "platform" },
        ]}
      />,
    );
    // Still 2. The reach of a post is not a booked job and never becomes one.
    expect(screen.getByText("2 of 6")).toBeInTheDocument();
  });
});
