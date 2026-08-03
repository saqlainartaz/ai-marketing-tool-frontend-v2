"use client";

import { useEffect, useRef, useState } from "react";

type AssemblyMomentProps = {
  steps: string[];
  onDone: () => void;
  /** ms between step reveals (the honest-labor pacing). */
  stepDelay?: number;
};

/**
 * The plan-assembly beat: the client's own work streams in, step by step,
 * then the plan reveals. We genuinely do this work — showing it is the
 * TurboTax/Perplexity trust pattern.
 *
 * M1A ships the CSS/timer version (works everywhere, respects
 * prefers-reduced-motion by skipping straight to done). T4 layers the GSAP
 * facts-click-together timeline on top without changing this API.
 */
export function AssemblyMoment({
  steps,
  onDone,
  stepDelay = 650,
}: AssemblyMomentProps) {
  const [visible, setVisible] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setVisible(steps.length);
      const t = setTimeout(() => {
        if (!done.current) {
          done.current = true;
          onDone();
        }
      }, 400);
      return () => clearTimeout(t);
    }
    if (visible >= steps.length) {
      const t = setTimeout(() => {
        if (!done.current) {
          done.current = true;
          onDone();
        }
      }, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisible((v) => v + 1), stepDelay);
    return () => clearTimeout(t);
  }, [visible, steps.length, stepDelay, onDone]);

  return (
    <div aria-live="polite" data-testid="assembly">
      {steps.slice(0, visible).map((step, i) => (
        <p
          key={step}
          className="animate-in fade-in slide-in-from-bottom-1 py-1 text-[13px] text-ink-2 duration-300"
          data-step={i}
        >
          <span className="font-bold text-moss">✓</span> {step}
        </p>
      ))}
    </div>
  );
}
