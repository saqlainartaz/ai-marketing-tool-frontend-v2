import type { LucideIcon } from "lucide-react";
import { CardShell } from "@/components/ui/card-shell";

type StateScreenProps = {
  icon: LucideIcon;
  /** States what happened, as a short phrase with a period. */
  title: string;
  /** Under 14 words, active voice, says what happens next. */
  body: string;
  /** Verb + the same noun the title uses. */
  action?: React.ReactNode;
  tone?: "neutral" | "warn";
};

/**
 * One anatomy for every "there is nothing here / something went wrong"
 * screen, so they read as the same product rather than six improvisations.
 *
 * The shape follows Stripe's empty-state pattern: the title states what is
 * missing or what happened, the body explains in one short active sentence
 * when content will appear or how to recover, and the action mirrors the
 * title's noun instead of a generic "Get started".
 */
export function StateScreen({
  icon: Icon,
  title,
  body,
  action,
  tone = "neutral",
}: StateScreenProps) {
  return (
    <CardShell className="py-10 text-center">
      <span
        aria-hidden
        className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
          tone === "warn" ? "bg-honey-mist text-honey" : "bg-paper text-ink-3"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <p className="t-title">{title}</p>
      <p className="t-sub mx-auto mt-2 max-w-xs">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </CardShell>
  );
}
