"use client";

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { OptionCard } from "@/components/ui/option-card";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export const OBSTACLES = [
  "No time",
  "Don't know what to say",
  "Tried before, nothing happened",
  "Just getting started",
] as const;

const RECOMMENDED_OBSTACLE = OBSTACLES[0];

export function ObstacleScreen({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { answers, setAnswer } = useOnboarding();

  /* Never a blank choice — see GoalScreen. */
  useEffect(() => {
    if (!answers.obstacle) setAnswer("obstacle", RECOMMENDED_OBSTACLE);
  }, [answers.obstacle, setAnswer]);

  return (
    <ScreenFrame
      step="obstacle"
      eyebrow="Question 2 of 4"
      title="What's been in the way?"
      sub="No wrong answer — it changes how much we hand you versus handle."
      onBack={onBack}
      footer={
        <>
          <ActionButton size="lg" onClick={onNext}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
          <ActionButton
            variant="quiet"
            className="mt-2"
            onClick={() => {
              setAnswer("obstacle", null);
              onNext();
            }}
          >
            Not sure — you decide
          </ActionButton>
        </>
      }
    >
      <div className="space-y-2">
        {OBSTACLES.map((o) => (
          <OptionCard
            key={o}
            selected={answers.obstacle === o}
            recommended={o === RECOMMENDED_OBSTACLE}
            onSelect={() => setAnswer("obstacle", o)}
          >
            {o}
          </OptionCard>
        ))}
      </div>
    </ScreenFrame>
  );
}
