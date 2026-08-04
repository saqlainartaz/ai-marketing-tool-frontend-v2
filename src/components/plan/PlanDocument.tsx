"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CalendarClock, HelpCircle, MapPin, MessageSquareText } from "lucide-react";
import type { FixtureClient } from "@/lib/fixtures/clients";

gsap.registerPlugin(useGSAP);

const SECTIONS = [
  { key: "where", n: "01", label: "Where to show up", icon: MapPin },
  { key: "what", n: "02", label: "What to talk about", icon: MessageSquareText },
  { key: "rhythm", n: "03", label: "Your rhythm", icon: CalendarClock },
  { key: "why", n: "04", label: "Why this plan", icon: HelpCircle },
] as const;

/**
 * The plan as a deliverable, not three grey strips: a titled document
 * with numbered sections, the client's own pillars as chips, and a
 * built-from line. Betterment's lesson — a recommendation is trusted in
 * proportion to how much it looks like something a professional made.
 * `animate` runs the staggered assembly (the demo's money-shot).
 */
export function PlanDocument({
  client,
  animate,
  hideWhy,
}: {
  client: FixtureClient;
  animate?: boolean;
  hideWhy?: boolean;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!animate) return;
      gsap.from("[data-doc-head]", {
        opacity: 0,
        y: -8,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.from("[data-doc-row]", {
        opacity: 0,
        y: 14,
        duration: 0.45,
        stagger: 0.09,
        delay: 0.12,
        ease: "power3.out",
      });
      gsap.from("[data-doc-foot]", {
        opacity: 0,
        duration: 0.5,
        delay: 0.55,
      });
    },
    { scope: root, dependencies: [animate] },
  );

  const pillars = client.plan.what.split("·").map((p) => p.trim());
  const rows = SECTIONS.filter((s) => !(hideWhy && s.key === "why"));

  return (
    <article
      ref={root}
      data-testid="plan-document"
      className="surface overflow-hidden rounded-xl"
    >
      <header
        data-doc-head
        className="flex items-baseline gap-2 border-b border-line bg-paper px-4 py-2.5 sm:px-5"
      >
        <span className="t-label truncate">{client.businessName}</span>
        <span className="t-label ml-auto shrink-0 text-ink-2">
          marketing plan
        </span>
      </header>

      <div className="divide-y divide-line">
        {rows.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.key}
              data-doc-row
              className="flex gap-3 px-4 py-4 sm:gap-4 sm:px-5"
            >
              <span className="t-meta w-6 shrink-0 pt-0.5">{section.n}</span>
              <div className="min-w-0 flex-1">
                <h3 className="flex items-center gap-1.5 text-[13.5px] font-semibold">
                  <Icon aria-hidden className="h-3.5 w-3.5 text-ink-3" />
                  {section.label}
                </h3>
                {section.key === "what" ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pillars.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-line bg-paper px-2.5 py-1 text-[12px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                    {section.key === "where"
                      ? client.plan.where
                      : section.key === "rhythm"
                        ? client.plan.rhythm
                        : client.plan.why}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <footer
        data-doc-foot
        className="border-t border-line bg-paper px-4 py-2.5 sm:px-5"
      >
        <p className="t-meta">
          Built from your episode and your answers — nothing generic.
        </p>
      </footer>
    </article>
  );
}
