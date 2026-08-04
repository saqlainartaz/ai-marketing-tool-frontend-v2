"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, PenLine } from "lucide-react";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { SectionLabel } from "@/components/ui/section-label";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { getStoredAnswers } from "@/lib/store/answers";
import type { OnboardingAnswers } from "@/components/onboarding/OnboardingProvider";

/**
 * The client's legible memory: everything the system believes, on one
 * page, every line correctable. Unanswered rows are designed states with
 * a way to fix them — never a dead "set during onboarding".
 */
export default function ProfilePage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});

  useEffect(() => {
    setAnswers(getStoredAnswers());
  }, []);

  const channels = Object.entries(answers.channels ?? {});

  function Row({
    label,
    value,
    fixHref,
  }: {
    label: string;
    value?: string | null;
    fixHref: string;
  }) {
    return (
      <div className="border-b border-line py-2.5 last:border-0">
        <p className="t-label">{label}</p>
        {value ? (
          <p className="mt-0.5 text-[13.5px]">{value}</p>
        ) : (
          <Link
            href={fixHref}
            className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-ink-2 underline underline-offset-4"
          >
            Not set yet — takes 10 seconds
            <ArrowRight aria-hidden className="h-3 w-3" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-3xl">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-clay font-display text-xl font-bold text-onact"
        >
          {client.avatarInitial}
        </span>
        <div className="min-w-0">
          <p className="t-label">What we know about you</p>
          <h1 className="t-title mt-1 truncate sm:text-[26px]">
            {client.businessName}
          </h1>
        </div>
      </div>

      <p className="t-sub mt-4 max-w-xl">
        Every draft is built from what&apos;s on this page — and nothing else.
        Fix any line and every future draft obeys it.
      </p>

      <div className="mt-7 space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
        <div className="space-y-6">
          <div>
            <SectionLabel>Your business</SectionLabel>
            <CardShell className="mt-3">
              <ul>
                {client.profileLines.map((line) => (
                  <li
                    key={line}
                    className="flex items-start justify-between gap-3 border-b border-line py-2.5 text-[13.5px] leading-snug last:border-0"
                  >
                    <span>{line}</span>
                    <PenLine
                      aria-label="Edit this (coming soon)"
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3"
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-line pt-3">
                <p className="t-label mb-1.5">Where this came from</p>
                <ul className="space-y-1">
                  {client.checks.map((c) => (
                    <li
                      key={c}
                      className="flex items-center gap-1.5 text-[12px] text-ink-2"
                    >
                      <Check
                        aria-hidden
                        className="h-3 w-3 shrink-0 text-moss"
                        strokeWidth={3}
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </CardShell>
          </div>

          <div>
            <SectionLabel>What you told us</SectionLabel>
            <CardShell className="mt-3">
              <Row
                label="Your goal"
                value={answers.goal}
                fixHref="/onboarding/goal"
              />
              <Row
                label="Who drives this"
                value={answers.driver}
                fixHref="/onboarding/goal"
              />
              <Row
                label="What's been in the way"
                value={answers.obstacle ?? "You let us decide"}
                fixHref="/onboarding/obstacle"
              />
            </CardShell>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <SectionLabel>Your channels</SectionLabel>
            <CardShell className="mt-3">
              {channels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {channels.map(([name, state]) => (
                    <Chip key={name} selected={state === "now"}>
                      {name}
                      {state === "want" ? " · want to try" : ""}
                    </Chip>
                  ))}
                </div>
              ) : (
                <Link
                  href="/onboarding/channels"
                  className="inline-flex items-center gap-1 text-[13px] text-ink-2 underline underline-offset-4"
                >
                  Not set yet — takes 10 seconds
                  <ArrowRight aria-hidden className="h-3 w-3" />
                </Link>
              )}
            </CardShell>
          </div>

          <div>
            <SectionLabel>Never do</SectionLabel>
            <CardShell className="mt-3">
              <div className="flex flex-wrap gap-1.5">
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
              <p className="t-meta mt-2.5">
                {client.lockedReason} locked to protect you.
              </p>
            </CardShell>
          </div>

          <div>
            <SectionLabel>How you sound</SectionLabel>
            <CardShell className="mt-3">
              <p className="text-[13px] leading-relaxed text-ink-2">
                {client.voice.summary}
              </p>
              <Link
                href="/workspace"
                className="t-meta mt-2.5 inline-flex items-center gap-1 underline underline-offset-4"
              >
                The full voice profile
                <ArrowRight aria-hidden className="h-3 w-3" />
              </Link>
            </CardShell>
          </div>
        </div>
      </div>
    </div>
  );
}
