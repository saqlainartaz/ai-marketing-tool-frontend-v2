"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { PostPreview } from "@/components/preview/post-preview";
import type { ActionCardFixture } from "@/lib/fixtures/clients";

type Decision = "approved" | "skipped";

type CardStackProps = {
  cards: ActionCardFixture[];
  businessName: string;
  avatarInitial: string;
  /** "One at a time" pager (mobile) vs full list (desktop) is a CSS concern; state is shared. */
  onAllDecided?: (decisions: Record<string, Decision>) => void;
};

/**
 * The heart of Home: draft_approval cards, one decision each.
 * Approve → stamp → next. His yes queues it; nothing publishes on silence.
 */
export function CardStack({
  cards,
  businessName,
  avatarInitial,
  onAllDecided,
}: CardStackProps) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [stamped, setStamped] = useState<string | null>(null);

  const pending = cards.filter((c) => !decisions[c.id]);
  const current = pending[0];
  const decidedCount = cards.length - pending.length;

  function decide(id: string, decision: Decision) {
    if (decision === "approved") {
      setStamped(id);
      setTimeout(() => {
        setStamped(null);
        commit(id, decision);
      }, 650);
    } else {
      commit(id, decision);
    }
  }

  function commit(id: string, decision: Decision) {
    setDecisions((prev) => {
      const next = { ...prev, [id]: decision };
      if (Object.keys(next).length === cards.length) onAllDecided?.(next);
      return next;
    });
  }

  if (!current) {
    return (
      <div className="py-10 text-center" data-testid="all-done">
        <p className="font-display text-2xl font-semibold">
          That&apos;s everything.
        </p>
        <p className="mt-2 text-sm text-ink-2">
          {Object.values(decisions).filter((d) => d === "approved").length} on
          their way — we&apos;ll take it from here. Nothing else needed today.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="card-stack">
      <div className="relative">
        <PostPreview
          platform={current.platform ?? "facebook"}
          businessName={businessName}
          avatarInitial={avatarInitial}
          meta={current.meta ?? ""}
          withImage={current.withImage}
        >
          {current.body}
        </PostPreview>
        {stamped === current.id ? (
          <div
            data-testid="stamp"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-2xl border-4 border-moss bg-moss-mist/95 px-6 py-2 font-display text-2xl font-bold text-moss"
          >
            ON ITS WAY ✓
          </div>
        ) : null}
      </div>
      <div className="mt-4">
        <ActionButton
          onClick={() => decide(current.id, "approved")}
          consequence={current.consequence}
          disabled={stamped !== null}
        >
          Good to go
        </ActionButton>
        <button
          type="button"
          onClick={() => decide(current.id, "skipped")}
          className="mt-2.5 w-full cursor-pointer text-center text-xs text-ink-2"
        >
          Not this one
        </button>
      </div>
      <div
        className="mt-4 flex justify-center gap-1.5"
        aria-label={`${decidedCount} of ${cards.length} decided`}
      >
        {cards.map((c, i) => (
          <span
            key={c.id}
            className={`h-1.5 rounded-full transition-all ${
              i < decidedCount ? "w-1.5 bg-moss" : i === decidedCount ? "w-5 bg-clay" : "w-1.5 bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
