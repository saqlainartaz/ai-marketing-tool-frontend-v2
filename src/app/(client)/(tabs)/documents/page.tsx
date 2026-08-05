"use client";

import { useRef, useState } from "react";
import {
  Check,
  FileText,
  Loader2,
  Mic,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { SectionLabel } from "@/components/ui/section-label";
import { QuietLink } from "@/components/ui/quiet-link";
import { useStatus } from "@/components/system/StatusProvider";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import {
  addDocument,
  advanceDocument,
  useDocuments,
  type StoredDocument,
} from "@/lib/store/documents";
import type { DocumentStatus } from "@/lib/fixtures/engine";
import { cn } from "@/lib/utils";

/**
 * Teach it something.
 *
 * The flow that proves there is an engine behind this rather than a text
 * generator. A client drops in a transcript or a brand document, watches
 * it actually get read, and then sees the new facts appear on their
 * profile — and the next draft using them.
 *
 * The stages are the engine's own pipeline, shown honestly. "Uploading…"
 * tells someone nothing; "reading it" and "pulling out what matters" tell
 * them what they are waiting for, which is the difference between a
 * progress bar and an explanation.
 */

const STAGES: { status: DocumentStatus; label: string; ms: number }[] = [
  { status: "parsed", label: "Reading it", ms: 900 },
  { status: "cleaned", label: "Tidying it up", ms: 800 },
  { status: "atomised", label: "Pulling out what matters", ms: 1100 },
];

const KIND_ICON: Record<string, LucideIcon> = {
  transcript: Mic,
  brand_doc: FileText,
  form: FileText,
  reviews: FileText,
};

const STATUS_LABEL: Record<DocumentStatus, string> = {
  uploaded: "Queued",
  parsed: "Reading it",
  cleaned: "Tidying it up",
  atomised: "Read",
  failed: "Couldn't read it",
};

function DocumentRow({ doc }: { doc: StoredDocument }) {
  const Icon = KIND_ICON[doc.kind] ?? FileText;
  const working = doc.status !== "atomised" && doc.status !== "failed";

  return (
    <li className="px-4 py-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            doc.status === "atomised"
              ? "bg-moss-mist text-moss"
              : doc.status === "failed"
                ? "bg-honey-mist text-honey"
                : "bg-clay-mist text-clay",
          )}
        >
          {working ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : doc.status === "atomised" ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="t-ui truncate">{doc.title}</p>
          <p className="t-meta mt-1">
            {STATUS_LABEL[doc.status]}
            {doc.atomCount ? ` · ${doc.atomCount} things learned` : ""}
            {doc.uploadedAt ? ` · ${doc.uploadedAt}` : ""}
          </p>

          {doc.learned?.length ? (
            <ul
              data-testid="learned"
              className="mt-3 space-y-2 rounded-xl border border-line bg-paper px-4 py-3"
            >
              <li className="t-label">What this taught us</li>
              {doc.learned.map((f) => (
                <li key={f.text} className="t-sub text-ink">
                  {f.text}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default function DocumentsPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const docs = useDocuments(clientId);
  const { announce } = useStatus();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function ingest(title: string) {
    const id = `doc-${Date.now()}`;
    setBusy(true);
    addDocument(clientId, {
      id,
      title,
      kind: "transcript",
      uploadedAt: new Date().toISOString().slice(0, 10),
    });

    let elapsed = 0;
    STAGES.forEach((stage, i) => {
      elapsed += stage.ms;
      setTimeout(() => {
        const last = i === STAGES.length - 1;
        advanceDocument(
          clientId,
          id,
          stage.status,
          last
            ? {
                atomCount: 6,
                learned: [
                  {
                    kind: "proof_point",
                    text: `A new proof point for “${client.plan.pillars[0]}”.`,
                  },
                  {
                    kind: "voice_constraint",
                    text: "Two phrases added to how you sound.",
                  },
                  {
                    kind: "claims_blacklist",
                    text: "One thing you'd rather we never claim.",
                  },
                ],
              }
            : undefined,
        );
        if (last) {
          setBusy(false);
          announce("Read — 6 things learned");
        }
      }, elapsed);
    });
  }

  return (
    <div className="w-full lg:max-w-3xl">
      <p className="t-label">What we&apos;ve read</p>
      <h1 className="t-display mt-3">Teach us something.</h1>
      <p className="t-sub mt-3 max-w-xl">
        Everything we write comes from what you&apos;ve given us. Add a call
        recording, a transcript or anything you&apos;ve already written, and
        you&apos;ll see exactly what it taught us.
      </p>

      <div className="surface mt-7 rounded-xl p-4 sm:p-5">
        <input
          ref={fileInput}
          type="file"
          className="sr-only"
          accept=".txt,.md,.pdf,.docx,.pptx"
          onChange={(e) => {
            const name = e.target.files?.[0]?.name;
            if (name) ingest(name);
            e.target.value = "";
          }}
        />
        <ActionButton
          size="lg"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          consequence="nothing is published from what you add"
          className="sm:w-auto sm:px-8"
        >
          <Upload className="h-4 w-4" />
          {busy ? "Reading…" : "Add a document"}
        </ActionButton>
        <p className="t-meta mt-3">
          Transcripts, PDFs, Word documents or plain text. We read it once and
          keep only what&apos;s useful.
        </p>
      </div>

      <div className="mt-8">
        <SectionLabel right={`${docs.length}`}>Everything we&apos;ve read</SectionLabel>
        <ul className="surface mt-3 divide-y divide-line rounded-xl">
          {docs.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </ul>
      </div>

      <div className="mt-8 border-t border-line pt-4">
        <QuietLink href="/profile">
          See everything we know about you
        </QuietLink>
      </div>
    </div>
  );
}
