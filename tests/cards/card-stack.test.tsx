import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientSessionProvider } from "@/components/auth/ClientSession";
import { CardStack } from "@/components/cards/CardStack";
import { __resetContentStore } from "@/lib/store/content";

function renderStack(clientId = "dave") {
  return render(
    <ClientSessionProvider clientId={clientId}>
      <CardStack clientId={clientId} />
    </ClientSessionProvider>,
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  __resetContentStore();
});

describe("CardStack (store-driven)", () => {
  it("shows Dave's first ready draft, one at a time", () => {
    renderStack();
    expect(screen.getByText(/Hail season/)).toBeInTheDocument();
    expect(screen.queryByText(/Lakeway Ave/)).not.toBeInTheDocument();
  });

  it("approve stamps, then advances to the next draft", async () => {
    const user = userEvent.setup();
    renderStack();
    await user.click(screen.getByRole("button", { name: /good to go/i }));
    expect(screen.getByTestId("stamp")).toHaveTextContent("ON ITS WAY");
    expect(
      await screen.findByText(/Lakeway Ave/, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
  });

  it("edit-in-preview saves the client's words and confirms the re-check", async () => {
    const user = userEvent.setup();
    renderStack();
    await user.click(screen.getByRole("button", { name: /edit/i }));
    const box = screen.getByLabelText(/edit post text/i);
    await user.clear(box);
    await user.type(box, "My own words about hail season.");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(
      screen.getByText(/Still safe after your edit/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/My own words about hail season./),
    ).toBeInTheDocument();
  });

  it("guardrail diff opens on tap (protection, not warning)", async () => {
    const user = userEvent.setup();
    renderStack();
    // Skip to Dave's second draft, which carries the softened claim.
    await user.click(screen.getByRole("button", { name: /not this one/i }));
    await user.click(
      await screen.findByRole("button", { name: /one claim softened/i }),
    );
    expect(screen.getByTestId("guardrail-diff")).toHaveTextContent(
      /We help you document/,
    );
  });

  it("provenance underline reveals the source", async () => {
    const user = userEvent.setup();
    renderStack();
    await user.click(
      screen.getByRole("button", {
        name: /we caught three roofs their owners thought were fine/i,
      }),
    );
    expect(screen.getByTestId("source-pop")).toHaveTextContent(
      /your episode, March/,
    );
  });

  it("after all drafts, the question card appears; question cards link to create", async () => {
    const user = userEvent.setup();
    renderStack();
    for (let i = 0; i < 3; i++) {
      await user.click(
        await screen.findByRole("button", { name: /not this one/i }),
      );
    }
    expect(
      screen.getByText(/Tell the story of a job you finished this week/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /tell the story/i }),
    ).toHaveAttribute("href", "/create/dave-q1");
  });
});
