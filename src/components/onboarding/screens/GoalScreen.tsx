"use client";

import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export const GOALS = [
  "More calls & booked jobs",
  "More clients or patients",
  "A bigger audience & authority",
  "Not sure — guide me",
] as const;

export const DRIVERS = ["Do it for me", "Me", "Someone on my team"] as const;

export function GoalScreen({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { answers, setAnswer } = useOnboarding();

  return (
    <ScreenFrame
      step="goal"
      eyebrow="Question 1 of 4"
      title="What do you want more of right now?"
      onBack={onBack}
      footer={
        <ActionButton onClick={onNext} disabled={!answers.goal}>
          Next →
        </ActionButton>
      }
    >
      <div className="space-y-2.5">
        {GOALS.map((goal) => (
          <button
            key={goal}
            type="button"
            className="block w-full cursor-pointer text-left"
            onClick={() => setAnswer("goal", goal)}
            aria-pressed={answers.goal === goal}
          >
            <CardShell primary={answers.goal === goal}>
              <span className="text-sm font-semibold">{goal}</span>
            </CardShell>
          </button>
        ))}
      </div>
      <div className="mt-4">
        <p className="text-xs text-ink-2">Who will drive this?</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {DRIVERS.map((d) => (
            <Chip
              key={d}
              selected={answers.driver === d}
              onToggle={() => setAnswer("driver", d)}
            >
              {d}
            </Chip>
          ))}
        </div>
      </div>
    </ScreenFrame>
  );
}
