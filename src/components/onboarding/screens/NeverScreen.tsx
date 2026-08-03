"use client";

import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
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
      sub="Most owners know what they don't want. Tap anything that applies."
      onBack={onBack}
      footer={
        <>
          <ActionButton onClick={onNext}>Build my plan →</ActionButton>
          <button
            type="button"
            onClick={onNext}
            className="mt-2.5 w-full cursor-pointer text-center text-xs text-ink-2"
          >
            Not sure? We&apos;ll use safe defaults
          </button>
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
      <CardShell className="mt-4">
        <p className="text-xs text-ink-2">{client.lockedReason}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {client.lockedNeverChips.map((chip) => (
            <Chip key={chip} locked>
              {chip}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-2">
          These stay on to protect you.
        </p>
      </CardShell>
    </ScreenFrame>
  );
}
