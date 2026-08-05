import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientSessionProvider } from "@/components/auth/ClientSession";
import { CardStack } from "@/components/cards/CardStack";
import { WhyThis } from "@/components/preview/WhyThis";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { __resetContentStore } from "@/lib/store/content";

beforeEach(() => {
  window.sessionStorage.clear();
  __resetContentStore();
});

describe("Why this? — the app explains the marketing", () => {
  it("stays collapsed, so a client in a hurry never has to dismiss it", () => {
    render(
      <WhyThis
        rationale={{
          moment: "Hail season starts in six weeks.",
          channel: "Facebook, because neighbours ask each other.",
          shape: "It leads with a question.",
        }}
      />,
    );
    expect(
      screen.getByRole("button", { name: /why this/i }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("why-this")).not.toBeInTheDocument();
  });

  it("opens to three different lessons — when, where, and how it's written", async () => {
    const user = userEvent.setup();
    render(
      <WhyThis
        rationale={{
          moment: "Hail season starts in six weeks.",
          channel: "Facebook, because neighbours ask each other.",
          shape: "It leads with a question.",
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: /why this/i }));

    expect(screen.getByTestId("why-this")).toBeInTheDocument();
    expect(screen.getByText(/Hail season starts/)).toBeInTheDocument();
    expect(screen.getByText(/neighbours ask each other/)).toBeInTheDocument();
    expect(screen.getByText(/leads with a question/)).toBeInTheDocument();
  });

  it("explains marketing, not the interface", () => {
    // The guard against this decaying into "click here to approve". Every
    // rationale must talk about the client's customers or their market —
    // never about our app.
    //
    // The signal isn't vocabulary, it's *voice*. "People click to check"
    // and "stops the scroll" are marketing language about the audience;
    // "click here" and "your dashboard" are instructions about our app.
    // Banning the bare words caught both, so this matches the
    // instructional forms instead.
    const uiWords =
      /\b(?:click|tap|press|select)\s+(?:here|the|on|your)\b|\byour\s+(?:dashboard|sidebar|menu|toolbar|screen)\b|\bthis\s+(?:screen|page|button)\b/i;
    for (const id of ["dave", "amara"] as const) {
      for (const draft of getFixtureClient(id).drafts) {
        if (!draft.rationale) continue;
        for (const line of Object.values(draft.rationale)) {
          expect(line, `${draft.id}: "${line}"`).not.toMatch(uiWords);
        }
      }
    }
  });

  it("appears below the actions, so it never delays a decision", () => {
    render(
      <ClientSessionProvider clientId="dave">
        <CardStack clientId="dave" />
      </ClientSessionProvider>,
    );
    const approve = screen.getByRole("button", { name: /approve post/i });
    const why = screen.getByRole("button", { name: /why this/i });
    // Node.DOCUMENT_POSITION_FOLLOWING === 4
    expect(approve.compareDocumentPosition(why) & 4).toBeTruthy();
  });
});

describe("the approval loop stays fast", () => {
  it("hands over to the next card without a long block", async () => {
    const user = userEvent.setup();
    render(
      <ClientSessionProvider clientId="dave">
        <CardStack clientId="dave" />
      </ClientSessionProvider>,
    );
    expect(screen.getByText(/Hail season/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /approve post/i }));

    // The stamp is a flourish, not a gate. It used to hold the primary
    // action disabled for 700ms — three and a half seconds across a week.
    expect(
      await screen.findByText(/Lakeway Ave/, {}, { timeout: 900 }),
    ).toBeInTheDocument();
  });
});
