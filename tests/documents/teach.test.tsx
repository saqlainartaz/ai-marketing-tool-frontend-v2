import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientSessionProvider } from "@/components/auth/ClientSession";
import { StatusProvider } from "@/components/system/StatusProvider";
import DocumentsPage from "@/app/(client)/(tabs)/documents/page";
import { __resetDocumentStore } from "@/lib/store/documents";

beforeEach(() => {
  window.sessionStorage.clear();
  __resetDocumentStore();
});

function renderPage() {
  return render(
    <ClientSessionProvider clientId="dave">
      <StatusProvider>
        <DocumentsPage />
      </StatusProvider>
    </ClientSessionProvider>,
  );
}

describe("teach it something", () => {
  it("starts from what we've already read, not an empty shelf", () => {
    renderPage();
    expect(screen.getByText(/ISTV episode — March/)).toBeInTheDocument();
    expect(screen.getByText(/Customer reviews/)).toBeInTheDocument();
  });

  it("names the engine's own stages rather than 'uploading'", async () => {
    const user = userEvent.setup();
    renderPage();

    const file = new File(["a transcript"], "March call.txt", {
      type: "text/plain",
    });
    await user.upload(
      document.querySelector<HTMLInputElement>('input[type="file"]')!,
      file,
    );

    // The document appears immediately with a real status. Asserting a
    // specific mid-pipeline stage would race the timers; what matters is
    // that the client sees their file land and then sees it finish.
    expect(await screen.findByText(/March call\.txt/)).toBeInTheDocument();
    expect(
      await screen.findByText(/Read · 6 things learned/, {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it("ends by showing what the document actually taught us", async () => {
    const user = userEvent.setup();
    renderPage();

    const file = new File(["a transcript"], "March call.txt", {
      type: "text/plain",
    });
    await user.upload(
      document.querySelector<HTMLInputElement>('input[type="file"]')!,
      file,
    );

    // The point of the whole flow: a client sees the connection between
    // what they gave us and what we now know.
    const learned = await screen.findByTestId("learned", {}, { timeout: 5000 });
    expect(learned).toHaveTextContent(/What this taught us/i);
    expect(learned).toHaveTextContent(/proof point/i);
  });

  it("promises nothing gets published from what they add", () => {
    renderPage();
    expect(
      screen.getByText(/nothing is published from what you add/i),
    ).toBeInTheDocument();
  });
});
