import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusProvider } from "@/components/system/StatusProvider";
import { VoiceSurface } from "@/components/voice/VoiceSurface";
import { LegibleMemory } from "@/components/profile/LegibleMemory";
import { getEngineFixture, currentVoice } from "@/lib/fixtures/engine";
import { findDraftAnywhere } from "@/lib/fixtures/clients";
import { __resetContentStore } from "@/lib/store/content";

beforeEach(() => {
  window.sessionStorage.clear();
  __resetContentStore();
});

function wrap(ui: React.ReactElement) {
  return render(<StatusProvider>{ui}</StatusProvider>);
}

describe("the voice profile shows what it rests on", () => {
  it("every judgement can be opened to reveal its evidence", async () => {
    const user = userEvent.setup();
    wrap(<VoiceSurface clientId="dave" />);

    const trait = screen.getByRole("button", {
      name: /Specific about the work/i,
    });
    expect(trait).toHaveAttribute("aria-expanded", "false");

    await user.click(trait);
    const evidence = screen.getByTestId("trait-evidence");
    // The actual line from the actual source — this is the thing that
    // answers "it doesn't sound like me". Without it there's nothing to
    // argue with.
    expect(evidence).toHaveTextContent(/two days flat/i);
    expect(evidence).toHaveTextContent(/Karen L\., May/i);
  });

  it("states its confidence rather than asserting", () => {
    wrap(<VoiceSurface clientId="dave" />);
    expect(
      screen.getByRole("button", { name: /Specific about the work/i }),
    ).toHaveTextContent(/%\s*sure/i);
  });

  it("a draft profile asks to be approved; an approved one doesn't", async () => {
    // Amara's is still draft, Dave's is approved.
    const { unmount } = wrap(<VoiceSurface clientId="amara" />);
    expect(
      screen.getByRole("button", { name: /approve this version/i }),
    ).toBeInTheDocument();
    unmount();

    wrap(<VoiceSurface clientId="dave" />);
    expect(
      screen.queryByRole("button", { name: /approve this version/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Approved by you/i)).toBeInTheDocument();
  });

  it("approving is reversible, like every other decision here", async () => {
    const user = userEvent.setup();
    wrap(<VoiceSurface clientId="amara" />);
    await user.click(
      screen.getByRole("button", { name: /approve this version/i }),
    );
    expect(screen.getByText(/Approved by you/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(
      await screen.findByRole("button", { name: /approve this version/i }),
    ).toBeInTheDocument();
  });

  it("every open question carries a recommendation — never a bare blocker", () => {
    for (const id of ["dave", "amara"] as const) {
      for (const v of getEngineFixture(id).voiceVersions) {
        for (const q of v.openQuestions) {
          expect(q.recommendation, q.question).toBeTruthy();
          expect(q.options, q.question).toContain(q.recommendation);
        }
      }
    }
    expect(currentVoice("dave").version).toBe(2);
  });
});

describe("the profile is legible, and read-only", () => {
  it("shows where each belief came from, down to the line", async () => {
    const user = userEvent.setup();
    wrap(<LegibleMemory clientId="dave" />);

    await user.click(
      screen.getAllByRole("button", { name: /ISTV episode — March · line/i })[0],
    );
    const source = screen.getByTestId("atom-source");
    expect(source).toHaveTextContent(/Dave/);
    expect(source).toHaveTextContent(/2026-03-14/);
  });

  it("lets a client dispute a fact but never curate one", async () => {
    const user = userEvent.setup();
    wrap(<LegibleMemory clientId="dave" />);

    // No confirm/deprecate anywhere — that lifecycle stays with the team.
    expect(
      screen.queryByRole("button", { name: /confirm|deprecate|delete/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /not right/i })[0]);
    expect(screen.getByText(/you flagged this/i)).toBeInTheDocument();
  });

  it("never offers to dispute a locked compliance rule", () => {
    wrap(<LegibleMemory clientId="dave" />);
    const locked = screen.getByText(
      /Never promise that an insurance claim will be approved/i,
    );
    const row = locked.closest("li")!;
    expect(
      row.querySelector("button[class*='hover:text-honey']"),
    ).toBeNull();
  });

  it("marks a claim we only inferred differently from one we can quote", () => {
    wrap(<LegibleMemory clientId="dave" />);
    // evidence_kind is what decides whether a claim can carry weight.
    expect(screen.getAllByText(/your words/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/unconfirmed/i).length).toBeGreaterThan(0);
  });
});

describe("the review link", () => {
  it("resolves a draft without knowing whose it is", () => {
    const found = findDraftAnywhere("dave-2");
    expect(found?.client.id).toBe("dave");
    expect(found?.draft.guardrail).toBeTruthy();
    expect(findDraftAnywhere("nope")).toBeNull();
  });
});
