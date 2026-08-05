"use client";

import { useState } from "react";
import { CalendarClock, ChevronDown, PenLine, Radio } from "lucide-react";
import type { Rationale } from "@/lib/fixtures/clients";

const LINES: {
  key: keyof Rationale;
  label: string;
  icon: typeof Radio;
}[] = [
  { key: "moment", label: "Why now", icon: CalendarClock },
  { key: "channel", label: "Why here", icon: Radio },
  { key: "shape", label: "Why it reads this way", icon: PenLine },
];

/**
 * The product's through-line, made visible.
 *
 * Most in-app guidance explains the interface — which is the version NN/g
 * found doesn't work, because it interrupts and isn't remembered. This
 * explains the *marketing* instead, and it serves four different people
 * from one mechanism: the Operator never opens it and loses nothing, the
 * Professional uses it as justification, the Newcomer learns something over
 * a month of reading it, and the Authority audits our thinking against
 * their own.
 *
 * Collapsed by default, always. A client in a hurry must never have to
 * dismiss it.
 */
export function WhyThis({ rationale }: { rationale: Rationale }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="pressable t-sub flex min-h-11 w-full items-center gap-2 rounded-xl border border-line bg-card px-3 text-left hover:border-ink-3"
      >
        <span className="flex-1 font-medium">Why this?</span>
        <span className="t-meta">the thinking behind it</span>
        <ChevronDown
          aria-hidden
          className={`h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          data-testid="why-this"
          className="mt-2 space-y-3 rounded-xl border border-line bg-paper px-4 py-3"
        >
          {LINES.map(({ key, label, icon: Icon }) => (
            <li key={key} className="flex gap-3">
              <Icon
                aria-hidden
                className="mt-1 h-4 w-4 shrink-0 text-clay"
                strokeWidth={2}
              />
              <span className="min-w-0">
                <span className="t-label block">{label}</span>
                <span className="t-sub mt-1 block text-ink">
                  {rationale[key]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
