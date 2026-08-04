import { cn } from "@/lib/utils";

type CardShellProps = {
  children: React.ReactNode;
  /** Primary = the one highlighted card ("start here" / selected). */
  primary?: boolean;
  className?: string;
};

/**
 * The universal content container: white card on the tinted canvas —
 * content is always the most contrasted thing on screen. Selection is an
 * accent border, never a second accent fill (the accent is a budget).
 */
export function CardShell({ children, primary, className }: CardShellProps) {
  return (
    <div
      data-primary={primary ? "true" : undefined}
      className={cn(
        "rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgb(16_19_24/0.06),0_4px_12px_rgb(16_19_24/0.05)]",
        primary
          ? "border-2 border-clay"
          : "border border-line",
        className,
      )}
    >
      {children}
    </div>
  );
}
