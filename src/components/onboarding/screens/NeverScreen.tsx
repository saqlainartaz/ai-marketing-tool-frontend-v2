"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { Chip } from "@/components/ui/chip";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export const NEVER_OPTIONS = [
  "Nothing salesy",
  "No personal stories",
  "No politics",
  "Don't make big claims",
] as const;

export function NeverScreen({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { client, answers, setAnswer } = useOnboarding();

  function toggle(option: string) {
    const has = answers.neverDo.includes(option);
    setAnswer(
      "neverDo",
      has
        ? answers.neverDo.filter((o) => o !== option)
        : [...answers.neverDo, option],
    );
  }

  return (
    <ScreenFrame
      step="never"
      eyebrow="Question 4 of 4"
      title="What should we never do?"
      sub="Most owners know what they don't want long before they know what they do. Every draft is checked against this list."
      onBack={onBack}
      footer={
        <>
          <ActionButton size="lg" onClick={onNext}>
            Build my plan
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
          <ActionButton variant="quiet" className="mt-2" onClick={onNext}>
            Not sure? We&apos;ll use safe defaults
          </ActionButton>
        </>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {NEVER_OPTIONS.map((option) => (
          <Chip
            key={option}
            selected={answers.neverDo.includes(option)}
            onToggle={() => toggle(option)}
          >
            {option}
          </Chip>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-honey/40 bg-honey-mist p-4">
        <p className="flex items-center gap-2 text-[12px] font-semibold text-honey">
          <ShieldCheck aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {client.lockedReason}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {client.lockedNeverChips.map((chip) => (
            <Chip key={chip} locked>
              {chip}
            </Chip>
          ))}
        </div>
        <p className="mt-2.5 text-[11.5px] text-honey">
          These stay on to protect you — they can&apos;t be switched off.
        </p>
      </div>
    </ScreenFrame>
  );
}
