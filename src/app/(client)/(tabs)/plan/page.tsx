"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Target } from "lucide-react";
import {
  ChannelCard,
  PillarBar,
  RhythmStrip,
} from "@/components/plan/plan-parts";
import { SectionLabel } from "@/components/ui/section-label";
import { useClientId } from "@/components/auth/ClientSession";
import { QuietLink } from "@/components/ui/quiet-link";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { useContentItems } from "@/lib/store/content";
import { getStoredAnswers } from "@/lib/store/answers";
import { cn } from "@/lib/utils";

/**
 * The living plan. Not a printed strategy: the channels show what they've
 * produced, the pillars carry the work made from them, and the rhythm is
 * a picture of the week. Everything on this page is computed from what
 * actually happened.
 */
export default function PlanPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const items = useContentItems(clientId);
  const [whyOpen, setWhyOpen] = useState(false);

  const goal =
    typeof window !== "undefined" ? getStoredAnswers().goal : undefined;

  const made = items.filter((i) => i.status !== "skipped");
  const countFor = (pillar: string) =>
    made.filter((i) => i.pillar === pillar).length;
  const pillarTotal = client.plan.pillars.reduce(
    (sum, p) => sum + countFor(p),
    0,
  );

  return (
    <div className="w-full lg:max-w-3xl">
      <p className="t-label">Your plan</p>
      <h1 className="t-display mt-3">What we&apos;re doing, and why.</h1>

      {/* The goal this whole plan serves */}
      <div className="surface mt-6 flex items-start gap-3 rounded-xl p-4">
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clay text-onact"
        >
          <Target className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="t-label">Everything here serves one goal</p>
          <p className="mt-1 t-body font-semibold">
            {goal ?? "More calls & booked jobs"}
          </p>
        </div>
      </div>

      {/* Channels */}
      <div className="mt-8">
        <SectionLabel right={`${client.plan.channels.length} channels`}>
          Where you show up
        </SectionLabel>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {client.plan.channels.map((channel) => (
            <ChannelCard
              key={channel.platform}
              channel={channel}
              count={made.filter((i) => i.platform === channel.platform).length}
            />
          ))}
        </div>
      </div>

      {/* Pillars with live counts */}
      <div className="mt-8">
        <SectionLabel right={`${made.length} made`}>
          What you talk about
        </SectionLabel>
        <div className="surface mt-3 divide-y divide-line rounded-xl px-4 py-1">
          {client.plan.pillars.map((pillar) => (
            <PillarBar
              key={pillar}
              pillar={pillar}
              count={countFor(pillar)}
              total={pillarTotal}
            />
          ))}
        </div>
      </div>

      {/* Rhythm */}
      <div className="mt-8">
        <SectionLabel>Your rhythm</SectionLabel>
        <div className="surface mt-3 rounded-xl p-4">
          <RhythmStrip
            days={client.plan.days}
            perWeek={client.plan.perWeek}
            effort={client.plan.effort}
          />
        </div>
      </div>

      {/* Why — quiet until asked */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setWhyOpen(!whyOpen)}
          aria-expanded={whyOpen}
          className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-left"
        >
          <span className="t-ui font-semibold">
            Why this plan, in plain words
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "ml-auto h-4 w-4 shrink-0 text-ink-3 transition-transform",
              whyOpen && "rotate-180",
            )}
          />
        </button>
        {whyOpen ? (
          <p className="mt-2 rounded-xl border border-line bg-paper px-4 py-3 t-ui leading-relaxed text-ink-2">
            {client.plan.why}
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4">
        <QuietLink href="/settings">Change your goal</QuietLink>
        <QuietLink href="/today">This week&apos;s work</QuietLink>
        <span className="t-meta ml-auto">
          Built from your episode and your answers
        </span>
      </div>
    </div>
  );
}
