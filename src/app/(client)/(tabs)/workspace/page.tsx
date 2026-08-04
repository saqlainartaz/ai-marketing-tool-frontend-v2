"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  FileText,
  Mail,
  MapPin,
  PenLine,
  Star,
  type LucideIcon,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { SectionLabel } from "@/components/ui/section-label";
import { AssemblyMoment } from "@/components/motion/AssemblyMoment";
import { VoiceCard } from "@/components/voice/VoiceCard";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { addItem } from "@/lib/store/content";

const TOOLS: {
  icon: LucideIcon;
  label: string;
  desc: string;
  on: boolean;
}[] = [
  { icon: PenLine, label: "Posts", desc: "Facebook, LinkedIn, GBP", on: true },
  { icon: Star, label: "Review replies", desc: "Google & Facebook", on: true },
  { icon: Mail, label: "Emails", desc: "Follow-ups & updates", on: true },
  { icon: MapPin, label: "GBP updates", desc: "Offers & news", on: true },
  {
    icon: Clapperboard,
    label: "Video scripts",
    desc: "From your episode",
    on: false,
  },
  { icon: FileText, label: "Landing pages", desc: "For campaigns", on: false },
];

/**
 * The door in the back. The tool gallery leads (what we can make, gated
 * by the plan), then the one input whose reply is a card — never a
 * transcript — and the voice profile every draft is checked against.
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
      pillar: "From your note",
      provenance: [{ phrase: input.trim().slice(0, 40), label: "your note, just now" }],
    });
    setPhase("done");
  }

  return (
    <div className="w-full lg:max-w-4xl">
      <p className="t-label">Workspace</p>
      <h1 className="t-display mt-3">The door in the back.</h1>

      <div className="mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <div>
          <SectionLabel>Tell us what&apos;s happening</SectionLabel>
          <CardShell className="mt-3">
            {phase === "idle" ? (
              <>
                <label htmlFor="ws-input" className="text-[13.5px] font-semibold">
                  What&apos;s happening at the business this week?
                </label>
                <p className="t-meta mt-0.5">
                  One sentence is enough. It comes back as a card.
                </p>
                <textarea
                  id="ws-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                  placeholder={`e.g. "We're running a spring gutter discount"`}
                  className="mt-3 w-full resize-none rounded-lg border border-line bg-paper p-3 text-[13.5px] outline-none focus:border-clay"
                />
                <div className="mt-3">
                  <ActionButton onClick={submit} disabled={!input.trim()}>
                    Turn it into a post
                    <ArrowRight className="h-4 w-4" />
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
                stepDelay={520}
                onDone={finish}
              />
            ) : (
              <div className="py-3 text-center" data-testid="ws-done">
                <p className="text-[13.5px] font-semibold">
                  Done — a new card is waiting on Today.
                </p>
                <Link
                  href="/today"
                  className="t-meta mt-1.5 inline-flex items-center gap-1 underline underline-offset-4"
                >
                  Review it now
                  <ArrowRight aria-hidden className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardShell>
        </div>

        <div className="mt-8 lg:mt-0">
          <SectionLabel>How you sound</SectionLabel>
          <p className="t-sub mt-2">
            From your episode and your calls. Every draft is checked
            against this.
          </p>
          <div className="mt-3">
            <VoiceCard client={client} />
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-line pt-8">
        <SectionLabel right={`${TOOLS.filter((t) => t.on).length} active`}>
          What we can make for you
        </SectionLabel>
        <p className="t-sub mt-2 max-w-xl">
          Your plan picks the tools that fit your business — whatever we make
          arrives as a card on Today.
        </p>
        <div
          className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3"
          data-testid="tool-gallery"
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.label}
                className={
                  tool.on
                    ? "surface rounded-xl p-3.5"
                    : "rounded-xl border border-dashed border-line p-3.5"
                }
              >
                <span
                  aria-hidden
                  className={`mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                    tool.on ? "bg-clay text-onact" : "bg-paper text-ink-3"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p
                  className={`text-[13.5px] font-semibold ${tool.on ? "" : "text-ink-2"}`}
                >
                  {tool.label}
                </p>
                <p className="t-meta mt-0.5">{tool.desc}</p>
                {!tool.on ? (
                  <p className="t-meta mt-1.5 text-ink-3">
                    joins when your plan calls for it
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
