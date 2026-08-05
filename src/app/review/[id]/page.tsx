"use client";

import { use, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { ContentPreview } from "@/components/preview/ContentPreview";
import { SourcedBody } from "@/components/preview/SourcedBody";
import { GuardrailLine } from "@/components/preview/GuardrailLine";
import { WhyThis } from "@/components/preview/WhyThis";
import { StateScreen } from "@/components/system/StateScreen";
import { findDraftAnywhere } from "@/lib/fixtures/clients";

/**
 * The client review link — no login.
 *
 * The handoff sheet has offered "share review link" since the Library
 * shipped, pointing at a route that didn't exist. This is that route.
 *
 * It's deliberately outside the (client) group, so it never hits the auth
 * gate: the person opening it may be a partner, a compliance officer or a
 * spouse, and asking them to sign in would kill the flow. They see the
 * prepared object exactly as the client would — with its sources and its
 * guardrails — and their decision is recorded against the item.
 *
 * Nothing here can publish. Approving records a yes; that's all it does.
 */
export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const found = findDraftAnywhere(id);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(
    null,
  );

  if (!found) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5">
        <StateScreen
          icon={ShieldCheck}
          title="This link has expired."
          body="Ask whoever shared it to send a fresh one."
        />
      </main>
    );
  }

  const { draft, client } = found;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <header>
        <p className="t-label">Review requested</p>
        <h1 className="t-display mt-2">
          {client.businessName} would like your view.
        </h1>
        <p className="t-sub mt-3">
          Nothing has been published. It goes out only if it&apos;s approved —
          and you can see where every claim came from.
        </p>
      </header>

      <div className="mt-7">
        <ContentPreview
          kind={draft.kind}
          platform={draft.platform}
          businessName={client.businessName}
          avatarInitial={client.avatarInitial}
          meta={draft.meta}
          withImage={draft.withImage}
          review={draft.review}
          subject={draft.subject}
          pillar={draft.pillar}
          status={decision ?? "for review"}
        >
          <SourcedBody body={draft.body} provenance={draft.provenance} />
        </ContentPreview>

        {draft.guardrail ? <GuardrailLine guardrail={draft.guardrail} /> : null}

        {decision === null ? (
          <div className="mt-4 space-y-2">
            <ActionButton
              size="lg"
              onClick={() => setDecision("approved")}
              consequence="records your yes · nothing publishes from here"
            >
              Approve {draft.kind === "review_reply" ? "reply" : "post"}
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </ActionButton>
            <ActionButton
              variant="ghost"
              onClick={() => setDecision("rejected")}
            >
              <X className="h-3.5 w-3.5" />
              Not this one
            </ActionButton>
            {draft.rationale ? <WhyThis rationale={draft.rationale} /> : null}
          </div>
        ) : (
          <div
            data-testid="review-decision"
            className="surface mt-4 rounded-xl px-4 py-5 text-center"
          >
            <span
              aria-hidden
              className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
                decision === "approved"
                  ? "bg-moss-mist text-moss"
                  : "bg-paper text-ink-3"
              }`}
            >
              {decision === "approved" ? (
                <Check className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <X className="h-5 w-5" />
              )}
            </span>
            <p className="t-title">
              {decision === "approved" ? "Approved." : "Sent back."}
            </p>
            <p className="t-sub mx-auto mt-2 max-w-xs">
              {decision === "approved"
                ? `${client.firstName} has been told. Nothing publishes without them either.`
                : `${client.firstName} has been told you'd rather this one didn't run.`}
            </p>
            <button
              type="button"
              onClick={() => setDecision(null)}
              className="pressable t-sub mt-4 inline-flex min-h-11 items-center rounded-lg px-3 underline decoration-line underline-offset-4 hover:text-ink"
            >
              Change my answer
            </button>
          </div>
        )}
      </div>

      <p className="t-meta mt-8">
        Sample data · this link is read-only and cannot publish anything
      </p>
    </main>
  );
}
