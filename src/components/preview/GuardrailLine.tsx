"use client";

import { useState } from "react";
import type { FixtureDraft } from "@/lib/fixtures/clients";

/**
 * Protection, not warnings: a risk was already handled. The diff is one tap
 * away — safety is the default state, never an alert to resolve.
 */
export function GuardrailLine({
  guardrail,
}: {
  guardrail: NonNullable<FixtureDraft["guardrail"]>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-honey-mist px-3 py-2 text-left text-[11.5px] text-honey"
      >
        🛡 {guardrail.note}
      </button>
      {open ? (
        <div
          data-testid="guardrail-diff"
          className="mt-1.5 rounded-xl border border-honey/40 bg-honey-mist px-3 py-2 text-[12px]"
        >
          <s className="text-ink-3">{guardrail.from}</s>
          <b className="block">→ {guardrail.to}</b>
          <span className="mt-1 block text-[10.5px] text-honey">
            Softened automatically; your call to accept.
          </span>
        </div>
      ) : null}
    </div>
  );
}
