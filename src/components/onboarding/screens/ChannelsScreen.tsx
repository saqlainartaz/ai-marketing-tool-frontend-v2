"use client";

import { ArrowRight, Check, Plus } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { ScreenFrame } from "@/components/onboarding/ScreenFrame";
import {
  useOnboarding,
  type ChannelState,
} from "@/components/onboarding/OnboardingProvider";
import { cn } from "@/lib/utils";

export const CHANNELS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Google Business",
  "YouTube",
  "TikTok",
  "X",
  "Website",
  "Nowhere yet",
] as const;

/** Tap cycles: off → using now → want to try → off. */
function nextState(current?: ChannelState): ChannelState | undefined {
  if (!current) return "now";
  if (current === "now") return "want";
  return undefined;
}

export function ChannelsScreen({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const { answers, setAnswer } = useOnboarding();

  function toggle(channel: string) {
    const next = { ...answers.channels };
    const state = nextState(next[channel]);
    if (state) next[channel] = state;
    else delete next[channel];
    setAnswer("channels", next);
  }

  return (
    <ScreenFrame
      step="channels"
      eyebrow="Question 3 of 4"
      title="Where does your business show up today?"
      sub="Tap once for where you are. Tap again for where you'd like to be."
      onBack={onBack}
      footer={
        <>
          <ActionButton size="lg" onClick={onNext}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </ActionButton>
          <ActionButton variant="quiet" className="mt-2" onClick={onNext}>
            Not sure — you decide
          </ActionButton>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        {CHANNELS.map((channel) => {
          const state = answers.channels[channel];
          return (
            <button
              key={channel}
              type="button"
              onClick={() => toggle(channel)}
              data-state={state ?? "off"}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-card px-3 py-2 t-ui transition-colors",
                !state && "border-line text-ink-2 hover:border-ink-3 hover:text-ink",
                state === "now" &&
                  "border-clay font-semibold text-ink shadow-[inset_0_0_0_1px_var(--clay)]",
                state === "want" && "border-dashed border-clay font-medium text-ink",
              )}
            >
              {state === "now" ? (
                <Check aria-hidden className="h-3 w-3 text-clay" strokeWidth={3} />
              ) : state === "want" ? (
                <Plus aria-hidden className="h-3 w-3 text-clay" strokeWidth={3} />
              ) : null}
              {channel}
              {state === "want" ? (
                <span className="t-meta">want to try</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </ScreenFrame>
  );
}
