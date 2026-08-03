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
 * The one clay action per screen. Solid = the primary commitment; the
 * consequence line rides on the button itself (Monzo rule: consequence +
 * timing + undo at the point of decision).
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
        "block w-full cursor-pointer rounded-2xl px-4 py-3.5 text-center text-[15px] font-semibold transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid" &&
          "bg-clay text-onact shadow-[0_3px_0_var(--clay-deep)]",
        variant === "ghost" && "border-[1.5px] border-ink bg-transparent text-ink",
        className,
      )}
    >
      {children}
      {consequence ? (
        <span className="mt-0.5 block text-[10.5px] font-normal opacity-90">
          {consequence}
        </span>
      ) : null}
    </button>
  );
}
