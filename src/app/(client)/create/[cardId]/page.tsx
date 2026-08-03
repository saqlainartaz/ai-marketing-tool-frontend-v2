"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { PostPreview } from "@/components/preview/post-preview";
import { SourcedBody } from "@/components/preview/SourcedBody";
import { AssemblyMoment } from "@/components/motion/AssemblyMoment";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { addItem, decideItem } from "@/lib/store/content";

type Phase = { step: number } | "generating" | "review";

/**
 * Guided create — C1 (a couple of plain questions, chips first, typing
 * optional) → C2 (visible work) → C3 (review the real thing). Mock
 * generation in M1: the fixture's `produces` draft, personalized lightly
 * by the chosen chips.
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

  function finishQuestions() {
    setPhase("generating");
  }

  function approve() {
    addItem(clientId, { ...produced, body: currentBody });
    decideItem(clientId, produced.id, "approved");
    router.push("/today");
  }

  function keepForLater() {
    addItem(clientId, { ...produced, body: currentBody });
    router.push("/today");
  }

  // --- C1: questions, one at a time ---
  if (typeof phase === "object") {
    const q = card.questions[phase.step];
    const isLast = phase.step === card.questions.length - 1;
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-5">
        <p className="text-[10.5px] tracking-[0.12em] text-ink-3 uppercase">
          {card.prompt} · {phase.step + 1} of {card.questions.length}
        </p>
        <h1 className="mt-3 font-display text-[26px] leading-tight font-semibold tracking-tight">
          {q.q}
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {q.chips.map((chip) => (
            <Chip
              key={chip}
              selected={picks[phase.step] === chip}
              onToggle={() =>
                setPicks((p) => {
                  const next = [...p];
                  next[phase.step] = chip;
                  return next;
                })
              }
            >
              {chip}
            </Chip>
          ))}
        </div>
        <div className="mt-auto">
          <ActionButton
            disabled={!picks[phase.step]}
            onClick={() =>
              isLast ? finishQuestions() : setPhase({ step: phase.step + 1 })
            }
          >
            {isLast ? "Write it for me →" : "Next →"}
          </ActionButton>
          <button
            type="button"
            onClick={() => router.push("/today")}
            className="mt-2.5 w-full cursor-pointer text-center text-xs text-ink-2"
          >
            Back to Today
          </button>
        </div>
      </main>
    );
  }

  // --- C2: visible work ---
  if (phase === "generating") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6">
        <p className="text-[10.5px] tracking-[0.12em] text-ink-3 uppercase">
          Writing your post
        </p>
        <h1 className="mt-3 font-display text-[26px] font-semibold">
          One moment —
        </h1>
        <div className="mt-4">
          <AssemblyMoment
            steps={[
              "Reading your answers…",
              "Checking how you sound…",
              "Matching your never-do list…",
              "Drafting it.",
            ]}
            stepDelay={550}
            onDone={() => setPhase("review")}
          />
        </div>
      </main>
    );
  }

  // --- C3: review the real thing ---
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-5">
      <p className="text-[10.5px] tracking-[0.12em] text-ink-3 uppercase">
        Here it is — your words, our writing
      </p>
      <div className="mt-4">
        <PostPreview
          platform={produced.platform}
          businessName={client.businessName}
          avatarInitial={client.avatarInitial}
          meta={produced.meta}
          withImage={produced.withImage}
        >
          <SourcedBody body={currentBody} provenance={produced.provenance} />
        </PostPreview>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        <Chip
          onToggle={() => {
            const sentences = currentBody.split(". ");
            if (sentences.length > 2)
              setBody(sentences.slice(0, 2).join(". ") + ".");
          }}
        >
          Make it shorter
        </Chip>
        <Chip onToggle={() => setBody(produced.body)}>Start over</Chip>
      </div>
      <div className="mt-auto">
        <ActionButton onClick={approve} consequence={produced.consequence}>
          Good to go
        </ActionButton>
        <div className="mt-2.5 flex justify-center gap-6 text-xs text-ink-2">
          <button type="button" className="cursor-pointer" onClick={keepForLater}>
            Keep for later
          </button>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => router.push("/today")}
          >
            Toss it
          </button>
        </div>
      </div>
    </main>
  );
}
