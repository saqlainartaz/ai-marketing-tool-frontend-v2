/**
 * The Brief — what is true about a client, typed so it carries its own
 * provenance.
 *
 * Every field records where it came from and whether anyone has confirmed
 * it, mirroring the engine's provisional → confirmed atom lifecycle. That
 * is not decoration: it is what lets `/plan` show the client the source of
 * every line about their own business, using the same affordance as
 * `SourcedBody` on a draft.
 *
 * Only the goal is modelled here for now. The rest of the Brief
 * (business model, motions, channels, brand) arrives when there is a
 * surface that needs it — the shape is what matters today, so that wiring
 * to the engine later is an adapter rather than a rewrite.
 */

export type SourceRef =
  /** An engine atom, with a label a person can read. */
  | { kind: "atom"; atomId: string; label: string }
  /** Captured or overridden by us at onboarding. */
  | { kind: "operator"; who: string; at: string }
  /** The client changed it themselves. */
  | { kind: "client"; at: string };

export type BriefField<T> = {
  value: T;
  source: SourceRef;
  status: "provisional" | "confirmed";
};

/**
 * How a goal is measured — and the reason this file exists.
 *
 * There are exactly two shapes, and there is deliberately no third:
 *
 * - `platform` — a number a platform reports. Real, and modest.
 * - `logged` — a win a person recorded, and we say who.
 *
 * A metric requiring call tracking or click attribution cannot be
 * expressed in this type. That makes "we never claim credit we can't
 * evidence" a property of the code rather than a matter of anyone's
 * discipline — the same trick as `evidence_kind` on an atom.
 *
 * The practical consequence, which is the point: marking a post as posted
 * can never move a "booked jobs" number. It isn't that we choose not to —
 * there is no path through these types that would let us.
 */
export type GoalMetric =
  | { kind: "platform"; name: "views" | "engagements" | "profile_visits" }
  | { kind: "logged"; name: string; loggedBy: "operator" };

export type Goal = {
  /** The client's own words. Shown verbatim; never our paraphrase. */
  statement: string;
  metric: GoalMetric;
  target: number;
  /** ISO date. */
  deadline: string;
};
