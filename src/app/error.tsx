"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { StateScreen } from "@/components/system/StateScreen";

/**
 * The failure path, designed rather than defaulted.
 *
 * Copy rules applied: say what happened and what to do, never blame the
 * user, no error codes or jargon in front of a client, and no "please"
 * (GOV.UK error-message guidance). The one promise that matters when
 * something breaks is that nothing went out — so it is on screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5">
      <StateScreen
        icon={TriangleAlert}
        tone="warn"
        title="This page didn't load."
        body="Nothing was sent and nothing was lost. Try again in a moment."
        action={
          <div className="space-y-2">
            <ActionButton onClick={reset} consequence="reloads this page only">
              Try again
            </ActionButton>
            <p className="t-meta">
              Still stuck? Reply to your invite email and we&apos;ll sort it.
            </p>
          </div>
        }
      />
    </div>
  );
}
