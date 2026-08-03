"use client";

import { Suspense } from "react";
import { CardStack } from "@/components/cards/CardStack";
import { DialPill } from "@/components/ui/dial-pill";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useFixtureClient } from "@/lib/fixtures/useFixtureClient";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

function TodayInner() {
  const client = useFixtureClient();
  const readyCount = client.cards.length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-5">
      <header className="flex items-center justify-between">
        <span className="font-display text-[13px] font-semibold lowercase">
          {client.businessName.split(" ")[0]} ⌂
        </span>
        <DialPill mode={client.workMode} />
      </header>

      <h1 className="mt-6 font-display text-[32px] leading-[1.1] font-semibold tracking-tight">
        {greeting()}, {client.firstName}.
        <br />
        {readyCount} ready.
      </h1>
      <p className="mt-2 text-[11.5px] text-moss">📈 {client.winLine}</p>

      <div className="mt-5 flex-1">
        <CardStack
          cards={client.cards}
          businessName={client.businessName}
          avatarInitial={client.avatarInitial}
        />
      </div>

      <footer className="mt-6 flex items-center justify-between gap-3">
        <span className="text-[11px] text-ink-3">Open workspace</span>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}

export default function TodayPage() {
  return (
    <Suspense>
      <TodayInner />
    </Suspense>
  );
}
