"use client";

import { ArrowRight, Check, PenLine } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";

/**
 * The trust moment: they arrive and we already did the work. Presented as
 * a dossier — a labeled document with sources at the foot — because a
 * document reads as prepared, where a list of grey rows reads as a form.
 */
export function ConfirmScreen({ onNext }: { onNext: () => void }) {
  const { client } = useOnboarding();

  return (
    <ScreenFrame
      step="confirm"
      eyebrow="Welcome"
      title={`Hi ${client.firstName} — here's what we already know.`}
      sub="Read it once. If a line is wrong, we fix it and every future draft obeys the correction."
      footer={
        <>
          <ActionButton size="lg" onClick={onNext}>
            That&apos;s me
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
          <ActionButton variant="quiet" className="mt-2" onClick={onNext}>
            Something&apos;s off — I&apos;ll fix it as we go
          </ActionButton>
        </>
      }
    >
      <article className="surface overflow-hidden rounded-xl">
        <header className="flex items-baseline gap-2 border-b border-line bg-paper px-4 py-2">
          <span className="t-label truncate">{client.businessName}</span>
          <span className="t-label ml-auto shrink-0 text-ink-2">
            prepared for you
          </span>
        </header>
        <ul className="px-4">
          {client.profileLines.map((line) => (
            <li
              key={line}
              className="flex items-start justify-between gap-3 border-b border-line py-3 text-[14px] leading-snug last:border-0"
            >
              <span>{line}</span>
              <PenLine
                aria-label="Edit this (coming soon)"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3"
              />
            </li>
          ))}
        </ul>
        <footer className="border-t border-line bg-paper px-4 py-3">
          <p className="t-label mb-1.5">Where this came from</p>
          <ul className="space-y-1">
            {client.checks.map((c) => (
              <li key={c} className="flex items-center gap-1.5 text-[12px]">
                <Check
                  aria-hidden
                  className="h-3 w-3 shrink-0 text-moss"
                  strokeWidth={3}
                />
                {c}
              </li>
            ))}
          </ul>
        </footer>
      </article>
    </ScreenFrame>
  );
}
