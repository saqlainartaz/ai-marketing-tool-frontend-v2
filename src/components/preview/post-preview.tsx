import { cn } from "@/lib/utils";

export type Platform = "facebook" | "linkedin" | "google_business";

const PLATFORM_ACTIONS: Record<Platform, string[]> = {
  facebook: ["👍 Like", "💬 Comment", "↗ Share"],
  linkedin: ["👍 Like", "💬 Comment", "↺ Repost"],
  google_business: ["📞 Call", "🌐 Website", "📍 Directions"],
};

type PostPreviewProps = {
  platform: Platform;
  businessName: string;
  avatarInitial: string;
  /** e.g. "Facebook · ready for Tue 9 AM" — consequence lives on the object. */
  meta: string;
  /** Body accepts nodes so provenance spans can be woven in (M2). */
  children: React.ReactNode;
  /** Renders the before/after image placeholder slot. */
  withImage?: boolean;
  className?: string;
};

/**
 * Platform-style preview — accurate enough for confident review (framing,
 * constraints, action row), deliberately not a pixel-perfect network clone.
 * The content IS the interface: clients judge the real thing.
 */
export function PostPreview({
  platform,
  businessName,
  avatarInitial,
  meta,
  children,
  withImage,
  className,
}: PostPreviewProps) {
  return (
    <div
      data-platform={platform}
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-1.5">
        <div
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-clay-mist font-display text-sm font-bold text-clay-deep"
        >
          {avatarInitial}
        </div>
        <div>
          <div className="text-xs font-semibold">{businessName}</div>
          <div className="text-[10.5px] text-ink-3">{meta}</div>
        </div>
      </div>
      <div className="px-3.5 pb-2.5 pt-0.5 text-[13px] leading-relaxed">
        {children}
      </div>
      {withImage ? (
        <div
          data-testid="image-slot"
          className="relative h-32 bg-[linear-gradient(105deg,var(--clay-mist)_49.6%,var(--line)_50.4%)]"
        >
          <span className="absolute top-2 left-2.5 text-[9px] tracking-widest text-ink-3 uppercase">
            before
          </span>
          <span className="absolute top-2 right-2.5 text-[9px] tracking-widest text-ink-3 uppercase">
            after
          </span>
        </div>
      ) : null}
      <div className="flex justify-around border-t border-line py-1.5 text-[10.5px] text-ink-3">
        {PLATFORM_ACTIONS[platform].map((a) => (
          <span key={a}>{a}</span>
        ))}
      </div>
    </div>
  );
}
