import { PostPreview, type Platform } from "@/components/preview/post-preview";

export type ContentKind = "post" | "review_reply" | "email";

type ContentPreviewProps = {
  kind?: ContentKind;
  platform: Platform;
  businessName: string;
  avatarInitial: string;
  meta: string;
  children: React.ReactNode;
  withImage?: boolean;
  /** review_reply: the customer review being answered. */
  review?: { reviewer: string; stars: number; text: string };
  /** email: subject line. */
  subject?: string;
};

/**
 * One preview component, many marketing tools. The card system is
 * content-type agnostic: a new tool ships as a new kind here + a card
 * from the server — never a new screen.
 */
export function ContentPreview({
  kind = "post",
  platform,
  businessName,
  avatarInitial,
  meta,
  children,
  withImage,
  review,
  subject,
}: ContentPreviewProps) {
  if (kind === "review_reply" && review) {
    return (
      <div
        data-kind="review_reply"
        className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm"
      >
        <div className="border-b border-line bg-paper px-3.5 py-3">
          <p className="text-[10.5px] text-ink-3">{meta}</p>
          <p className="mt-1 text-xs font-semibold">
            {review.reviewer}{" "}
            <span aria-label={`${review.stars} stars`} className="text-honey">
              {"★".repeat(review.stars)}
            </span>
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-2 italic">
            “{review.text}”
          </p>
        </div>
        <div className="px-3.5 py-3">
          <p className="text-[10px] font-semibold tracking-widest text-ink-3 uppercase">
            Your reply · as {businessName}
          </p>
          <div className="mt-1.5 text-[13px] leading-relaxed">{children}</div>
        </div>
      </div>
    );
  }

  if (kind === "email") {
    return (
      <div
        data-kind="email"
        className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm"
      >
        <div className="border-b border-line px-3.5 py-2.5">
          <p className="text-[10.5px] text-ink-3">{meta}</p>
          <p className="mt-1 text-[11px] text-ink-2">
            From: <b className="text-ink">{businessName}</b>
          </p>
          <p className="text-[12.5px] font-semibold">{subject}</p>
        </div>
        <div className="px-3.5 py-3 text-[13px] leading-relaxed">
          {children}
        </div>
      </div>
    );
  }

  return (
    <PostPreview
      platform={platform}
      businessName={businessName}
      avatarInitial={avatarInitial}
      meta={meta}
      withImage={withImage}
    >
      {children}
    </PostPreview>
  );
}
