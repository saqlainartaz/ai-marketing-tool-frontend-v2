"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getFixtureClient, type FixtureClient } from "@/lib/fixtures/clients";

/**
 * Resolves the active fixture client outside the onboarding flow
 * (?c= param wins, then the session choice, then Dave). M1 only —
 * replaced by the real client session in M1B/M2.
 */
export function useFixtureClient(): FixtureClient {
  const searchParams = useSearchParams();
  const [id, setId] = useState<string>("dave");

  useEffect(() => {
    const fromUrl = searchParams.get("c");
    try {
      if (fromUrl) {
        window.sessionStorage.setItem("v2client", fromUrl);
        setId(fromUrl);
      } else {
        setId(window.sessionStorage.getItem("v2client") ?? "dave");
      }
    } catch {
      /* default */
    }
  }, [searchParams]);

  return getFixtureClient(id);
}
