import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SourcedBody } from "@/components/preview/SourcedBody";

/**
 * P0 regression (design audit 2026-08-04): provenance buttons fractured
 * sentence flow — orphaned punctuation, mid-sentence line breaks. Guard:
 * the rendered text must be byte-identical to the source body, and the
 * span buttons must be true inline elements.
 */
const BODY =
  "Last month we caught three roofs their owners thought were fine. Here's the check.";

describe("SourcedBody text flow", () => {
  it("renders text identical to the body — punctuation stays attached", () => {
    render(
      <p>
        <SourcedBody
          body={BODY}
          provenance={[
            {
              phrase: "we caught three roofs their owners thought were fine",
              label: "your episode, March",
            },
          ]}
        />
      </p>,
    );
    expect(screen.getByTestId("sourced-body")).toHaveTextContent(BODY, {
      normalizeWhitespace: false,
    });
  });

  it("provenance buttons are inline elements (never break the line)", () => {
    render(
      <p>
        <SourcedBody
          body={BODY}
          provenance={[
            {
              phrase: "we caught three roofs their owners thought were fine",
              label: "your episode, March",
            },
          ]}
        />
      </p>,
    );
    const button = screen.getByRole("button");
    expect(button.style.display).toBe("inline");
  });

  it("tapping a span reveals the source below the paragraph", async () => {
    const user = userEvent.setup();
    render(
      <SourcedBody
        body={BODY}
        provenance={[
          {
            phrase: "we caught three roofs their owners thought were fine",
            label: "your episode, March · 22:14",
            quote: "…three inspections where the homeowner had no idea…",
          },
        ]}
      />,
    );
    await user.click(screen.getByRole("button"));
    const pop = screen.getByTestId("source-pop");
    expect(pop).toHaveTextContent(/your episode, March/);
    expect(pop).toHaveTextContent(/no idea/);
  });
});
