"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlanDocument } from "@/components/plan/PlanDocument";
import { SectionLabel } from "@/components/ui/section-label";
import { CardShell } from "@/components/ui/card-shell";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";

/** The living plan — the same document the client was handed on day one. */
export default function PlanPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);

  return (
    <div className="w-full lg:max-w-3xl">
      <p className="t-label">Your plan</p>
      <h1 className="t-display mt-3">What we&apos;re doing, and why.</h1>

      <div className="mt-7 lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start lg:gap-8">
        <PlanDocument client={client} />

        <aside className="mt-6 space-y-5 lg:mt-0">
          <div>
            <SectionLabel>Changing course</SectionLabel>
            <CardShell quiet className="mt-3">
              <p className="text-[12.5px] leading-relaxed text-ink-2">
                Your goal changes, the plan re-adjusts — and we tell you what
                changed and why.
              </p>
              <Link
                href="/settings"
                className="t-meta mt-2 inline-flex items-center gap-1 underline underline-offset-4"
              >
                Change it in Settings
                <ArrowRight aria-hidden className="h-3 w-3" />
              </Link>
            </CardShell>
          </div>
          <div>
            <SectionLabel>This week</SectionLabel>
            <CardShell quiet className="mt-3">
              <p className="text-[12.5px] leading-relaxed text-ink-2">
                The plan turns into cards on Today. Nothing here needs
                managing.
              </p>
              <Link
                href="/today"
                className="t-meta mt-2 inline-flex items-center gap-1 underline underline-offset-4"
              >
                Go to Today
                <ArrowRight aria-hidden className="h-3 w-3" />
              </Link>
            </CardShell>
          </div>
        </aside>
      </div>
    </div>
  );
}
