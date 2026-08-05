"use client";

import { Check, X } from "lucide-react";
import type { FixtureClient } from "@/lib/fixtures/clients";

/**
 * What we know about how a client sounds.
 *
 * This is a do/don't pair, so it is laid out as one: two columns, each a
 * plain list under a labelled header. Pills were wrong (they read as
 * controls); so was flat prose with strikethrough (nothing to scan, and
 * struck small text is hard to read). A two-column comparison is the
 * oldest, fastest way to show "this, not that".
 */
export function VoiceCard({ client }: { client: FixtureClient }) {
  return (
    <div className="surface overflow-hidden rounded-xl">
      <p className="border-b border-line px-4 py-3.5 t-ui leading-relaxed text-ink-2 sm:px-5">
        {client.voice.summary}
      </p>

      <div className="grid sm:grid-cols-2">
        {/* Do */}
        <div className="border-b border-line px-4 py-3.5 sm:border-r sm:border-b-0 sm:px-5">
          <p className="flex items-center gap-1.5">
            <Check
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-moss"
              strokeWidth={3}
            />
            <span className="t-label">Sounds like you</span>
          </p>
          <ul className="mt-3 space-y-2.5">
            {client.voice.sounds.map((phrase) => (
              <li key={phrase} className="t-ui leading-snug">
                “{phrase}”
              </li>
            ))}
          </ul>
        </div>

        {/* Don't */}
        <div className="px-4 py-3.5 sm:px-5">
          <p className="flex items-center gap-1.5">
            <X
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-ink-3"
              strokeWidth={3}
            />
            <span className="t-label">We never use</span>
          </p>
          <ul className="mt-3 space-y-2.5">
            {client.voice.avoids.map((word) => (
              <li
                key={word}
                className="t-ui leading-snug text-ink-2"
              >
                {word}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="t-meta border-t border-line bg-paper px-4 py-2.5 sm:px-5">
        Checked against every draft before you see it · something wrong?
        Tell us.
      </p>
    </div>
  );
}
