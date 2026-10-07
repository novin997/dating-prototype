import { NextResponse } from "next/server";
import { passwordMatches, RESULTS_COOKIE, sessionToken } from "@/lib/results-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const given = String(form.get("password") ?? "");
  const expected = process.env.RESULTS_PASSWORD;

  if (!passwordMatches(given, expected)) {
    return NextResponse.redirect(new URL("/results?error=1", request.url), 303);
  }

  const res = NextResponse.redirect(new URL("/results", request.url), 303);
  res.cookies.set(RESULTS_COOKIE, sessionToken(expected!), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
