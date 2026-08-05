import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { ClientSessionProvider } from "@/components/auth/ClientSession";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { GoalScreen } from "@/components/onboarding/screens/GoalScreen";
import { ObstacleScreen } from "@/components/onboarding/screens/ObstacleScreen";
import { getFixtureClient } from "@/lib/fixtures/clients";
import { __resetContentStore } from "@/lib/store/content";

/**
 * "Never a blank page" as a gate rather than an intention.
 *
 * A blank box is the hardest thing to face for the client who doesn't know
 * where to start — the largest and least-served group in the persona
 * research. So: every free-text input offers a way to start, every choice
 * arrives with a recommendation already selected, and no empty state
 * describes a situation without offering a way out of it.
 */

beforeEach(() => {
  window.sessionStorage.clear();
  __resetContentStore();
});

describe("every free-text input offers a starting point", () => {
  it("both sample clients have real things they might say", () => {
    for (const id of ["dave", "amara"] as const) {
      const client = getFixtureClient(id);
      expect(client.promptSuggestions.length).toBeGreaterThanOrEqual(3);
      for (const s of client.promptSuggestions) {
        // A starting point has to be a sentence they'd actually say, not a
        // category label like "an offer" or "news".
        expect(s.split(" ").length, s).toBeGreaterThan(4);
      }
    }
  });
});

describe("every choice arrives with a recommendation", () => {
  function wrap(ui: React.ReactElement) {
    return render(
      <ClientSessionProvider clientId="dave">
        <OnboardingProvider>{ui}</OnboardingProvider>
      </ClientSessionProvider>,
    );
  }

  it("the goal question pre-selects ours and labels it", async () => {
    wrap(<GoalScreen onNext={() => {}} onBack={() => {}} />);
    const picked = await screen.findByRole("button", {
      name: /More calls & booked jobs/i,
    });
    expect(picked).toHaveAttribute("aria-pressed", "true");
    expect(picked).toHaveTextContent(/our pick/i);
  });

  it("the obstacle question does too", async () => {
    wrap(<ObstacleScreen onNext={() => {}} onBack={() => {}} />);
    const picked = await screen.findByRole("button", { name: /No time/i });
    expect(picked).toHaveAttribute("aria-pressed", "true");
  });
});

describe("no empty state is a dead end", () => {
  /**
   * Static check across the source: wherever we tell someone there's
   * nothing here, there has to be a link or a button within reach. Written
   * as a source scan rather than a render test because empty states are
   * spread across pages that each need their own fixture setup — this
   * catches a new one the day it's added, which a render test wouldn't.
   */
  const SRC = path.resolve(__dirname, "../../src");

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) return walk(full);
      return /\.tsx$/.test(entry) ? [full] : [];
    });
  }

  /** Phrases we use to say "there is nothing here". */
  const EMPTY_PHRASES = [
    /Nothing scheduled/,
    /Nothing in the record/,
    /That&apos;s every idea/,
    /That&apos;s everything/,
    /Pick any mark/,
  ];

  it("every 'nothing here' message has an action near it", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const text = readFileSync(file, "utf8");
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        if (!EMPTY_PHRASES.some((re) => re.test(line))) return;
        // An action within the following 14 lines counts as "near".
        const after = lines.slice(i, i + 14).join("\n");
        const hasAction =
          /<QuietLink|<ActionButton|<Link\b|<button/.test(after);
        if (!hasAction) {
          offenders.push(
            `${path.relative(SRC, file)}:${i + 1} — ${line.trim().slice(0, 60)}`,
          );
        }
      });
    }
    expect(
      offenders,
      "An empty state that describes the situation without offering a way " +
        "out of it is still a dead end. Give it a link or a button.",
    ).toEqual([]);
  });
});
