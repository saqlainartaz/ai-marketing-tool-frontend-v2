"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { DialPill } from "@/components/ui/dial-pill";
import { SectionLabel } from "@/components/ui/section-label";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useClientId } from "@/components/auth/ClientSession";
import { QuietLink } from "@/components/ui/quiet-link";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { setWorkMode, useWorkMode } from "@/lib/store/settings";

export default function SettingsPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const workMode = useWorkMode(clientId);

  return (
    <div className="w-full lg:max-w-2xl">
      <p className="t-label">Settings</p>
      <h1 className="t-display mt-3">How we work together.</h1>

      <div className="mt-8 space-y-8">
        <div>
          <SectionLabel>How much should we handle?</SectionLabel>
          <p className="t-sub mt-2">
            Change it anytime. Whatever you pick, nothing goes public without
            your yes.
          </p>
          <div className="mt-3">
            <DialPill mode={workMode} onChange={(m) => setWorkMode(clientId, m)} />
          </div>
        </div>

        <div>
          <SectionLabel>Your business</SectionLabel>
          <CardShell className="mt-3">
            <p className="text-[13px] leading-relaxed text-ink-2">
              Everything we know about you lives on your profile — one page,
              every line correctable.
            </p>
            <QuietLink href="/profile" className="mt-1.5">
              See what we know about you
            </QuietLink>
          </CardShell>
        </div>

        <div>
          <SectionLabel>Never do</SectionLabel>
          <CardShell className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {client.lockedNeverChips.map((chip) => (
                <Chip key={chip} locked>
                  {chip}
                </Chip>
              ))}
            </div>
            <p className="t-meta mt-3 flex items-center gap-1.5">
              <ShieldCheck aria-hidden className="h-3.5 w-3.5 text-honey" />
              {client.lockedReason} these stay on to protect you.
            </p>
          </CardShell>
        </div>

        <div>
          <SectionLabel>Appearance</SectionLabel>
          <div className="mt-3 max-w-xs">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
