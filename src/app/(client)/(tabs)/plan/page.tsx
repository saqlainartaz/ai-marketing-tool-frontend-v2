"use client";

import Link from "next/link";
import { CardShell } from "@/components/ui/card-shell";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";

/** The living plan — S6's reveal as a permanent page. Always answers "why". */
export default function PlanPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);

  return (
    <>
      <div className="w-full lg:max-w-3xl">
      <h1 className="font-display text-[26px] font-semibold tracking-tight lg:text-[32px]">
        Your plan
      </h1>
      <p className="mt-1 text-xs text-ink-2">
        Built from your episode and your answers — nothing generic.
      </p>

      <div className="mt-4 space-y-2.5 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        <CardShell>
          <p className="text-sm font-semibold">Where to show up</p>
          <p className="mt-1 text-[12.5px] text-ink-2">{client.plan.where}</p>
        </CardShell>
        <CardShell>
          <p className="text-sm font-semibold">What to talk about</p>
          <p className="mt-1 text-[12.5px] text-ink-2">{client.plan.what}</p>
        </CardShell>
        <CardShell>
          <p className="text-sm font-semibold">Your rhythm</p>
          <p className="mt-1 text-[12.5px] text-ink-2">{client.plan.rhythm}</p>
        </CardShell>
        <CardShell>
          <p className="text-sm font-semibold">Why this plan</p>
          <p className="mt-1 text-[12.5px] text-ink-2">{client.plan.why}</p>
        </CardShell>
      </div>

      <p className="mt-4 text-center text-[11px] text-ink-3">
        Your goal changes? The plan re-adjusts —{" "}
        <Link href="/settings" className="underline">
          change it in Settings
        </Link>
        .
      </p>
      </div>
    </>
  );
}
