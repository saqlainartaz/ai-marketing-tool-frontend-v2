import type { Platform } from "@/components/preview/post-preview";
import type { WorkMode } from "@/components/ui/dial-pill";

/**
 * M1 fixture clients — Dave and Amara from the walkthrough (the visual
 * contract). All names and numbers are sample data. M2 replaces this with
 * the real BFF; the shapes anticipate `client_profile` / `content_item` /
 * `action_card`.
 */

/** A claim-bearing phrase traceable to the client's own words. */
export type ProvenanceSpan = {
  phrase: string;
  label: string; // "your episode, Mar 12"
  quote?: string; // the exact grounding words
};

export type FixtureDraft = {
  id: string;
  /** The marketing tool this came from — new tools add kinds, not screens. */
  kind?: "post" | "review_reply" | "email";
  platform: Platform;
  meta: string;
  body: string;
  withImage?: boolean;
  consequence?: string;
  pillar?: string;
  provenance?: ProvenanceSpan[];
  /** Protection already applied — shown as the honey line + diff. */
  guardrail?: { note: string; from: string; to: string };
  /** review_reply: the review being answered. */
  review?: { reviewer: string; stars: number; text: string };
  /** email: subject line. */
  subject?: string;
};

export type QuestionCardFixture = {
  id: string;
  prompt: string;
  timeCost: string;
  questions: { q: string; chips: string[] }[];
  /** The draft this card produces (mock generation). */
  produces: Omit<FixtureDraft, "id">;
};

export type FixtureClient = {
  id: "dave" | "amara";
  firstName: string;
  businessName: string;
  avatarInitial: string;
  workMode: WorkMode;
  checks: string[];
  profileLines: string[];
  lockedReason: string;
  lockedNeverChips: string[];
  plan: { where: string; what: string; rhythm: string; why: string };
  winLine: string;
  drafts: FixtureDraft[];
  questionCards: QuestionCardFixture[];
  voice: { summary: string; sounds: string[]; avoids: string[] };
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
    why: "Your goal is calls and booked jobs. Homeowners with a leak search Google and ask neighbors on Facebook — so that's where you show up, with proof of work and answers to the questions they're already asking.",
  },
  winLine: "Your last post reached 412 neighbors",
  drafts: [
    {
      id: "dave-1",
      platform: "facebook",
      meta: "Facebook · ready for Tue 9 AM",
      body: "Hail season's coming, Austin. Last month we caught three roofs their owners thought were fine. Here's the 10-minute check you can do from the ground — no ladder needed.",
      withImage: true,
      consequence: "pull it back anytime",
      pillar: "Storm-season prep",
      provenance: [
        {
          phrase: "we caught three roofs their owners thought were fine",
          label: "your episode, March · 22:14",
          quote:
            "…just last month we had three inspections where the homeowner had no idea…",
        },
      ],
    },
    {
      id: "dave-2",
      platform: "google_business",
      meta: "Google Business · ready for Thu 9 AM",
      body: "Before & after from Lakeway Ave — full replacement in two days, family in the house the whole time.",
      withImage: true,
      consequence: "pull it back anytime",
      pillar: "Before & after jobs",
      provenance: [
        {
          phrase: "full replacement in two days",
          label: "your review from Karen L., May",
          quote: "They finished our entire roof in two days flat…",
        },
      ],
      guardrail: {
        note: "One claim softened for your trade rules — see what changed",
        from: "We guarantee your insurance claim gets approved.",
        to: "We help you document everything your insurer asks for.",
      },
    },
    {
      id: "dave-3",
      platform: "facebook",
      meta: "Facebook · ready for Sat 10 AM",
      body: 'The #1 question we get every storm season: "Should I file a claim?" Here\'s how to know in five minutes — before you call anyone.',
      consequence: "pull it back anytime",
      pillar: "Questions customers ask",
    },
    {
      id: "dave-4",
      kind: "review_reply",
      platform: "google_business",
      meta: "New Google review · reply drafted",
      review: {
        reviewer: "Karen L.",
        stars: 5,
        text: "They finished our entire roof in two days flat and left the yard cleaner than they found it.",
      },
      body: "Thank you, Karen — the crew still talks about your dog supervising from the porch. Two days is what good prep looks like; glad the cleanup showed too. We're here whenever you need us.",
      consequence: "posts to your Google reviews · pull it back anytime",
      pillar: "Reviews",
      provenance: [
        {
          phrase: "Two days is what good prep looks like",
          label: "your episode, March · 31:02",
        },
      ],
    },
  ],
  questionCards: [
    {
      id: "dave-q1",
      prompt: "Tell the story of a job you finished this week",
      timeCost: "~3 min",
      questions: [
        {
          q: "What kind of job was it?",
          chips: ["Full replacement", "Storm repair", "Leak fix", "Inspection"],
        },
        {
          q: "What would the homeowner say about it?",
          chips: [
            "Fast",
            "Cleaned up great",
            "Explained everything",
            "Saved us money",
          ],
        },
      ],
      produces: {
        platform: "facebook",
        meta: "Facebook · ready when you are",
        body: "Wrapped up another one this week — and the part the homeowner mentioned first wasn't the roof. It was that the crew explained every step before it happened. That's how we like it: no surprises up there, none on the bill either.",
        consequence: "pull it back anytime",
        pillar: "Before & after jobs",
        provenance: [
          {
            phrase: "the crew explained every step",
            label: "your answer, just now",
          },
        ],
      },
    },
  ],
  voice: {
    summary:
      "Plain-spoken and practical. Talks like a neighbor who happens to know roofs — short sentences, real jobs, zero sales pitch.",
    sounds: ["No ladder needed", "Here's the honest answer", "We caught it early"],
    avoids: ["Guarantee", "Best in Austin", "Act now", "Free estimate!!!"],
  },
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
    why: "Your goal is more clients at zero reputational risk. Referrals come from peers who see your thinking on LinkedIn; families in trouble read your articles at 2 AM. Every post is claim-checked against bar rules before you ever see it.",
  },
  winLine: "Your last post was read by 89 people in your network",
  drafts: [
    {
      id: "amara-1",
      platform: "linkedin",
      meta: "LinkedIn · awaiting your review",
      body: "In fifteen years of family practice, the cases that end well usually start with a conversation months earlier — before positions harden. You don't need a crisis to book a consultation. You need twenty minutes and a list of what's keeping you up at night.",
      consequence: "nothing publishes without you · ever",
      pillar: "What to ask before a crisis",
      provenance: [
        {
          phrase: "fifteen years of family practice",
          label: "your onboarding call, Mar 12",
          quote: "I've been doing family law for fifteen years now…",
        },
        {
          phrase: "before positions harden",
          label: "your episode, February · 08:41",
        },
      ],
    },
    {
      id: "amara-2",
      platform: "linkedin",
      meta: "LinkedIn · awaiting your review",
      body: 'Mediation isn\'t about "giving in." In my experience it\'s where families keep the most control over their own outcome. Three myths I hear every week — and what actually happens in the room.',
      consequence: "nothing publishes without you · ever",
      pillar: "Mediation myths",
      provenance: [
        {
          phrase: "families keep the most control over their own outcome",
          label: "your episode, February · 14:03",
        },
      ],
      guardrail: {
        note: "One claim softened for your bar rules — see what changed",
        from: "I win the cases others give up on.",
        to: "I take on the cases others find difficult.",
      },
    },
    {
      id: "amara-3",
      kind: "email",
      platform: "linkedin",
      meta: "Email · consultation follow-up · awaiting your review",
      subject: "What we covered — and your next step, when you're ready",
      body: "It was good to meet you this week. As promised, here's the short version of what we discussed, in plain language, plus the two documents worth gathering before anything else. No deadline on any of this — when you're ready, you know where I am.",
      consequence: "sent from your inbox after you approve · never automatic",
      pillar: "How consultations actually work",
      provenance: [
        {
          phrase: "in plain language",
          label: "your onboarding call, Mar 12",
          quote: "I never want a client to need a dictionary to read my emails.",
        },
      ],
    },
  ],
  questionCards: [
    {
      id: "amara-q1",
      prompt: "Answer the question clients ask you most",
      timeCost: "~3 min",
      questions: [
        {
          q: "Which question comes up most?",
          chips: [
            "How long will this take?",
            "What will it cost?",
            "Will we end up in court?",
            "What about the kids?",
          ],
        },
        {
          q: "What's the honest short answer?",
          chips: [
            "It depends — here's on what",
            "Sooner than you fear",
            "Usually not",
            "They come first, always",
          ],
        },
      ],
      produces: {
        platform: "linkedin",
        meta: "LinkedIn · ready for your review",
        body: '"Will we end up in court?" It\'s the question behind almost every first consultation. The honest answer: usually not — and the path that avoids it starts earlier than most people think.',
        consequence: "nothing publishes without you · ever",
        pillar: "How consultations actually work",
        provenance: [
          {
            phrase: "usually not",
            label: "your answer, just now",
          },
        ],
      },
    },
  ],
  voice: {
    summary:
      "Measured and warm. Writes like she speaks to a worried client across the desk — precise, never dramatic, always leaving a next step.",
    sounds: [
      "Here's what that means for you",
      "In my experience",
      "You have more options than you think",
    ],
    avoids: ["I win", "Guaranteed outcome", "Don't hire a cheap lawyer", "Act fast"],
  },
};

const CLIENTS: Record<string, FixtureClient> = { dave, amara };

export function getFixtureClient(id?: string | null): FixtureClient {
  return CLIENTS[id ?? "dave"] ?? dave;
}
