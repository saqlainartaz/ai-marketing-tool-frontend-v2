"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  FileText,
  Mail,
  MapPin,
  PenLine,
  Star,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { SectionLabel } from "@/components/ui/section-label";
import { AssemblyMoment } from "@/components/motion/AssemblyMoment";
import { VoiceCard } from "@/components/voice/VoiceCard";
import { IdeaCard } from "@/components/cards/IdeaCard";
import { useClientId } from "@/components/auth/ClientSession";
import { QuietLink } from "@/components/ui/quiet-link";
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
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Validate on submit, not on keystroke, and never pre-disable the
   * button: a greyed-out control states no reason, so the user is left
   * guessing what it wants (NN/g). An enabled button that explains the
   * problem in place is the cheaper interaction. */
  function submit() {
    if (input.trim().length < 3) {
      setError("Tell us what happened, in a few words");
      inputRef.current?.focus();
      return;
    }
    setError(null);
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
      {/* A page heading has one job: say what the page is for. "The door
       * in the back" was a metaphor only we could decode. */}
      <h1 className="t-display mt-3">Ask for anything.</h1>
      <p className="t-sub mt-3 max-w-xl">
        Tell us what&apos;s going on and we&apos;ll write it. Everything we
        make is checked against how you sound.
      </p>

      <div className="mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <div>
          <SectionLabel>Tell us what&apos;s happening</SectionLabel>
          <CardShell className="mt-3">
            {phase === "idle" ? (
              <>
                <label htmlFor="ws-input" className="t-ui font-semibold">
                  What&apos;s happening at the business this week?
                </label>
                {/* The example lives in the hint, not the placeholder — a
                 * placeholder disappears the moment you type, isn't
                 * reliably announced, and rarely passes contrast. */}
                <p id="ws-hint" className="t-sub mt-1">
                  One sentence is enough — for example, we&apos;re running a
                  spring gutter discount
                </p>
                {error ? (
                  <p
                    id="ws-error"
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 t-sub font-medium text-honey"
                  >
                    <TriangleAlert aria-hidden className="h-3.5 w-3.5 shrink-0" />
                    {error}
                  </p>
                ) : null}
                <textarea
                  id="ws-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                  aria-describedby={error ? "ws-hint ws-error" : "ws-hint"}
                  aria-invalid={error ? true : undefined}
                  className={`t-body mt-3 w-full resize-none rounded-lg border bg-paper p-3 focus:border-clay ${
                    error ? "border-honey" : "border-line"
                  }`}
                />
                <div className="mt-3">
                  <ActionButton onClick={submit}>
                    Write my post
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
                <p className="t-ui font-semibold">
                  Your post is drafted.
                </p>
                <p className="t-meta mt-1">
                  It&apos;s waiting on Today. Nothing goes out until you say so.
                </p>
                <QuietLink href="/today" className="mt-1">
                  Review post
                </QuietLink>
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
        <SectionLabel>Give me ideas</SectionLabel>
        <p className="t-sub mt-2 max-w-xl">
          Things worth saying, mined from your episode, your calls and your
          reviews. Pick one and we write it.
        </p>
        <div className="mt-4 lg:max-w-2xl">
          <IdeaCard clientId={clientId} />
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
        {/* These are capabilities, not objects. They used to wear the
            raised `surface` treatment — which in this system means "a
            prepared thing you can act on" — while having no handler at
            all. Six cards that look pressable and ignore you is worse
            than six that don't ask. Flat, informational, and the on/off
            difference is stated in words rather than only in styling. */}
        <ul
          className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3"
          data-testid="tool-gallery"
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <li
                key={tool.label}
                className={`rounded-xl border p-3.5 ${
                  tool.on
                    ? "border-line bg-card"
                    : "border-dashed border-line bg-transparent"
                }`}
              >
                <span
                  aria-hidden
                  className={`mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                    tool.on ? "bg-clay-mist text-clay" : "bg-paper text-ink-3"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p className={`t-ui ${tool.on ? "" : "text-ink-2"}`}>
                  {tool.label}
                </p>
                <p className="t-meta mt-0.5">{tool.desc}</p>
                <p className="t-meta mt-1.5">
                  {tool.on ? "in your plan" : "joins when your plan calls for it"}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}
