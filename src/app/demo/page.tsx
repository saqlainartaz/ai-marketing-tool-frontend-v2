"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { startDemo } from "@/components/demo/DemoBar";
import { DEMO_SCRIPT } from "@/lib/demo/script";

/**
 * Opening /demo arms the walkthrough and drops you at the first stop.
 * Sign in as a sample client first — the script walks the product, not
 * the front door.
 */
export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    startDemo();
    router.replace(DEMO_SCRIPT[0].href);
  }, [router]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5">
      <p className="t-label">Demo</p>
      <h1 className="t-display mt-2">Starting the walkthrough…</h1>
      <p className="t-sub mt-3">
        {DEMO_SCRIPT.length} stops, in the order you&apos;d tell it.
      </p>
    </main>
  );
}
