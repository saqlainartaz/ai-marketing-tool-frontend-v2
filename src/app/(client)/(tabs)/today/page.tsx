"use client";

import Link from "next/link";
import { ArrowRight, MessageSquarePlus, TrendingUp } from "lucide-react";
import { CardStack } from "@/components/cards/CardStack";
import { GoalLine } from "@/components/goal/GoalLine";
import { CardShell } from "@/components/ui/card-shell";
import { DialPill } from "@/components/ui/dial-pill";
import { SectionLabel } from "@/components/ui/section-label";
import { WorkSpine, type SpineItem } from "@/components/ui/work-spine";
import { useClientId } from "@/components/auth/ClientSession";
import { QuietLink } from "@/components/ui/quiet-link";
import { getFixtureClient, type FixtureDraft } from "@/lib/fixtures/clients";
import { useContentItems, type ContentItem } from "@/lib/store/content";
import { useWorkMode } from "@/lib/store/settings";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

const DATE_FMT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "short",
  day: "numeric",
};

/** Short human label for the spine, from the object's own words. */
function spineLabel(item: FixtureDraft): string {
  if (item.pillar) return item.pillar;
  return item.body.split(/[.—]/)[0].slice(0, 34).trim() + "…";
}

export default function TodayPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const items = useContentItems(clientId);
  const workMode = useWorkMode(clientId);

  const pendingQuestions = client.questionCards.filter(
    (qc) => !items.some((i) => i.id === `${qc.id}-out`),
  );
  const decided = (i: ContentItem) => i.status !== "ready";
  const readyCount =
    items.filter((i) => !decided(i)).length + pendingQuestions.length;

  /* One ordered list: prepared items first, then the client's own turns.
   * Exactly one entry is "current" — the next decision waiting on them. */
  const queue = [
    ...items.map((item) => ({
      id: item.id,
      label: spineLabel(item),
      settled: decided(item),
    })),
    ...pendingQuestions.map((q) => ({
      id: q.id,
      label: q.prompt,
      settled: false,
    })),
  ];
  const currentIndex = queue.findIndex((q) => !q.settled);
  const spine: SpineItem[] = queue.map((q, i) => ({
    id: q.id,
    label: q.label,
    state: q.settled ? "done" : i === currentIndex ? "current" : "waiting",
  }));
  const done = spine.filter((s) => s.state === "done").length;
  const upNext = spine.filter((s) => s.state === "waiting").slice(0, 2);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header band */}
      <header className="flex items-center justify-between gap-3">
        <p className="t-label">
          {new Date().toLocaleDateString(undefined, DATE_FMT)}
        </p>
        <DialPill mode={workMode} />
      </header>

      <h1 className="t-display mt-5">
        {greeting()}, {client.firstName}.
        <br />
        <span className="text-ink-2">
          {readyCount > 0
            ? `${readyCount} ${readyCount === 1 ? "thing" : "things"} to look at.`
            : "All clear."}
        </span>
      </h1>

      {/* What all of it is for. Sits under the greeting because it frames
       * every decision below, and above the queue because a client who
       * reads nothing else should still know the target and who counts it. */}
      <GoalLine goal={client.goal} outcomes={client.outcomes} />

      <div className="mt-5 lg:hidden">
        <WorkSpine items={spine} />
      </div>

      <div className="mt-6 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_268px] lg:gap-10">
        {/* The decision column */}
        <div className="lg:max-w-[560px]">
          <CardStack clientId={clientId} />

          {/* Next up — the queue made visible so the column never ends in a void */}
          {upNext.length > 0 ? (
            <div className="mt-8 hidden lg:block">
              <SectionLabel right={`${upNext.length} more`}>
                Next up
              </SectionLabel>
              <ul className="mt-3 space-y-1.5">
                {upNext.map((item, i) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-line bg-card/60 px-3 py-2.5"
                  >
                    <span className="t-meta w-4 shrink-0 text-center">
                      {done + 2 + i}
                    </span>
                    <span className="truncate t-ui text-ink-2">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* Desk rail — the week, the result, the plan. Data, not paragraphs. */}
        <aside className="mt-8 space-y-6 lg:mt-0" data-testid="context-rail">
          <div className="hidden lg:block">
            <SectionLabel right={`${done} of ${spine.length} done`}>
              This week
            </SectionLabel>
            <div className="mt-3">
              <WorkSpine items={spine} />
            </div>
          </div>

          {/* The result, as a number you can't miss */}
          <div>
            <SectionLabel>Last week</SectionLabel>
            <CardShell className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[34px] leading-none font-semibold tracking-tight">
                  {client.win.value}
                </span>
                <TrendingUp
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-moss"
                />
              </div>
              <p className="mt-1.5 t-sub leading-snug">
                {client.win.unit}
              </p>
              <p className="t-meta mt-0.5">{client.win.note}</p>
            </CardShell>
          </div>

          {/* Pillars as chips — scannable, and a door to the plan */}
          <div>
            <SectionLabel right={`${client.plan.perWeek} a week`}>
              Your pillars
            </SectionLabel>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {client.plan.pillars.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-line bg-card px-2.5 py-1 t-sub text-ink-2"
                >
                  {p}
                </span>
              ))}
            </div>
            <QuietLink href="/plan" className="mt-1">
              See the whole plan
            </QuietLink>
          </div>

          {/* An affordance, not a paragraph */}
          <div className="hidden lg:block">
            <SectionLabel>Anything happening?</SectionLabel>
            <Link
              href="/workspace"
              className="mt-3 flex items-center gap-2.5 rounded-xl border border-dashed border-line bg-card/60 px-3.5 py-3 transition-colors hover:border-ink-3"
            >
              <MessageSquarePlus
                aria-hidden
                className="h-4 w-4 shrink-0 text-ink-3"
              />
              <span className="t-sub text-ink-2">
                Tell us in a sentence
              </span>
              <ArrowRight
                aria-hidden
                className="ml-auto h-3 w-3 shrink-0 text-ink-3"
              />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
