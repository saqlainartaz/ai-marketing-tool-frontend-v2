"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CalendarClock, MapPin, MessageSquareText } from "lucide-react";
import {
  ChannelCard,
  RhythmStrip,
} from "@/components/plan/plan-parts";
import type { FixtureClient } from "@/lib/fixtures/clients";

gsap.registerPlugin(useGSAP);

/**
 * The plan as a deliverable — the moment the client sees that someone
 * did the thinking. Channels as cards with their reasons, pillars as
 * chips, the rhythm as a picture of the week; assembled with a stagger
 * so it arrives rather than appears.
 */
export function PlanDocument({
  client,
  animate,
}: {
  client: FixtureClient;
  animate?: boolean;
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
        y: 16,
        duration: 0.5,
        stagger: 0.12,
        delay: 0.15,
        ease: "power3.out",
      });
      gsap.from("[data-doc-foot]", {
        opacity: 0,
        duration: 0.5,
        delay: 0.7,
      });
    },
    { scope: root, dependencies: [animate] },
  );

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
        <section data-doc-row className="px-4 py-4 sm:px-5">
          <h3 className="flex items-center gap-1.5 t-ui font-semibold">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-ink-3" />
            Where to show up
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {client.plan.channels.map((channel) => (
              <ChannelCard key={channel.platform} channel={channel} />
            ))}
          </div>
        </section>

        <section data-doc-row className="px-4 py-4 sm:px-5">
          <h3 className="flex items-center gap-1.5 t-ui font-semibold">
            <MessageSquareText aria-hidden className="h-3.5 w-3.5 text-ink-3" />
            What to talk about
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {client.plan.pillars.map((p) => (
              <span
                key={p}
                className="rounded-full border border-line bg-paper px-2.5 py-1 t-sub"
              >
                {p}
              </span>
            ))}
          </div>
        </section>

        <section data-doc-row className="px-4 py-4 sm:px-5">
          <h3 className="flex items-center gap-1.5 t-ui font-semibold">
            <CalendarClock aria-hidden className="h-3.5 w-3.5 text-ink-3" />
            Your rhythm
          </h3>
          <div className="mt-3">
            <RhythmStrip
              days={client.plan.days}
              perWeek={client.plan.perWeek}
              effort={client.plan.effort}
            />
          </div>
        </section>
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
