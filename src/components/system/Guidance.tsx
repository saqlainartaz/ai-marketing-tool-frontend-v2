"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, X } from "lucide-react";

/**
 * In-app guidance — summonable, never pushed.
 *
 * NN/g's finding on onboarding tours is that they interrupt, aren't
 * remembered, and don't improve task success. What does work is help you
 * can ask for, in context. So this is a button, not a tour, and it opens
 * only when someone wants it.
 *
 * And it explains the *marketing*, like "Why this?" does — what this
 * screen is for in terms of the client's business, not where the controls
 * are. A client who reads it should end up knowing something about
 * marketing they didn't, rather than something about our interface.
 */

const GUIDANCE: Record<string, { title: string; body: string[] }> = {
  "/today": {
    title: "Why one at a time",
    body: [
      "Marketing fails from inconsistency far more often than from bad posts. The point of this screen is that it takes a minute, so it happens every week.",
      "Everything here is already written and already checked against your rules. Your job is the yes — and nothing goes out without one.",
    ],
  },
  "/library": {
    title: "Why the record matters",
    body: [
      "When someone asks what your marketing did this quarter, this page is the answer — what went out, when, and on which channel.",
      "It's also your proof of control: every piece here has a recorded yes from you.",
    ],
  },
  "/plan": {
    title: "Why a plan beats posting when you feel like it",
    body: [
      "Two things decide whether marketing works: showing up where your customers already are, and saying the same few things consistently enough to be remembered.",
      "That's what the channels and pillars are. The counts are live, so you can see whether the plan is actually being followed.",
    ],
  },
  "/voice": {
    title: "Why voice is the whole game",
    body: [
      "Generic marketing gets ignored because it could be about anyone. The specific detail — your job, your street, your phrasing — is what makes someone stop.",
      "This is our reading of how you actually sound, and what it rests on. If a judgement is wrong, correcting it changes everything we write from then on.",
    ],
  },
  "/documents": {
    title: "Why we ask for your material",
    body: [
      "Everything we write comes from something you've already said. That's the difference between marketing that sounds like you and marketing that sounds like software.",
      "The more you give us — calls, transcripts, reviews — the more specific the drafts get.",
    ],
  },
  "/profile": {
    title: "Why you can see all of this",
    body: [
      "Most tools keep what they think about you hidden. Ours doesn't, because the quality of your marketing depends entirely on whether what we believe is true.",
      "If something here is wrong, flag it — the next draft won't use it.",
    ],
  },
  "/workspace": {
    title: "Why one sentence is enough",
    body: [
      "The best marketing usually starts from something that actually happened this week — a job, a question, a complaint.",
      "You don't need to write it well. Tell us what happened and we'll do the writing.",
    ],
  },
};

export function Guidance() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const entry = GUIDANCE[pathname];

  /* Every way in needs a way out that doesn't require finding a target.
   * Escape closes it, focus moves into the panel when it opens so the
   * next Tab is inside rather than back at the top of the page, and it
   * returns to the button on close so the keyboard user's place is kept. */
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function dismiss() {
    setOpen(false);
    trigger.current?.focus();
  }

  if (!entry) return null;

  return (
    <>
      {/* No aria-label. It would replace the accessible name with "Why this
       * page matters: …", which no longer starts with the visible text —
       * the WCAG 2.5.3 failure our own rules call out, where a speech-input
       * user says what they see and nothing happens. */}
      <button
        type="button"
        ref={trigger}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="pressable t-meta inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line px-3 text-ink-3 hover:border-ink-3 hover:text-ink"
      >
        <HelpCircle aria-hidden className="h-3.5 w-3.5 shrink-0" />
        Why this matters
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-scrim p-4 sm:items-center"
          onClick={dismiss}
        >
          <div
            data-testid="guidance"
            role="dialog"
            aria-modal="true"
            aria-label={entry.title}
            onClick={(e) => e.stopPropagation()}
            className="surface w-full max-w-md rounded-2xl p-5 shadow-overlay"
          >
            <div className="flex items-start gap-3">
              <p className="t-title flex-1">{entry.title}</p>
              <button
                type="button"
                ref={close}
                onClick={dismiss}
                aria-label="Close"
                className="pressable -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-3 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {entry.body.map((p) => (
              <p key={p} className="t-body mt-3">
                {p}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
