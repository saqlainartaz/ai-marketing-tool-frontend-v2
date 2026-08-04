"use client";

import { useState } from "react";
import { ArrowRight, Lightbulb, Quote, RefreshCw } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { AssemblyMoment } from "@/components/motion/AssemblyMoment";
import { PlatformMark } from "@/components/preview/platform-mark";
import { getFixtureClient, type IdeaFixture } from "@/lib/fixtures/clients";
import { addItem } from "@/lib/store/content";
import { cn } from "@/lib/utils";

/**
 * "Show me ideas" made real. Ideas are not invented: each one is
 * something the client already said, with the line it came from. Pick
 * one and we write it — the client stays the author, we do the typing.
 */
export function IdeaCard({
  clientId,
  onWritten,
}: {
  clientId: string;
  onWritten?: () => void;
}) {
  const client = getFixtureClient(clientId);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [writing, setWriting] = useState<IdeaFixture | null>(null);
  const [done, setDone] = useState<string[]>([]);

  const shown = client.ideas.filter(
    (i) => !dismissed.includes(i.id) && !done.includes(i.id),
  );

  function write(idea: IdeaFixture) {
    setWriting(idea);
  }

  function finish() {
    if (!writing) return;
    addItem(clientId, { ...writing.produces, id: `${writing.id}-out` });
    setDone((d) => [...d, writing.id]);
    setWriting(null);
    onWritten?.();
  }

  if (writing) {
    return (
      <div className="surface rounded-xl p-4" data-testid="idea-writing">
        <p className="t-label">Writing your idea</p>
        <p className="t-title mt-1.5">{writing.title}</p>
        <div className="mt-4">
          <AssemblyMoment
            steps={[
              "Pulling the line it came from…",
              "Checking how you sound…",
              "Matching your never-do list…",
              "Drafting it.",
            ]}
            stepDelay={520}
            onDone={finish}
          />
        </div>
      </div>
    );
  }

  return (
    <div data-testid="idea-card">
      <article className="surface overflow-hidden rounded-xl">
        <header className="flex items-center gap-2 border-b border-line bg-paper px-4 py-2">
          <Lightbulb aria-hidden className="h-3.5 w-3.5 shrink-0 text-honey" />
          <span className="t-label truncate">
            Ideas from your own material
          </span>
          <span className="t-label ml-auto shrink-0 text-ink-2">
            {shown.length} waiting
          </span>
        </header>

        {shown.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[13.5px] font-semibold">
              That&apos;s every idea we had this week.
            </p>
            <p className="t-sub mx-auto mt-1 max-w-xs">
              More arrive as we read new material — or tell us what&apos;s
              happening and we&apos;ll make one.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((idea, i) => (
              <li key={idea.id} className="px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <span className="t-meta w-5 shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5">
                      <PlatformMark platform={idea.platform} size="sm" />
                      <span className="t-meta truncate">{idea.pillar}</span>
                    </p>
                    <p className="mt-1 text-[14.5px] leading-snug font-semibold">
                      {idea.title}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
                      {idea.angle}
                    </p>
                    <p className="t-meta mt-1.5 flex items-center gap-1">
                      <Quote aria-hidden className="h-2.5 w-2.5" />
                      {idea.source}
                    </p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => write(idea)}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-[12.5px] font-semibold transition-colors hover:border-clay",
                        )}
                      >
                        Write this one
                        <ArrowRight aria-hidden className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDismissed((d) => [...d, idea.id])
                        }
                        className="t-meta cursor-pointer hover:text-ink"
                      >
                        Not for me
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <footer className="flex items-center gap-2 border-t border-line bg-paper px-4 py-2.5">
          <p className="t-meta flex-1">
            Every idea traces to something you already said.
          </p>
          {dismissed.length > 0 ? (
            <button
              type="button"
              onClick={() => setDismissed([])}
              className="t-meta inline-flex shrink-0 cursor-pointer items-center gap-1 underline underline-offset-4"
            >
              <RefreshCw aria-hidden className="h-2.5 w-2.5" />
              Show the ones I skipped
            </button>
          ) : null}
        </footer>
      </article>

      {done.length > 0 ? (
        <p className="t-meta mt-3 text-center">
          {done.length} drafted — {done.length === 1 ? "it's" : "they're"}{" "}
          waiting below.
        </p>
      ) : null}
    </div>
  );
}
