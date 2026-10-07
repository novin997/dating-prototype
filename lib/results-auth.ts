import { createHmac, timingSafeEqual } from "node:crypto";

export const RESULTS_COOKIE = "results_auth";

/** Cookie value proving the shared password was entered. Changing the password logs everyone out. */
export function sessionToken(password: string): string {
  return createHmac("sha256", password).update("results-page").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwordMatches(given: string, expected: string | undefined): boolean {
  return !!expected && safeEqual(given, expected);
}

export function hasValidSession(cookie: string | undefined, expected: string | undefined): boolean {
  return !!expected && !!cookie && safeEqual(cookie, sessionToken(expected));
}
