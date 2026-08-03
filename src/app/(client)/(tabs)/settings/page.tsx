"use client";

import Link from "next/link";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { DialPill } from "@/components/ui/dial-pill";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { setWorkMode, useWorkMode } from "@/lib/store/settings";

export default function SettingsPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const workMode = useWorkMode(clientId);

  return (
    <div className="w-full lg:max-w-2xl">
      <Link href="/today" className="text-xs text-ink-2 lg:hidden">
        ← Back to Today
      </Link>
      <h1 className="mt-3 font-display text-[26px] font-semibold tracking-tight lg:mt-0 lg:text-[32px]">
        Settings
      </h1>

      <div className="mt-4 space-y-3">
        <CardShell>
          <p className="text-sm font-semibold">How much should we handle?</p>
          <p className="mt-1 mb-2 text-xs text-ink-2">
            Change it anytime. Whatever you pick, nothing goes public without
            your yes.
          </p>
          <DialPill
            mode={workMode}
            onChange={(m) => setWorkMode(clientId, m)}
          />
        </CardShell>

        <CardShell>
          <p className="text-sm font-semibold">Your business</p>
          <ul className="mt-1">
            {client.profileLines.map((line) => (
              <li
                key={line}
                className="border-b border-dashed border-line py-2 text-[12.5px] text-ink-2 last:border-0"
              >
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10.5px] text-ink-3">
            Something changed? Tell us — editing lands in M2.
          </p>
        </CardShell>

        <CardShell>
          <p className="text-sm font-semibold">Never do</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {client.lockedNeverChips.map((chip) => (
              <Chip key={chip} locked>
                {chip}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-ink-3">
            {client.lockedReason} these stay on to protect you.
          </p>
        </CardShell>

        <CardShell>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Appearance</p>
            <ThemeSwitcher />
          </div>
        </CardShell>
      </div>
    </div>
  );
}
