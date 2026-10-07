import { BARRIERS, HARDEST_TIMES, LIKELIHOODS, type StoredResponse } from "./types";

export const GATE_THRESHOLD = 0.8;
export const MIN_RESPONSES = 20;

export type Gate = { count: number; of: number; status: "waiting" | "pass" | "fail" };

function countBy<K extends string>(keys: readonly K[], values: K[]): Record<K, number> {
  const counts = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
  for (const v of values) counts[v] += 1;
  return counts;
}

function average(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function gate(count: number, of: number): Gate {
  if (of < MIN_RESPONSES) return { count, of, status: "waiting" };
  return { count, of, status: count / of >= GATE_THRESHOLD ? "pass" : "fail" };
}

export function summarize(responses: StoredResponse[]) {
  const posts = responses.flatMap((r) => (r.post ? [r.post] : []));
  const moneyOrTime = responses.filter((r) =>
    r.pre.topBarriers.some((b) => b === "money" || b === "time"),
  ).length;
  const yes = posts.filter((p) => p.likelihood === "yes").length;
  const picks = responses.flatMap((r) => r.picks);
  const pickCounts = new Map<string, number>();
  for (const p of picks) pickCounts.set(p.profileId, (pickCounts.get(p.profileId) ?? 0) + 1);

  return {
    total: responses.length,
    withPost: posts.length,
    barrierCounts: countBy(BARRIERS, responses.flatMap((r) => r.pre.topBarriers)),
    hardestTimeCounts: countBy(HARDEST_TIMES, responses.map((r) => r.pre.hardestTime)),
    likelihoodCounts: countBy(LIKELIHOODS, posts.map((p) => p.likelihood)),
    avgCost: average(responses.map((r) => r.pre.lastDateCost)),
    avgHours: average(responses.map((r) => r.pre.lastDateHours)),
    plansMade: picks.length,
    respondentsWhoPlanned: responses.filter((r) => r.picks.length > 0).length,
    /** [profileId, times picked], most picked first. */
    pickCounts: [...pickCounts].sort((a, b) => b[1] - a[1]),
    /** Gate 1: money or time is in the respondent's top two barriers. */
    gate1: gate(moneyOrTime, responses.length),
    /** Gate 2: answered "yes" to "more likely to date", out of those who answered. */
    gate2: gate(yes, posts.length),
  };
}

export type Summary = ReturnType<typeof summarize>;
