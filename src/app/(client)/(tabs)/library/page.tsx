"use client";

import { useState } from "react";
import {
  CheckCheck,
  Copy,
  Download,
  Link2,
  Mail,
  MessageSquareQuote,
  PenLine,
  ShieldCheck,
} from "lucide-react";
import { useClientId } from "@/components/auth/ClientSession";
import { getFixtureClient } from "@/lib/fixtures/clients";
import {
  useContentItems,
  markPosted,
  publishedWithoutApprovalCount,
  type ContentItem,
  type ContentStatus,
} from "@/lib/store/content";
import { PLATFORM_NAME } from "@/components/preview/post-preview";
import { CardShell } from "@/components/ui/card-shell";
import { Chip } from "@/components/ui/chip";
import { SectionLabel } from "@/components/ui/section-label";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ContentStatus, string> = {
  ready: "Waiting for you",
  approved: "In the queue",
  posted: "Posted",
  skipped: "Skipped",
};

const STATUS_TONE: Record<ContentStatus, string> = {
  ready: "border-clay/40 bg-clay-mist text-ink",
  approved: "border-moss/30 bg-moss-mist text-moss",
  posted: "border-moss/30 bg-moss-mist text-moss",
  skipped: "border-line bg-paper text-ink-3",
};

const KIND_ICON = {
  post: PenLine,
  review_reply: MessageSquareQuote,
  email: Mail,
} as const;

/**
 * The archive: what went out, and when. The handoff kit is how the loop
 * closes in v2 — copy, download, share, mark posted. It publishes nothing.
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
    <div className="w-full lg:max-w-3xl">
      <p className="t-label">Library</p>
      <h1 className="t-display mt-3">What went out, and when.</h1>

      <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-moss/30 bg-moss-mist px-4 py-3">
        <ShieldCheck aria-hidden className="h-4 w-4 shrink-0 text-moss" />
        <p className="text-[13px]">
          Published without your approval, all time:{" "}
          <b className="font-mono">{publishedWithoutApprovalCount()}</b>
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {(["all", "ready", "approved", "posted", "skipped"] as const).map(
          (f) => (
            <Chip key={f} selected={filter === f} onToggle={() => setFilter(f)}>
              {f === "all" ? "Everything" : STATUS_LABEL[f]}
            </Chip>
          ),
        )}
      </div>

      {note ? (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-moss-mist px-3 py-2 text-[12px] text-moss">
          <CheckCheck aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {note}
        </p>
      ) : null}

      <div className="mt-5">
        <SectionLabel right={`${shown.length} items`}>
          {filter === "all" ? "Everything made" : STATUS_LABEL[filter]}
        </SectionLabel>

        <div className="mt-3 space-y-2">
          {shown.length === 0 ? (
            <CardShell quiet className="py-10 text-center">
              <p className="text-[13.5px] font-semibold">Nothing here yet</p>
              <p className="t-sub mx-auto mt-1 max-w-xs">
                Approve something on Today and it lands here — with its
                sources and its history.
              </p>
            </CardShell>
          ) : (
            shown.map((item) => {
              const Icon = KIND_ICON[item.kind ?? "post"];
              const open = openId === item.id;
              return (
                <CardShell key={item.id} className="p-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : item.id)}
                    aria-expanded={open}
                    className="flex w-full cursor-pointer items-start gap-3 p-4 text-left"
                  >
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper text-ink-3"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="t-label block truncate">
                        {item.kind === "review_reply"
                          ? "Google review reply"
                          : item.kind === "email"
                            ? "Email"
                            : PLATFORM_NAME[item.platform]}
                        {item.pillar ? ` · ${item.pillar}` : ""}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[13.5px] leading-snug">
                        {item.editedBody ?? item.body}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "t-meta shrink-0 rounded-full border px-2 py-0.5 whitespace-nowrap",
                        STATUS_TONE[item.status],
                      )}
                    >
                      {STATUS_LABEL[item.status]}
                      {item.postedAt ? ` · ${item.postedAt}` : ""}
                    </span>
                  </button>

                  {open &&
                  (item.status === "approved" || item.status === "posted") ? (
                    <div
                      className="border-t border-line bg-paper px-4 py-3"
                      data-testid="handoff-sheet"
                    >
                      <p className="t-label mb-2">Take it from here</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Chip onToggle={() => copyText(item)}>
                          <Copy aria-hidden className="h-3 w-3" />
                          Copy text
                        </Chip>
                        <Chip onToggle={() => download(item)}>
                          <Download aria-hidden className="h-3 w-3" />
                          Download
                        </Chip>
                        <Chip onToggle={() => shareLink(item)}>
                          <Link2 aria-hidden className="h-3 w-3" />
                          Share review link
                        </Chip>
                        {item.status === "approved" ? (
                          <Chip
                            onToggle={() => {
                              markPosted(clientId, item.id);
                              setNote("Marked as posted — it's in the record");
                            }}
                          >
                            <CheckCheck aria-hidden className="h-3 w-3" />
                            Mark as posted
                          </Chip>
                        ) : null}
                      </div>
                      <p className="t-meta mt-2.5">
                        Marking as posted is a record, not a publish — nothing
                        here can post for you.
                      </p>
                    </div>
                  ) : null}
                </CardShell>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
