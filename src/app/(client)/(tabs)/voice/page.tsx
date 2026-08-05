"use client";

import { VoiceSurface } from "@/components/voice/VoiceSurface";
import { QuietLink } from "@/components/ui/quiet-link";
import { useClientId } from "@/components/auth/ClientSession";

/**
 * The voice profile in full. Reached from Workspace and Profile rather
 * than the nav — it's something you check occasionally and argue with,
 * not somewhere you work.
 */
export default function VoicePage() {
  const clientId = useClientId();

  return (
    <div className="w-full lg:max-w-3xl">
      <p className="t-label">How you sound</p>
      <h1 className="t-display mt-3">Your voice, and how we know.</h1>
      <p className="t-sub mt-3 max-w-xl">
        Built from your own material. Every judgement below shows what it
        rests on — open one and you&apos;ll see the line it came from.
      </p>

      <div className="mt-8">
        <VoiceSurface clientId={clientId} />
      </div>

      <div className="mt-8 border-t border-line pt-4">
        <QuietLink href="/profile">
          See everything else we know about you
        </QuietLink>
      </div>
    </div>
  );
}
