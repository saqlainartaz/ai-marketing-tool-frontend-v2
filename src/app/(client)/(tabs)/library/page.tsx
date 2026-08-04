"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarRange,
  CheckCheck,
  Copy,
  Download,
  Link2,
  List,
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
  unmarkPosted,
  publishedWithoutApprovalCount,
  type ContentItem,
  type ContentStatus,
} from "@/lib/store/content";
import { PLATFORM_NAME } from "@/components/preview/post-preview";
import { PlatformMark } from "@/components/preview/platform-mark";
import { useStatus } from "@/components/system/StatusProvider";
import { WeekCalendar } from "@/components/library/WeekCalendar";
import { MonthCalendar } from "@/components/library/MonthCalendar";
import { Chip } from "@/components/ui/chip";
import { SectionLabel } from "@/components/ui/section-label";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ContentStatus, string> = {
  ready: "Needs your yes",
  approved: "In the queue",
  posted: "Posted",
  skipped: "Skipped",
};

const STATUS_DOT: Record<ContentStatus, string> = {
  ready: "bg-clay",
  approved: "bg-moss",
  posted: "bg-moss",
  skipped: "bg-line",
};

const KIND_ICON = {
  post: PenLine,
  review_reply: MessageSquareQuote,
  email: Mail,
} as const;

const GROUPS: { key: ContentStatus; title: string }[] = [
  { key: "ready", title: "Needs your yes" },
  { key: "approved", title: "In the queue" },
  { key: "posted", title: "Posted" },
  { key: "skipped", title: "Skipped" },
];

/**
 * The archive: what went out, and when. Two ways to read it — the week
 * (the question clients actually ask) and the list, grouped by state so
 * the page has rhythm instead of a wall of identical rows.
 */
export default function LibraryPage() {
  const clientId = useClientId();
  const client = getFixtureClient(clientId);
  const items = useContentItems(clientId);
  const [view, setView] = useState<"week" | "month" | "list">("week");
  const [openId, setOpenId] = useState<string | null>(null);
  const { announce } = useStatus();

  const weekItems = items.filter(
    (i) => i.scheduledFor && i.status !== "skipped",
  );

  async function copyText(item: ContentItem) {
    try {
      await navigator.clipboard.writeText(item.editedBody ?? item.body);
      announce("Copied");
    } catch {
      announce("Couldn't copy — select the text instead", { tone: "problem" });
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
    announce("Downloaded");
  }

  async function shareLink(item: ContentItem) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/review/${item.id} (no login needed)`,
      );
      announce("Review link copied");
    } catch {
      announce("Couldn't copy the link — try again", { tone: "problem" });
    }
  }

  function Handoff({ item }: { item: ContentItem }) {
    if (item.status !== "approved" && item.status !== "posted") return null;
    return (
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
                announce("Marked as posted", {
                  undo: () => unmarkPosted(clientId, item.id),
                });
              }}
            >
              <CheckCheck aria-hidden className="h-3 w-3" />
              Mark as posted
            </Chip>
          ) : null}
        </div>
        <p className="t-meta mt-2.5">
          Marking as posted is a record, not a publish — nothing here can post
          for you.
        </p>
      </div>
    );
  }

  function Row({ item, last }: { item: ContentItem; last: boolean }) {
    const Icon = KIND_ICON[item.kind ?? "post"];
    const open = openId === item.id;
    const label =
      item.kind === "review_reply"
        ? "Google review reply"
        : item.kind === "email"
          ? "Email"
          : PLATFORM_NAME[item.platform];
    return (
      <li className={cn(!last && "border-b border-line")}>
        <button
          type="button"
          onClick={() => setOpenId(open ? null : item.id)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-paper/50"
        >
          <span className="mt-0.5 flex shrink-0 items-center gap-1.5">
            <span
              aria-hidden
              className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[item.status])}
            />
            <PlatformMark platform={item.platform} size="sm" />
            <Icon aria-hidden className="h-3 w-3 text-ink-3" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="t-meta block truncate">
              {label}
              {item.pillar ? ` · ${item.pillar}` : ""}
              {item.postedAt ? ` · ${item.postedAt}` : ""}
            </span>
            <span className="mt-0.5 line-clamp-1 text-[13.5px]">
              {item.editedBody ?? item.body}
            </span>
          </span>
        </button>
        {open ? <Handoff item={item} /> : null}
      </li>
    );
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

      {/* View switch */}
      <div className="mt-6 inline-flex rounded-lg border border-line bg-card p-0.5">
        {(["week", "month", "list"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] transition-colors",
              view === v
                ? "bg-ink font-semibold text-paper"
                : "text-ink-2 hover:text-ink",
            )}
          >
            {v === "week" ? (
              <CalendarDays aria-hidden className="h-3.5 w-3.5" />
            ) : v === "month" ? (
              <CalendarRange aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <List aria-hidden className="h-3.5 w-3.5" />
            )}
            {v === "week"
              ? "This week"
              : v === "month"
                ? "Full calendar"
                : "Everything"}
          </button>
        ))}
      </div>

      {view === "week" ? (
        <div className="mt-5">
          <WeekCalendar
            items={items}
            onSelect={(id) => setOpenId(openId === id ? null : id)}
          />
          {/* The grid answers "when"; the week's items answer "what" —
              together they fill the page honestly, even on a light week. */}
          <div className="mt-8">
            <SectionLabel right={`${weekItems.length}`}>
              Prepared for this week
            </SectionLabel>
            {weekItems.length > 0 ? (
              <ul className="surface mt-3 overflow-hidden rounded-xl">
                {weekItems.map((item, i) => (
                  <Row
                    key={item.id}
                    item={item}
                    last={i === weekItems.length - 1}
                  />
                ))}
              </ul>
            ) : (
              /* A quiet week is not the same as an empty account, so it
                 says which one this is and points at the one action that
                 changes it. */
              <div className="surface mt-3 rounded-xl px-4 py-8 text-center">
                <p className="text-[13.5px] font-semibold">
                  Nothing scheduled this week.
                </p>
                <p className="t-sub mx-auto mt-1 max-w-xs">
                  Approve a draft on Today and it takes a slot here.
                </p>
                <Link
                  href="/today"
                  className="t-meta mt-3 inline-block py-1 underline underline-offset-4"
                >
                  Go to Today
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : view === "month" ? (
        <div className="mt-5">
          <MonthCalendar
            items={items}
            onSelect={(id) => setOpenId(openId === id ? null : id)}
          />
          {openId ? (
            <div className="mt-6">
              <SectionLabel>Selected</SectionLabel>
              <ul className="surface mt-3 overflow-hidden rounded-xl">
                {items
                  .filter((i) => i.id === openId)
                  .map((item) => (
                    <Row key={item.id} item={item} last />
                  ))}
              </ul>
            </div>
          ) : (
            <p className="t-meta mt-4">
              Tap any mark to read what&apos;s prepared for that day.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-7">
          {GROUPS.map((group) => {
            const rows = items.filter((i) => i.status === group.key);
            if (rows.length === 0) return null;
            return (
              <div key={group.key}>
                <SectionLabel right={`${rows.length}`}>
                  {group.title}
                </SectionLabel>
                <ul className="surface mt-3 overflow-hidden rounded-xl">
                  {rows.map((item, i) => (
                    <Row key={item.id} item={item} last={i === rows.length - 1} />
                  ))}
                </ul>
              </div>
            );
          })}
          {items.length === 0 ? (
            <div className="surface rounded-xl py-10 text-center">
              <p className="text-[13.5px] font-semibold">
                Nothing in the record yet.
              </p>
              <p className="t-sub mx-auto mt-1 max-w-xs">
                Approve a draft and it lands here, with its sources and its
                history.
              </p>
              <Link
                href="/today"
                className="t-meta mt-3 inline-block py-1 underline underline-offset-4"
              >
                Go to Today
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
