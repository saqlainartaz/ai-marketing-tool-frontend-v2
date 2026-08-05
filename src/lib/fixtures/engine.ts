/**
 * Fixtures shaped like the engine's real responses.
 *
 * Nothing here is wired yet — the engine is live at
 * content-engine-nr4a.onrender.com but this build deliberately stays
 * fixture-backed until the app's features and flows are signed off.
 *
 * The shapes, though, are the engine's. `docs/API_CONTRACT.md` and
 * `docs/ENGINE_BRIEF.md` in the backend repo describe atoms carrying
 * provenance, confidence, impact and evidence kind; a voice profile on the
 * TribeAI schema with evidence per pair, a tone matrix, terminology tiers
 * and Open Questions; and documents moving through
 * uploaded → parsed → cleaned → atomised.
 *
 * Keeping these type-identical to the contract means the wiring milestone
 * replaces a module with a `fetch` rather than rewriting components — and,
 * more usefully now, it stops us designing screens the engine can never
 * fill.
 */

/** The engine's nine atom types. */
export type AtomType =
  | "tldr"
  | "insight"
  | "pain_point"
  | "objection"
  | "proof_point"
  | "quote"
  | "terminology"
  | "claims_blacklist"
  | "voice_constraint";

/**
 * How well-founded a claim is. This is what drives softening: a factual
 * claim may rest on `measured` or `quoted`, never on `inferred` or
 * `unverified`.
 */
export type EvidenceKind = "measured" | "quoted" | "inferred" | "unverified";

/** Machine opinion until a human confirms it. */
export type AtomStatus = "provisional" | "confirmed" | "deprecated";

export type AtomProvenance = {
  documentId: string;
  documentTitle: string;
  /** Line range in the cleaned document. */
  lines: [number, number];
  speaker?: string;
  quote?: string;
  /** When the source material is from — drives staleness. */
  capturedAt: string;
};

export type Atom = {
  id: string;
  type: AtomType;
  text: string;
  confidence: number;
  /** 1–5. How much this should shape what we write. */
  impact: number;
  evidenceKind: EvidenceKind;
  status: AtomStatus;
  provenance: AtomProvenance;
};

export type DocumentStatus =
  | "uploaded"
  | "parsed"
  | "cleaned"
  | "atomised"
  | "failed";

export type EngineDocument = {
  id: string;
  title: string;
  kind: "transcript" | "brand_doc" | "form" | "reviews";
  status: DocumentStatus;
  uploadedAt: string;
  /** Populated once atomised. */
  atomCount?: number;
  error?: string;
};

/** One half of a We Are / We Are Not pair, with what it rests on. */
export type VoiceTrait = {
  id: string;
  /** "We are" statement, or the thing we are not. */
  claim: string;
  confidence: number;
  /** Atom ids this judgement was drawn from. */
  evidence: { atomId: string; quote: string; source: string }[];
};

export type ToneAxis = {
  label: string;
  /** 0–100 along the axis; 50 is neutral. */
  value: number;
  leftLabel: string;
  rightLabel: string;
};

export type TerminologyTier = {
  tier: "always" | "sometimes" | "never";
  terms: string[];
  note: string;
};

/**
 * A question the engine decided it needs answered, with the answer it
 * would choose if nobody replies. The recommendation is mandatory in the
 * engine's schema — an open question without one is just a blocker.
 */
export type OpenQuestion = {
  id: string;
  question: string;
  why: string;
  recommendation: string;
  options: string[];
};

export type VoiceProfileVersion = {
  version: number;
  status: "draft" | "approved";
  builtAt: string;
  approvedAt?: string;
  summary: string;
  weAre: VoiceTrait[];
  weAreNot: VoiceTrait[];
  tone: ToneAxis[];
  terminology: TerminologyTier[];
  openQuestions: OpenQuestion[];
  /** What changed since the previous version. */
  changes?: string[];
};

export type EngineFixture = {
  documents: EngineDocument[];
  atoms: Atom[];
  voiceVersions: VoiceProfileVersion[];
};

const daveAtoms: Atom[] = [
  {
    id: "a-d1",
    type: "proof_point",
    text: "Caught three roofs last month whose owners believed they were undamaged.",
    confidence: 0.91,
    impact: 5,
    evidenceKind: "quoted",
    status: "confirmed",
    provenance: {
      documentId: "doc-d1",
      documentTitle: "ISTV episode — March",
      lines: [212, 214],
      speaker: "Dave",
      quote:
        "…just last month we had three inspections where the homeowner had no idea…",
      capturedAt: "2026-03-14",
    },
  },
  {
    id: "a-d2",
    type: "insight",
    text: "Homeowners search for a roofer the week the first storm lands, not before.",
    confidence: 0.78,
    impact: 4,
    evidenceKind: "inferred",
    status: "confirmed",
    provenance: {
      documentId: "doc-d1",
      documentTitle: "ISTV episode — March",
      lines: [88, 96],
      speaker: "Dave",
      capturedAt: "2026-03-14",
    },
  },
  {
    id: "a-d3",
    type: "proof_point",
    text: "Full roof replacement completed in two days with the family still living in the house.",
    confidence: 0.95,
    impact: 5,
    evidenceKind: "quoted",
    status: "confirmed",
    provenance: {
      documentId: "doc-d3",
      documentTitle: "Customer reviews (34)",
      lines: [12, 13],
      speaker: "Karen L.",
      quote: "They finished our entire roof in two days flat…",
      capturedAt: "2026-05-02",
    },
  },
  {
    id: "a-d4",
    type: "claims_blacklist",
    text: "Never promise that an insurance claim will be approved.",
    confidence: 1,
    impact: 5,
    evidenceKind: "measured",
    status: "confirmed",
    provenance: {
      documentId: "doc-d2",
      documentTitle: "Onboarding form",
      lines: [40, 41],
      capturedAt: "2026-03-02",
    },
  },
  {
    id: "a-d5",
    type: "voice_constraint",
    text: "No pricing promises in public content.",
    confidence: 1,
    impact: 4,
    evidenceKind: "measured",
    status: "confirmed",
    provenance: {
      documentId: "doc-d2",
      documentTitle: "Onboarding form",
      lines: [42, 42],
      capturedAt: "2026-03-02",
    },
  },
  {
    id: "a-d6",
    type: "objection",
    text: "Homeowners worry a roof job means moving out for a week.",
    confidence: 0.64,
    impact: 3,
    evidenceKind: "unverified",
    status: "provisional",
    provenance: {
      documentId: "doc-d3",
      documentTitle: "Customer reviews (34)",
      lines: [61, 63],
      capturedAt: "2026-05-02",
    },
  },
  {
    id: "a-d7",
    type: "terminology",
    text: 'Says "storm season", never "inclement weather".',
    confidence: 0.88,
    impact: 2,
    evidenceKind: "quoted",
    status: "confirmed",
    provenance: {
      documentId: "doc-d1",
      documentTitle: "ISTV episode — March",
      lines: [140, 141],
      speaker: "Dave",
      capturedAt: "2026-03-14",
    },
  },
];

const daveVoice: VoiceProfileVersion[] = [
  {
    version: 2,
    status: "approved",
    builtAt: "2026-05-04",
    approvedAt: "2026-05-06",
    summary:
      "Plain-spoken and practical. Talks like a neighbour who happens to know roofs — short sentences, real jobs, zero sales pitch.",
    weAre: [
      {
        id: "wa-d1",
        claim: "Specific about the work, never about ourselves",
        confidence: 0.9,
        evidence: [
          {
            atomId: "a-d3",
            quote: "They finished our entire roof in two days flat…",
            source: "Customer reviews · Karen L., May",
          },
        ],
      },
      {
        id: "wa-d2",
        claim: "Useful before we're asked for anything",
        confidence: 0.83,
        evidence: [
          {
            atomId: "a-d1",
            quote:
              "…three inspections where the homeowner had no idea…",
            source: "ISTV episode, March · 22:14",
          },
        ],
      },
    ],
    weAreNot: [
      {
        id: "wn-d1",
        claim: "Never urgent or fear-driven",
        confidence: 0.86,
        evidence: [
          {
            atomId: "a-d7",
            quote: 'Says "storm season", never "inclement weather"',
            source: "ISTV episode, March · 18:02",
          },
        ],
      },
      {
        id: "wn-d2",
        claim: "Never promising an outcome we don't control",
        confidence: 1,
        evidence: [
          {
            atomId: "a-d4",
            quote: "Never promise that an insurance claim will be approved.",
            source: "Onboarding form · line 40",
          },
        ],
      },
    ],
    tone: [
      { label: "Warmth", value: 72, leftLabel: "Formal", rightLabel: "Warm" },
      { label: "Pace", value: 30, leftLabel: "Brisk", rightLabel: "Considered" },
      {
        label: "Authority",
        value: 58,
        leftLabel: "Peer",
        rightLabel: "Expert",
      },
    ],
    terminology: [
      {
        tier: "always",
        terms: ["storm season", "before & after", "no ladder needed"],
        note: "Words you already use, kept exactly as you say them.",
      },
      {
        tier: "sometimes",
        terms: ["inspection", "claim"],
        note: "Fine in context, but never as a headline.",
      },
      {
        tier: "never",
        terms: ["guarantee", "best in Austin", "act now", "free estimate!!!"],
        note: "Two of these are your trade rules; the rest don't sound like you.",
      },
    ],
    openQuestions: [
      {
        id: "oq-d1",
        question: "Do you want to name specific streets in before-and-afters?",
        why: "Local recognition is the strongest thing you have on Facebook, but some customers would rather not be identifiable.",
        recommendation: "Name the street, never the house number",
        options: [
          "Name the street, never the house number",
          "Name the suburb only",
          "No locations at all",
        ],
      },
      {
        id: "oq-d2",
        question: "How should we talk about emergency call-outs?",
        why: "You mentioned them twice in your episode but they're not on your website, so we don't know if they're a service or a favour.",
        recommendation: "Mention availability, never a response time",
        options: [
          "Mention availability, never a response time",
          "Promote it as a service",
          "Don't mention it",
        ],
      },
    ],
    changes: [
      "Added “no ladder needed” to always-use after it appeared in three reviews",
      "Raised Warmth from 64 to 72",
    ],
  },
  {
    version: 1,
    status: "approved",
    builtAt: "2026-03-16",
    approvedAt: "2026-03-18",
    summary:
      "Practical and direct. Built from the March episode before any customer reviews were read.",
    weAre: [
      {
        id: "wa-d1-v1",
        claim: "Specific about the work",
        confidence: 0.71,
        evidence: [
          {
            atomId: "a-d1",
            quote: "…three inspections where the homeowner had no idea…",
            source: "ISTV episode, March · 22:14",
          },
        ],
      },
    ],
    weAreNot: [
      {
        id: "wn-d1-v1",
        claim: "Never fear-driven",
        confidence: 0.7,
        evidence: [],
      },
    ],
    tone: [
      { label: "Warmth", value: 64, leftLabel: "Formal", rightLabel: "Warm" },
      { label: "Pace", value: 34, leftLabel: "Brisk", rightLabel: "Considered" },
      {
        label: "Authority",
        value: 55,
        leftLabel: "Peer",
        rightLabel: "Expert",
      },
    ],
    terminology: [
      {
        tier: "always",
        terms: ["storm season"],
        note: "Words you already use.",
      },
      {
        tier: "never",
        terms: ["guarantee", "best in Austin"],
        note: "Your trade rules.",
      },
    ],
    openQuestions: [],
  },
];

const daveDocuments: EngineDocument[] = [
  {
    id: "doc-d1",
    title: "ISTV episode — March",
    kind: "transcript",
    status: "atomised",
    uploadedAt: "2026-03-14",
    atomCount: 41,
  },
  {
    id: "doc-d2",
    title: "Onboarding form",
    kind: "form",
    status: "atomised",
    uploadedAt: "2026-03-02",
    atomCount: 12,
  },
  {
    id: "doc-d3",
    title: "Customer reviews (34)",
    kind: "reviews",
    status: "atomised",
    uploadedAt: "2026-05-02",
    atomCount: 27,
  },
];

const amaraAtoms: Atom[] = [
  {
    id: "a-a1",
    type: "proof_point",
    text: "Fifteen years practising family law.",
    confidence: 0.97,
    impact: 5,
    evidenceKind: "quoted",
    status: "confirmed",
    provenance: {
      documentId: "doc-a1",
      documentTitle: "Onboarding call — 12 March",
      lines: [8, 9],
      speaker: "Amara",
      quote: "I've been doing family law for fifteen years now…",
      capturedAt: "2026-03-12",
    },
  },
  {
    id: "a-a2",
    type: "insight",
    text: "Cases that resolve well tend to start months before a crisis.",
    confidence: 0.82,
    impact: 5,
    evidenceKind: "quoted",
    status: "confirmed",
    provenance: {
      documentId: "doc-a2",
      documentTitle: "ISTV episode — February",
      lines: [51, 55],
      speaker: "Amara",
      quote: "…before positions harden, you have so many more options…",
      capturedAt: "2026-02-08",
    },
  },
  {
    id: "a-a3",
    type: "claims_blacklist",
    text: "Never claim or imply a case outcome.",
    confidence: 1,
    impact: 5,
    evidenceKind: "measured",
    status: "confirmed",
    provenance: {
      documentId: "doc-a3",
      documentTitle: "Bar compliance notes",
      lines: [3, 5],
      capturedAt: "2026-03-12",
    },
  },
  {
    id: "a-a4",
    type: "objection",
    text: "People assume mediation means conceding.",
    confidence: 0.74,
    impact: 4,
    evidenceKind: "inferred",
    status: "provisional",
    provenance: {
      documentId: "doc-a2",
      documentTitle: "ISTV episode — February",
      lines: [120, 126],
      speaker: "Amara",
      capturedAt: "2026-02-08",
    },
  },
];

const amaraVoice: VoiceProfileVersion[] = [
  {
    version: 1,
    status: "draft",
    builtAt: "2026-05-01",
    summary:
      "Measured and warm. Writes like she speaks to a worried client across the desk — precise, never dramatic, always leaving a next step.",
    weAre: [
      {
        id: "wa-a1",
        claim: "Calm about things other people find frightening",
        confidence: 0.88,
        evidence: [
          {
            atomId: "a-a2",
            quote: "…before positions harden, you have so many more options…",
            source: "ISTV episode, February · 08:41",
          },
        ],
      },
      {
        id: "wa-a2",
        claim: "Always leaving a next step",
        confidence: 0.79,
        evidence: [
          {
            atomId: "a-a1",
            quote: "I've been doing family law for fifteen years now…",
            source: "Onboarding call, 12 March",
          },
        ],
      },
    ],
    weAreNot: [
      {
        id: "wn-a1",
        claim: "Never adversarial, never combative",
        confidence: 0.91,
        evidence: [
          {
            atomId: "a-a3",
            quote: "Never claim or imply a case outcome.",
            source: "Bar compliance notes · line 3",
          },
        ],
      },
    ],
    tone: [
      { label: "Warmth", value: 66, leftLabel: "Formal", rightLabel: "Warm" },
      { label: "Pace", value: 22, leftLabel: "Brisk", rightLabel: "Considered" },
      {
        label: "Authority",
        value: 78,
        leftLabel: "Peer",
        rightLabel: "Expert",
      },
    ],
    terminology: [
      {
        tier: "always",
        terms: ["in my experience", "you have options", "a next step"],
        note: "Phrases from your own calls.",
      },
      {
        tier: "never",
        terms: ["win", "fight", "battle", "guarantee"],
        note: "Adversarial framing, and your bar rules.",
      },
    ],
    openQuestions: [
      {
        id: "oq-a1",
        question: "Can we reference anonymised client situations?",
        why: "Your strongest material is real situations, but family law makes anonymisation harder than most fields.",
        recommendation: "Composite examples only, never a single case",
        options: [
          "Composite examples only, never a single case",
          "Anonymised single cases with permission",
          "No client situations at all",
        ],
      },
    ],
  },
];

const amaraDocuments: EngineDocument[] = [
  {
    id: "doc-a1",
    title: "Onboarding call — 12 March",
    kind: "transcript",
    status: "atomised",
    uploadedAt: "2026-03-12",
    atomCount: 34,
  },
  {
    id: "doc-a2",
    title: "ISTV episode — February",
    kind: "transcript",
    status: "atomised",
    uploadedAt: "2026-02-08",
    atomCount: 52,
  },
  {
    id: "doc-a3",
    title: "Bar compliance notes",
    kind: "brand_doc",
    status: "atomised",
    uploadedAt: "2026-03-12",
    atomCount: 9,
  },
];

const ENGINE: Record<string, EngineFixture> = {
  dave: {
    documents: daveDocuments,
    atoms: daveAtoms,
    voiceVersions: daveVoice,
  },
  amara: {
    documents: amaraDocuments,
    atoms: amaraAtoms,
    voiceVersions: amaraVoice,
  },
};

export function getEngineFixture(clientId?: string | null): EngineFixture {
  return ENGINE[clientId ?? "dave"] ?? ENGINE.dave;
}

/** The version a client is currently governed by, approved or not. */
export function currentVoice(clientId?: string | null): VoiceProfileVersion {
  const versions = getEngineFixture(clientId).voiceVersions;
  return versions.find((v) => v.status === "approved") ?? versions[0];
}
