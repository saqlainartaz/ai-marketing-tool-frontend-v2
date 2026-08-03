import type { Platform } from "@/components/preview/post-preview";
import type { WorkMode } from "@/components/ui/dial-pill";

/**
 * M1A fixture clients — Dave and Amara from the walkthrough (the visual
 * contract). All names and numbers are sample data. Replaced by the real
 * BFF in M2; the shapes anticipate `client_profile` / `action_card`.
 */

export type ActionCardFixture = {
  id: string;
  type: "draft_approval" | "question" | "win";
  platform?: Platform;
  meta?: string;
  body?: string;
  withImage?: boolean;
  consequence?: string;
  /** question cards */
  prompt?: string;
  timeCost?: string;
};

export type FixtureClient = {
  id: "dave" | "amara";
  firstName: string;
  businessName: string;
  avatarInitial: string;
  workMode: WorkMode;
  /** Endowed-progress lines on S1 — work already done for them. */
  checks: string[];
  /** The confirm card rows, plain second person. */
  profileLines: string[];
  /** S5: pre-locked compliance chips + why. */
  lockedReason: string;
  lockedNeverChips: string[];
  /** S6 plan reveal. */
  plan: {
    where: string;
    what: string;
    rhythm: string;
  };
  winLine: string;
  cards: ActionCardFixture[];
};

const dave: FixtureClient = {
  id: "dave",
  firstName: "Dave",
  businessName: "Meridian Roofing",
  avatarInitial: "M",
  workMode: "handle",
  checks: [
    "Found your website",
    "Read your ISTV episode (March)",
    "Read 34 of your customer reviews",
  ],
  profileLines: [
    "You run Meridian Roofing — residential roofing in Austin.",
    "Your customers: homeowners needing repairs & replacements.",
    "You're on Facebook and have a website.",
  ],
  lockedReason: "Because you're a licensed trade:",
  lockedNeverChips: ["No guarantee claims", "No pricing promises"],
  plan: {
    where:
      "Google Business first — your customers search when the roof leaks. Facebook second — neighbors recommend roofers there.",
    what: "Before & after jobs · Questions customers always ask · Storm-season prep",
    rhythm: "2 posts a week — about 10 minutes of your time.",
  },
  winLine: "Your last post reached 412 neighbors",
  cards: [
    {
      id: "dave-1",
      type: "draft_approval",
      platform: "facebook",
      meta: "Facebook · ready for Tue 9 AM",
      body: "Hail season's coming, Austin. Last month we caught three roofs their owners thought were fine. Here's the 10-minute check you can do from the ground — no ladder needed. 👇",
      withImage: true,
      consequence: "pull it back anytime",
    },
    {
      id: "dave-2",
      type: "draft_approval",
      platform: "google_business",
      meta: "Google Business · ready for Thu 9 AM",
      body: "Before & after from Lakeway Ave — full replacement in two days, family in the house the whole time.",
      withImage: true,
      consequence: "pull it back anytime",
    },
    {
      id: "dave-3",
      type: "draft_approval",
      platform: "facebook",
      meta: "Facebook · ready for Sat 10 AM",
      body: "The #1 question we get every storm season: \"Should I file a claim?\" Here's how to know in five minutes — before you call anyone.",
      consequence: "pull it back anytime",
    },
  ],
};

const amara: FixtureClient = {
  id: "amara",
  firstName: "Amara",
  businessName: "Osei Family Law",
  avatarInitial: "A",
  workMode: "prepare",
  checks: [
    "Found your website",
    "Read your ISTV episode (February)",
    "Read your onboarding call notes",
  ],
  profileLines: [
    "You run Osei Family Law — family law practice in Chicago.",
    "Your clients: families navigating separation and custody.",
    "You're on LinkedIn and have a website.",
  ],
  lockedReason: "Because you're a licensed attorney:",
  lockedNeverChips: [
    "No outcome guarantees",
    "No legal advice in posts",
    "No client details, ever",
  ],
  plan: {
    where:
      "LinkedIn first — your referral network lives there. Your website's articles second — people research before they call a lawyer.",
    what: "What to ask before a crisis · Mediation myths · How consultations actually work",
    rhythm: "1 post a week, reviewed by you line by line.",
  },
  winLine: "Your last post was read by 89 people in your network",
  cards: [
    {
      id: "amara-1",
      type: "draft_approval",
      platform: "linkedin",
      meta: "LinkedIn · awaiting your review",
      body: "In fifteen years of family practice, the cases that end well usually start with a conversation months earlier — before positions harden. You don't need a crisis to book a consultation. You need twenty minutes and a list of what's keeping you up at night.",
      consequence: "nothing publishes without you · ever",
    },
    {
      id: "amara-2",
      type: "draft_approval",
      platform: "linkedin",
      meta: "LinkedIn · awaiting your review",
      body: "Mediation isn't about \"giving in.\" In my experience it's where families keep the most control over their own outcome. Three myths I hear every week — and what actually happens in the room.",
      consequence: "nothing publishes without you · ever",
    },
  ],
};

const CLIENTS: Record<string, FixtureClient> = { dave, amara };

export function getFixtureClient(id?: string | null): FixtureClient {
  return CLIENTS[id ?? "dave"] ?? dave;
}
