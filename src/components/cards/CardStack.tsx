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
import { WhyThis } from "@/components/preview/WhyThis";
import { getFixtureClient } from "@/lib/fixtures/clients";
import {
  useContentItems,
  decideItem,
  undecideItem,
  editItemBody,
} from "@/lib/store/content";
import { useWorkMode } from "@/lib/store/settings";
import { IdeaCard } from "@/components/cards/IdeaCard";
import { useStatus } from "@/components/system/StatusProvider";
import { QuietLink } from "@/components/ui/quiet-link";

/**
 * Action labels name the object they act on, so the button answers
 * "approve what?" without reading the card again (Stripe's call-and-
 * response rule; Carbon's verb + noun formula).
 */
function objectNoun(kind: string | undefined): string {
  if (kind === "review_reply") return "reply";
  if (kind === "email") return "email";
  return "post";
}

/**
 * The decision surface: one prepared object at a time, its consequence
 * on the commit, its sources one tap inside the text. Ready drafts
 * first, then the client's own turn, then a designed done-state.
 */
export function CardStack({ clientId }: { clientId: string }) {
  const client = getFixtureClient(clientId);
  const items = useContentItems(clientId);
  const workMode = useWorkMode(clientId);
  const [stamped, setStamped] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [justChecked, setJustChecked] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const { announce } = useStatus();

  const ready = items.filter((i) => i.status === "ready");
  const current = ready[0];
  const pendingQuestions = client.questionCards.filter(
    (qc) => !items.some((i) => i.id === `${qc.id}-out`),
  );

  /* Each decision hands over to the next: the incoming object rises into
   * place, its actions follow. Motion confirms the handover — it is the
   * only animation on this screen.
   *
   * Kept deliberately short. This runs once per card in a loop a client is
   * meant to finish in under a minute, so every 100ms here is spent five
   * times over. The CSS reduced-motion rule can't reach GSAP, so the
   * preference is checked directly. */
  useGSAP(
    () => {
      const reduced =
        typeof window !== "undefined" &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.from("[data-card-object]", {
        opacity: 0,
        y: 12,
        duration: 0.22,
        ease: "power3.out",
      });
      gsap.from("[data-card-actions]", {
        opacity: 0,
        y: 6,
        duration: 0.18,
        delay: 0.04,
        ease: "power2.out",
      });
    },
    { scope: root, dependencies: [current?.id ?? "none"] },
  );

  /* The stamp is the product's one flourish and it stays — but it used to
   * hold the primary action disabled for 700ms, which across a five-card
   * week is three and a half seconds of a client waiting on an animation.
   * The toast already confirms the approval and carries the undo, so the
   * stamp only has to register; it doesn't have to be read. */
  const STAMP_MS = 320;

  function approve(id: string) {
    setStamped(id);
    setTimeout(() => {
      setStamped(null);
      decideItem(clientId, id, "approved");
      announce("Approved", { undo: () => undecideItem(clientId, id) });
    }, STAMP_MS);
  }

  function skip(id: string) {
    decideItem(clientId, id, "skipped");
    announce("Skipped", { undo: () => undecideItem(clientId, id) });
  }

  /* The dial decides what leads. "Show me ideas" means exactly that:
   * the client picks what to say and we write it, rather than being
   * handed finished drafts to wave through. */
  if (workMode === "suggest") {
    return (
      <div data-testid="card-stack">
        <IdeaCard clientId={clientId} />
        {ready.length > 0 ? (
          <div className="mt-6">
            <p className="t-label mb-3">
              Also prepared for you · {ready.length}
            </p>
            {/* Approving is the same commitment here as anywhere else, so
                it gets the same control. It used to degrade to an 11px
                underlined link — a fifth the size of the button that does
                exactly this job in the other two modes. */}
            <ul className="space-y-2">
              {ready.slice(0, 3).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-line bg-card py-2 pr-2 pl-3.5"
                >
                  <span className="t-sub min-w-0 flex-1 truncate">
                    {item.pillar ?? item.meta}
                  </span>
                  <ActionButton
                    variant="ghost"
                    onClick={() => approve(item.id)}
                    className="w-auto shrink-0"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Approve {objectNoun(item.kind)}
                  </ActionButton>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
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
                className="t-body w-full resize-none rounded-lg border border-clay bg-paper p-3"
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
              <span className="animate-in fade-in zoom-in-95 flex items-center gap-2 rounded-full border border-moss bg-card px-4 py-2 font-display text-sm font-semibold text-moss shadow-overlay duration-200">
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
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-honey-mist px-3 py-2 t-sub font-medium text-honey">
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
                Save changes
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
                Approve {objectNoun(current.kind)}
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
                  Edit {objectNoun(current.kind)}
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  onClick={() => skip(current.id)}
                >
                  <X className="h-3.5 w-3.5" />
                  Skip {objectNoun(current.kind)}
                </ActionButton>
              </div>
              {/* Below the actions on purpose. Someone approving a week in
                  a minute must never scroll past our reasoning to reach
                  the button; someone who wants the reasoning will scroll. */}
              {current.rationale ? (
                <WhyThis rationale={current.rationale} />
              ) : null}
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
          {/* One interactive element, not a button nested inside a link. */}
          <ActionButton
            size="lg"
            href={`/create/${nextQuestion.id}`}
            className="mt-4"
          >
            Answer {nextQuestion.questions.length} questions
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
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
      <QuietLink href="/workspace" className="mt-4">
        Something happening this week? Tell us
      </QuietLink>
    </CardShell>
  );
}
