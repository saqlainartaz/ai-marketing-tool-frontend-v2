"use client";

import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export const OBSTACLES = [
  "No time",
  "Don't know what to say",
  "Tried before, nothing happened",
  "Just getting started",
] as const;

export function ObstacleScreen({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { answers, setAnswer } = useOnboarding();

  return (
    <ScreenFrame
      step="obstacle"
      eyebrow="Question 2 of 4"
      title="What's been in the way?"
      onBack={onBack}
      footer={
        <>
          <ActionButton onClick={onNext} disabled={!answers.obstacle}>
            Next →
          </ActionButton>
          <button
            type="button"
            onClick={() => {
              setAnswer("obstacle", null);
              onNext();
            }}
            className="mt-2.5 w-full cursor-pointer text-center text-xs text-ink-2"
          >
            Not sure — you decide
          </button>
        </>
      }
    >
      <div className="space-y-2.5">
        {OBSTACLES.map((o) => (
          <button
            key={o}
            type="button"
            className="block w-full cursor-pointer text-left"
            onClick={() => setAnswer("obstacle", o)}
            aria-pressed={answers.obstacle === o}
          >
            <CardShell primary={answers.obstacle === o}>
              <span className="text-sm font-semibold">{o}</span>
            </CardShell>
          </button>
        ))}
      </div>
    </ScreenFrame>
  );
}
