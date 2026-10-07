import { findMatches } from "@/lib/matching";
import { SAMPLE_PROFILES } from "@/lib/profiles";
import { getStore } from "@/lib/store";
import { validateDetails, validatePre } from "@/lib/validation";

/** Saves the before-answers and details, and returns the suggestions. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pre = validatePre(body?.pre);
  const details = validateDetails(body?.details);
  if (!pre.ok || !details.ok) {
    return Response.json(
      { errors: { ...(pre.ok ? {} : pre.errors), ...(details.ok ? {} : details.errors) } },
      { status: 400 },
    );
  }

  const matches = findMatches(details.value, SAMPLE_PROFILES);
  const id = await getStore().create({ pre: pre.value, details: details.value, matchCount: matches.length });
  return Response.json({ id, matches }, { status: 201 });
}
