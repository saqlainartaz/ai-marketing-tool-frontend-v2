import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardStack } from "@/components/cards/CardStack";
import type { ActionCardFixture } from "@/lib/fixtures/clients";

const CARDS: ActionCardFixture[] = [
  {
    id: "c1",
    type: "draft_approval",
    platform: "facebook",
    meta: "Facebook · ready for Tue 9 AM",
    body: "First draft body.",
    consequence: "pull it back anytime",
  },
  {
    id: "c2",
    type: "draft_approval",
    platform: "linkedin",
    meta: "LinkedIn · awaiting your review",
    body: "Second draft body.",
    consequence: "nothing publishes without you",
  },
];

function renderStack(onAllDecided = vi.fn()) {
  render(
    <CardStack
      cards={CARDS}
      businessName="Meridian Roofing"
      avatarInitial="M"
      onAllDecided={onAllDecided}
    />,
  );
  return onAllDecided;
}

describe("CardStack", () => {
  it("shows one card at a time", () => {
    renderStack();
    expect(screen.getByText("First draft body.")).toBeInTheDocument();
    expect(screen.queryByText("Second draft body.")).not.toBeInTheDocument();
  });

  it("approve stamps, then advances to the next card", async () => {
    const user = userEvent.setup();
    renderStack();
    await user.click(screen.getByRole("button", { name: /good to go/i }));
    expect(screen.getByTestId("stamp")).toHaveTextContent("ON ITS WAY");
    expect(
      await screen.findByText("Second draft body.", {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("'Not this one' advances without a stamp and reports all decisions", async () => {
    const user = userEvent.setup();
    const onAllDecided = renderStack();
    await user.click(screen.getByRole("button", { name: /not this one/i }));
    expect(screen.getByText("Second draft body.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /good to go/i }));
    expect(
      await screen.findByTestId("all-done", {}, { timeout: 2000 }),
    ).toBeInTheDocument();
    expect(onAllDecided).toHaveBeenCalledWith({
      c1: "skipped",
      c2: "approved",
    });
  });
});
