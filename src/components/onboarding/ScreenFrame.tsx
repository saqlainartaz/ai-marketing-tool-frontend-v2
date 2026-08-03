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
 * Shared first-run chrome: progress dots, eyebrow, one big display-font
 * question, content, one action. TurboTax rules: one question per screen,
 * Back always available, progress visible.
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
    <div className="flex min-h-dvh flex-col px-5 pt-6 pb-5">
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
            className={`h-1 w-6 rounded-full ${i <= index ? "bg-clay" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="mt-5 text-[10.5px] tracking-[0.12em] text-ink-3 uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-[27px] leading-[1.15] font-semibold tracking-tight">
        {title}
      </h1>
      {sub ? <p className="mt-2 text-[13px] text-ink-2">{sub}</p> : null}
      <div className="mt-4 flex-1">{children}</div>
      <div className="mt-4">{footer}</div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-3 cursor-pointer text-center text-xs text-ink-2"
        >
          ← Back
        </button>
      ) : null}
    </div>
  );
}
