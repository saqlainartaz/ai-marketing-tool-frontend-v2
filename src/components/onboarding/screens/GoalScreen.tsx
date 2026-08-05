"use client";

import { useState } from "react";
import { ArrowRight, TriangleAlert } from "lucide-react";
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
  const [error, setError] = useState(false);

  /* A greyed-out Continue tells the user they're stuck without telling
   * them why. The button stays live and answers the question when asked. */
  function next() {
    if (!answers.goal) {
      setError(true);
      return;
    }
    onNext();
  }

  return (
    <ScreenFrame
      step="goal"
      eyebrow="Question 1 of 4"
      title="What do you want more of right now?"
      sub="Everything we prepare from here on serves this one answer."
      onBack={onBack}
      footer={
        <ActionButton size="lg" onClick={next}>
          Continue
          <ArrowRight className="h-4 w-4" />
        </ActionButton>
      }
    >
      {error && !answers.goal ? (
        <p
          role="alert"
          className="mb-3 flex items-center gap-1.5 t-sub font-medium text-honey"
        >
          <TriangleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
          Pick one to carry on — &ldquo;Not sure&rdquo; is a real answer
        </p>
      ) : null}
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
        {/* Most questions here are required, so the exception is the one
         * that gets marked — the GOV.UK convention. */}
        <SectionLabel>Who will drive this (optional)</SectionLabel>
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
