"use client";

import { PenLine } from "lucide-react";
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
      title={`Hi ${client.firstName} — here's what we already know about your business.`}
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
              <PenLine
                aria-label="Edit this (coming soon)"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3"
              />
            </li>
          ))}
        </ul>
      </CardShell>
    </ScreenFrame>
  );
}
