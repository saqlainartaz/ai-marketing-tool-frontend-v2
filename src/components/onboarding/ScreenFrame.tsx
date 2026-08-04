"use client";

import { ArrowLeft } from "lucide-react";

const STEPS = ["confirm", "goal", "obstacle", "channels", "never", "plan"] as const;
export type OnboardingStep = (typeof STEPS)[number];

const STEP_NAME: Record<OnboardingStep, string> = {
  confirm: "Your business",
  goal: "Your goal",
  obstacle: "What's in the way",
  channels: "Where you show up",
  never: "What we never do",
  plan: "Your plan",
};

type ScreenFrameProps = {
  step: OnboardingStep;
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  children: React.ReactNode;
  /** The one commitment (+ optional escape under it). */
  footer: React.ReactNode;
  onBack?: () => void;
};

/**
 * First-run chrome. Phone: a focused single column, question anchored at
 * the top, answers filling the middle, commitment at the thumb. Desktop:
 * a centered two-column brief — the question carries the left, the answers
 * the right, with the step rail above. One question per screen, Back
 * always available.
 */
export function ScreenFrame({
  step,
  eyebrow,
  title,
  sub,
  children,
  footer,
  onBack,
}: ScreenFrameProps) {
  const index = STEPS.indexOf(step);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-6 lg:max-w-4xl lg:justify-center lg:px-10 lg:pt-0 lg:pb-16">
      {/* Step rail */}
      <div
        className="flex items-center gap-2"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={`Step ${index + 1} of ${STEPS.length}: ${STEP_NAME[step]}`}
      >
        <span className="t-meta shrink-0">
          {String(index + 1).padStart(2, "0")}/{STEPS.length}
        </span>
        <span className="flex flex-1 gap-1">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-0.5 flex-1 rounded-full ${
                i < index ? "bg-clay" : i === index ? "bg-clay" : "bg-line"
              } ${i === index ? "opacity-100" : i < index ? "opacity-40" : ""}`}
            />
          ))}
        </span>
        <span className="t-label hidden shrink-0 sm:block">
          {STEP_NAME[step]}
        </span>
      </div>

      <div className="flex flex-1 flex-col lg:mt-14 lg:grid lg:flex-none lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] lg:items-start lg:gap-16">
        {/* The question */}
        <div className="pt-8 lg:pt-0">
          <p className="t-label">{eyebrow}</p>
          <h1 className="t-display mt-3">{title}</h1>
          {sub ? <p className="t-sub mt-3 max-w-sm">{sub}</p> : null}
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="t-meta mt-8 hidden cursor-pointer items-center gap-1.5 hover:text-ink lg:inline-flex"
            >
              <ArrowLeft aria-hidden className="h-3 w-3" />
              Back
            </button>
          ) : null}
        </div>

        {/* The answers */}
        <div className="flex flex-1 flex-col lg:flex-none">
          <div className="mt-7 flex-1 lg:mt-0 lg:flex-none">{children}</div>
          <div className="mt-7 lg:mt-8">{footer}</div>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="t-meta mt-4 inline-flex cursor-pointer items-center justify-center gap-1.5 lg:hidden"
            >
              <ArrowLeft aria-hidden className="h-3 w-3" />
              Back
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
