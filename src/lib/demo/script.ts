/**
 * The demo script — a client's year, in the order you'd tell it.
 *
 * Built for a sales call and the design review, not for the product's own
 * users. It exists because a walkthrough driven from memory always
 * forgets the thing that matters and always finds the one dead end.
 *
 * Each stop names what to look at, in the language you'd actually use out
 * loud. Keep the captions short: whoever is driving is talking over them.
 */

export type DemoStop = {
  href: string;
  title: string;
  /** What to point at. One sentence, said aloud, not read. */
  say: string;
};

export const DEMO_SCRIPT: DemoStop[] = [
  {
    href: "/today",
    title: "Monday morning",
    say: "A week of work, prepared. One decision at a time — and nothing here has been published.",
  },
  {
    href: "/today",
    title: "Where this came from",
    say: "Tap any underlined phrase. Every claim traces to something the client actually said, with the line it came from.",
  },
  {
    href: "/today",
    title: "Why we made it",
    say: "Open “Why this?” — the product explains the marketing thinking, not the buttons. That's the part nobody else has.",
  },
  {
    href: "/voice",
    title: "Does it sound like me?",
    say: "The voice profile, with the evidence behind every judgement. Open one and you see the line it was drawn from.",
  },
  {
    href: "/documents",
    title: "Teaching it something",
    say: "Add a transcript and watch it get read. This is the engine — the reason the drafts aren't generic.",
  },
  {
    href: "/profile",
    title: "Everything we know",
    say: "The client's legible memory. Read-only, every fact sourced, and they can flag anything that's wrong.",
  },
  {
    href: "/plan",
    title: "The plan behind it",
    say: "Not a printed strategy — the counts are live, computed from what actually got made.",
  },
  {
    href: "/library",
    title: "What went out, and when",
    say: "The archive, and the number that matters: published without your approval, all time, zero.",
  },
  {
    href: "/review/dave-2",
    title: "Sending it to someone else",
    say: "A partner or a compliance officer can review without an account. Same sources, same guardrails.",
  },
];
