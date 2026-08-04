"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { CardStack } from "@/components/cards/CardStack";
import { CardShell } from "@/components/ui/card-shell";
import { DialPill } from "@/components/ui/dial-pill";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { useContentItems } from "@/lib/store/content";
import { useWorkMode } from "@/lib/store/settings";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

export default function TodayPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const items = useContentItems(clientId);
  const workMode = useWorkMode(clientId);

  const pendingQuestions = client.questionCards.filter(
    (qc) => !items.some((i) => i.id === `${qc.id}-out`),
  ).length;
  const readyCount =
    items.filter((i) => i.status === "ready").length + pendingQuestions;
  const total = items.length + pendingQuestions;
  const done = total - readyCount;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 lg:hidden">
        <span className="font-display text-[13px] font-semibold">
          {client.businessName}
        </span>
        <DialPill mode={workMode} className="shrink" />
      </header>

      <div className="flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        {/* Main column */}
        <div className="lg:max-w-lg">
          <h1 className="mt-6 font-display text-[32px] leading-[1.1] font-semibold tracking-tight lg:mt-0 lg:text-[40px]">
            {greeting()}, {client.firstName}.
            <br />
            {readyCount > 0 ? `${readyCount} ready.` : "All clear."}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-2 lg:hidden">
            <TrendingUp aria-hidden className="h-3.5 w-3.5 shrink-0 text-moss" />
            {client.winLine}
          </p>
          <div className="mt-5">
            <CardStack clientId={clientId} />
          </div>
        </div>

        {/* Desktop context rail */}
        <aside
          className="hidden space-y-3 lg:block"
          data-testid="context-rail"
        >
          <CardShell>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-moss uppercase">
              <TrendingUp aria-hidden className="h-3 w-3" />
              Last week
            </p>
            <p className="mt-1 text-[13px]">{client.winLine}</p>
          </CardShell>
          <CardShell>
            <p className="text-[10px] font-semibold tracking-widest text-ink-3 uppercase">
              This week
            </p>
            <p className="mt-1 text-[13px]">
              <b>
                {done} of {total}
              </b>{" "}
              handled
            </p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${i < done ? "bg-moss" : "bg-line"}`}
                />
              ))}
            </div>
          </CardShell>
          <CardShell>
            <p className="text-[10px] font-semibold tracking-widest text-ink-3 uppercase">
              Your pillars
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
              {client.plan.what}
            </p>
            <Link
              href="/plan"
              className="mt-2 inline-block text-[11px] text-clay-deep underline"
            >
              See the whole plan →
            </Link>
          </CardShell>
          <CardShell>
            <p className="text-[12px] text-ink-2">
              Something happening this week we should know about?
            </p>
            <Link
              href="/workspace"
              className="mt-1.5 inline-block text-[11px] font-semibold text-clay-deep underline"
            >
              Tell us — it becomes a card →
            </Link>
          </CardShell>
        </aside>
      </div>
    </div>
  );
}
