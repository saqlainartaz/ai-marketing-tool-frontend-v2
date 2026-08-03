"use client";

import { useState } from "react";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import {
  useContentItems,
  markPosted,
  publishedWithoutApprovalCount,
  type ContentItem,
  type ContentStatus,
} from "@/lib/store/content";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ContentStatus, string> = {
  ready: "Waiting for you",
  approved: "Approved · in the queue",
  posted: "Posted",
  skipped: "Skipped",
};

const STATUS_TONE: Record<ContentStatus, string> = {
  ready: "text-clay-deep bg-clay-mist",
  approved: "text-moss bg-moss-mist",
  posted: "text-moss bg-moss-mist",
  skipped: "text-ink-3 bg-card border border-line",
};

/**
 * Everything made, and what happened to it — the archive that answers
 * "what went out, when." The handoff sheet is how the loop closes in v2:
 * copy / download / share / mark as posted. It publishes nothing.
 */
export default function LibraryPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const items = useContentItems(clientId);
  const [filter, setFilter] = useState<ContentStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const shown = items.filter((i) => filter === "all" || i.status === filter);

  async function copyText(item: ContentItem) {
    try {
      await navigator.clipboard.writeText(item.editedBody ?? item.body);
      setNote("Copied — paste it anywhere");
    } catch {
      setNote("Couldn't reach your clipboard — select the text instead");
    }
  }

  function download(item: ContentItem) {
    const blob = new Blob([item.editedBody ?? item.body], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${client.businessName.replaceAll(" ", "-")}-${item.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setNote("Downloaded as text");
  }

  async function shareLink(item: ContentItem) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/review/${item.id} (no login needed)`,
      );
      setNote("Review link copied — anyone can read it, nobody can publish it");
    } catch {
      setNote("Couldn't reach your clipboard");
    }
  }

  return (
    <>
      <div className="w-full lg:max-w-3xl">
      <h1 className="font-display text-[26px] font-semibold tracking-tight lg:text-[32px]">
        Library
      </h1>
      <p className="mt-1 text-xs text-ink-2">What went out, and when.</p>

      <CardShell className="mt-4">
        <p className="text-xs text-ink-2">
          Published without your approval, all time:{" "}
          <b className="text-ink">{publishedWithoutApprovalCount()}</b>
        </p>
      </CardShell>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(["all", "ready", "approved", "posted", "skipped"] as const).map(
          (f) => (
            <Chip key={f} selected={filter === f} onToggle={() => setFilter(f)}>
              {f === "all" ? "Everything" : STATUS_LABEL[f]}
            </Chip>
          ),
        )}
      </div>

      {note ? (
        <p className="mt-3 rounded-xl bg-moss-mist px-3 py-2 text-[11.5px] text-moss">
          ✓ {note}
        </p>
      ) : null}

      <div className="mt-4 space-y-2.5">
        {shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-2">
            Nothing here yet — approve something on Today and it lands here.
          </p>
        ) : (
          shown.map((item) => (
            <CardShell key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="block w-full cursor-pointer text-left"
                aria-expanded={openId === item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10.5px] text-ink-3">
                      {item.meta}
                      {item.pillar ? ` · ${item.pillar}` : ""}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[13px]">
                      {item.editedBody ?? item.body}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap",
                      STATUS_TONE[item.status],
                    )}
                  >
                    {STATUS_LABEL[item.status]}
                    {item.postedAt ? ` · ${item.postedAt}` : ""}
                  </span>
                </div>
              </button>

              {openId === item.id &&
              (item.status === "approved" || item.status === "posted") ? (
                <div
                  className="mt-3 border-t border-dashed border-line pt-3"
                  data-testid="handoff-sheet"
                >
                  <div className="flex flex-wrap gap-1.5">
                    <Chip onToggle={() => copyText(item)}>📋 Copy text</Chip>
                    <Chip onToggle={() => download(item)}>⬇ Download</Chip>
                    <Chip onToggle={() => shareLink(item)}>
                      🔗 Share review link
                    </Chip>
                    {item.status === "approved" ? (
                      <Chip
                        onToggle={() => {
                          markPosted(clientId, item.id);
                          setNote("Marked as posted — it's in the record");
                        }}
                      >
                        ✓ Mark as posted
                      </Chip>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[10.5px] text-ink-3">
                    Marking as posted is a record, not a publish — nothing
                    here can post for you.
                  </p>
                </div>
              ) : null}
            </CardShell>
          ))
        )}
      </div>
      </div>
    </>
  );
}
