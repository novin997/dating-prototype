import type { Details, Profile } from "./types";

export const MAX_SUGGESTIONS = 5;

function fitsEachOther(me: Details, p: Profile): boolean {
  return (
    me.lookingFor.includes(p.gender) &&
    p.lookingFor.includes(me.gender) &&
    p.age >= me.ageMin &&
    p.age <= me.ageMax &&
    me.age >= p.ageMin &&
    me.age <= p.ageMax
  );
}

/** 2 = same area, 1 = other area but I'm happy to go anywhere, 0 = other area and I'd rather not. */
function areaScore(me: Details, p: Profile): number {
  if (p.area === me.area) return 2;
  return me.areaFlex === "anywhere" ? 1 : 0;
}

/**
 * Hard filters: both sides fit each other's gender and age preferences.
 * Ranking: area, then closest budget, then most free evenings in common.
 * Ties keep the input order.
 */
export function findMatches(me: Details, profiles: readonly Profile[]): Profile[] {
  return profiles
    .filter((p) => fitsEachOther(me, p))
    .map((p, i) => ({
      p,
      i,
      area: areaScore(me, p),
      budgetGap: Math.abs(p.budget - me.budget),
      evenings: Math.min(p.freeEvenings, me.freeEvenings),
    }))
    .sort((a, b) => b.area - a.area || a.budgetGap - b.budgetGap || b.evenings - a.evenings || a.i - b.i)
    .slice(0, MAX_SUGGESTIONS)
    .map((s) => s.p);
}
