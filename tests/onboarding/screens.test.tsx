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
    expect(screen.getAllByText(/Meridian Roofing/).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /that's me/i }),
    ).toBeInTheDocument();
  });
});

describe("GoalScreen (S2)", () => {
  it("arrives with our recommendation already chosen, and says it's ours", async () => {
    const onNext = vi.fn();
    wrap(<GoalScreen onNext={onNext} onBack={() => {}} />);

    // Never a blank choice. The person who doesn't know where to start is
    // never asked to guess, and the fastest path through is one tap.
    const recommended = await screen.findByRole("button", {
      name: /More calls & booked jobs/i,
    });
    expect(recommended).toHaveAttribute("aria-pressed", "true");
    expect(recommended).toHaveTextContent(/our pick/i);

    // And it's a recommendation, not a decision made for them.
    await userEvent.click(
      screen.getByRole("button", { name: /A bigger audience/i }),
    );
    expect(
      screen.getByRole("button", { name: /A bigger audience/i }),
    ).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
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
