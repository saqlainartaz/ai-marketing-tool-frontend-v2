import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type QuietLinkProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  /** Trailing arrow — on by default, since these all lead somewhere. */
  arrow?: boolean;
  className?: string;
};

/**
 * The secondary way onward. Not a button — these never commit anything —
 * but a real target: 44px tall, because before this the app was full of
 * 11px underlined links roughly 16px high, which is under even the WCAG
 * 2.2 AA floor and hopeless for a thumb.
 *
 * One component so they also stop drifting: the same link appeared with
 * py-1, with min-h-6, and with no padding at all, in the same product.
 */
export function QuietLink({
  children,
  href,
  onClick,
  arrow = true,
  className,
}: QuietLinkProps) {
  const classes = cn(
    "pressable t-sub inline-flex min-h-11 items-center gap-1.5 rounded-lg underline decoration-line underline-offset-4 hover:decoration-ink-2 hover:text-ink",
    className,
  );
  const body = (
    <>
      {children}
      {arrow ? <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0" /> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  );
}
