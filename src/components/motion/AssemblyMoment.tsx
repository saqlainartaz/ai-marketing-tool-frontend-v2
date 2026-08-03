"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

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
 * Sequencing is timer-driven (deterministic, testable); GSAP handles only
 * the presentational entrance — each fact drifts in and settles with a
 * spring, and the set pulses together before the reveal. Reduced motion
 * skips straight to the finished state.
 */
export function AssemblyMoment({
  steps,
  onDone,
  stepDelay = 650,
}: AssemblyMomentProps) {
  const [visible, setVisible] = useState(0);
  const done = useRef(false);
  const container = useRef<HTMLDivElement>(null);

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
      }, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setVisible((v) => v + 1), stepDelay);
    return () => clearTimeout(t);
  }, [visible, steps.length, stepDelay, onDone]);

  useGSAP(
    () => {
      if (visible === 0) return;
      // Newest fact drifts in and clicks into place.
      gsap.from(`[data-step="${visible - 1}"]`, {
        opacity: 0,
        y: 14,
        scale: 0.97,
        duration: 0.42,
        ease: "back.out(1.6)",
      });
      // All facts assembled: one quiet pulse together before the reveal.
      if (visible === steps.length) {
        gsap.to("[data-step]", {
          scale: 1.02,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
          stagger: 0.03,
          delay: 0.25,
        });
      }
    },
    { dependencies: [visible], scope: container },
  );

  return (
    <div ref={container} aria-live="polite" data-testid="assembly">
      {steps.slice(0, visible).map((step, i) => (
        <p
          key={step}
          className="py-1 text-[13px] text-ink-2"
          data-step={i}
        >
          <span className="font-bold text-moss">✓</span> {step}
        </p>
      ))}
    </div>
  );
}
