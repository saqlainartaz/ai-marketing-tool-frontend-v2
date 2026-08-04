"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { getStoredAnswers } from "@/lib/store/answers";
import type { OnboardingAnswers } from "@/components/onboarding/OnboardingProvider";

/**
 * The client's legible memory: everything the system believes about them,
 * on one page, every line correctable. This IS the trust story — every
 * draft is built from what's on this screen, and nothing else.
 */
export default function ProfilePage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});

  useEffect(() => {
    setAnswers(getStoredAnswers());
  }, []);

  const channels = Object.entries(answers.channels ?? {});

  return (
    <div className="w-full lg:max-w-3xl">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-clay-mist font-display text-xl font-bold text-clay-deep"
        >
          {client.avatarInitial}
        </div>
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-tight lg:text-[32px]">
            {client.businessName}
          </h1>
          <p className="text-xs text-ink-2">
            {client.firstName} · what we know about you
          </p>
        </div>
      </div>

      <p className="mt-3 text-[12.5px] text-ink-2">
        Every draft is built from what&apos;s on this page — and nothing else.
        Fix any line and every future draft obeys it.
      </p>

      <div className="mt-5 space-y-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-3 lg:space-y-0">
        <div className="space-y-3">
          <CardShell>
            <p className="text-sm font-semibold">Your business</p>
            <ul className="mt-1">
              {client.profileLines.map((line) => (
                <li
                  key={line}
                  className="flex items-start justify-between gap-3 border-b border-dashed border-line py-2 text-[12.5px] last:border-0"
                >
                  <span>{line}</span>
                  <PenLine
                    aria-label="Edit this (coming soon)"
                    className="h-3.5 w-3.5 shrink-0 text-ink-3"
                  />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10.5px] text-ink-3">Where this came from:</p>
            <ul className="mt-0.5 text-[10.5px] text-ink-3">
              {client.checks.map((c) => (
                <li key={c}>
                  <span className="text-moss">✓</span> {c}
                </li>
              ))}
            </ul>
          </CardShell>

          <CardShell>
            <p className="text-sm font-semibold">What you told us</p>
            <dl className="mt-1 text-[12.5px]">
              <div className="border-b border-dashed border-line py-2">
                <dt className="text-[10.5px] text-ink-3">Your goal</dt>
                <dd>{answers.goal ?? "Set during onboarding"}</dd>
              </div>
              <div className="border-b border-dashed border-line py-2">
                <dt className="text-[10.5px] text-ink-3">Who drives this</dt>
                <dd>{answers.driver ?? "Set during onboarding"}</dd>
              </div>
              <div className="py-2">
                <dt className="text-[10.5px] text-ink-3">In the way</dt>
                <dd>{answers.obstacle ?? "You let us decide"}</dd>
              </div>
            </dl>
          </CardShell>
        </div>

        <div className="space-y-3">
          <CardShell>
            <p className="text-sm font-semibold">Your channels</p>
            {channels.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {channels.map(([name, state]) => (
                  <Chip key={name} selected={state === "now"}>
                    {name}
                    {state === "want" ? " · want to try" : ""}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-[12.5px] text-ink-2">
                From your onboarding — revisit anytime.
              </p>
            )}
          </CardShell>

          <CardShell>
            <p className="text-sm font-semibold">Never do</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(answers.neverDo ?? []).map((chip) => (
                <Chip key={chip} selected>
                  {chip}
                </Chip>
              ))}
              {client.lockedNeverChips.map((chip) => (
                <Chip key={chip} locked>
                  {chip}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-[10.5px] text-ink-3">
              {client.lockedReason} locked to protect you.
            </p>
          </CardShell>

          <CardShell>
            <p className="text-sm font-semibold">How you sound</p>
            <p className="mt-1 text-[12.5px] text-ink-2">
              {client.voice.summary}
            </p>
            <Link
              href="/workspace"
              className="mt-2 inline-block text-[11px] text-clay-deep underline"
            >
              See the full voice profile →
            </Link>
          </CardShell>
        </div>
      </div>
    </div>
  );
}
