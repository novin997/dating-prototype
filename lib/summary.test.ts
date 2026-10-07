import { describe, expect, it } from "vitest";
import { GATE_THRESHOLD, MIN_RESPONSES, summarize } from "./summary";
import type { Barrier, Likelihood, StoredResponse } from "./types";

let n = 0;
function response(
  barriers: [Barrier, Barrier],
  likelihood: Likelihood | null,
  over: Partial<StoredResponse["pre"]> = {},
  pickedIds: string[] = [],
): StoredResponse {
  n += 1;
  return {
    id: `r${n}`,
    createdAt: "2026-10-07T00:00:00.000Z",
    pre: {
      whatMakesItHard: "x",
      topBarriers: barriers,
      lastDateCost: 100,
      lastDateHours: 4,
      hardestTime: "busy_work_periods",
      ...over,
    },
    details: {
      age: 30,
      gender: "woman",
      area: "east",
      freeEvenings: 2,
      budget: 50,
      lookingFor: ["man"],
      ageMin: 25,
      ageMax: 35,
      areaFlex: "anywhere",
    },
    matchCount: 5,
    post: likelihood ? { likelihood, why: "y" } : null,
    picks: pickedIds.map((profileId) => ({ profileId, at: "2026-10-07T01:00:00.000Z" })),
  };
}

function many(count: number, make: () => StoredResponse) {
  return Array.from({ length: count }, make);
}

describe("summarize", () => {
  it("uses the agreed pass rules", () => {
    expect(GATE_THRESHOLD).toBe(0.8);
    expect(MIN_RESPONSES).toBe(20);
  });

  it("handles no responses", () => {
    const s = summarize([]);
    expect(s.total).toBe(0);
    expect(s.avgCost).toBeNull();
    expect(s.avgHours).toBeNull();
    expect(s.gate1.status).toBe("waiting");
    expect(s.gate2.status).toBe("waiting");
  });

  it("counts each of the two barriers", () => {
    const s = summarize([response(["money", "time"], null), response(["time", "energy"], null)]);
    expect(s.barrierCounts).toEqual({ money: 1, time: 2, finding_someone: 0, energy: 1, other: 0 });
  });

  it("averages cost and hours", () => {
    const s = summarize([
      response(["money", "time"], null, { lastDateCost: 50, lastDateHours: 2 }),
      response(["money", "time"], null, { lastDateCost: 150, lastDateHours: 5 }),
    ]);
    expect(s.avgCost).toBe(100);
    expect(s.avgHours).toBe(3.5);
  });

  it("counts hardest times and likelihood answers", () => {
    const s = summarize([
      response(["money", "time"], "yes", { hardestTime: "end_of_month" }),
      response(["money", "time"], "maybe"),
      response(["money", "time"], null),
    ]);
    expect(s.hardestTimeCounts.end_of_month).toBe(1);
    expect(s.hardestTimeCounts.busy_work_periods).toBe(2);
    expect(s.likelihoodCounts).toEqual({ yes: 1, maybe: 1, no: 0 });
    expect(s.withPost).toBe(2);
  });

  it("gate 1 counts a respondent once if money or time is in their top two", () => {
    const s = summarize([
      response(["money", "time"], null),
      response(["money", "energy"], null),
      response(["finding_someone", "energy"], null),
    ]);
    expect(s.gate1.count).toBe(2);
    expect(s.gate1.of).toBe(3);
  });

  it("waits until there are 20 responses", () => {
    const s = summarize(many(19, () => response(["money", "time"], "yes")));
    expect(s.gate1.status).toBe("waiting");
    expect(s.gate2.status).toBe("waiting");
  });

  it("passes gate 1 at exactly 80% of 20 and fails just below", () => {
    const pass = summarize([
      ...many(16, () => response(["money", "energy"], null)),
      ...many(4, () => response(["energy", "other"], null)),
    ]);
    expect(pass.gate1).toMatchObject({ count: 16, of: 20, status: "pass" });

    const fail = summarize([
      ...many(15, () => response(["money", "energy"], null)),
      ...many(5, () => response(["energy", "other"], null)),
    ]);
    expect(fail.gate1.status).toBe("fail");
  });

  it("gate 2 counts only 'yes', out of people who answered the after-question", () => {
    const s = summarize([
      ...many(16, () => response(["money", "time"], "yes")),
      ...many(4, () => response(["money", "time"], "maybe")),
      ...many(10, () => response(["money", "time"], null)),
    ]);
    expect(s.gate2).toMatchObject({ count: 16, of: 20, status: "pass" });

    const maybes = summarize([
      ...many(15, () => response(["money", "time"], "yes")),
      ...many(5, () => response(["money", "time"], "maybe")),
    ]);
    expect(maybes.gate2.status).toBe("fail");
  });

  it("gate 2 waits for 20 after-answers even if there are 20+ responses", () => {
    const s = summarize([
      ...many(19, () => response(["money", "time"], "yes")),
      ...many(5, () => response(["money", "time"], null)),
    ]);
    expect(s.gate1.status).toBe("pass");
    expect(s.gate2.status).toBe("waiting");
  });

  it("counts date plans and who was picked, most picked first", () => {
    const s = summarize([
      response(["money", "time"], null, {}, ["s01", "s09"]),
      response(["money", "time"], null, {}, ["s09"]),
      response(["money", "time"], null),
    ]);
    expect(s.plansMade).toBe(3);
    expect(s.respondentsWhoPlanned).toBe(2);
    expect(s.pickCounts).toEqual([
      ["s09", 2],
      ["s01", 1],
    ]);
  });
});
