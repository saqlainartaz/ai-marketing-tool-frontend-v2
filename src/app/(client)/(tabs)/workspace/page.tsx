"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { AssemblyMoment } from "@/components/motion/AssemblyMoment";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { addItem } from "@/lib/store/content";

/**
 * The Act-3 door. Chat is a door, not a box: whatever you tell us becomes
 * a card in Today — never a transcript to manage. Below: the legible voice
 * profile ("what we know about how you sound").
 */
export default function WorkspacePage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");

  function submit() {
    if (!input.trim()) return;
    setPhase("working");
  }

  function finish() {
    addItem(clientId, {
      id: `ws-${Date.now()}`,
      platform: client.drafts[0]?.platform ?? "facebook",
      meta: `${client.drafts[0]?.platform === "linkedin" ? "LinkedIn" : "Facebook"} · ready when you are`,
      body: `${input.trim()} — and here's why that matters to the people you serve. (Drafted from what you just told us, in your voice.)`,
      consequence: "review it on Today · your yes sends it",
      pillar: "From your workspace note",
      provenance: [
        {
          phrase: input.trim().slice(0, 40),
          label: "your note, just now",
        },
      ],
    });
    setPhase("done");
  }

  return (
    <div className="w-full lg:grid lg:max-w-4xl lg:grid-cols-2 lg:gap-10">
      <div>
      <Link href="/today" className="text-xs text-ink-2 lg:hidden">
        ← Back to Today
      </Link>
      <h1 className="mt-3 font-display text-[26px] font-semibold tracking-tight lg:mt-0 lg:text-[32px]">
        Workspace
      </h1>
      <p className="mt-1 text-xs text-ink-2">
        Tell us anything — it comes back as a card, not a conversation.
      </p>

      <CardShell className="mt-4">
        {phase === "idle" ? (
          <>
            <label
              htmlFor="ws-input"
              className="text-sm font-semibold"
            >
              What&apos;s happening at the business this week?
            </label>
            <textarea
              id="ws-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder={`e.g. "We're running a spring gutter discount" or "Just finished a big job on Lakeway Ave"`}
              className="mt-2 w-full resize-none rounded-xl border border-line bg-paper p-3 text-[13px] outline-none focus:border-clay"
            />
            <div className="mt-3">
              <ActionButton onClick={submit} disabled={!input.trim()}>
                Turn it into a post →
              </ActionButton>
            </div>
          </>
        ) : phase === "working" ? (
          <AssemblyMoment
            steps={[
              "Reading your note…",
              "Checking how you sound…",
              "Drafting it.",
            ]}
            stepDelay={500}
            onDone={finish}
          />
        ) : (
          <div className="py-2 text-center" data-testid="ws-done">
            <p className="text-sm font-semibold">
              Done — a new card is waiting on Today.
            </p>
            <Link
              href="/today"
              className="mt-2 inline-block text-xs text-clay-deep underline"
            >
              Review it now →
            </Link>
          </div>
        )}
      </CardShell>

      </div>
      <div>
      <h2 className="mt-8 font-display text-lg font-semibold lg:mt-0">
        How you sound
      </h2>
      <p className="mt-1 text-xs text-ink-2">
        What we know about your voice — from your episode and your calls.
        Every draft is checked against this.
      </p>
      <CardShell className="mt-3">
        <p className="text-[12.5px] text-ink-2">{client.voice.summary}</p>
        <p className="mt-3 text-xs font-semibold">Sounds like you</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {client.voice.sounds.map((s) => (
            <Chip key={s} selected>
              “{s}”
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold">We never use</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {client.voice.avoids.map((s) => (
            <Chip key={s} locked>
              {s}
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-[10.5px] text-ink-3">
          Something here wrong? Tell us — corrections land in M2.
        </p>
      </CardShell>
      </div>
    </div>
  );
}
