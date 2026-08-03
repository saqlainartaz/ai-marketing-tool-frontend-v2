"use client";

const STEPS = ["confirm", "goal", "obstacle", "channels", "never", "plan"] as const;
export type OnboardingStep = (typeof STEPS)[number];

type ScreenFrameProps = {
  step: OnboardingStep;
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  children: React.ReactNode;
  /** Footer slot — the one clay action (+ optional ghost line under it). */
  footer: React.ReactNode;
  onBack?: () => void;
};

/**
 * Shared first-run chrome. Mobile: a focused single column. Desktop: a
 * vertically-centered two-column wizard — the question carries the left
 * side in display type, the answers live on the right. One question per
 * screen, Back always available, progress visible (TurboTax rules).
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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-5 lg:max-w-4xl lg:justify-center lg:px-10 lg:pt-0 lg:pb-20">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={`Step ${index + 1} of ${STEPS.length}`}
      >
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1 w-6 rounded-full lg:w-10 ${i <= index ? "bg-clay" : "bg-line"}`}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col lg:mt-12 lg:grid lg:flex-none lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-16">
        {/* Question block */}
        <div>
          <p className="mt-5 text-[10.5px] tracking-[0.12em] text-ink-3 uppercase lg:mt-0">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-[27px] leading-[1.15] font-semibold tracking-tight lg:text-[40px] lg:leading-[1.08]">
            {title}
          </h1>
          {sub ? (
            <p className="mt-2 text-[13px] text-ink-2 lg:mt-4 lg:text-sm">
              {sub}
            </p>
          ) : null}
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mt-6 hidden cursor-pointer text-xs text-ink-2 lg:block"
            >
              ← Back
            </button>
          ) : null}
        </div>

        {/* Answers block */}
        <div className="flex flex-1 flex-col lg:flex-none">
          <div className="mt-4 flex-1 lg:mt-0 lg:flex-none">{children}</div>
          <div className="mt-4 lg:mt-6">{footer}</div>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mt-3 cursor-pointer text-center text-xs text-ink-2 lg:hidden"
            >
              ← Back
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
