import { cn } from "@/lib/utils";

type CardShellProps = {
  children: React.ReactNode;
  /** Primary = the one highlighted card ("start here"). */
  primary?: boolean;
  className?: string;
};

/** The universal card container — every card type renders inside one of these. */
export function CardShell({ children, primary, className }: CardShellProps) {
  return (
    <div
      data-primary={primary ? "true" : undefined}
      className={cn(
        "rounded-2xl border bg-card p-4",
        primary ? "border-[1.5px] border-clay bg-clay-mist" : "border-line",
        className,
      )}
    >
      {children}
    </div>
  );
}
