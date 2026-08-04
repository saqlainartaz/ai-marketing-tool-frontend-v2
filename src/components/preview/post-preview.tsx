import {
  Globe,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
  Repeat2,
  Share2,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Platform = "facebook" | "linkedin" | "google_business";

const PLATFORM_ACTIONS: Record<Platform, { icon: LucideIcon; label: string }[]> =
  {
    facebook: [
      { icon: ThumbsUp, label: "Like" },
      { icon: MessageCircle, label: "Comment" },
      { icon: Share2, label: "Share" },
    ],
    linkedin: [
      { icon: ThumbsUp, label: "Like" },
      { icon: MessageCircle, label: "Comment" },
      { icon: Repeat2, label: "Repost" },
    ],
    google_business: [
      { icon: Phone, label: "Call" },
      { icon: Globe, label: "Website" },
      { icon: MapPin, label: "Directions" },
    ],
  };

type PostPreviewProps = {
  platform: Platform;
  businessName: string;
  avatarInitial: string;
  /** e.g. "Facebook · ready for Tue 9 AM" — consequence lives on the object. */
  meta: string;
  /** Body accepts nodes so provenance spans can be woven in. */
  children: React.ReactNode;
  /** Renders the media slot (compact, labeled — never a void). */
  withImage?: boolean;
  imageLabel?: string;
  className?: string;
};

/**
 * Platform-style preview — accurate enough for confident review (framing,
 * constraints, action row), deliberately not a pixel-perfect clone.
 * The content IS the interface: clients judge the real thing.
 */
export function PostPreview({
  platform,
  businessName,
  avatarInitial,
  meta,
  children,
  withImage,
  imageLabel = "before & after photo",
  className,
}: PostPreviewProps) {
  return (
    <div
      data-platform={platform}
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_2px_rgb(16_19_24/0.06),0_4px_12px_rgb(16_19_24/0.05)]",
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
          <div className="text-[11px] text-ink-3">{meta}</div>
        </div>
      </div>
      <div className="px-3.5 pb-3 pt-0.5 text-[14px] leading-[1.6]">
        {children}
      </div>
      {withImage ? (
        <div
          data-testid="image-slot"
          className="mx-3.5 mb-3 flex h-24 items-center justify-center gap-2 rounded-xl border border-dashed border-ink-3/50 bg-paper text-ink-3"
        >
          <ImageIcon aria-hidden className="h-4 w-4" />
          <span className="text-[11.5px]">{imageLabel}</span>
        </div>
      ) : null}
      <div className="flex justify-around border-t border-line py-2 text-[11px] text-ink-3">
        {PLATFORM_ACTIONS[platform].map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <Icon aria-hidden className="h-3.5 w-3.5" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
