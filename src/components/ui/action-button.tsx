"use client";

import { cn } from "@/lib/utils";

type ActionButtonProps = {
  children: React.ReactNode;
  /** The consequence line: what + when + undo, e.g. "Goes to your queue — pull it back anytime". */
  consequence?: string;
  variant?: "solid" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

/**
 * The one commitment per screen. Solid = the primary action (the only
 * accent-filled element allowed on a screen); the consequence line rides
 * on the button itself (Monzo rule: consequence + timing + undo at the
 * point of decision). Disabled is genuinely quiet — never a pastel accent.
 */
export function ActionButton({
  children,
  consequence,
  variant = "solid",
  onClick,
  disabled,
  type = "button",
  className,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "block w-full cursor-pointer rounded-xl px-4 py-3 text-center text-[15px] font-semibold transition-[transform,background-color] duration-150 active:scale-[0.99]",
        variant === "solid" &&
          !disabled &&
          "border-b-2 border-clay-deep bg-clay text-onact shadow-[0_1px_2px_rgb(16_19_24/0.15)] hover:brightness-[0.97]",
        variant === "solid" &&
          disabled &&
          "cursor-not-allowed border-b-2 border-line bg-line text-ink-3",
        variant === "ghost" &&
          "border border-line bg-card text-ink hover:border-ink-3",
        className,
      )}
    >
      {children}
      {consequence ? (
        <span className="mt-0.5 block text-[11px] font-medium opacity-90">
          {consequence}
        </span>
      ) : null}
    </button>
  );
}
