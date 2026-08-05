"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import type { ProvenanceSpan } from "@/lib/fixtures/clients";

/**
 * Renders draft text with claim-bearing phrases underlined (dotted) —
 * tap one and its source appears below the paragraph. The buttons are
 * true inline elements: they must never break sentence flow or orphan
 * punctuation (regression-tested).
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
      <span data-testid="sourced-body">
        {parts.map((part, i) =>
          part.span ? (
            /* A real <button> is an atomic inline-block: when its text
             * wraps internally it pushes following content to a new line,
             * fracturing the sentence (the audit's P0). span[role=button]
             * is genuinely inline and flows like text. */
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() =>
                setOpen(open === part.span!.phrase ? null : part.span!.phrase)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(
                    open === part.span!.phrase ? null : part.span!.phrase,
                  );
                }
              }}
              aria-expanded={open === part.span.phrase}
              className="cursor-pointer [text-decoration:underline_dotted_var(--clay)_1.5px] [text-underline-offset:3px]"
              style={{ display: "inline" }}
            >
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </span>
      {active ? (
        <span
          data-testid="source-pop"
          className="mt-2.5 block rounded-xl bg-ink px-3.5 py-2.5 t-sub leading-snug text-paper"
        >
          <Quote aria-hidden className="mr-1.5 inline h-3 w-3 align-[-1px]" />
          <b>Your words</b> — {active.label}
          {active.quote ? (
            <i className="block pt-0.5 opacity-80">“{active.quote}”</i>
          ) : null}
        </span>
      ) : null}
    </>
  );
}
