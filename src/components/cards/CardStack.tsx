"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, PenLine, ShieldCheck, X } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { ContentPreview } from "@/components/preview/ContentPreview";
import { SourcedBody } from "@/components/preview/SourcedBody";
import { GuardrailLine } from "@/components/preview/GuardrailLine";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { useContentItems, decideItem, editItemBody } from "@/lib/store/content";

/**
 * The decision surface: one prepared object at a time, its consequence
 * on the commit, its sources one tap inside the text. Ready drafts
 * first, then the client's own turn, then a designed done-state.
 */
export function CardStack({ clientId }: { clientId: string }) {
  const client = getFixtureClient(clientId);
  const items = useContentItems(clientId);
  const [stamped, setStamped] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [justChecked, setJustChecked] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const ready = items.filter((i) => i.status === "ready");
  const current = ready[0];
  const pendingQuestions = client.questionCards.filter(
    (qc) => !items.some((i) => i.id === `${qc.id}-out`),
  );

  /* Each decision hands over to the next: the incoming object rises into
   * place, its actions follow. Motion confirms the handover — it is the
   * only animation on this screen. */
  useGSAP(
    () => {
      gsap.from("[data-card-object]", {
        opacity: 0,
        y: 16,
        duration: 0.38,
        ease: "power3.out",
      });
      gsap.from("[data-card-actions]", {
        opacity: 0,
        y: 8,
        duration: 0.3,
        delay: 0.08,
        ease: "power2.out",
      });
    },
    { scope: root, dependencies: [current?.id ?? "none"] },
  );

  function approve(id: string) {
    setStamped(id);
    setTimeout(() => {
      setStamped(null);
      decideItem(clientId, id, "approved");
    }, 700);
  }

  if (current) {
    const body = current.editedBody ?? current.body;
    const isEditing = editing === current.id;

    return (
      <div data-testid="card-stack" ref={root}>
        <div className="relative" data-card-object>
          <ContentPreview
            kind={current.kind}
            platform={current.platform}
            businessName={client.businessName}
            avatarInitial={client.avatarInitial}
            meta={current.meta}
            withImage={current.withImage}
            review={current.review}
            subject={current.subject}
            pillar={current.pillar}
            status={isEditing ? "editing" : "ready"}
          >
            {isEditing ? (
              <textarea
                aria-label="Edit post text"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={5}
                className="t-body w-full resize-none rounded-lg border border-clay bg-paper p-2.5 outline-none"
              />
            ) : (
              <SourcedBody body={body} provenance={current.provenance} />
            )}
          </ContentPreview>

          {stamped === current.id ? (
            <div
              data-testid="stamp"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <span className="animate-in fade-in zoom-in-95 flex items-center gap-2 rounded-full border border-moss bg-card px-4 py-2 font-display text-sm font-semibold text-moss shadow-lg duration-200">
                <Check className="h-4 w-4" strokeWidth={3} />
                On its way
              </span>
            </div>
          ) : null}
        </div>

        {current.guardrail && !isEditing ? (
          <GuardrailLine guardrail={current.guardrail} />
        ) : null}
        {justChecked === current.id && !isEditing ? (
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-honey-mist px-3 py-2 text-[12px] font-medium text-honey">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5 shrink-0" />
            Still safe after your edit — checked just now
          </p>
        ) : null}

        <div className="mt-4 space-y-2" data-card-actions>
          {isEditing ? (
            <>
              <ActionButton
                size="lg"
                onClick={() => {
                  editItemBody(clientId, current.id, draftText);
                  setEditing(null);
                  setJustChecked(current.id);
                }}
                consequence="your words, checked again"
              >
                Save
              </ActionButton>
              <ActionButton variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </ActionButton>
            </>
          ) : (
            <>
              <ActionButton
                size="lg"
                onClick={() => approve(current.id)}
                consequence={current.consequence}
                disabled={stamped !== null}
              >
                Good to go
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </ActionButton>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton
                  variant="ghost"
                  onClick={() => {
                    setDraftText(body);
                    setEditing(current.id);
                  }}
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Edit
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  onClick={() => decideItem(clientId, current.id, "skipped")}
                >
                  <X className="h-3.5 w-3.5" />
                  Not this one
                </ActionButton>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const nextQuestion = pendingQuestions[0];
  if (nextQuestion) {
    return (
      <div data-testid="card-stack">
        <CardShell primary className="text-center">
          <span
            aria-hidden
            className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-clay text-onact"
          >
            <PenLine className="h-5 w-5" />
          </span>
          <p className="t-label">Your turn</p>
          <p className="t-title mt-1.5">{nextQuestion.prompt}</p>
          <p className="t-meta mt-2">
            {nextQuestion.questions.length} quick questions · we write it ·{" "}
            {nextQuestion.timeCost}
          </p>
          <Link href={`/create/${nextQuestion.id}`} className="mt-4 block">
            <ActionButton size="lg">
              Answer {nextQuestion.questions.length} questions
              <ArrowRight className="h-4 w-4" />
            </ActionButton>
          </Link>
        </CardShell>
      </div>
    );
  }

  const approved = items.filter(
    (i) => i.status === "approved" || i.status === "posted",
  ).length;
  return (
    <CardShell className="py-10 text-center" data-testid="all-done">
      <span
        aria-hidden
        className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-moss-mist text-moss"
      >
        <Check className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <p className="t-title">That&apos;s everything.</p>
      <p className="t-sub mx-auto mt-2 max-w-xs">
        {`${approved} on their way — we'll take it from here. Nothing else needed today.`}
      </p>
      <Link
        href="/workspace"
        className="t-meta mt-4 inline-block underline underline-offset-4"
      >
        Something happening this week? Tell us →
      </Link>
    </CardShell>
  );
}
