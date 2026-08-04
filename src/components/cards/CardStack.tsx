"use client";

import { useState } from "react";
import Link from "next/link";
import { PenLine, ShieldCheck } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { CardShell } from "@/components/ui/card-shell";
import { ContentPreview } from "@/components/preview/ContentPreview";
import { SourcedBody } from "@/components/preview/SourcedBody";
import { GuardrailLine } from "@/components/preview/GuardrailLine";
import { getFixtureClient } from "@/lib/fixtures/clients";
import {
  useContentItems,
  decideItem,
  editItemBody,
} from "@/lib/store/content";

/**
 * The heart of Home: one decision at a time. Ready drafts first
 * (approve / edit-in-preview / skip), then MAKE cards (question cards →
 * guided create), then done. His yes queues it; nothing publishes on silence.
 */
export function CardStack({ clientId }: { clientId: string }) {
  const client = getFixtureClient(clientId);
  const items = useContentItems(clientId);
  const [stamped, setStamped] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [justChecked, setJustChecked] = useState<string | null>(null);

  const ready = items.filter((i) => i.status === "ready");
  const current = ready[0];
  const pendingQuestions = client.questionCards.filter(
    (qc) => !items.some((i) => i.id === `${qc.id}-out`),
  );
  const total = items.length + pendingQuestions.length;
  const decidedCount = items.length - ready.length;

  function approve(id: string) {
    setStamped(id);
    setTimeout(() => {
      setStamped(null);
      decideItem(clientId, id, "approved");
    }, 650);
  }

  if (current) {
    const body = current.editedBody ?? current.body;
    const isEditing = editing === current.id;
    return (
      <div data-testid="card-stack">
        <div className="relative">
          <ContentPreview
            kind={current.kind}
            platform={current.platform}
            businessName={client.businessName}
            avatarInitial={client.avatarInitial}
            meta={current.meta}
            withImage={current.withImage}
            review={current.review}
            subject={current.subject}
          >
            {isEditing ? (
              <textarea
                aria-label="Edit post text"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-lg border border-clay bg-paper p-2 text-[13px] leading-relaxed outline-none"
              />
            ) : (
              <SourcedBody body={body} provenance={current.provenance} />
            )}
          </ContentPreview>
          {stamped === current.id ? (
            <div
              data-testid="stamp"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-2xl border-4 border-moss bg-moss-mist/95 px-6 py-2 font-display text-2xl font-bold text-moss"
            >
              ON ITS WAY ✓
            </div>
          ) : null}
        </div>

        {current.guardrail && !isEditing ? (
          <GuardrailLine guardrail={current.guardrail} />
        ) : null}
        {justChecked === current.id && !isEditing ? (
          <p className="mt-2 flex items-center gap-2 rounded-xl bg-honey-mist px-3 py-2 text-[11.5px] font-medium text-honey">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5 shrink-0" />
            Still safe after your edit — checked just now
          </p>
        ) : null}

        <div className="mt-4">
          {isEditing ? (
            <ActionButton
              onClick={() => {
                editItemBody(clientId, current.id, draftText);
                setEditing(null);
                setJustChecked(current.id);
              }}
              consequence="your words, verified"
            >
              Save
            </ActionButton>
          ) : (
            <ActionButton
              onClick={() => approve(current.id)}
              consequence={current.consequence}
              disabled={stamped !== null}
            >
              Good to go
            </ActionButton>
          )}
          <div className="mt-2.5 flex justify-center gap-6 text-xs text-ink-2">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-1 px-2 py-2"
                  onClick={() => {
                    setDraftText(body);
                    setEditing(current.id);
                  }}
                >
                  <PenLine aria-hidden className="h-3 w-3" />
                  Edit
                </button>
                <button
                  type="button"
                  className="cursor-pointer px-2 py-2"
                  onClick={() => decideItem(clientId, current.id, "skipped")}
                >
                  Not this one
                </button>
              </>
            ) : (
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div
          className="mt-4 flex justify-center gap-1.5"
          aria-label={`${decidedCount} of ${total} done`}
        >
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i < decidedCount
                  ? "w-1.5 bg-moss"
                  : i === decidedCount
                    ? "w-5 bg-clay"
                    : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  const nextQuestion = pendingQuestions[0];
  if (nextQuestion) {
    return (
      <div data-testid="card-stack">
        <Link href={`/create/${nextQuestion.id}`} className="block">
          <CardShell primary>
            <span className="text-[10px] font-semibold tracking-widest text-clay-deep uppercase">
              Your turn
            </span>
            <p className="mt-1 text-[15px] font-semibold">
              {nextQuestion.prompt}
            </p>
            <p className="mt-1 text-xs text-ink-2">
              {nextQuestion.questions.length} quick questions · we write it,
              you approve · {nextQuestion.timeCost}
            </p>
          </CardShell>
        </Link>
      </div>
    );
  }

  const approved = items.filter(
    (i) => i.status === "approved" || i.status === "posted",
  ).length;
  return (
    <div className="py-10 text-center" data-testid="all-done">
      <p className="font-display text-2xl font-semibold">
        That&apos;s everything.
      </p>
      <p className="mt-2 text-sm text-ink-2">
        {approved} on their way — we&apos;ll take it from here. Nothing else
        needed today.
      </p>
    </div>
  );
}
