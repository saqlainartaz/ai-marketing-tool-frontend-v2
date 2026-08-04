import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientSessionProvider } from "@/components/auth/ClientSession";
import { StatusProvider } from "@/components/system/StatusProvider";
import { CardStack } from "@/components/cards/CardStack";
import { __resetContentStore } from "@/lib/store/content";

function renderStack(clientId = "dave") {
  return render(
    <ClientSessionProvider clientId={clientId}>
      <StatusProvider>
        <CardStack clientId={clientId} />
      </StatusProvider>
    </ClientSessionProvider>,
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
  __resetContentStore();
});

describe("acting is reversible, and the result is announced", () => {
  it("skipping a draft can be undone from the toast", async () => {
    const user = userEvent.setup();
    renderStack();
    expect(screen.getByText(/Hail season/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^skip post$/i }));
    expect(screen.queryByText(/Hail season/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(await screen.findByText(/Hail season/)).toBeInTheDocument();
  });

  it("the result reaches assistive tech without stealing focus", async () => {
    const user = userEvent.setup();
    renderStack();
    const skip = screen.getByRole("button", { name: /^skip post$/i });
    await user.click(skip);

    // role=status is polite by definition: announced, never interrupting.
    const live = screen.getByRole("status");
    expect(live).toHaveTextContent("Skipped");
    expect(document.activeElement).not.toBe(
      screen.getByRole("button", { name: /undo/i }),
    );
  });

  it("approving is undoable too — the promise is 'nothing is final'", async () => {
    const user = userEvent.setup();
    renderStack();
    await user.click(screen.getByRole("button", { name: /approve post/i }));
    expect(
      await screen.findByRole("button", { name: /undo/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /undo/i }));
    expect(await screen.findByText(/Hail season/)).toBeInTheDocument();
  });
});

describe("action labels name their object", () => {
  it("a review reply says 'Approve reply', not a generic verb", async () => {
    const user = userEvent.setup();
    renderStack();
    for (let i = 0; i < 3; i++) {
      await user.click(
        await screen.findByRole("button", { name: /^skip (post|reply|email)$/i }),
      );
    }
    expect(
      screen.getByRole("button", { name: /approve reply/i }),
    ).toBeInTheDocument();
  });

  it("the consequence is a description, not part of the button's name", () => {
    renderStack();
    const approve = screen.getByRole("button", { name: /approve post/i });
    // WCAG 2.5.3: a speech-input user says what they see.
    expect(approve).toHaveAccessibleName("Approve post");
    expect(approve).toHaveAccessibleDescription(/.+/);
  });
});
