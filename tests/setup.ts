import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL auto-cleanup relies on framework globals; we don't enable vitest
// globals, so register it explicitly — otherwise DOM accumulates between
// tests and queries find duplicates.
afterEach(() => {
  cleanup();
});
