"use client";

import { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ActionButtonProps = {
  children: React.ReactNode;
  /** Consequence: what + when + undo. Rendered under the label. */
  consequence?: string;
  variant?: "solid" | "ghost" | "quiet";
  size?: "md" | "lg";
  onClick?: () => void;
  /** When the commitment is "go somewhere", render as a link, not a
   *  button wrapped in one — that nests two interactive elements. */
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

/**
 * The commitment — one of the system's three product primitives.
 *
 * One solid per screen: it is the only accent-filled element allowed.
 * Compact and precise rather than a stadium blob — a decision, not a
 * billboard. Every variant is at least 44px tall, because this is the
 * control the whole product exists to offer and it is pressed with a
 * thumb.
 *
 * The consequence line is attached with aria-describedby rather than left
 * inside the button, so the accessible name stays equal to the visible
 * label. WCAG 2.5.3 (Label in Name) wants speech-input users to be able to
 * say what they see: "approve post", not "approve post pull it back
 * anytime".
 *
 * Disabled is styled for EVERY variant. Ghost and quiet used to render
 * identically whether disabled or not, so the only cue was a missing
 * cursor — invisible until you tried and nothing happened.
 */
export function ActionButton({
  children,
  consequence,
  variant = "solid",
  size = "md",
  onClick,
  href,
  disabled,
  type = "button",
  className,
}: ActionButtonProps) {
  const describedBy = useId();
  const body = (
    <>
      <span className="inline-flex items-center gap-1.5">{children}</span>
      {consequence ? (
        <span
          id={describedBy}
          /* Hidden from name-from-content so the accessible name equals the
           * visible label; aria-describedby still resolves it, so the
           * consequence is announced as a description. */
          aria-hidden
          className={cn(
            "mt-0.5 t-meta font-normal tracking-tight",
            variant === "solid" && !disabled ? "opacity-80" : "text-ink-3",
          )}
        >
          {consequence}
        </span>
      ) : null}
    </>
  );
  const classes = cn(
    "pressable group inline-flex w-full flex-col items-center justify-center rounded-lg font-semibold",
    size === "lg"
      ? "min-h-13 px-5 py-3 t-body leading-tight"
      : "min-h-11 px-4 py-2.5 t-ui leading-tight",
    disabled && "is-off",
    variant === "solid" && !disabled && "mark-commitment hover:brightness-110",
    variant === "solid" && disabled && "border border-line",
    variant === "ghost" &&
      !disabled &&
      "border border-line bg-card text-ink hover:border-ink-3",
    variant === "ghost" && disabled && "border border-dashed",
    variant === "quiet" && !disabled && "text-ink-2 hover:text-ink",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-describedby={consequence ? describedBy : undefined}
        className={classes}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-describedby={consequence ? describedBy : undefined}
      className={classes}
    >
      {body}
    </button>
  );
}
