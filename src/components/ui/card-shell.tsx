import { cn } from "@/lib/utils";

type CardShellProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  /** Marks the card that wants attention first ("start here"). */
  primary?: boolean;
  /** Inset variant — sits in the page rather than on it (rails, wells). */
  quiet?: boolean;
  className?: string;
};

/**
 * The prepared object. White, raised, on the tinted desk — content is
 * always the most contrasted thing on screen.
 *
 * `primary` used to paint `ring-2 ring-clay`, which is the system's
 * *selection* signal, on a card nobody can select. It draws an accent
 * edge instead: "look here first" and "you have chosen this" are
 * different statements and shouldn't share a shape.
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
        quiet ? "border border-line bg-paper" : "surface",
        primary && "border-t-2 border-t-clay",
        className,
      )}
    >
      {children}
    </div>
  );
}
