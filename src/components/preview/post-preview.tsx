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
import { PlatformMark } from "@/components/preview/platform-mark";
import { cn } from "@/lib/utils";

export type Platform = "facebook" | "linkedin" | "google_business";

export const PLATFORM_NAME: Record<Platform, string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  google_business: "Google Business",
};

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
  /** e.g. "Facebook · ready for Tue 9 AM". */
  meta: string;
  children: React.ReactNode;
  withImage?: boolean;
  imageLabel?: string;
  /** Renders naked (no card chrome) when the parent object supplies it. */
  bare?: boolean;
  className?: string;
};

/**
 * The platform-style render: accurate enough for confident review —
 * framing, constraints, action row — deliberately not a pixel clone.
 * The client judges the real thing, so this is the most contrasted,
 * most readable block on any screen.
 */
export function PostPreview({
  platform,
  businessName,
  avatarInitial,
  meta,
  children,
  withImage,
  imageLabel = "before & after photo",
  bare,
  className,
}: PostPreviewProps) {
  return (
    <div
      data-platform={platform}
      className={cn(
        "overflow-hidden",
        bare ? "" : "surface rounded-xl",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
        <div className="relative shrink-0">
          <div
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full bg-paper font-display text-sm font-bold text-ink"
          >
            {avatarInitial}
          </div>
          <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-card ring-1 ring-line">
            <PlatformMark platform={platform} className="h-2.5 w-2.5" />
          </span>
        </div>
        <div className="min-w-0">
          <div className="truncate t-ui font-semibold">
            {businessName}
          </div>
          <div className="t-meta truncate">{meta}</div>
        </div>
      </div>
      <div className="t-body px-4 pb-3">{children}</div>
      {withImage ? (
        <div
          data-testid="image-slot"
          className="mx-4 mb-3 flex h-20 items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper text-ink-3"
        >
          <ImageIcon aria-hidden className="h-3.5 w-3.5" />
          <span className="t-meta">{imageLabel}</span>
        </div>
      ) : null}
      <div className="flex justify-around border-t border-line bg-paper/60 py-2">
        {PLATFORM_ACTIONS[platform].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 t-meta font-sans text-ink-3"
          >
            <Icon aria-hidden className="h-3.5 w-3.5" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
