"use client";

import { ArrowRight } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Chip } from "@/components/ui/chip";
import { OptionCard } from "@/components/ui/option-card";
import { SectionLabel } from "@/components/ui/section-label";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export const GOALS = [
  { label: "More calls & booked jobs", hint: "the phone rings more often" },
  { label: "More clients or patients", hint: "a fuller book, steadier work" },
  { label: "A bigger audience & authority", hint: "known for what you know" },
  { label: "Not sure — guide me", hint: "we'll pick, you can change it" },
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
      sub="Everything we prepare from here on serves this one answer."
      onBack={onBack}
      footer={
        <ActionButton size="lg" onClick={onNext} disabled={!answers.goal}>
          Next
          <ArrowRight className="h-4 w-4" />
        </ActionButton>
      }
    >
      <div className="space-y-2">
        {GOALS.map((goal) => (
          <OptionCard
            key={goal.label}
            hint={goal.hint}
            selected={answers.goal === goal.label}
            onSelect={() => setAnswer("goal", goal.label)}
          >
            {goal.label}
          </OptionCard>
        ))}
      </div>
      <div className="mt-6">
        <SectionLabel>Who will drive this</SectionLabel>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
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
