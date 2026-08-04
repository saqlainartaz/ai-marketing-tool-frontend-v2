"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { AssemblyMoment } from "@/components/motion/AssemblyMoment";
import { PlanDocument } from "@/components/plan/PlanDocument";

export function PlanScreen({ onNext }: { onNext: () => void }) {
  const { client } = useOnboarding();
  const [revealed, setRevealed] = useState(false);

  return (
    <ScreenFrame
      step="plan"
      eyebrow={revealed ? "Your marketing plan" : "Building your plan"}
      title={
        revealed ? `Here's your plan, ${client.firstName}.` : "One moment —"
      }
      sub={
        revealed
          ? "Three things decide everything we prepare from now on. You can change any of them later."
          : undefined
      }
      footer={
        revealed ? (
          <>
            <ActionButton size="lg" onClick={onNext}>
              Start with this week&apos;s actions
              <ArrowRight className="h-4 w-4" />
            </ActionButton>
            <ActionButton variant="quiet" className="mt-2">
              Adjust the plan
            </ActionButton>
          </>
        ) : (
          <span aria-hidden className="block h-12" />
        )
      }
    >
      {!revealed ? (
        <AssemblyMoment
          steps={[
            "Reading your episode…",
            "Checking where your customers look…",
            "Matching your never-do list…",
            "Writing your plan.",
          ]}
          onDone={() => setRevealed(true)}
        />
      ) : (
        <div data-testid="plan-reveal">
          <PlanDocument client={client} animate />
        </div>
      )}
    </ScreenFrame>
  );
}
