import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * The redirect target arrives in a query parameter on the one route that
 * sets a session cookie, so anything it accepts is somewhere a crafted
 * link can send a freshly-signed-in visitor.
 */
describe("safeNext", () => {
  it("refuses to leave this origin", () => {
    for (const hostile of [
      "https://example.com",
      "//example.com",
      "/\\example.com",
      "javascript:alert(1)",
      "http://localhost:1/steal",
    ]) {
      expect(safeNext(hostile)).toBe("/onboarding");
    }
  });

  it("refuses routes that aren't ours", () => {
    expect(safeNext("/admin")).toBe("/onboarding");
    expect(safeNext("/api/client-login")).toBe("/onboarding");
  });

  it("lets the real destinations through, query string intact", () => {
    expect(safeNext("/today")).toBe("/today");
    expect(safeNext("/create/dave-q1")).toBe("/create/dave-q1");
    expect(safeNext("/library?view=month")).toBe("/library?view=month");
  });

  it("defaults when nothing is asked for", () => {
    expect(safeNext(null)).toBe("/onboarding");
    expect(safeNext("")).toBe("/onboarding");
  });
});
