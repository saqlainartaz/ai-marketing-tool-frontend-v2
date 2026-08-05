"use client";

import { useState } from "react";
import { Check, ChevronDown, Quote, X } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { ActionButton } from "@/components/ui/action-button";
import { useStatus } from "@/components/system/StatusProvider";
import {
  currentVoice,
  getEngineFixture,
  type VoiceTrait,
  type VoiceProfileVersion,
} from "@/lib/fixtures/engine";
import { cn } from "@/lib/utils";

/**
 * The voice profile, at full depth.
 *
 * The engine builds far more than we were showing: each We Are / We Are
 * Not judgement carries the evidence it was drawn from and a confidence,
 * plus a tone matrix, terminology tiers and a version history. Rendering
 * only the summary threw away the one thing that answers the Authority
 * persona's actual complaint — "it doesn't sound like me" — because
 * without the evidence there's nothing to argue with.
 *
 * Progressive disclosure: the summary and the do/don't pairs are the
 * entry, and opening a pair reveals what it rests on.
 */
function TraitList({
  traits,
  tone,
}: {
  traits: VoiceTrait[];
  tone: "is" | "is-not";
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-line">
      {traits.map((trait) => {
        const isOpen = open === trait.id;
        const hasEvidence = trait.evidence.length > 0;
        return (
          <li key={trait.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : trait.id)}
              aria-expanded={isOpen}
              disabled={!hasEvidence}
              className={cn(
                "pressable flex min-h-14 w-full items-center gap-3 px-4 text-left",
                hasEvidence ? "hover:bg-paper/60" : "cursor-default",
              )}
            >
              {tone === "is" ? (
                <Check
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-moss"
                  strokeWidth={3}
                />
              ) : (
                <X aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />
              )}
              <span className="t-ui min-w-0 flex-1">{trait.claim}</span>
              <span className="t-meta shrink-0">
                {hasEvidence
                  ? `${Math.round(trait.confidence * 100)}% sure`
                  : "no evidence yet"}
              </span>
              {hasEvidence ? (
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              ) : null}
            </button>

            {isOpen ? (
              <ul
                data-testid="trait-evidence"
                className="space-y-3 border-t border-line bg-paper px-4 py-3"
              >
                {trait.evidence.map((e) => (
                  <li key={e.atomId} className="flex gap-3">
                    <Quote
                      aria-hidden
                      className="mt-1 h-3 w-3 shrink-0 text-ink-3"
                    />
                    <span className="min-w-0">
                      <span className="t-sub block text-ink italic">
                        “{e.quote}”
                      </span>
                      <span className="t-meta mt-1 block">{e.source}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function ToneMatrix({ version }: { version: VoiceProfileVersion }) {
  return (
    /* Capped: an axis is a scale you read at a glance, and stretched the
     * width of a desktop column it stops looking like one. */
    <ul className="max-w-sm space-y-4">
      {version.tone.map((axis) => (
        <li key={axis.label}>
          {/* The reading sits beside the label, not opposite it. Pushed
           * right it landed directly above the right-hand endpoint and
           * read as a duplicate of it — "Warmth … Warm / Formal — Warm".
           * Lower-cased for the same reason it isn't a heading. */}
          <p className="t-ui">
            {axis.label}
            <span className="t-meta ml-2">
              {(axis.value < 40
                ? axis.leftLabel
                : axis.value > 60
                  ? axis.rightLabel
                  : "balanced"
              ).toLowerCase()}
            </span>
          </p>
          <div className="relative mt-2 h-1.5 rounded-full bg-line">
            <span
              aria-hidden
              className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-clay"
              style={{ left: `calc(${axis.value}% - 6px)` }}
            />
          </div>
          <div className="mt-1 flex justify-between">
            <span className="t-meta">{axis.leftLabel}</span>
            <span className="t-meta">{axis.rightLabel}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function VoiceSurface({ clientId }: { clientId: string }) {
  const { voiceVersions } = getEngineFixture(clientId);
  const [versionNo, setVersionNo] = useState(currentVoice(clientId).version);
  const [approved, setApproved] = useState<number[]>(
    voiceVersions.filter((v) => v.status === "approved").map((v) => v.version),
  );
  const { announce } = useStatus();

  const version =
    voiceVersions.find((v) => v.version === versionNo) ?? voiceVersions[0];
  const isApproved = approved.includes(version.version);

  return (
    <div data-testid="voice-surface">
      <div className="surface rounded-xl p-4 sm:p-5">
        <p className="t-body">{version.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "t-meta rounded-full px-3 py-1",
              isApproved
                ? "bg-moss-mist text-moss"
                : "bg-honey-mist text-honey",
            )}
          >
            {isApproved ? "Approved by you" : "Waiting for your approval"}
          </span>
          <span className="t-meta">
            Version {version.version} · built {version.builtAt}
          </span>
        </div>

        {!isApproved ? (
          <div className="mt-4">
            <ActionButton
              onClick={() => {
                setApproved((a) => [...a, version.version]);
                announce("Voice approved", {
                  undo: () =>
                    setApproved((a) =>
                      a.filter((v) => v !== version.version),
                    ),
                });
              }}
              consequence="every draft from here follows it"
              className="sm:w-auto sm:px-8"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Approve this version
            </ActionButton>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <SectionLabel right={`${version.weAre.length}`}>
          Sounds like you
        </SectionLabel>
        <div className="surface mt-3 overflow-hidden rounded-xl">
          <TraitList traits={version.weAre} tone="is" />
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel right={`${version.weAreNot.length}`}>
          Never you
        </SectionLabel>
        <div className="surface mt-3 overflow-hidden rounded-xl">
          <TraitList traits={version.weAreNot} tone="is-not" />
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel>How you land</SectionLabel>
        <div className="surface mt-3 rounded-xl p-4">
          <ToneMatrix version={version} />
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel>Words</SectionLabel>
        <div className="surface mt-3 divide-y divide-line rounded-xl">
          {version.terminology.map((tier) => (
            <div key={tier.tier} className="px-4 py-3">
              <p className="t-label">
                {tier.tier === "always"
                  ? "Always"
                  : tier.tier === "never"
                    ? "Never"
                    : "Only in context"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tier.terms.map((term) => (
                  <span
                    key={term}
                    className={cn(
                      "t-sub rounded-full border px-3 py-1",
                      tier.tier === "never"
                        ? "border-line text-ink-3 line-through"
                        : "border-line bg-card text-ink",
                    )}
                  >
                    {term}
                  </span>
                ))}
              </div>
              <p className="t-meta mt-2">{tier.note}</p>
            </div>
          ))}
        </div>
      </div>

      {voiceVersions.length > 1 ? (
        <div className="mt-8">
          <SectionLabel>History</SectionLabel>
          <ul className="surface mt-3 divide-y divide-line rounded-xl">
            {voiceVersions.map((v) => (
              <li key={v.version}>
                <button
                  type="button"
                  onClick={() => setVersionNo(v.version)}
                  aria-pressed={v.version === versionNo}
                  className={cn(
                    "pressable flex min-h-14 w-full items-center gap-3 px-4 text-left",
                    v.version === versionNo && "bg-paper/60",
                  )}
                >
                  <span className="t-ui shrink-0">v{v.version}</span>
                  <span className="min-w-0 flex-1">
                    <span className="t-sub block truncate">
                      {v.changes?.[0] ?? "First version, built from your material"}
                    </span>
                    <span className="t-meta">{v.builtAt}</span>
                  </span>
                  {v.version === versionNo ? (
                    <span className="t-meta shrink-0">showing</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
