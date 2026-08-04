"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type ActionButtonProps = {
  children: React.ReactNode;
  /** Consequence: what + when + undo. Rendered under the label. */
  consequence?: string;
  variant?: "solid" | "ghost" | "quiet";
  size?: "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

/**
 * The commitment. One solid per screen — it is the only accent-filled
 * element allowed. Compact and precise rather than a stadium blob: a
 * decision, not a billboard.
 *
 * The consequence line is attached with aria-describedby rather than left
 * inside the button, so the accessible name stays equal to the visible
 * label. WCAG 2.5.3 (Label in Name) wants speech-input users to be able to
 * say what they see: "approve post", not "approve post pull it back
 * anytime".
 */
export function ActionButton({
  children,
  consequence,
  variant = "solid",
  size = "md",
  onClick,
  disabled,
  type = "button",
  className,
}: ActionButtonProps) {
  const describedBy = useId();
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-describedby={consequence ? describedBy : undefined}
      className={cn(
        "group inline-flex w-full flex-col items-center justify-center rounded-lg font-semibold transition-[transform,background-color,border-color] duration-150 active:translate-y-px",
        size === "lg" ? "px-5 py-3.5 text-[15px]" : "px-4 py-3 text-[14px]",
        !disabled && "cursor-pointer",
        variant === "solid" &&
          !disabled &&
          "bg-clay text-onact shadow-[inset_0_1px_0_color-mix(in_srgb,white_18%,transparent),0_1px_2px_color-mix(in_srgb,var(--ink)_25%,transparent)] hover:brightness-110",
        variant === "solid" &&
          disabled &&
          "cursor-not-allowed border border-line bg-paper text-ink-3",
        variant === "ghost" &&
          "border border-line bg-card text-ink hover:border-ink-3",
        variant === "quiet" && "text-ink-2 hover:text-ink",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">{children}</span>
      {consequence ? (
        <span
          id={describedBy}
          /* Hidden from name-from-content so the accessible name equals the
           * visible label; aria-describedby still resolves it, so the
           * consequence is announced as a description. */
          aria-hidden
          className={cn(
            "mt-1 font-mono text-[10.5px] font-normal tracking-tight",
            variant === "solid" && !disabled ? "opacity-75" : "text-ink-3",
          )}
        >
          {consequence}
        </span>
      ) : null}
    </button>
  );
}
