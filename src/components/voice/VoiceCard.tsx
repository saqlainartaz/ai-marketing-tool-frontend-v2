"use client";

import { Lock } from "lucide-react";
import type { FixtureClient } from "@/lib/fixtures/clients";

/**
 * What we know about how a client sounds.
 *
 * This is reference, not controls — so it stopped being two rows of pills.
 * Pills read as buttons: eight of them side by side gave the eye nowhere
 * to rest and implied things were clickable. Now the phrases are quoted
 * lines (they are, after all, quotations from the client) and the
 * forbidden words are one struck-through line under a single lock. Two
 * blocks to scan instead of eight objects to parse.
 */
export function VoiceCard({ client }: { client: FixtureClient }) {
  return (
    <div className="surface rounded-xl p-4 sm:p-5">
      <p className="text-[13.5px] leading-relaxed text-ink-2">
        {client.voice.summary}
      </p>

      <div className="mt-5">
        <p className="t-label">Phrases that sound like you</p>
        <ul className="mt-2.5 space-y-2 border-l-2 border-line pl-3.5">
          {client.voice.sounds.map((phrase) => (
            <li
              key={phrase}
              className="font-display text-[14px] leading-snug text-ink italic"
            >
              “{phrase}”
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <p className="t-label flex items-center gap-1.5">
          <Lock aria-hidden className="h-3 w-3" />
          Words we never use
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
          {client.voice.avoids.map((word, i) => (
            <span key={word}>
              {i > 0 ? <span aria-hidden className="px-1.5">·</span> : null}
              <span className="line-through decoration-ink-3/60">{word}</span>
            </span>
          ))}
        </p>
        <p className="t-meta mt-2">
          Checked against every draft before you see it.
        </p>
      </div>

      <p className="t-meta mt-5 border-t border-line pt-3">
        Something here wrong? Tell us — we&apos;ll fix it.
      </p>
    </div>
  );
}
