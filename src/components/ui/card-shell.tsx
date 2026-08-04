import { cn } from "@/lib/utils";

type CardShellProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  /** The one highlighted card ("start here" / selected). */
  primary?: boolean;
  /** Inset variant — sits in the page rather than on it (rails, wells). */
  quiet?: boolean;
  className?: string;
};

/**
 * The prepared object. White, raised, on the tinted desk — content is
 * always the most contrasted thing on screen. Selection is a ring, never
 * a second accent fill (the accent is a budget).
 */
export function CardShell({
  children,
  primary,
  quiet,
  className,
  ...rest
}: CardShellProps) {
  return (
    <div
      {...rest}
      data-primary={primary ? "true" : undefined}
      className={cn(
        "rounded-xl p-4",
        quiet
          ? "border border-line bg-paper"
          : "surface",
        primary && "ring-2 ring-clay ring-offset-2 ring-offset-canvas",
        className,
      )}
    >
      {children}
    </div>
  );
}
