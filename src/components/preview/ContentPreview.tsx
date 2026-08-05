import { Mail, MessageSquareQuote, Star } from "lucide-react";
import {
  PostPreview,
  PLATFORM_NAME,
  type Platform,
} from "@/components/preview/post-preview";
import { PlatformMark } from "@/components/preview/platform-mark";

export type ContentKind = "post" | "review_reply" | "email";

const KIND_NAME: Record<ContentKind, string> = {
  post: "post",
  review_reply: "review reply",
  email: "email",
};

type ContentPreviewProps = {
  kind?: ContentKind;
  platform: Platform;
  businessName: string;
  avatarInitial: string;
  meta: string;
  children: React.ReactNode;
  withImage?: boolean;
  review?: { reviewer: string; stars: number; text: string };
  subject?: string;
  /** The pillar/topic this came from — shown in the object header. */
  pillar?: string;
  /** Right-hand status word in the header ("ready", "approved"…). */
  status?: string;
};

/**
 * The prepared object: a labeled deliverable, not a floating post.
 * One header strip states what this is and where it came from; inside
 * sits the platform-accurate render. One component, many marketing
 * tools — a new tool is a new kind here, never a new screen.
 *
 * **The lit object.** This is the one element that does not follow the
 * ambient theme. `data-theme-preview="paper"` scopes the light palette to
 * it, so the post renders in the colours it will actually have on Facebook
 * or LinkedIn — white, dark text. Against the dark studio that makes it
 * literally the only lit thing on screen, which is both the accurate
 * rendering and the whole visual idea: the work under a lamp.
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
  pillar,
  status,
}: ContentPreviewProps) {
  const label =
    kind === "post"
      ? `${PLATFORM_NAME[platform]} ${KIND_NAME[kind]}`
      : kind === "review_reply"
        ? "Google review reply"
        : "Email";

  return (
    <article
      data-theme-preview="paper"
      /* text-ink is not redundant. `body` sets `color: var(--ink)`, which
       * computes once against :root — descendants inherit that resolved
       * colour, not the variable. Re-scoping the tokens here does nothing
       * to it, so the element has to re-assert its own colour or the post
       * renders light-on-light. */
      className="surface overflow-hidden rounded-xl text-ink"
    >
      {/* Object header — what this is, where it came from, its state. */}
      <header className="flex items-center gap-2 border-b border-line bg-paper px-4 py-2">
        <PlatformMark platform={platform} size="sm" className="shrink-0" />
        <span className="t-label truncate">
          {label}
          {pillar ? ` · ${pillar}` : ""}
        </span>
        {status ? (
          <span className="t-label ml-auto shrink-0 text-ink-2">{status}</span>
        ) : null}
      </header>

      {kind === "review_reply" && review ? (
        <div>
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquareQuote
                aria-hidden
                className="h-3.5 w-3.5 text-ink-3"
              />
              <span className="t-ui font-semibold">
                {review.reviewer}
              </span>
              <span
                aria-label={`${review.stars} stars`}
                className="flex gap-0.5"
              >
                {Array.from({ length: review.stars }).map((_, i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className="h-3 w-3 fill-honey text-honey"
                  />
                ))}
              </span>
            </div>
            <p className="mt-1 t-ui leading-relaxed text-ink-2 italic">
              “{review.text}”
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="t-label mb-1.5">Your reply · as {businessName}</p>
            <div className="t-body">{children}</div>
          </div>
        </div>
      ) : kind === "email" ? (
        <div>
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <Mail aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink-3" />
            <div className="min-w-0">
              <p className="t-meta truncate">{meta}</p>
              <p className="truncate t-ui font-semibold">{subject}</p>
            </div>
          </div>
          <div className="t-body px-4 py-3">{children}</div>
        </div>
      ) : (
        <PostPreview
          bare
          platform={platform}
          businessName={businessName}
          avatarInitial={avatarInitial}
          meta={meta}
          withImage={withImage}
        >
          {children}
        </PostPreview>
      )}
    </article>
  );
}
