"use client";

import { getFixtureClient, type FixtureClient } from "@/lib/fixtures/clients";
import { useClientId } from "@/components/auth/ClientSession";

/**
 * Resolves the active fixture client from the verified session (set by the
 * (client) layout gate). M1 only — M2 replaces fixture data with the BFF,
 * but the session source stays the same.
 */
export function useFixtureClient(): FixtureClient {
  return getFixtureClient(useClientId());
}
