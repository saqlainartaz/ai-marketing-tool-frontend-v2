"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { AssemblyMoment } from "@/components/motion/AssemblyMoment";

export function PlanScreen({ onNext }: { onNext: () => void }) {
  const { client } = useOnboarding();
  const [revealed, setRevealed] = useState(false);

  return (
    <ScreenFrame
      step="plan"
      eyebrow="Your marketing plan"
      title={
        revealed ? (
          <>Here&apos;s your plan, {client.firstName}.</>
        ) : (
          <>One moment —</>
        )
      }
      footer={
        revealed ? (
          <>
            <ActionButton onClick={onNext}>
              Start with this week&apos;s actions →
            </ActionButton>
            <button
              type="button"
              className="mt-2.5 w-full cursor-pointer text-center text-xs text-ink-2"
            >
              Adjust the plan
            </button>
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
        <div className="space-y-2.5" data-testid="plan-reveal">
          <CardShell>
            <p className="text-sm font-semibold">Where to show up</p>
            <p className="mt-1 text-[12.5px] text-ink-2">{client.plan.where}</p>
          </CardShell>
          <CardShell>
            <p className="text-sm font-semibold">What to talk about</p>
            <p className="mt-1 text-[12.5px] text-ink-2">{client.plan.what}</p>
          </CardShell>
          <CardShell>
            <p className="text-sm font-semibold">Your rhythm</p>
            <p className="mt-1 text-[12.5px] text-ink-2">{client.plan.rhythm}</p>
          </CardShell>
          <p className="pt-1 text-center text-[11px] text-ink-3">
            Built from your episode and your answers — nothing generic.
          </p>
        </div>
      )}
    </ScreenFrame>
  );
}
