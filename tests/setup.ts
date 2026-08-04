import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// RTL auto-cleanup relies on framework globals; we don't enable vitest
// globals, so register it explicitly — otherwise DOM accumulates between
// tests and queries find duplicates.
afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia; components that respect prefers-reduced-motion
// ask for it on mount.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
