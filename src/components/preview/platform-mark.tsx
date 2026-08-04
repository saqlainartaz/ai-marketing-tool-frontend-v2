import type { Platform } from "@/components/preview/post-preview";
import { cn } from "@/lib/utils";

/**
 * Real platform marks. A client recognises "Facebook" from its glyph a
 * beat faster than from the word — and a correct brand mark is the
 * difference between "a preview" and "my post". Paths are the public
 * brand glyphs (simple-icons, CC0); colour is the brand's own so the
 * mark stays recognisable in every theme.
 */

const PATHS: Record<Platform, { d: string; color: string; label: string }> = {
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0A66C2",
    d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  google_business: {
    label: "Google Business",
    color: "#4285F4",
    d: "M12 11v2.4h5.7c-.23 1.5-1.74 4.4-5.7 4.4-3.43 0-6.23-2.84-6.23-6.34S8.57 5.12 12 5.12c1.95 0 3.26.83 4.01 1.55l2.73-2.63C16.99 2.38 14.7 1.4 12 1.4 6.48 1.4 2 5.88 2 11.4s4.48 10 10 10c5.77 0 9.6-4.06 9.6-9.77 0-.66-.07-1.16-.16-1.66H12z",
  },
};

export function PlatformMark({
  platform,
  size = "md",
  className,
}: {
  platform: Platform;
  size?: "sm" | "md";
  className?: string;
}) {
  const mark = PATHS[platform];
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={mark.label}
      className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", className)}
      style={{ color: mark.color }}
    >
      <path fill="currentColor" d={mark.d} />
    </svg>
  );
}
