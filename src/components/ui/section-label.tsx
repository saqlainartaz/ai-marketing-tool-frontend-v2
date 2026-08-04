import { cn } from "@/lib/utils";

/**
 * Mono eyebrow + optional hairline rule. Structural device: it says
 * "a new kind of thing starts here" without adding a heavy heading.
 */
export function SectionLabel({
  children,
  right,
  rule = true,
  className,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  rule?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline gap-3",
        rule && "pb-2",
        className,
      )}
    >
      <span className="t-label shrink-0">{children}</span>
      {rule ? <span className="h-px flex-1 bg-line" aria-hidden /> : null}
      {right ? <span className="t-meta shrink-0">{right}</span> : null}
    </div>
  );
}
