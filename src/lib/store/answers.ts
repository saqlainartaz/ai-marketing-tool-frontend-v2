"use client";

import type { OnboardingAnswers } from "@/components/onboarding/OnboardingProvider";

/**
 * Reads the client's onboarding answers outside the onboarding flow
 * (Profile page). M1: sessionStorage; M2: /api/me/context.
 */
export function getStoredAnswers(): Partial<OnboardingAnswers> {
  try {
    const raw = window.sessionStorage.getItem("v2onboarding");
    if (raw) return JSON.parse(raw);
  } catch {
    /* none */
  }
  return {};
}
