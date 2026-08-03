"use client";

import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

export function ConfirmScreen({ onNext }: { onNext: () => void }) {
  const { client } = useOnboarding();
  return (
    <ScreenFrame
      step="confirm"
      eyebrow="Welcome"
      title={
        <>
          Hi {client.firstName} — here&apos;s what we already know about your
          business.
        </>
      }
      footer={
        <>
          <ActionButton onClick={onNext}>That&apos;s me →</ActionButton>
          <button
            type="button"
            onClick={onNext}
            className="mt-2.5 w-full cursor-pointer text-center text-xs text-ink-2"
          >
            Something&apos;s off — I&apos;ll fix it as we go
          </button>
        </>
      }
    >
      <ul className="space-y-1 text-[13px] text-ink-2">
        {client.checks.map((c) => (
          <li key={c}>
            <span className="font-bold text-moss">✓</span> {c}
          </li>
        ))}
      </ul>
      <CardShell className="mt-4">
        <ul>
          {client.profileLines.map((line) => (
            <li
              key={line}
              className="flex items-start justify-between gap-3 border-b border-dashed border-line py-2 text-[13px] last:border-0"
            >
              <span>{line}</span>
              <span aria-label="Edit this (available soon)" className="text-xs text-ink-3">
                ✎
              </span>
            </li>
          ))}
        </ul>
      </CardShell>
    </ScreenFrame>
  );
}
