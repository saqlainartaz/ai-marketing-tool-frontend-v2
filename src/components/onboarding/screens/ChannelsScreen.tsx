"use client";

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
      sub="Tap once for using now, twice for want to try."
      onBack={onBack}
      footer={
        <>
          <ActionButton onClick={onNext}>Next →</ActionButton>
          <button
            type="button"
            onClick={onNext}
            className="mt-2.5 w-full cursor-pointer text-center text-xs text-ink-2"
          >
            Not sure — you decide
          </button>
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
                "cursor-pointer rounded-full border px-3.5 py-2 text-xs transition-colors",
                !state && "border-line bg-card text-ink-2",
                state === "now" && "border-clay bg-clay-mist font-semibold text-ink",
                state === "want" &&
                  "border-dashed border-clay bg-transparent font-semibold text-clay-deep",
              )}
            >
              {channel}
              {state === "now" && " · using"}
              {state === "want" && " · want to try"}
            </button>
          );
        })}
      </div>
    </ScreenFrame>
  );
}
