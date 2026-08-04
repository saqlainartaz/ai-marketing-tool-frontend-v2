import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientSessionProvider } from "@/components/auth/ClientSession";
import { IdeaCard } from "@/components/cards/IdeaCard";
import { CardStack } from "@/components/cards/CardStack";
import { __resetContentStore } from "@/lib/store/content";
import { setWorkMode } from "@/lib/store/settings";

function renderIdeas(clientId = "dave") {
  return render(
    <ClientSessionProvider clientId={clientId}>
      <IdeaCard clientId={clientId} />
    </ClientSessionProvider>,
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  __resetContentStore();
});

describe("IdeaCard", () => {
  it("shows grounded ideas with the line they came from", () => {
    renderIdeas();
    expect(
      screen.getByText(/What insurers actually look for after a storm/),
    ).toBeInTheDocument();
    // Every idea states its source — ideas are never invented.
    expect(screen.getByText(/your episode, March · 18:40/)).toBeInTheDocument();
  });

  it("skipping an idea removes it and offers it back", async () => {
    const user = userEvent.setup();
    renderIdeas();
    const before = screen.getAllByRole("button", { name: /write this one/i });
    await user.click(screen.getAllByRole("button", { name: /not for me/i })[0]);
    expect(
      screen.getAllByRole("button", { name: /write this one/i }).length,
    ).toBe(before.length - 1);
    expect(
      screen.getByRole("button", { name: /show the ones i skipped/i }),
    ).toBeInTheDocument();
  });

  it("writing an idea shows the work, then drafts it", async () => {
    const user = userEvent.setup();
    renderIdeas();
    await user.click(
      screen.getAllByRole("button", { name: /write this one/i })[0],
    );
    expect(screen.getByTestId("idea-writing")).toBeInTheDocument();
    expect(
      await screen.findByText(/drafted/, {}, { timeout: 6000 }),
    ).toBeInTheDocument();
  });
});

describe("the work-mode dial changes what Today leads with", () => {
  it("'show me ideas' leads with ideas, not prepared drafts", () => {
    setWorkMode("dave", "suggest");
    render(
      <ClientSessionProvider clientId="dave">
        <CardStack clientId="dave" />
      </ClientSessionProvider>,
    );
    expect(screen.getByTestId("idea-card")).toBeInTheDocument();
    // The prepared drafts are still reachable, just not in the way.
    expect(screen.getByText(/Also prepared for you/)).toBeInTheDocument();
  });

  it("'handle the prep' leads with the prepared draft", () => {
    setWorkMode("dave", "handle");
    render(
      <ClientSessionProvider clientId="dave">
        <CardStack clientId="dave" />
      </ClientSessionProvider>,
    );
    expect(screen.queryByTestId("idea-card")).not.toBeInTheDocument();
    expect(screen.getByText(/Hail season/)).toBeInTheDocument();
  });
});
