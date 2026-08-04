"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { OptionCard } from "@/components/ui/option-card";
import { SectionLabel } from "@/components/ui/section-label";
import { ContentPreview } from "@/components/preview/ContentPreview";
import { SourcedBody } from "@/components/preview/SourcedBody";
import { AssemblyMoment } from "@/components/motion/AssemblyMoment";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { addItem, decideItem } from "@/lib/store/content";

type Phase = { step: number } | "generating" | "review";

/**
 * Guided create — C1 (a couple of plain questions, chips first) → C2
 * (visible work) → C3 (review the real thing). The client's answers are
 * the material; we do the writing.
 */
export default function CreatePage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = use(params);
  const router = useRouter();
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const card = client.questionCards.find((c) => c.id === cardId);

  const [phase, setPhase] = useState<Phase>({ step: 0 });
  const [picks, setPicks] = useState<string[]>([]);
  const [body, setBody] = useState<string | null>(null);

  if (!card) {
    router.replace("/today");
    return null;
  }

  const produced = { ...card.produces, id: `${card.id}-out` };
  const currentBody = body ?? produced.body;

  function approve() {
    addItem(clientId, { ...produced, body: currentBody });
    decideItem(clientId, produced.id, "approved");
    router.push("/today");
  }

  function keepForLater() {
    addItem(clientId, { ...produced, body: currentBody });
    router.push("/today");
  }

  // C1 — questions, one at a time
  if (typeof phase === "object") {
    const q = card.questions[phase.step];
    const isLast = phase.step === card.questions.length - 1;
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-7 pb-6 lg:max-w-xl lg:justify-center lg:pb-24">
        <div className="flex items-center gap-2">
          <span className="t-meta shrink-0">
            {String(phase.step + 1).padStart(2, "0")}/
            {String(card.questions.length).padStart(2, "0")}
          </span>
          <span className="flex flex-1 gap-1">
            {card.questions.map((_, i) => (
              <span
                key={i}
                className={`h-0.5 flex-1 rounded-full ${i <= phase.step ? "bg-clay" : "bg-line"}`}
              />
            ))}
          </span>
          <span className="t-label truncate">{card.prompt}</span>
        </div>

        {/* Question + answers sit in the optical middle; the commitment
            stays at the thumb. No dead space between them. */}
        <div className="flex flex-1 flex-col justify-center py-8 lg:flex-none lg:py-0">
        <h1 className="t-display lg:mt-8">{q.q}</h1>

        <div className="mt-7 space-y-2">
          {q.chips.map((chip) => (
            <OptionCard
              key={chip}
              selected={picks[phase.step] === chip}
              onSelect={() =>
                setPicks((p) => {
                  const next = [...p];
                  next[phase.step] = chip;
                  return next;
                })
              }
            >
              {chip}
            </OptionCard>
          ))}
        </div>
        </div>

        <div className="lg:mt-10">
          <ActionButton
            size="lg"
            disabled={!picks[phase.step]}
            onClick={() =>
              isLast ? setPhase("generating") : setPhase({ step: phase.step + 1 })
            }
          >
            {isLast ? "Write it for me" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
          <ActionButton
            variant="quiet"
            className="mt-2"
            onClick={() => router.push("/today")}
          >
            Back to Today
          </ActionButton>
        </div>
      </main>
    );
  }

  // C2 — visible work
  if (phase === "generating") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 lg:max-w-xl">
        <p className="t-label">Writing it</p>
        <h1 className="t-display mt-3">One moment —</h1>
        <div className="mt-6">
          <AssemblyMoment
            steps={[
              "Reading your answers…",
              "Checking how you sound…",
              "Matching your never-do list…",
              "Drafting it.",
            ]}
            stepDelay={540}
            onDone={() => setPhase("review")}
          />
        </div>
      </main>
    );
  }

  // C3 — review the real thing
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-7 pb-6 lg:max-w-3xl lg:justify-center lg:pb-20">
      <p className="t-label">Your words, our writing</p>
      <h1 className="t-display mt-3 lg:text-[34px]">Ready when you are.</h1>

      <div className="mt-7 flex flex-1 flex-col lg:grid lg:flex-none lg:grid-cols-[minmax(0,1fr)_236px] lg:items-start lg:gap-10">
        <div>
          <ContentPreview
            kind="post"
            platform={produced.platform}
            businessName={client.businessName}
            avatarInitial={client.avatarInitial}
            meta={produced.meta}
            withImage={produced.withImage}
            pillar={produced.pillar}
            status="draft"
          >
            <SourcedBody body={currentBody} provenance={produced.provenance} />
          </ContentPreview>

          <div className="mt-3">
            <SectionLabel rule={false}>Not quite?</SectionLabel>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const sentences = currentBody.split(". ");
                  if (sentences.length > 2)
                    setBody(sentences.slice(0, 2).join(". ") + ".");
                }}
                className="cursor-pointer rounded-full border border-line bg-card px-3 py-1.5 text-xs text-ink-2 hover:border-ink-3 hover:text-ink"
              >
                Make it shorter
              </button>
              <button
                type="button"
                onClick={() => setBody(produced.body)}
                className="cursor-pointer rounded-full border border-line bg-card px-3 py-1.5 text-xs text-ink-2 hover:border-ink-3 hover:text-ink"
              >
                Start over
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-7 lg:mt-0 lg:pt-0">
          <ActionButton
            size="lg"
            onClick={approve}
            consequence={produced.consequence}
          >
            Approve post
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </ActionButton>
          <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1">
            <ActionButton variant="ghost" onClick={keepForLater}>
              Keep for later
            </ActionButton>
            <ActionButton
              variant="ghost"
              onClick={() => router.push("/today")}
            >
              Discard draft
            </ActionButton>
          </div>
        </div>
      </div>
    </main>
  );
}
