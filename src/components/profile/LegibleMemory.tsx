"use client";

import { useState } from "react";
import { Flag, Quote, ShieldCheck } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { useStatus } from "@/components/system/StatusProvider";
import {
  getEngineFixture,
  type Atom,
  type AtomType,
  type EvidenceKind,
} from "@/lib/fixtures/engine";
import { cn } from "@/lib/utils";

/**
 * Everything we believe about this business, and where each belief came
 * from — read-only.
 *
 * Deliberately *not* editable. The engine has a full confirm / override /
 * deprecate lifecycle, and it stays with the team: asking a roofer to
 * curate a knowledge base is how you lose the client who was already
 * unsure where to start. What the client gets instead is the ability to
 * say "this isn't right", which marks the fact disputed and tells us.
 */

const GROUPS: { types: AtomType[]; title: string; blurb: string }[] = [
  {
    types: ["proof_point", "quote"],
    title: "Things we can prove",
    blurb: "Claims we'll use, each traced to something you said or a review.",
  },
  {
    types: ["insight", "pain_point", "objection"],
    title: "What we think we understand",
    blurb: "Our reading of your customers. Correct anything that's off.",
  },
  {
    types: ["claims_blacklist", "voice_constraint"],
    title: "Things we'll never say",
    blurb: "Locked. These are checked against every draft before you see it.",
  },
  {
    types: ["terminology"],
    title: "How you word things",
    blurb: "Picked up from your own language.",
  },
];

const EVIDENCE_LABEL: Record<EvidenceKind, string> = {
  measured: "on record",
  quoted: "your words",
  inferred: "our read",
  unverified: "unconfirmed",
};

function AtomRow({
  atom,
  disputed,
  onDispute,
}: {
  atom: Atom;
  disputed: boolean;
  onDispute: () => void;
}) {
  const [showSource, setShowSource] = useState(false);
  const locked =
    atom.type === "claims_blacklist" || atom.type === "voice_constraint";

  return (
    <li className="px-4 py-4">
      <div className="flex items-start gap-3">
        {locked ? (
          <ShieldCheck
            aria-hidden
            className="mt-1 h-4 w-4 shrink-0 text-honey"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className={cn("t-ui", disputed && "text-ink-3 line-through")}>
            {atom.text}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={() => setShowSource(!showSource)}
              aria-expanded={showSource}
              className="pressable t-meta inline-flex min-h-6 items-center gap-1 underline decoration-line underline-offset-4 hover:text-ink"
            >
              <Quote aria-hidden className="h-2.5 w-2.5 shrink-0" />
              {atom.provenance.documentTitle} · line {atom.provenance.lines[0]}
            </button>
            <span
              className={cn(
                "t-meta",
                atom.evidenceKind === "unverified" && "text-honey",
              )}
            >
              {EVIDENCE_LABEL[atom.evidenceKind]}
            </span>
            {disputed ? (
              <span className="t-meta text-honey">
                you flagged this — we&apos;re looking
              </span>
            ) : null}
          </div>

          {showSource ? (
            <div
              data-testid="atom-source"
              className="mt-2 rounded-lg border border-line bg-paper px-3 py-2"
            >
              {atom.provenance.quote ? (
                <p className="t-sub text-ink italic">
                  “{atom.provenance.quote}”
                </p>
              ) : (
                <p className="t-sub">
                  Drawn from lines {atom.provenance.lines[0]}–
                  {atom.provenance.lines[1]}.
                </p>
              )}
              <p className="t-meta mt-2">
                {atom.provenance.speaker
                  ? `${atom.provenance.speaker} · `
                  : ""}
                {atom.provenance.documentTitle} · {atom.provenance.capturedAt}
              </p>
            </div>
          ) : null}
        </div>

        {!locked && !disputed ? (
          <button
            type="button"
            onClick={onDispute}
            className="pressable t-meta inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 hover:text-honey"
          >
            <Flag aria-hidden className="h-3 w-3" />
            Not right
          </button>
        ) : null}
      </div>
    </li>
  );
}

export function LegibleMemory({ clientId }: { clientId: string }) {
  const { atoms } = getEngineFixture(clientId);
  const [disputed, setDisputed] = useState<string[]>([]);
  const { announce } = useStatus();

  function dispute(atom: Atom) {
    setDisputed((d) => [...d, atom.id]);
    announce("Flagged — we'll check it", {
      undo: () => setDisputed((d) => d.filter((id) => id !== atom.id)),
    });
  }

  return (
    <div data-testid="legible-memory" className="space-y-8">
      {GROUPS.map((group) => {
        const rows = atoms.filter((a) => group.types.includes(a.type));
        if (rows.length === 0) return null;
        return (
          <div key={group.title}>
            <SectionLabel right={`${rows.length}`}>{group.title}</SectionLabel>
            <p className="t-sub mt-2">{group.blurb}</p>
            <ul className="surface mt-3 divide-y divide-line rounded-xl">
              {rows.map((atom) => (
                <AtomRow
                  key={atom.id}
                  atom={atom}
                  disputed={disputed.includes(atom.id)}
                  onDispute={() => dispute(atom)}
                />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
