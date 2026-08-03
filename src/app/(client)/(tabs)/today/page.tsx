"use client";

import { CardStack } from "@/components/cards/CardStack";
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
  const readyCount =
    items.filter((i) => i.status === "ready").length +
    client.questionCards.filter(
      (qc) => !items.some((i) => i.id === `${qc.id}-out`),
    ).length;

  return (
    <>
      <header className="flex items-center justify-between">
        <span className="font-display text-[13px] font-semibold lowercase">
          {client.businessName.split(" ")[0]} ⌂
        </span>
        <DialPill mode={workMode} />
      </header>

      <h1 className="mt-6 font-display text-[32px] leading-[1.1] font-semibold tracking-tight">
        {greeting()}, {client.firstName}.
        <br />
        {readyCount > 0 ? `${readyCount} ready.` : "All clear."}
      </h1>
      <p className="mt-2 text-[11.5px] text-moss">📈 {client.winLine}</p>

      <div className="mt-5 flex-1">
        <CardStack clientId={clientId} />
      </div>
    </>
  );
}
