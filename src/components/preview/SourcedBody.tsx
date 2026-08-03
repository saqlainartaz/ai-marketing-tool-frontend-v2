"use client";

import { useState } from "react";
import type { ProvenanceSpan } from "@/lib/fixtures/clients";

/**
 * Renders draft text with claim-bearing phrases underlined (dotted) —
 * tap one and its source appears. Provenance lives IN the text, sparingly:
 * only spans the fixture/BFF marks as claims.
 */
export function SourcedBody({
  body,
  provenance = [],
}: {
  body: string;
  provenance?: ProvenanceSpan[];
}) {
  const [open, setOpen] = useState<string | null>(null);

  if (provenance.length === 0) return <>{body}</>;

  // Split the body around each provenance phrase (first occurrence).
  const parts: Array<{ text: string; span?: ProvenanceSpan }> = [];
  let rest = body;
  for (const span of provenance) {
    const at = rest.indexOf(span.phrase);
    if (at === -1) continue;
    if (at > 0) parts.push({ text: rest.slice(0, at) });
    parts.push({ text: span.phrase, span });
    rest = rest.slice(at + span.phrase.length);
  }
  if (rest) parts.push({ text: rest });

  const active = provenance.find((p) => p.phrase === open);

  return (
    <>
      {parts.map((part, i) =>
        part.span ? (
          <button
            key={i}
            type="button"
            onClick={() =>
              setOpen(open === part.span!.phrase ? null : part.span!.phrase)
            }
            className="cursor-pointer border-b-[1.5px] border-dotted border-clay text-left"
            aria-expanded={open === part.span.phrase}
          >
            {part.text}
          </button>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
      {active ? (
        <span
          data-testid="source-pop"
          className="mt-2 block rounded-xl bg-ink px-3 py-2 text-[11px] leading-snug text-paper"
        >
          <b>Your words</b> — {active.label}
          {active.quote ? <i className="block opacity-80">“{active.quote}”</i> : null}
        </span>
      ) : null}
    </>
  );
}
