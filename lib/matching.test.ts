import { describe, expect, it } from "vitest";
import { findMatches } from "./matching";
import { SAMPLE_PROFILES } from "./profiles";
import type { Details, Profile } from "./types";

const me: Details = {
  age: 30,
  gender: "woman",
  area: "east",
  freeEvenings: 2,
  budget: 50,
  lookingFor: ["man"],
  ageMin: 28,
  ageMax: 35,
  areaFlex: "anywhere",
};

let n = 0;
function profile(over: Partial<Profile>): Profile {
  n += 1;
  return {
    id: `p${n}`,
    name: `P${n}`,
    age: 31,
    gender: "man",
    area: "east",
    freeEvenings: 2,
    budget: 50,
    lookingFor: ["woman"],
    ageMin: 25,
    ageMax: 35,
    blurb: "",
    ...over,
  };
}

const ids = (ps: Profile[]) => ps.map((p) => p.id);

describe("findMatches: hard filters", () => {
  it("drops profiles whose gender I am not looking for", () => {
    const p = profile({ gender: "woman" });
    expect(findMatches(me, [p])).toEqual([]);
  });

  it("drops profiles not looking for my gender", () => {
    const p = profile({ lookingFor: ["man"] });
    expect(findMatches(me, [p])).toEqual([]);
  });

  it("drops profiles outside my age range, inclusive at the edges", () => {
    const tooYoung = profile({ age: 27 });
    const edgeLow = profile({ age: 28 });
    const edgeHigh = profile({ age: 35 });
    const tooOld = profile({ age: 36 });
    expect(ids(findMatches(me, [tooYoung, edgeLow, edgeHigh, tooOld])).sort()).toEqual(
      [edgeLow.id, edgeHigh.id].sort(),
    );
  });

  it("drops profiles whose age range excludes me", () => {
    const p = profile({ ageMin: 32, ageMax: 40 });
    expect(findMatches(me, [p])).toEqual([]);
  });

  it("returns an empty list when nobody passes (the 'widen your preferences' case)", () => {
    expect(findMatches({ ...me, ageMin: 90, ageMax: 99 }, SAMPLE_PROFILES)).toEqual([]);
  });
});

describe("findMatches: ranking", () => {
  it("puts same-area profiles ahead of others", () => {
    const far = profile({ area: "west", budget: 50 });
    const near = profile({ area: "east", budget: 200 });
    expect(ids(findMatches(me, [far, near]))).toEqual([near.id, far.id]);
  });

  it("still shows other areas when I prefer my area, just lower down", () => {
    const far = profile({ area: "west" });
    const near = profile({ area: "east" });
    const res = findMatches({ ...me, areaFlex: "prefer_my_area" }, [far, near]);
    expect(ids(res)).toEqual([near.id, far.id]);
  });

  it("when I prefer my area, ranks other-area profiles among themselves by budget", () => {
    const a = profile({ area: "west", budget: 50 });
    const b = profile({ area: "north", budget: 80 });
    expect(ids(findMatches({ ...me, areaFlex: "prefer_my_area" }, [b, a]))).toEqual([a.id, b.id]);
  });

  it("within the same area, ranks closer budgets first", () => {
    const pricey = profile({ budget: 150 });
    const close = profile({ budget: 60 });
    expect(ids(findMatches(me, [pricey, close]))).toEqual([close.id, pricey.id]);
  });

  it("with equal area and budget gap, ranks more free evenings in common first", () => {
    const busy = profile({ freeEvenings: 1 });
    const free = profile({ freeEvenings: 4 });
    expect(ids(findMatches(me, [busy, free]))).toEqual([free.id, busy.id]);
  });

  it("returns at most 5", () => {
    const many = Array.from({ length: 8 }, () => profile({}));
    expect(findMatches(me, many)).toHaveLength(5);
  });

  it("is stable for complete ties (keeps input order)", () => {
    const a = profile({});
    const b = profile({});
    expect(ids(findMatches(me, [a, b]))).toEqual([a.id, b.id]);
  });
});

describe("sample profiles", () => {
  it("has about 30 profiles with unique ids, all 21+ and internally valid", () => {
    expect(SAMPLE_PROFILES.length).toBeGreaterThanOrEqual(28);
    expect(new Set(SAMPLE_PROFILES.map((p) => p.id)).size).toBe(SAMPLE_PROFILES.length);
    for (const p of SAMPLE_PROFILES) {
      expect(p.age).toBeGreaterThanOrEqual(21);
      expect(p.ageMin).toBeLessThanOrEqual(p.ageMax);
      expect(p.lookingFor.length).toBeGreaterThan(0);
    }
  });

  it("covers every area and every gender", () => {
    expect(new Set(SAMPLE_PROFILES.map((p) => p.area)).size).toBe(5);
    expect(new Set(SAMPLE_PROFILES.map((p) => p.gender)).size).toBe(3);
  });

  it("gives a typical respondent a full list of 5", () => {
    expect(findMatches(me, SAMPLE_PROFILES)).toHaveLength(5);
    expect(findMatches({ ...me, gender: "man", lookingFor: ["woman"] }, SAMPLE_PROFILES)).toHaveLength(5);
  });
});
