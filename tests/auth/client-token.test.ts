import { describe, expect, it } from "vitest";
import {
  createClientToken,
  verifyClientToken,
} from "@/lib/auth/client-token";

const SECRET = "test-secret-at-least-16-chars";

describe("client magic-link tokens (HMAC)", () => {
  it("round-trips a valid token", () => {
    const token = createClientToken("dave", SECRET);
    expect(verifyClientToken(token, SECRET)).toEqual({ clientId: "dave" });
  });

  it("rejects an expired token", () => {
    const token = createClientToken("dave", SECRET, Date.now() - 1000);
    expect(verifyClientToken(token, SECRET)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const token = createClientToken("dave", SECRET);
    const [payload, sig] = token.split(".");
    const forged =
      Buffer.from(
        Buffer.from(payload, "base64url").toString("utf8").replace("dave", "amara"),
      ).toString("base64url") + `.${sig}`;
    expect(verifyClientToken(forged, SECRET)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const token = createClientToken("dave", "another-secret-16-chars!");
    expect(verifyClientToken(token, SECRET)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(verifyClientToken("not-a-token", SECRET)).toBeNull();
    expect(verifyClientToken("", SECRET)).toBeNull();
    expect(verifyClientToken("a.b.c", SECRET)).toBeNull();
  });
});
