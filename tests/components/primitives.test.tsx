import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { DialPill, WORK_MODE_LABELS } from "@/components/ui/dial-pill";
import { PostPreview } from "@/components/preview/post-preview";

describe("ActionButton", () => {
  it("renders label and the consequence line", () => {
    render(
      <ActionButton consequence="pull it back anytime">Good to go</ActionButton>,
    );
    expect(screen.getByRole("button")).toHaveTextContent("Good to go");
    expect(screen.getByText("pull it back anytime")).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<ActionButton onClick={onClick}>Approve</ActionButton>);
    await userEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("CardShell", () => {
  it("marks the primary card", () => {
    render(
      <CardShell primary>
        <p>Start here</p>
      </CardShell>,
    );
    expect(screen.getByText("Start here").parentElement).toHaveAttribute(
      "data-primary",
      "true",
    );
  });
});

describe("Chip", () => {
  it("toggles selection via aria-pressed", async () => {
    const onToggle = vi.fn();
    render(<Chip onToggle={onToggle}>Nothing salesy</Chip>);
    const chip = screen.getByRole("button", { name: "Nothing salesy" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("locked chips are not buttons and cannot toggle", () => {
    render(<Chip locked>No guarantee claims</Chip>);
    expect(
      screen.queryByRole("button", { name: /no guarantee claims/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/No guarantee claims/)).toBeInTheDocument();
  });
});

describe("DialPill", () => {
  it("display-only pill shows the short label", () => {
    render(<DialPill mode="handle" />);
    expect(
      screen.getByText(/Prepared for you · your yes sends it/),
    ).toBeInTheDocument();
  });

  it("interactive dial selects a mode", async () => {
    const onChange = vi.fn();
    render(<DialPill mode="prepare" onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("radio", { name: WORK_MODE_LABELS.handle }),
    );
    expect(onChange).toHaveBeenCalledWith("handle");
  });
});

describe("PostPreview", () => {
  it("renders facebook framing with its action row", () => {
    render(
      <PostPreview
        platform="facebook"
        businessName="Meridian Roofing"
        avatarInitial="M"
        meta="Facebook · ready for Tue 9 AM"
        withImage
      >
        Hail season is coming, Austin.
      </PostPreview>,
    );
    expect(screen.getByText("Meridian Roofing")).toBeInTheDocument();
    expect(screen.getByText(/ready for Tue 9 AM/)).toBeInTheDocument();
    expect(screen.getByText(/Hail season/)).toBeInTheDocument();
    expect(screen.getByText("👍 Like")).toBeInTheDocument();
    expect(screen.getByTestId("image-slot")).toBeInTheDocument();
  });

  it("google business preview shows call/directions actions", () => {
    render(
      <PostPreview
        platform="google_business"
        businessName="Meridian Roofing"
        avatarInitial="M"
        meta="Google Business · Thu 9 AM"
      >
        Before and after from Lakeway Ave.
      </PostPreview>,
    );
    expect(screen.getByText("📞 Call")).toBeInTheDocument();
    expect(screen.getByText("📍 Directions")).toBeInTheDocument();
  });
});
