import { describe, expect, it } from "vitest";
import { hasValidSession, passwordMatches, sessionToken } from "./results-auth";

describe("results auth", () => {
  it("accepts only the configured password", () => {
    expect(passwordMatches("open-sesame", "open-sesame")).toBe(true);
    expect(passwordMatches("wrong", "open-sesame")).toBe(false);
    expect(passwordMatches("", "open-sesame")).toBe(false);
  });

  it("refuses everything when no password is configured", () => {
    expect(passwordMatches("", undefined)).toBe(false);
    expect(passwordMatches("", "")).toBe(false);
    expect(hasValidSession(sessionToken(""), "")).toBe(false);
  });

  it("accepts a session cookie made from the current password only", () => {
    expect(hasValidSession(sessionToken("pw"), "pw")).toBe(true);
    expect(hasValidSession(sessionToken("old"), "pw")).toBe(false);
    expect(hasValidSession(undefined, "pw")).toBe(false);
    expect(hasValidSession("pw", "pw")).toBe(false);
  });
});
