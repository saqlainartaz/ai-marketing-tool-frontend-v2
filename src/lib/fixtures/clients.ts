import type { Platform } from "@/components/preview/post-preview";
import type { WorkMode } from "@/components/ui/dial-pill";
import type { Goal } from "@/lib/brief/types";
import type { RecordedOutcome } from "@/lib/outcomes";

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

/**
 * The marketing reasoning behind a prepared object.
 *
 * The product's through-line: we explain the marketing, not the interface.
 * Three different lessons, one per line — so a client who reads it for a
 * month learns something, and a client who never opens it loses nothing,
 * because it stays collapsed.
 */
export type Rationale = {
  /** Why now — a season, an event, something that just happened. */
  moment: string;
  /** Why this channel, in terms of where their customers actually are. */
  channel: string;
  /** Why it reads the way it does — the craft decision. */
  shape: string;
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
  /** Why we made this — the "Why this?" disclosure. */
  rationale?: Rationale;
  /** Protection already applied — shown as the honey line + diff. */
  guardrail?: { note: string; from: string; to: string };
  /** review_reply: the review being answered. */
  review?: { reviewer: string; stars: number; text: string };
  /** email: subject line. */
  subject?: string;
  /** Day this is prepared for (ISO yyyy-mm-dd) — drives the calendar. */
  scheduledFor?: string;
};

export type QuestionCardFixture = {
  id: string;
  prompt: string;
  timeCost: string;
  questions: { q: string; chips: string[] }[];
  /** The draft this card produces (mock generation). */
  produces: Omit<FixtureDraft, "id">;
};

export type ClientContact = {
  fullName: string;
  email: string;
  phone?: string;
  /** Photo URL when they have one; initials stand in until then. */
  photoUrl?: string;
};

export type ClientSocial = {
  platform: "facebook" | "linkedin" | "google_business" | "instagram" | "website";
  handle: string;
  connected: boolean;
};

export type FixtureClient = {
  id: "dave" | "amara";
  firstName: string;
  businessName: string;
  avatarInitial: string;
  contact: ClientContact;
  socials: ClientSocial[];
  workMode: WorkMode;
  checks: string[];
  profileLines: string[];
  lockedReason: string;
  lockedNeverChips: string[];
  plan: {
    where: string;
    what: string;
    rhythm: string;
    why: string;
    /** Structured plan — drives the living Plan page and the reveal. */
    channels: {
      platform: Platform;
      name: string;
      why: string;
      state: "active" | "next";
    }[];
    pillars: string[];
    /** posts per week + the days they usually land */
    perWeek: number;
    days: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[];
    effort: string;
  };
  /**
   * The one number the work is for, with its deadline — and a metric that
   * records who counts it. Dave's is logged by a person; Amara's is
   * reported by the platforms. Both are honest, and the difference is
   * visible on screen, which is the whole point of having two shapes.
   */
  goal: Goal;
  /**
   * What has actually been counted toward it. Empty is a real state and
   * renders as "nothing measured yet" — never as a zero, which reads as
   * failure when the truth is that it's early.
   */
  outcomes: RecordedOutcome[];
  winLine: string;
  /** The headline result, split so it can be shown as a stat. */
  win: { value: string; unit: string; note: string };
  drafts: FixtureDraft[];
  questionCards: QuestionCardFixture[];
  /** Things worth saying, mined from the client's own material. */
  ideas: IdeaFixture[];
  voice: { summary: string; sounds: string[]; avoids: string[] };
  /**
   * Starting points for the one free-text box in the product. A blank box
   * is the single hardest thing to face for the persona who doesn't know
   * where to begin — so it never ships blank.
   */
  promptSuggestions: string[];
};

export type IdeaFixture = {
  id: string;
  title: string;
  /** Why this one is worth saying, in their terms. */
  angle: string;
  /** Where it came from — ideas are grounded, never invented. */
  source: string;
  pillar: string;
  platform: Platform;
  /** The draft this idea becomes. */
  produces: Omit<FixtureDraft, "id">;
};

const dave: FixtureClient = {
  id: "dave",
  firstName: "Dave",
  businessName: "Meridian Roofing",
  avatarInitial: "M",
  contact: {
    fullName: "Dave Whitaker",
    email: "dave@meridianroofing.com",
    phone: "(512) 555-0148",
  },
  socials: [
    { platform: "facebook", handle: "/meridianroofingatx", connected: true },
    { platform: "google_business", handle: "Meridian Roofing · Austin", connected: true },
    { platform: "website", handle: "meridianroofing.com", connected: true },
    { platform: "instagram", handle: "not connected", connected: false },
  ],
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
    channels: [
      {
        platform: "google_business",
        name: "Google Business",
        why: "Where Austin homeowners search the moment a roof leaks.",
        state: "active",
      },
      {
        platform: "facebook",
        name: "Facebook",
        why: "Where neighbours ask each other who to call.",
        state: "active",
      },
    ],
    pillars: [
      "Before & after jobs",
      "Questions customers ask",
      "Storm-season prep",
    ],
    perWeek: 2,
    days: ["TUE", "THU"],
    effort: "about 10 minutes of your time",
  },
  winLine: "Your last post reached 412 neighbors",
  /* Dave's goal is the one no platform can report. A booked job happens on
   * a phone call we never see, so a person logs it and we say who — and
   * marking a post as posted cannot move this number, by construction. */
  goal: {
    statement: "Book 6 jobs by the end of September",
    metric: { kind: "logged", name: "booked jobs", loggedBy: "operator" },
    target: 6,
    deadline: "2026-09-30",
  },
  outcomes: [
    { value: 1, at: "2026-07-02", source: "operator" },
    { value: 1, at: "2026-07-21", source: "operator" },
  ],
  win: { value: "412", unit: "neighbours reached", note: "your best week yet" },
  drafts: [
    {
      id: "dave-1",
      platform: "facebook",
      meta: "Facebook · ready for Tue 9 AM",
      scheduledFor: "TUE",
      body: "Hail season's coming, Austin. Last month we caught three roofs their owners thought were fine. Here's the 10-minute check you can do from the ground — no ladder needed.",
      withImage: true,
      consequence: "pull it back anytime",
      pillar: "Storm-season prep",
      rationale: {
        moment:
          "Hail season starts in about six weeks. Austin homeowners start searching for roofers the week the first storm hits — the ones who already know your name call you first.",
        channel:
          "Facebook, because roof damage is what neighbours ask each other about. A post here gets shared into local groups you can't buy your way into.",
        shape:
          "It gives something away before it asks for anything. The ten-minute check is useful on its own, which is why people save it and come back to you later.",
      },
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
      scheduledFor: "THU",
      body: "Before & after from Lakeway Ave — full replacement in two days, family in the house the whole time.",
      withImage: true,
      consequence: "pull it back anytime",
      pillar: "Before & after jobs",
      rationale: {
        moment:
          "Before-and-afters work all year, so this one fills a Thursday rather than chasing an event.",
        channel:
          "Google Business, because this is what someone sees when they search \"roofer near me\" — photos of finished work do more there than words.",
        shape:
          "Two days and the family staying home are the details that answer the fear behind the search: how long will my life be disrupted?",
      },
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
      scheduledFor: "SAT",
      body: 'The #1 question we get every storm season: "Should I file a claim?" Here\'s how to know in five minutes — before you call anyone.',
      consequence: "pull it back anytime",
      pillar: "Questions customers ask",
      rationale: {
        moment:
          "Saturday morning, when people deal with the house things they put off all week.",
        channel:
          "Facebook, where a question in the first line stops the scroll better than a statement does.",
        shape:
          "It leads with the question they're already typing into Google. Answering it here means they never leave to find the answer somewhere else.",
      },
    },
    {
      id: "dave-4",
      kind: "review_reply",
      platform: "google_business",
      meta: "New Google review · reply drafted",
      scheduledFor: "TODAY",
      review: {
        reviewer: "Karen L.",
        stars: 5,
        text: "They finished our entire roof in two days flat and left the yard cleaner than they found it.",
      },
      body: "Thank you, Karen — the crew still talks about your dog supervising from the porch. Two days is what good prep looks like; glad the cleanup showed too. We're here whenever you need us.",
      consequence: "posts to your Google reviews · pull it back anytime",
      pillar: "Reviews",
      rationale: {
        moment:
          "Within a day of the review going up. Replies posted quickly read as a business that's paying attention.",
        channel:
          "Google, where the reply sits under the review permanently — future customers read both.",
        shape:
          "It thanks her by name and repeats the detail she chose to praise, so the reply reinforces the thing you want to be known for rather than just saying thanks.",
      },
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
        rationale: {
          moment:
            "Finished work is evergreen — it fills a slot without waiting for an event.",
          channel:
            "Facebook, where a neighbour recognising the street does more than any advert.",
          shape:
            "The detail that matters is disruption, not craft. People want to know what living through it is like.",
        },
        provenance: [
          {
            phrase: "the crew explained every step",
            label: "your answer, just now",
          },
        ],
      },
    },
  ],
  ideas: [
    {
      id: "dave-i1",
      title: "What insurers actually look for after a storm",
      angle: "You explain this on every job — most homeowners have never heard it.",
      source: "your episode, March · 18:40",
      pillar: "Questions customers ask",
      platform: "facebook",
      produces: {
        platform: "facebook",
        meta: "Facebook · ready when you are",
        body: "After a storm, an adjuster is looking for three things — and homeowners almost never photograph them. Here's what to capture before anyone climbs up, so your claim tells the whole story.",
        consequence: "pull it back anytime",
        pillar: "Questions customers ask",
        rationale: {
          moment:
            "Any week. These answer what people are already searching for, so they never go stale.",
          channel:
            "Facebook, because a question in the first line earns the read.",
          shape:
            "Answering properly here means they don't leave to find the answer somewhere else.",
        },
        scheduledFor: "FRI",
        provenance: [
          {
            phrase: "an adjuster is looking for three things",
            label: "your episode, March · 18:40",
          },
        ],
      },
    },
    {
      id: "dave-i2",
      title: "Why you turn some jobs down",
      angle: "Turning work away builds more trust than any sales line could.",
      source: "your onboarding call",
      pillar: "Before & after jobs",
      platform: "facebook",
      produces: {
        platform: "facebook",
        meta: "Facebook · ready when you are",
        body: "We told a homeowner last week that her roof had four good years left. No sale, no deposit. She'll call us in four years — and she already sent her neighbour.",
        consequence: "pull it back anytime",
        pillar: "Before & after jobs",
        rationale: {
          moment:
            "Finished work is evergreen — it fills a slot without waiting for an event.",
          channel:
            "Facebook, where a neighbour recognising the street does more than any advert.",
          shape:
            "The detail that matters is disruption, not craft. People want to know what living through it is like.",
        },
        scheduledFor: "SAT",
        provenance: [
          { phrase: "four good years left", label: "your onboarding call" },
        ],
      },
    },
    {
      id: "dave-i3",
      title: "The gutter check nobody does in spring",
      angle: "Seasonal, useful, and it puts you in mind before the first storm.",
      source: "your reviews · 3 mentions",
      pillar: "Storm-season prep",
      platform: "google_business",
      produces: {
        platform: "google_business",
        meta: "Google Business · ready when you are",
        body: "Spring gutter check, ten minutes: clear the corners, run the hose, watch where it pools. If it pools by the fascia, call someone before summer storms — that's where the damage starts.",
        consequence: "pull it back anytime",
        pillar: "Storm-season prep",
        rationale: {
          moment:
            "Ahead of the season, while people can still act rather than react.",
          channel:
            "Google Business, where someone searches the moment they suspect damage.",
          shape:
            "Practical and specific. Advice they can use today is what makes them remember who gave it.",
        },
        provenance: [
          { phrase: "that's where the damage starts", label: "your reviews · 3 mentions" },
        ],
      },
    },
  ],
  promptSuggestions: [
    "We finished a full replacement on Lakeway Ave this week",
    "Storm coming Thursday — we're booking emergency inspections",
    "A customer asked whether insurance covers hail damage",
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
  contact: {
    fullName: "Amara Osei",
    email: "amara@oseifamilylaw.com",
    phone: "(312) 555-0113",
  },
  socials: [
    { platform: "linkedin", handle: "/in/amara-osei", connected: true },
    { platform: "website", handle: "oseifamilylaw.com", connected: true },
    { platform: "google_business", handle: "Osei Family Law · Chicago", connected: false },
  ],
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
    channels: [
      {
        platform: "linkedin",
        name: "LinkedIn",
        why: "Where your referral network reads and remembers you.",
        state: "active",
      },
      {
        platform: "google_business",
        name: "Google Business",
        why: "For families searching for a family lawyer nearby.",
        state: "next",
      },
    ],
    pillars: [
      "What to ask before a crisis",
      "Mediation myths",
      "How consultations actually work",
    ],
    perWeek: 1,
    days: ["WED"],
    effort: "reviewed by you, line by line",
  },
  winLine: "Your last post was read by 89 people in your network",
  /* Amara's goal is the other shape: something the platforms genuinely
   * count. Real, and deliberately modest — reach is not instructions, and
   * the product never implies it is. */
  goal: {
    statement: "Reach 4,000 people in Manchester by the end of October",
    metric: { kind: "platform", name: "views" },
    target: 4000,
    deadline: "2026-10-31",
  },
  outcomes: [{ value: 1180, at: "2026-07-28", source: "platform" }],
  win: { value: "89", unit: "people in your network", note: "read your last post" },
  drafts: [
    {
      id: "amara-1",
      platform: "linkedin",
      meta: "LinkedIn · awaiting your review",
      scheduledFor: "WED",
      body: "In fifteen years of family practice, the cases that end well usually start with a conversation months earlier — before positions harden. You don't need a crisis to book a consultation. You need twenty minutes and a list of what's keeping you up at night.",
      consequence: "nothing publishes without you · ever",
      pillar: "What to ask before a crisis",
      rationale: {
        moment:
          "Mid-week, when people research quietly at their desk. Family-law enquiries spike on weekday afternoons, not weekends.",
        channel:
          "LinkedIn, because the people who refer you — accountants, therapists, other solicitors — are there, and referrals are where your best clients come from.",
        shape:
          "It lowers the barrier instead of selling. \"You don't need a crisis\" gives someone permission to enquire early, which is exactly the client you want.",
      },
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
      scheduledFor: "MON",
      body: 'Mediation isn\'t about "giving in." In my experience it\'s where families keep the most control over their own outcome. Three myths I hear every week — and what actually happens in the room.',
      consequence: "nothing publishes without you · ever",
      pillar: "Mediation myths",
      rationale: {
        moment:
          "Monday. Weekend arguments are what push people to start looking on a Monday morning.",
        channel:
          "LinkedIn, where correcting a professional misconception builds authority faster than describing your services does.",
        shape:
          "Naming the myth first is what earns the read. People click to check whether they hold the belief you just named.",
      },
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
      scheduledFor: "TODAY",
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
        rationale: {
          moment:
            "Steady all year — the fear of the first meeting never goes out of season.",
          channel:
            "LinkedIn, where the professionals who refer you are reading.",
          shape:
            "Removing the unknown is the whole job. People delay because they don't know what happens in the room.",
        },
        provenance: [
          {
            phrase: "usually not",
            label: "your answer, just now",
          },
        ],
      },
    },
  ],
  ideas: [
    {
      id: "amara-i1",
      title: "What to bring to a first consultation",
      angle: "The question every caller asks before they book — answered once, publicly.",
      source: "your onboarding call, Mar 12",
      pillar: "How consultations actually work",
      platform: "linkedin",
      produces: {
        platform: "linkedin",
        meta: "LinkedIn · ready for your review",
        body: "People arrive at a first consultation braced for an interrogation. Bring two things: a rough timeline, and the questions keeping you up at night. That is genuinely enough for us to start.",
        consequence: "nothing publishes without you · ever",
        pillar: "How consultations actually work",
        rationale: {
          moment:
            "Steady all year — the fear of the first meeting never goes out of season.",
          channel:
            "LinkedIn, where the professionals who refer you are reading.",
          shape:
            "Removing the unknown is the whole job. People delay because they don't know what happens in the room.",
        },
        scheduledFor: "FRI",
        provenance: [
          {
            phrase: "a rough timeline, and the questions keeping you up at night",
            label: "your onboarding call, Mar 12",
          },
        ],
      },
    },
    {
      id: "amara-i2",
      title: "Why the calm parent usually does better",
      angle: "Hard-won, uncontroversial, and it shows how you think.",
      source: "your episode, February · 26:05",
      pillar: "What to ask before a crisis",
      platform: "linkedin",
      produces: {
        platform: "linkedin",
        meta: "LinkedIn · ready for your review",
        body: "In custody matters, the parent who stays calm on paper tends to fare better than the one who is right and furious. Not because courts reward composure — because composure keeps options open.",
        consequence: "nothing publishes without you · ever",
        pillar: "What to ask before a crisis",
        rationale: {
          moment:
            "Mid-week, when people quietly research at their desk.",
          channel:
            "LinkedIn, because early enquiries come through professional referral more often than search.",
          shape:
            "It gives permission to come early, which is exactly the client you want.",
        },
        provenance: [
          { phrase: "composure keeps options open", label: "your episode, February · 26:05" },
        ],
      },
    },
    {
      id: "amara-i3",
      title: "What mediation costs, honestly",
      angle: "Nobody in your field posts numbers. Ranges alone would stand out.",
      source: "your onboarding call",
      pillar: "Mediation myths",
      platform: "linkedin",
      produces: {
        platform: "linkedin",
        meta: "LinkedIn · ready for your review",
        body: "Families ask what mediation costs and get a shrug. Here is the honest shape of it: fewer sessions than you fear, priced per session, and the total is usually a fraction of a contested filing.",
        consequence: "nothing publishes without you · ever",
        pillar: "Mediation myths",
        rationale: {
          moment:
            "Monday, after the weekend that made someone start looking.",
          channel:
            "LinkedIn, where correcting a misconception builds authority faster than describing services.",
          shape:
            "Naming the belief first is what earns the read.",
        },
        provenance: [
          { phrase: "fewer sessions than you fear", label: "your onboarding call" },
        ],
      },
    },
  ],
  promptSuggestions: [
    "I'm offering free 20-minute consultations this month",
    "A client asked what mediation actually costs",
    "I spoke at a family-law seminar last week",
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

/**
 * Find a draft by id without knowing whose it is.
 *
 * The review link is opened by someone with no session — a partner, a
 * compliance officer — so there is no client context to scope the lookup
 * by. Once the BFF exists this becomes a signed, expiring token that
 * resolves server-side; the shape of the answer stays the same.
 */
export function findDraftAnywhere(
  id: string,
): { draft: FixtureDraft; client: FixtureClient } | null {
  for (const client of Object.values(CLIENTS)) {
    const draft = client.drafts.find((d) => d.id === id);
    if (draft) return { draft, client };
  }
  return null;
}
