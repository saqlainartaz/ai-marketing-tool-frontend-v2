"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getFixtureClient, type FixtureClient } from "@/lib/fixtures/clients";
import { useClientId } from "@/components/auth/ClientSession";

/** Channel selection cycles: off → using now → want to try → off. */
export type ChannelState = "now" | "want";

export type OnboardingAnswers = {
  goal: string | null;
  driver: string | null;
  obstacle: string | null;
  channels: Record<string, ChannelState>;
  neverDo: string[];
};

const EMPTY: OnboardingAnswers = {
  goal: null,
  driver: null,
  obstacle: null,
  channels: {},
  neverDo: [],
};

type OnboardingContextValue = {
  client: FixtureClient;
  answers: OnboardingAnswers;
  setAnswer: <K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K],
  ) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const STORAGE_KEY = "v2onboarding";

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const clientId = useClientId();
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) setAnswers({ ...EMPTY, ...JSON.parse(saved) });
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, []);

  const setAnswer = useCallback(
    <K extends keyof OnboardingAnswers>(
      key: K,
      value: OnboardingAnswers[K],
    ) => {
      setAnswers((prev) => {
        const next = { ...prev, [key]: value };
        try {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* in-memory only */
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ client: getFixtureClient(clientId), answers, setAnswer }),
    [clientId, answers, setAnswer],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}
