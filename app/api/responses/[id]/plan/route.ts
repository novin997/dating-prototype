import { DAILY_PLAN_CAP, DEFAULT_MODEL, generatePlan, startOfSingaporeDay } from "@/lib/date-plan";
import { findMatches } from "@/lib/matching";
import { SAMPLE_PROFILES } from "@/lib/profiles";
import { getStore, isResponseId } from "@/lib/store";

const fail = (error: string, status: number) => Response.json({ error }, { status });

/** Makes a date plan with one of this response's suggested people. One plan per person, capped per day. */
export async function POST(request: Request, ctx: RouteContext<"/api/responses/[id]/plan">) {
  if (process.env.DATE_PLANNER !== "on") return fail("The date planner is off.", 404);
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) return fail("The date planner isn't set up yet.", 503);

  const { id } = await ctx.params;
  const store = getStore();
  const response = isResponseId(id) ? await store.get(id) : null;
  if (!response) return fail("Not found.", 404);

  const body = await request.json().catch(() => null);
  const them = findMatches(response.details, SAMPLE_PROFILES).find((p) => p.id === body?.profileId);
  if (!them) return fail("That person isn't one of your suggestions.", 400);
  if (response.picks.some((p) => p.profileId === them.id)) {
    return fail(`You've already planned a date with ${them.name}.`, 409);
  }

  const now = new Date();
  if ((await store.countPicksSince(startOfSingaporeDay(now))) >= DAILY_PLAN_CAP) {
    return fail("The planner is resting for today. Try again tomorrow.", 429);
  }

  const plan = await generatePlan(response.details, them, {
    apiKey,
    model: process.env.OPENCODE_MODEL || DEFAULT_MODEL,
  });
  if (!plan) return fail("Couldn't make a plan right now. Please try again.", 502);

  await store.addPick(id, them.id, now);
  return Response.json({ plan });
}
