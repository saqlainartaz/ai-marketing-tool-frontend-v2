"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Check, Loader2 } from "lucide-react";

gsap.registerPlugin(useGSAP);

type AssemblyMomentProps = {
  steps: string[];
  onDone: () => void;
  /** ms between step reveals (the honest-labor pacing). */
  stepDelay?: number;
};

/**
 * We genuinely do this work; showing it is what converts waiting into
 * trust (TurboTax's labor illusion, Perplexity's visible plan). Steps
 * complete one by one with the current one live — never a spinner alone.
 * Reduced motion skips straight to the finished state.
 */
export function AssemblyMoment({
  steps,
  onDone,
  stepDelay = 620,
}: AssemblyMomentProps) {
  const [visible, setVisible] = useState(0);
  const done = useRef(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  useGSAP(
    () => {
      if (visible === 0) return;
      gsap.from(`[data-step="${visible - 1}"]`, {
        opacity: 0,
        x: -8,
        duration: 0.38,
        ease: "power2.out",
      });
    },
    { dependencies: [visible], scope: container },
  );

  return (
    <div
      ref={container}
      aria-live="polite"
      data-testid="assembly"
      className="surface rounded-xl px-4 py-4"
    >
      <ol className="space-y-2.5">
        {steps.map((step, i) => {
          const complete = i < visible - 1 || visible >= steps.length;
          const live = i === visible - 1 && visible < steps.length;
          if (i >= visible) return null;
          return (
            <li
              key={step}
              data-step={i}
              className="flex items-center gap-2.5 t-ui"
            >
              <span
                aria-hidden
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  complete ? "bg-moss-mist text-moss" : "text-ink-3"
                }`}
              >
                {complete ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
              </span>
              <span className={live ? "text-ink" : "text-ink-2"}>{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
