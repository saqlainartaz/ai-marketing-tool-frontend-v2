import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientSessionProvider } from "@/components/auth/ClientSession";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { GoalScreen } from "@/components/onboarding/screens/GoalScreen";
import { ObstacleScreen } from "@/components/onboarding/screens/ObstacleScreen";
import { NeverScreen } from "@/components/onboarding/screens/NeverScreen";
import { ConfirmScreen } from "@/components/onboarding/screens/ConfirmScreen";

function wrap(ui: React.ReactNode, clientId = "dave") {
  return render(
    <ClientSessionProvider clientId={clientId}>
      <OnboardingProvider>{ui}</OnboardingProvider>
    </ClientSessionProvider>,
  );
}

beforeEach(() => {
  window.sessionStorage.clear();
});

describe("ConfirmScreen (S1)", () => {
  it("shows endowed-progress checks and the client's profile", () => {
    wrap(<ConfirmScreen onNext={() => {}} />);
    expect(screen.getByText(/Read your ISTV episode/)).toBeInTheDocument();
    expect(screen.getByText(/Meridian Roofing/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /that's me/i }),
    ).toBeInTheDocument();
  });
});

describe("GoalScreen (S2)", () => {
  it("Next stays disabled until a goal is chosen", async () => {
    const onNext = vi.fn();
    wrap(<GoalScreen onNext={onNext} onBack={() => {}} />);
    const next = screen.getByRole("button", { name: /next/i });
    expect(next).toBeDisabled();
    await userEvent.click(
      screen.getByRole("button", { name: /More calls & booked jobs/i }),
    );
    expect(next).toBeEnabled();
    await userEvent.click(next);
    expect(onNext).toHaveBeenCalledOnce();
  });
});

describe("ObstacleScreen (S3)", () => {
  it("'Not sure — you decide' always advances", async () => {
    const onNext = vi.fn();
    wrap(<ObstacleScreen onNext={onNext} onBack={() => {}} />);
    await userEvent.click(
      screen.getByRole("button", { name: /not sure — you decide/i }),
    );
    expect(onNext).toHaveBeenCalledOnce();
  });
});

describe("NeverScreen (S5)", () => {
  it("renders Dave's locked trade-compliance chips as non-toggleable", () => {
    wrap(<NeverScreen onNext={() => {}} onBack={() => {}} />);
    expect(screen.getByText(/licensed trade/)).toBeInTheDocument();
    expect(screen.getByText(/No guarantee claims/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /no guarantee claims/i }),
    ).not.toBeInTheDocument();
  });

  it("renders Amara's bar-rule chips when the session client is amara", async () => {
    wrap(<NeverScreen onNext={() => {}} onBack={() => {}} />, "amara");
    expect(await screen.findByText(/licensed attorney/)).toBeInTheDocument();
    expect(screen.getByText(/No outcome guarantees/)).toBeInTheDocument();
    expect(screen.getByText(/No client details, ever/)).toBeInTheDocument();
  });
});
